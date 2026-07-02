# Content Pack Roadmap

## Current posture

This repository has already crossed the old extraction boundary.

The active shape is:

- root package: publishable `@benthic/idle-core`
- `example/`: API showcase and promotional demo
- `example/legacy-root/`: reference material only

That changes the roadmap. The main job is no longer "migrate the original app." The main job is "keep the library stable, document it well, and prove it with focused showcase packs."

## What the roadmap optimizes for now

1. keep `idle-core` headless and semver-safe
2. make all public runtime surfaces explicit
3. prove the API with small showcase scenes
4. keep Benthic as a strong vertical slice, not a migration burden

## Stable responsibilities

### Runtime

- engine actions and lifecycle
- manifest-driven economy
- save envelopes and migration delegation
- scheduler queue and onceKey rules
- state cloning and normalization
- logs and cooldowns

### Packs

- content-owned state
- content commands
- story and automation rules
- save migration for pack versions
- renderer-facing view model construction

### Example app

- public API showcase
- subpath export validation
- promotional presentation
- pack authoring reference

## Showcase strategy

The example app should stay scene-oriented and small.

Recommended scenes:

1. `Benthic Slice`
   - build actions
   - cooldowns
   - pack-owned unlock chain
   - descriptor layout
2. `Automation Queue`
   - delayed content commands
   - onceKey dedupe
   - queue inspection and cancellation
3. `Save Migration`
   - restore from a legacy fixture
   - `migrateSave()`
   - portable envelope round-trip
4. `Descriptor Studio`
   - `notice`
   - `stats`
   - `actions`
   - `entityList`
   - `choices`

## Next improvements after this phase

- add more pack authoring recipes
- add a second non-Benthic showcase pack with a different tone
- decide whether a pack registry helper belongs in core
- only consider a renderer helper package after the headless API stays stable through another iteration
