import type {
  ContentCommand,
  EngineAction,
  EngineState,
  IdlePack,
  IdleRuntime,
  RenderCommand,
} from '@benthic/idle-core/contracts';
import { createIdleRuntime } from '@benthic/idle-core/runtime';
import { useEffect, useMemo, useState } from 'react';
import type { ShowcaseDefinition, ShowcasePackMeta, ShowcaseSnapshot } from './showcaseTypes';

interface ShowcaseRuntimeOptions<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
> {
  scene: ShowcaseDefinition;
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>;
  packMeta: ShowcasePackMeta;
  storageKey: string;
  tickRateMs?: number;
}

type GenericRuntime<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
> = IdleRuntime<TContent, TCommand, TResourceId, TBuildingId>;

function loadState<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  runtime: GenericRuntime<TContent, TCommand, TResourceId, TBuildingId>,
  storageKey: string,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  if (typeof window === 'undefined') {
    return runtime.createInitialState(0);
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return runtime.createInitialState(Date.now());
  }

  try {
    return runtime.restore(JSON.parse(raw));
  } catch {
    return runtime.createInitialState(Date.now());
  }
}

function toEngineAction<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  command: RenderCommand,
): EngineAction<TContent, TCommand, TResourceId, TBuildingId> | null {
  if (command.kind === 'content') {
    return {
      type: 'CONTENT_COMMAND',
      command: {
        id: command.id,
        payload: command.args,
      } as TCommand,
    };
  }

  if (command.id === 'engine.reset') {
    return { type: 'ENGINE_RESET' };
  }

  if (command.id === 'engine.build') {
    const buildingId = command.args?.buildingId;
    if (typeof buildingId !== 'string') {
      return null;
    }

    return {
      type: 'ENGINE_BUILD',
      buildingId: buildingId as TBuildingId,
      quantity:
        typeof command.args?.quantity === 'number'
          ? command.args.quantity
          : undefined,
    };
  }

  return null;
}

export function useShowcaseRuntime<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>({
  scene,
  pack,
  packMeta,
  storageKey,
  tickRateMs = 1_000,
}: ShowcaseRuntimeOptions<TContent, TCommand, TResourceId, TBuildingId>): {
  runtime: GenericRuntime<TContent, TCommand, TResourceId, TBuildingId>;
  state: EngineState<TContent, TResourceId, TBuildingId, TCommand>;
  replaceState(state: EngineState<TContent, TResourceId, TBuildingId, TCommand>): void;
  snapshot: ShowcaseSnapshot;
  dispatch(command: RenderCommand): void;
} {
  const runtime = useMemo(() => {
    return createIdleRuntime(pack);
  }, [pack]);
  const [state, setState] = useState<EngineState<TContent, TResourceId, TBuildingId, TCommand>>(
    () => loadState(runtime, storageKey),
  );
  const [recentCommands, setRecentCommands] = useState<RenderCommand[]>([]);

  useEffect(() => {
    if (tickRateMs <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setState((currentState) => runtime.advance(currentState, { now: Date.now() }));
    }, tickRateMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [runtime, tickRateMs]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(runtime.save(state)));
  }, [runtime, state, storageKey]);

  const snapshot = useMemo<ShowcaseSnapshot>(() => {
    return {
      scene,
      pack: packMeta,
      runtimeMode: 'idle-core',
      viewModel:
        runtime.buildViewModel(state, { now: Date.now() }) ?? {
          shell: {
            title: packMeta.title,
            subtitle: 'This pack does not expose a renderer-facing view model.',
            theme: 'workbench',
          },
          logs: {
            title: 'Logs',
            entries: [],
          },
          center: [],
          right: [],
        },
      recentCommands,
    };
  }, [packMeta, recentCommands, runtime, scene, state]);

  const dispatch = (command: RenderCommand) => {
    const action = toEngineAction<TContent, TCommand, TResourceId, TBuildingId>(command);
    setRecentCommands((currentCommands) => [command, ...currentCommands].slice(0, 8));

    if (!action) {
      return;
    }

    setState((currentState) => runtime.step(currentState, action, { now: Date.now() }));
  };

  return {
    runtime,
    state,
    replaceState: setState,
    snapshot,
    dispatch,
  };
}
