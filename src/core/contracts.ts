export const IDLE_CORE_ENGINE_VERSION = 1;
export const DEFAULT_BUILD_COST_SCALE = 1.15;

export type ResourceRecord<TResourceId extends string = string> = Record<TResourceId, number>;
export type BuildingRecord<TBuildingId extends string = string> = Record<TBuildingId, number>;
export type CooldownRecord = Record<string, number>;
export type AutomationRecord = Record<string, true>;

export interface EngineResourceDefinition {
  initialAmount?: number;
  min?: number;
  max?: number;
}

export interface EngineBuildingDefinition<TResourceId extends string = string> {
  initialCount?: number;
  baseCost?: Partial<Record<TResourceId, number>>;
  costScale?: number;
  passiveProduction?: Partial<Record<TResourceId, number>>;
}

export interface EngineManifest<
  TResourceId extends string = string,
  TBuildingId extends string = string,
> {
  resources?: Record<TResourceId, EngineResourceDefinition>;
  buildings?: Record<TBuildingId, EngineBuildingDefinition<TResourceId>>;
}

export interface ContentCommand<TPayload = unknown> {
  id: string;
  payload?: TPayload;
}

export type RenderCommandKind = 'engine' | 'content';

export interface RenderCommand {
  kind: RenderCommandKind;
  id: string;
  args?: Record<string, unknown>;
}

export interface EngineLogEntry {
  id: string;
  timestamp: number;
  message: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  source?: string;
  tags?: string[];
  data?: Record<string, unknown>;
}

export interface EngineLogInput {
  id?: string;
  timestamp?: number;
  message: string;
  level?: EngineLogEntry['level'];
  source?: string;
  tags?: string[];
  data?: Record<string, unknown>;
}

export interface LogEntryView {
  id: string;
  text: string;
  tone?: 'default' | 'accent' | 'warning' | 'muted';
  prefix?: string;
}

export interface ShellView {
  title: string;
  subtitle: string;
  theme: string;
  badges?: string[];
}

export type StatRow =
  | {
      kind: 'value';
      id: string;
      label: string;
      value: string | number;
      tone?: 'default' | 'accent' | 'warning';
    }
  | {
      kind: 'meter';
      id: string;
      label: string;
      value: number;
      max: number;
      tone?: 'default' | 'accent' | 'warning';
    };

export interface ActionView {
  id: string;
  label: string;
  description?: string;
  command: RenderCommand;
  disabled?: boolean;
  emphasis?: 'normal' | 'primary';
  cooldown?: {
    remainingMs: number;
    totalMs: number;
  };
}

export interface EntityRowView {
  id: string;
  label: string;
  sublabel?: string;
  value?: string;
  status?: string;
  action?: ActionView;
}

export interface ChoiceView {
  id: string;
  label: string;
  description?: string;
  command: RenderCommand;
}

export type BlockView =
  | {
      kind: 'notice';
      id: string;
      title?: string;
      tone?: 'default' | 'accent' | 'warning';
      lines: string[];
    }
  | {
      kind: 'stats';
      id: string;
      title?: string;
      rows: StatRow[];
    }
  | {
      kind: 'actions';
      id: string;
      title?: string;
      actions: ActionView[];
    }
  | {
      kind: 'entityList';
      id: string;
      title?: string;
      items: EntityRowView[];
    }
  | {
      kind: 'choices';
      id: string;
      title?: string;
      options: ChoiceView[];
    };

export interface IdleGameViewModel {
  shell: ShellView;
  logs: {
    title: string;
    entries: LogEntryView[];
  };
  center: BlockView[];
  right: BlockView[];
}

export interface ScheduledCommand<TCommand extends ContentCommand = ContentCommand> {
  id: string;
  dueAt: number;
  createdAt: number;
  command: TCommand;
  onceKey?: string;
  tags?: string[];
}

export interface ScheduleCommandInput<TCommand extends ContentCommand = ContentCommand> {
  id?: string;
  dueAt: number;
  command: TCommand;
  onceKey?: string;
  tags?: string[];
}

export interface ScheduledCommandMatcher<TCommand extends ContentCommand = ContentCommand> {
  id?: string;
  onceKey?: string;
  commandId?: TCommand['id'];
  tag?: string;
}

export interface EngineRuntimeMeta {
  nextLogSequence: number;
  nextScheduledSequence: number;
}

export interface EngineState<
  TContent,
  TResourceId extends string = string,
  TBuildingId extends string = string,
  TCommand extends ContentCommand = ContentCommand,
