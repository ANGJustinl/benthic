# `@benthic/idle-core`

Headless TypeScript runtime for Web text idle games.

This package is designed around three boundaries:

- `idle-core` owns simulation, scheduling, save envelopes, migrations, logs, and generic economy helpers.
- content packs own state, commands, automation, and renderer-facing descriptors.
- renderers only consume `IdleGameViewModel` data and dispatch `RenderCommand` values.

## Public API

Stable root export:

- `@benthic/idle-core`

Stable subpath exports:

- `@benthic/idle-core/contracts`
- `@benthic/idle-core/runtime`
- `@benthic/idle-core/save`
- `@benthic/idle-core/scheduler`
- `@benthic/idle-core/state`
- `@benthic/idle-core/economy`

All of the above are part of the package contract and should be treated as semver-governed public API.

## Quick start

```ts
import type { ContentCommand, IdlePack } from '@benthic/idle-core/contracts';
import { createIdleRuntime } from '@benthic/idle-core/runtime';

type ResourceId = 'ore';
type BuildingId = 'drill';
type DemoCommand = ContentCommand | { id: 'demo.mine' };

interface DemoContentState {
  stage: 'idle' | 'ready';
}

const pack: IdlePack<DemoContentState, DemoCommand, ResourceId, BuildingId> = {
  id: 'demo-pack',
  version: 1,
  manifest: {
    resources: {
      ore: { initialAmount: 0, min: 0 },
    },
    buildings: {
      drill: {
        baseCost: { ore: 2 },
        passiveProduction: { ore: 1 },
      },
    },
  },
  createInitialContentState() {
    return { stage: 'idle' };
  },
  handleCommand(state, command, services) {
    if (command.id === 'demo.mine') {
      services.addResource('ore', 1);
      return { ...state.content, stage: 'ready' };
    }

    return;
  },
  buildViewModel(state) {
    return {
      shell: {
        title: 'Demo Pack',
        subtitle: `Stage: ${state.content.stage}`,
        theme: 'workbench',
      },
      logs: {
        title: 'Logs',
        entries: state.logs.map((entry) => ({
          id: entry.id,
          text: entry.message,
        })),
      },
      center: [
        {
          kind: 'actions',
          id: 'actions',
          title: 'Commands',
          actions: [
            {
              id: 'mine',
              label: 'Mine ore',
              command: {
                kind: 'content',
                id: 'demo.mine',
              },
            },
          ],
        },
      ],
      right: [],
    };
  },
};

const runtime = createIdleRuntime(pack);
const initialState = runtime.createInitialState(Date.now());
const nextState = runtime.step(
  initialState,
  {
    type: 'CONTENT_COMMAND',
    command: { id: 'demo.mine' },
  },
  { now: Date.now() },
);

const viewModel = runtime.buildViewModel(nextState, { now: Date.now() });
```

## Runtime lifecycle

The runtime has four core flows:

1. `createInitialState(now)` seeds manifest resources, buildings, content state, and reset-time automation.
2. `step(state, action, { now, random })` applies one engine or content action.
3. `advance(state, { now, random })` applies passive production, `handleTick`, and scheduled command draining.
4. `save(state)` / `restore(envelope)` round-trip portable snapshots.

Execution order inside a tick is:

1. passive production from manifest buildings
2. `pack.handleTick()`
3. `pack.syncAutomation()`
4. draining due scheduled commands
5. normalization

## Pack authoring rules

- `createInitialContentState()` should return plain data.
- `handleCommand()` and `handleTick()` should return the next content state instead of mutating previous state in place.
- `syncAutomation()` is the place for timed story triggers, delayed content commands, and once-only transitions.
- `buildViewModel()` should compute labels, disabled states, cooldown displays, and layout descriptors inside the pack.
- pack state, command payloads, log metadata, and save snapshots should stay structured-clone friendly.

Detailed guidance:

- [pack-authoring.md](./docs/pack-authoring.md)
- [content-pack-roadmap.md](./docs/content-pack-roadmap.md)

## Save and migration

`idle-core` uses portable save envelopes:

```ts
interface SaveEnvelope<TSnapshot = unknown> {
  engineVersion: number;
  packId: string;
  packVersion: number;
  snapshot: TSnapshot;
}
```

When `engineVersion` or `packVersion` differs from the current runtime, `restore()` delegates to `pack.migrateSave()`.

The example app includes a dedicated save migration showcase under [example](./example).

## Renderer contract

The runtime never imports React. Packs can optionally expose `buildViewModel()` and return `IdleGameViewModel` values built from:

- `notice`
- `stats`
- `actions`
- `entityList`
- `choices`

This allows any UI layer to stay generic and data-driven.

## Commands

Root package:

- `npm run build:core`
- `npm run test`
- `npm run typecheck`

Example showcase:

- `npm run dev:example`
- `npm run build:example`
- `npm run test:example`
- `npm run typecheck:example`
