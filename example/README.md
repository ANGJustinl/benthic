# Example Showcase

This package is the public showcase for `@benthic/idle-core`.

It is intentionally not a full Benthic migration. Its job is to demonstrate:

- pack-owned runtime logic
- scheduler automation
- save envelope migration
- descriptor-driven rendering

## Scenes

- `Benthic Slice`
- `Automation Queue`
- `Save Migration`
- `Descriptor Studio`

## Local commands

Run from `example/`:

- `npm run dev`
- `npm run build`
- `npm run test`

## Boundary rules

- The example imports only public `@benthic/idle-core` entrypoints and subpath exports.
- `example/legacy-root/` is migration reference only.
- Every interactive scene is backed by a small pack, not by hidden app-specific glue.
