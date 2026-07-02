# idle-core Status

## Repository shape

- root package: `@benthic/idle-core`
- root `src/`: headless runtime only
- `example/`: API showcase and promotional demo
- `example/legacy-root/`: migration reference only

## Runtime modules

Headless runtime lives under `src/core/`:

- `src/core/contracts.ts`
- `src/core/runtime.ts`
- `src/core/save.ts`
- `src/core/scheduler.ts`
- `src/core/state.ts`
- `src/core/economy.ts`

Stable public subpath shims exist at the repository root:

- `contracts.ts`
- `runtime.ts`
- `save.ts`
- `scheduler.ts`
- `state.ts`
- `economy.ts`

## Example posture

The example app is no longer expected to recreate the full historical Benthic game.

Its job is to:

- teach the public API
- validate public imports and subpath exports
- demonstrate scheduler automation, save migration, and descriptor rendering
- keep one polished Benthic slice for narrative flavor

## Reference docs

- roadmap:
  [content-pack-roadmap.md](./content-pack-roadmap.md)
- pack authoring:
  [pack-authoring.md](./pack-authoring.md)
