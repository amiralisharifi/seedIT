import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';

export const revalidate = 0;

const CHANNEL_ICON: Record<string, string> = {
  whatsapp: '💬',
  email: '✉️',
  instagram_dm: '📷',
  phone_call: '📞',
  in_person: '🤝',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  try {
    const data = await queries.getConversation(businessId);
    return { title: data ? `Conversation · ${data.business.name}` : 'Conversation' };
  } catch {
    return { title: 'Conversation' };
  }
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const data = await queries.getConversation(businessId);
  if (!data) notFound();

  const { business, timeline } = data;
  const lastSent = [...timeline].reverse().find((m) => m.direction === 'outbound');
  const hoursSinceLastInbound = (() => {
    const lastInbound = [...timeline].reverse().find((m) => m.direction === 'inbound');
    if (!lastInbound) return null;
    const elapsed = Date.now() - new Date(lastInbound.occurredAt).getTime();
    return elapsed / (1000 * 60 * 60);
  })();
  const sessionOpen = hoursSinceLastInbound !== null && hoursSinceLastInbound < 24;

  return (
    <>
      <PageHeader
        title={business.name}
        description={
          business.areaZone
            ? `${business.areaZone} · ${business.phone ?? business.whatsappNumber ?? '—'}`
            : (business.phone ?? business.whatsappNumber ?? '—')
        }
        actions={
          <Link
            href={`/outreach/compose?leadId=${business.id}`}
            className="h-9 px-3 rounded-md border border-border text-sm font-medium hover:bg-muted flex items-center"
          >
            Compose →
          </Link>
        }
      />

      <div className="p-8 max-w-3xl space-y-4">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="px-2 py-1 rounded bg-muted font-mono">{business.status}</span>
          {lastSent && (
            <span className="px-2 py-1 rounded bg-muted font-mono text-muted-foreground">
              last sent {new Date(lastSent.occurredAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {sessionOpen && (
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-mono">
              24h session open
            </span>
          )}
        </div>

        {timeline.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No messages yet for this lead.
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((m) => {
              const inbound = m.direction === 'inbound';
              return (
                <div
                  key={m.id}
                  className={`flex ${inbound ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={
                      'max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ' +
                      (inbound
                        ? 'bg-muted text-foreground rounded-bl-sm'
                        : 'bg-emerald-600 text-white rounded-br-sm')
                    }
                    dir={m.locale === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <div>{m.body}</div>
                    <div
                      className={
                        'mt-1 text-[10px] font-mono uppercase tracking-wider ' +
                        (inbound ? 'text-muted-foreground' : 'text-emerald-100/80')
                      }
                    >
                      {CHANNEL_ICON[m.channel] ?? '•'}{' '}
                      {new Date(m.occurredAt).toLocaleString('en-AE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-md border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          Replies appear here once AiSensy&apos;s webhook is wired to{' '}
          <code className="font-mono">/api/webhooks/aisensy</code>. Until then, only logged
          outbound sends are visible.
        </div>
      </div>
    </>
  );
}
