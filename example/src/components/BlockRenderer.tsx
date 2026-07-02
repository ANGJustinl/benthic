import type { BlockView, RenderCommand } from '@benthic/idle-core';

interface BlockRendererProps {
  block: BlockView;
  onDispatch(command: RenderCommand): void;
}

function renderTitle(title?: string) {
  return title ? <h2>{title}</h2> : null;
}

function formatRemainingSeconds(remainingMs: number): string {
  return `${Math.max(1, Math.ceil(remainingMs / 1000))}s`;
}

export function BlockRenderer({ block, onDispatch }: BlockRendererProps) {
  if (block.kind === 'notice') {
    return (
      <article className={`card tone-${block.tone ?? 'default'}`}>
        {renderTitle(block.title)}
        <div className="stack-lines">
          {block.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </article>
    );
  }

  if (block.kind === 'stats') {
    return (
      <article className="card">
        {renderTitle(block.title)}
        <div className="stats-grid">
          {block.rows.map((row) => (
            <div key={row.id} className="stat-row">
              <span>{row.label}</span>
              {row.kind === 'meter' ? (
                <div className="meter">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, (Number(row.value) / Number(row.max || 1)) * 100),
                      )}%`,
                    }}
                  />
                  <strong>{row.value}</strong>
                </div>
              ) : (
                <strong>{row.value}</strong>
              )}
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (block.kind === 'actions') {
    return (
      <article className="card">
        {renderTitle(block.title)}
        <div className="action-list">
          {block.actions.map((action) => (
            <button
              key={action.id}
              className={`action-button emphasis-${action.emphasis ?? 'normal'}`}
              disabled={action.disabled}
              onClick={() => onDispatch(action.command)}
              type="button"
            >
              <span>{action.label}</span>
              {action.description ? <small>{action.description}</small> : null}
              {action.cooldown && action.cooldown.remainingMs > 0 ? (
                <small className="cooldown-copy">
                  冷却 {formatRemainingSeconds(action.cooldown.remainingMs)}
                </small>
              ) : null}
            </button>
          ))}
        </div>
      </article>
    );
  }

  if (block.kind === 'entityList') {
    return (
      <article className="card">
        {renderTitle(block.title)}
        <ul className="plain-list entity-list">
          {block.items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.label}</strong>
                {item.sublabel ? <p className="small-copy">{item.sublabel}</p> : null}
              </div>
              <div className="entity-meta">
                {item.value ? <span>{item.value}</span> : null}
                {item.status ? <code>{item.status}</code> : null}
                {item.action ? (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => onDispatch(item.action!.command)}
                  >
                    {item.action.label}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <article className="card">
      {renderTitle(block.title)}
      <div className="choice-list">
        {block.options.map((option) => (
          <button
            key={option.id}
            className="choice-card"
            onClick={() => onDispatch(option.command)}
            type="button"
          >
            <span>{option.label}</span>
            {option.description ? <small>{option.description}</small> : null}
          </button>
        ))}
      </div>
    </article>
  );
}