> {
  resources: ResourceRecord<TResourceId>;
  buildings: BuildingRecord<TBuildingId>;
  cooldowns: CooldownRecord;
  logs: EngineLogEntry[];
  scheduledCommands: ScheduledCommand<TCommand>[];
  firedAutomationKeys: AutomationRecord;
  lastTick: number;
  runtime: EngineRuntimeMeta;
  content: TContent;
}

export type EngineAction<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
> =
  | { type: 'ENGINE_TICK' }
  | { type: 'ENGINE_RESET' }
  | {
      type: 'ENGINE_LOAD_SNAPSHOT';
      snapshot: EngineState<TContent, TResourceId, TBuildingId, TCommand>;
    }
  | { type: 'ENGINE_BUILD'; buildingId: TBuildingId; quantity?: number }
  | { type: 'CONTENT_COMMAND'; command: TCommand };

export type AutomationCause<
  TCommand extends ContentCommand = ContentCommand,
  TBuildingId extends string = string,
> =
  | { type: 'reset' }
  | { type: 'load' }
  | { type: 'tick'; now: number; deltaMs: number }
  | { type: 'build'; buildingId: TBuildingId; quantity: number }
  | { type: 'content-command'; command: TCommand }
  | { type: 'scheduled-command'; scheduled: ScheduledCommand<TCommand> };

export interface RuntimeExecutionOptions {
  now: number;
  random?: () => number;
}

export interface ViewModelBuildOptions {
  now: number;
}

export interface RuntimeServices<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
> {
  readonly now: number;
  readonly random: () => number;
  appendLog(entry: EngineLogInput): EngineLogEntry;
  addResource(resourceId: TResourceId, amount: number): number;
  setResource(resourceId: TResourceId, amount: number): number;
  addBuilding(buildingId: TBuildingId, amount?: number): number;
  setBuilding(buildingId: TBuildingId, amount: number): number;
  setCooldown(id: string, readyAt: number): void;
  clearCooldown(id: string): void;
  scheduleCommand(input: ScheduleCommandInput<TCommand>): ScheduledCommand<TCommand> | null;
  cancelScheduledCommands(matcher: ScheduledCommandMatcher<TCommand>): number;
  markAutomationFired(key: string): void;
  hasAutomationFired(key: string): boolean;
}

export interface SaveEnvelope<TSnapshot = unknown> {
  engineVersion: number;
  packId: string;
  packVersion: number;
  snapshot: TSnapshot;
}

export interface IdlePack<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
> {
  id: string;
  version: number;
  manifest?: EngineManifest<TResourceId, TBuildingId>;
  createInitialContentState(): TContent;
  migrateSave?(
    envelope: SaveEnvelope<unknown>,
  ): EngineState<TContent, TResourceId, TBuildingId, TCommand>;
  handleCommand?(
    state: Readonly<EngineState<TContent, TResourceId, TBuildingId, TCommand>>,
    command: TCommand,
    services: RuntimeServices<TContent, TCommand, TResourceId, TBuildingId>,
  ): TContent | void;
  handleTick?(
    state: Readonly<EngineState<TContent, TResourceId, TBuildingId, TCommand>>,
    deltaMs: number,
    services: RuntimeServices<TContent, TCommand, TResourceId, TBuildingId>,
  ): TContent | void;
  syncAutomation?(
    state: Readonly<EngineState<TContent, TResourceId, TBuildingId, TCommand>>,
    cause: AutomationCause<TCommand, TBuildingId>,
    services: RuntimeServices<TContent, TCommand, TResourceId, TBuildingId>,
  ): void;
  buildViewModel?(
    state: Readonly<EngineState<TContent, TResourceId, TBuildingId, TCommand>>,
    options: ViewModelBuildOptions,
  ): IdleGameViewModel;
}

export interface IdleRuntime<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
> {
  readonly pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>;
  createInitialState(now?: number): EngineState<TContent, TResourceId, TBuildingId, TCommand>;
  step(
    state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
    action: EngineAction<TContent, TCommand, TResourceId, TBuildingId>,
    options: RuntimeExecutionOptions,
  ): EngineState<TContent, TResourceId, TBuildingId, TCommand>;
  advance(
    state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
    options: RuntimeExecutionOptions,
  ): EngineState<TContent, TResourceId, TBuildingId, TCommand>;
  buildViewModel(
    state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
    options: ViewModelBuildOptions,
  ): IdleGameViewModel | null;
  save(
    state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
  ): SaveEnvelope<EngineState<TContent, TResourceId, TBuildingId, TCommand>>;
  restore(
    envelope: SaveEnvelope<unknown>,
  ): EngineState<TContent, TResourceId, TBuildingId, TCommand>;
}
