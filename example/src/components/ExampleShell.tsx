import type { ReactNode } from 'react';
import type { RenderCommand } from '@benthic/idle-core/contracts';
import type {
  ShowcaseDefinition,
  ShowcaseDetailCard,
  ShowcaseSnapshot,
} from '../showcaseTypes';
import { BlockRenderer } from './BlockRenderer';
import { LogPane } from './LogPane';

interface ExampleShellProps {
  catalog: ShowcaseDefinition[];
  activeSceneId: string;
  onSelectScene(id: string): void;
  snapshot: ShowcaseSnapshot;
  detailCards: ShowcaseDetailCard[];
  toolbar?: ReactNode;
  onDispatch(command: RenderCommand): void;
}

export function ExampleShell({
  catalog,
  activeSceneId,
  onSelectScene,
  snapshot,
  detailCards,
  toolbar,
  onDispatch,
}: ExampleShellProps) {
  const { scene, pack, runtimeMode, viewModel, recentCommands } = snapshot;

  return (
    <div className={`showcase-shell theme-${viewModel.shell.theme}`}>
      <aside className="showcase-sidebar">
        <div className="sidebar-brand">
          <p className="eyebrow">idle-core</p>
          <h1>API Showcase</h1>
          <p className="small-copy">
            Public runtime surface, pack authoring patterns, and renderer descriptors in one place.
          </p>
        </div>

        <nav className="scene-nav">
          {catalog.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`scene-link${entry.id === activeSceneId ? ' active' : ''}`}
              onClick={() => onSelectScene(entry.id)}
            >
              <span className="scene-kicker">{entry.kicker}</span>
              <strong>{entry.title}</strong>
              <small>{entry.summary}</small>
            </button>
          ))}
        </nav>
      </aside>

      <div className="showcase-main">
        <header className="hero-card">
          <div>
            <p className="eyebrow">{scene.kicker}</p>
            <h2>{scene.title}</h2>
            <p className="subtitle">{scene.summary}</p>
          </div>

          <div className="topbar-meta">
            <span>{pack.id}</span>
            <span>{pack.version}</span>
            <span>{runtimeMode}</span>
          </div>
        </header>

        <div className="badge-row">
          {(viewModel.shell.badges ?? []).concat(scene.tags).map((badge) => (
            <span key={badge} className="badge">
              {badge}
            </span>
          ))}
        </div>

        {toolbar ? <div className="toolbar-row">{toolbar}</div> : null}

        <main className="showcase-layout">
          <section className="panel panel-logs">
            <LogPane title={viewModel.logs.title} entries={viewModel.logs.entries} />
          </section>

          <section className="panel panel-center">
            {viewModel.center.map((block) => (
              <div key={block.id}>
                <BlockRenderer
                  block={block}
                  onDispatch={onDispatch}
                />
              </div>
            ))}
          </section>

          <aside className="panel panel-right">
            <article className="card">
              <h2>Public imports used</h2>
              <ul className="plain-list import-list">
                {scene.imports.map((importPath) => (
                  <li key={importPath}>
                    <code>{importPath}</code>
                  </li>
                ))}
              </ul>
              <p className="small-copy">{pack.description}</p>
            </article>

            {detailCards.map((card) => (
              <article key={card.id} className="card">
                <h2>{card.title}</h2>
                <div className="stack-lines">
                  {card.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                {card.code ? (
                  <pre className="code-block">
                    <code>{card.code}</code>
                  </pre>
                ) : null}
              </article>
            ))}

            {viewModel.right.map((block) => (
              <div key={block.id}>
                <BlockRenderer
                  block={block}
                  onDispatch={onDispatch}
                />
              </div>
            ))}

            <article className="card">
              <h2>Recent commands</h2>
              {recentCommands.length === 0 ? (
                <p className="small-copy">No commands dispatched yet.</p>
              ) : (
                <ul className="plain-list command-list">
                  {recentCommands.map((command, index) => (
                    <li key={`${command.kind}-${command.id}-${index}`}>
                      <code>{command.kind}</code>
                      <span>{command.id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </aside>
        </main>
      </div>
    </div>
  );
}
