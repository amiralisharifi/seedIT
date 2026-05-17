import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { queries } from '@seed-panel/db';

export const metadata = { title: 'Conversations' };
export const revalidate = 0;

const CHANNEL_ICON: Record<string, string> = {
  whatsapp: '💬',
  email: '✉️',
  instagram_dm: '📷',
  phone_call: '📞',
  in_person: '🤝',
};

export default async function ConversationsPage() {
  let rows: Awaited<ReturnType<typeof queries.listConversations>> = [];
  let loadError: string | null = null;
  try {
    rows = await queries.listConversations(200);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <PageHeader
        title="Conversations"
        description="All threads with leads — outbound sends and inbound replies in one timeline."
      />
      <div className="p-8">
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center max-w-xl mx-auto">
            <h3 className="font-semibold text-lg">No conversations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Once you log an outreach send or AiSensy delivers a reply, threads will appear here.
            </p>
            <Link
              href="/outreach/compose"
              className="mt-6 inline-flex h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 items-center"
            >
              Compose first outreach
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
            {rows.map((c) => {
              const isInbound = c.last_message_direction === 'inbound';
              return (
                <Link
                  key={c.business_id}
                  href={`/conversations/${c.business_id}`}
                  className={`block px-5 py-4 hover:bg-muted/30 ${isInbound ? 'bg-emerald-50/40' : ''}`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{CHANNEL_ICON[c.last_message_channel] ?? '•'}</span>
                      <span className="font-medium truncate">{c.business_name}</span>
                      {c.business_area_zone && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          · {c.business_area_zone}
                        </span>
                      )}
                      {isInbound && (
                        <span className="text-[10px] uppercase font-mono tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          replied
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {new Date(c.last_message_at).toLocaleString('en-AE', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-2 max-w-3xl">
                    <span className={isInbound ? 'text-emerald-700 font-medium' : ''}>
                      {isInbound ? '← ' : '→ '}
                    </span>
                    {c.last_message_body ?? '—'}
                  </div>
                  <div className="mt-1 flex gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span>{c.outbound_count} sent</span>
                    <span>{c.inbound_count} received</span>
                    <span className="ml-auto">{c.business_status}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
