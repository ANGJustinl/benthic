import {
  IDLE_CORE_ENGINE_VERSION,
  type ContentCommand,
  type EngineState,
  type IdlePack,
  type SaveEnvelope,
} from './contracts';
import { cloneEngineState, normalizeEngineState } from './state';

export function createSaveEnvelope<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
): SaveEnvelope<EngineState<TContent, TResourceId, TBuildingId, TCommand>> {
  return {
    engineVersion: IDLE_CORE_ENGINE_VERSION,
    packId: pack.id,
    packVersion: pack.version,
    snapshot: cloneEngineState(normalizeEngineState(pack, state)),
  };
}

export function restoreFromSave<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  envelope: SaveEnvelope<unknown>,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  if (envelope.packId !== pack.id) {
    throw new Error(`Cannot restore save for pack "${envelope.packId}" into "${pack.id}".`);
  }

  if (
    envelope.engineVersion !== IDLE_CORE_ENGINE_VERSION ||
    envelope.packVersion !== pack.version
  ) {
    if (!pack.migrateSave) {
      throw new Error(
        `Save version mismatch for pack "${pack.id}" and no migrateSave() handler was provided.`,
      );
    }

    return normalizeEngineState(pack, pack.migrateSave(envelope));
  }

  return normalizeEngineState(
    pack,
    envelope.snapshot as EngineState<TContent, TResourceId, TBuildingId, TCommand>,
  );
}
