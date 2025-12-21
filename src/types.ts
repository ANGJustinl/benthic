export enum ResourceType {
  OXYGEN = 'oxygen',
  LUMENS = 'lumens',
  BIOMASS = 'biomass',
  SCRAP = 'scrap',
  EVOLUTION = 'evolution',
}

export enum BuildingType {
  PUMP = 'pump', // Auto-oxygen
  BIO_FILTER = 'bio_filter', // Passive biomass collection
  NODE = 'node', // Unlocks map/efficiency
  NEURAL_LINK = 'neural_link', // Phase 3 building
  COMMS_ARRAY = 'comms_array', // End of Chapter 1
}

export interface LogEntry {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'story' | 'horror' | 'success';
  timestamp: number;
}

export interface GameState {
  resources: Record<ResourceType, number>;
  buildings: Record<BuildingType, number>;
  flags: {
    gameStarted: boolean;
    hasLight: boolean;
    hasScavenged: boolean;
    inspectedJam: boolean;
    commsRepaired: boolean;
    oxygenCrisis: boolean;
    revealedTruth: boolean;
    // Chapter 1 specific flags
    systemBooted: boolean;
    crankStarted: boolean;
    filtersUnlocked: boolean;
    sonarUnlocked: boolean;
    impactOccurred: boolean;
    sosReceived: boolean;
    // Stage specific flags
    overheated: boolean;
    lowTempWarning: boolean;
    coldWeldingDiscovered: boolean;
    damageControlActive: boolean;
    furnaceUnlocked: boolean; // Track if furnace science message has been shown
  };
  phase: 1 | 2 | 3; // 1: Survival, 2: Management, 3: Ascension
  // Chapter 1 stages
  chapter1Stage: 'boot' | 'crank' | 'rust' | 'ghost' | 'impact' | 'complete';
  logs: LogEntry[];
  lastTick: number;
  totalClicks: number;
  lastCrankTime: number;
  lastFilterTime: number;
  lastFurnaceTime: number;
  lastSonarTime: number;
  lastDiagnosticsTime: number;
  maxOxygen: number;
  // Chapter 1 specific state
  coreTemperature: number;
  power: number;
  filterWaste: number;
  crankClicks: number;
  furnaceUses: number;
  sonarPings: number;
  hullIntegrity: number;
  damageControlTimer: number;
}

export type GameAction = 
  | { type: 'TICK'; payload: { now: number } }
  | { type: 'MANUAL_BREATHE' }
  | { type: 'IGNITE_FLARE' }
  | { type: 'SCAVENGE' }
  | { type: 'INSPECT_JAM' }
  | { type: 'REPAIR_COMMS' }
  | { type: 'BUILD'; payload: { building: BuildingType } }
  | { type: 'TRIGGER_EVENT'; payload: { text: string; type: LogEntry['type'] } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_GAME' }
  // Chapter 1 new actions
  | { type: 'MANUAL_CRANK' }
  | { type: 'SCRUB_FILTERS' }
  | { type: 'FEED_FURNACE' }
  | { type: 'SONAR_PING' }
  | { type: 'FULL_DIAGNOSTICS' }
  | { type: 'DAMAGE_CONTROL'; payload: { action: string } };