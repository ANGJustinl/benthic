import { Chapter2State } from './chapters/chapter2/types';
import { Chapter3State } from './chapters/chapter3/types';

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
  damageControlProgress?: {
    seal_a: boolean;
    seal_b: boolean;
    pump: boolean;
    hardener: boolean;
  };
  // Chapter 2 state
  chapter2?: Chapter2State;
  // Chapter 3 state
  chapter3?: Chapter3State;
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
  | { type: 'DAMAGE_CONTROL'; payload: { action: string } }
  // Chapter 2 actions
  | { type: 'CHAPTER2_ACTION'; payload: { 
      action: 'ANALYZE_SIGNAL' | 'REPAIR_ZONE' | 'ASSEMBLE_ROV' | 'DEPLOY_ROV' | 
              'EXPLORE_TARGET' | 'READ_ICARUS_LOG' | 'DISCONNECT_ROV' | 'SELF_DESTRUCT_ROV' |
              'PROCESS_GHOST_DATA' | 'COMPLETE_CHAPTER2';
      target?: string;
      progress?: number;
    } }
  // Chapter 3 actions
  | { type: 'CHAPTER3_ACTION'; payload: { 
      action: 'INJECT_COOLANT' | 'ACCELERATE_METABOLISM' | 'TRIGGER_MOLT_WARNING' | 
              'EMERGENCY_REINFORCE' | 'TRIGGER_SHELL_SHED' | 
              'CONTINUE_MOLT' | 'TRIGGER_INTERPRET' | 'TRIGGER_ENCOUNTER' |
              'SING' | 'TRIGGER_POSEIDON_RESPONSE' | 'TRIGGER_ASCENSION_PROMPT' |
              'CHOOSE_ENDING' | 'TRIGGER_EPILOGUE' | 'COMPLETE_CHAPTER3';
      target?: string;
      ending?: 'deep' | 'spore' | 'beacon';
    } }
  // Test helper actions
  | { type: 'SET_PHASE'; payload: { phase: 1 | 2 | 3 } }
  | { type: 'ADD_RESOURCE'; payload: { resourceType: ResourceType; amount: number } }
  | { type: 'SET_POWER'; payload: { power: number } }
  | { type: 'SET_CHAPTER2_RESOURCES'; payload: { circuits?: number; titanium?: number } }
  | { type: 'RESET_CHAPTER2_ZONE'; payload: { zone: string } }
  | { type: 'RESET_CHAPTER2_ROV' }
  | { type: 'RESET_CHAPTER2_NETWORK' };