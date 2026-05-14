import { cn } from '@seed-panel/ui';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'h-auto border-b border-border bg-background/80 backdrop-blur',
        'sticky top-0 z-20',
        className,
      )}
    >
      <div className="px-8 py-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-semibold leading-tight">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground max-w-prose">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
