import type { LogEntryView } from '@benthic/idle-core';

interface LogPaneProps {
  title: string;
  entries: LogEntryView[];
}

export function LogPane({ title, entries }: LogPaneProps) {
  return (
    <div className="log-pane">
      <div className="panel-heading">
        <h2>{title}</h2>
      </div>
      <ul className="plain-list log-list">
        {entries.map((entry) => (
          <li key={entry.id} className={`tone-${entry.tone ?? 'default'}`}>
            {entry.prefix ? <code>{entry.prefix}</code> : null}
            <span>{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
