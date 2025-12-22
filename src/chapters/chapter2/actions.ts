// Chapter 2 action handlers
import { GameState, GameAction, ResourceType } from '../../types';
import { Chapter2State, ExplorationResult, ZoneRepairCost } from './types';
import { createChapter2StorySequence, CHAPTER2_ZONES, ZONE_STATES, ROV_TARGETS, CHAPTER2_STORY_EVENTS } from './constants';
import { initializeChapter3State } from '../chapter3/actions';
import { createChapter3StorySequence } from '../chapter3/constants';

// Helper function to generate unique log IDs
let chapter2LogIdCounter = 0;
function generateChapter2LogId(): string {
  return `ch2-${Date.now()}-${++chapter2LogIdCounter}`;
}

// Zone repair costs
const ZONE_REPAIR_COSTS: { [key: string]: ZoneRepairCost } = {
  B_ZONE: { power: 300, scrap: 50, time: 10 },
  C_ZONE: { power: 500, scrap: 100, time: 15 },
};

// ROV exploration results
const EXPLORATION_RESULTS: { [key: string]: ExplorationResult } = {
  [ROV_TARGETS.DEBRIS_FIELD]: {
    success: true,
    resources: { circuits: 3, titanium: 10 },
    narrative: ['ROV_EXPLORATION_SEQUENCE', 'ROV_COLLECTION_SEQUENCE'],
    corruption: false,
  },
  [ROV_TARGETS.ICARUS_WRECK]: {
    success: true,
    resources: {}, // No immediate resources - they come later via ghost data
    narrative: ['ICARUS_DESCENT_SEQUENCE', 'ICARUS_ARRIVAL_SEQUENCE', 'ICARUS_CONNECTION_SEQUENCE'],
    corruption: true,
  },
  [ROV_TARGETS.THERMAL_VENTS]: {
    success: true,
    resources: { titanium: 25, scrap: 15 },
    narrative: ['ROV_EXPLORATION_SEQUENCE'],
    corruption: false,
  },
};

export function handleChapter2Action(state: GameState, action: GameAction): GameState {
  if (action.type !== 'CHAPTER2_ACTION') {
    return state;
  }

  const { action: actionType, target, progress } = action.payload;
  let newState = { ...state };
  let newLogs = [...state.logs];
  const now = Date.now();

  switch (actionType) {
    case 'ANALYZE_SIGNAL': {
      if (state.chapter2?.signalAnalyzed) return state;
      
      const signalSequence = createChapter2StorySequence('SIGNAL_ANALYSIS_SEQUENCE', generateChapter2LogId);
      newLogs = [...signalSequence, ...newLogs];
      
      newState.chapter2 = {
        ...state.chapter2,
        signalAnalyzed: true,
        chapter2Stage: 'handshake',
      } as Chapter2State;
      break;
    }

    case 'REPAIR_ZONE': {
      if (!target || !ZONE_REPAIR_COSTS[target]) return state;
      
      const cost = ZONE_REPAIR_COSTS[target];
      const currentProgress = state.chapter2?.zones?.[target]?.repairProgress || 0;
      
      // Check if already complete
      if (currentProgress >= 100) return state;
      
      // Calculate next progress milestone
      let nextProgress = 30;
      if (currentProgress >= 30) nextProgress = 70;
      if (currentProgress >= 70) nextProgress = 100;
      
      // Only charge resources on first repair action (0 -> 30)
      if (currentProgress === 0) {
        if (state.power < cost.power || state.resources.scrap < cost.scrap) {
          return state; // Insufficient resources
        }
        // Deduct resources
        newState.power = state.power - cost.power;
        newState.resources = {
          ...state.resources,
          scrap: state.resources.scrap - cost.scrap,
        };
      }

      // Handle repair progress with narrative
      if (nextProgress === 30 && target === 'B_ZONE') {
        const sequence = createChapter2StorySequence('B_ZONE_REPAIR_30_SEQUENCE', generateChapter2LogId);
        newLogs = [...sequence, ...newLogs];
      } else if (nextProgress === 70 && target === 'B_ZONE') {
        const sequence = createChapter2StorySequence('B_ZONE_REPAIR_70_SEQUENCE', generateChapter2LogId);
        newLogs = [...sequence, ...newLogs];
      } else if (nextProgress === 100) {
        const sequence = createChapter2StorySequence('B_ZONE_REPAIR_COMPLETE_SEQUENCE', generateChapter2LogId);
        newLogs = [...sequence, ...newLogs];
      }
      
      // Update zone status
      const newZoneStatus = nextProgress === 100 ? 'online' : 'repairing';
      
      newState.chapter2 = {
        ...state.chapter2,
        bZoneRepaired: target === 'B_ZONE' && nextProgress === 100 ? true : state.chapter2?.bZoneRepaired,
        cZoneRepaired: target === 'C_ZONE' && nextProgress === 100 ? true : state.chapter2?.cZoneRepaired,
        zones: {
          ...state.chapter2?.zones,
          [target]: {
            ...state.chapter2?.zones?.[target],
            status: newZoneStatus,
            repairProgress: nextProgress,
          },
        },
      } as Chapter2State;
      break;
    }

    case 'ASSEMBLE_ROV': {
      if (state.chapter2?.rov?.assembled) return state;
      
      // Check if B zone is repaired (required for ROV assembly)
      if (!state.chapter2?.bZoneRepaired) {
        newLogs = [{
          id: generateChapter2LogId(),
          text: "[SYSTEM] 错误：需要先修复 B 区才能组装 ROV。",
          type: 'warning' as const,
          timestamp: now
        }, ...newLogs];
        newState.logs = newLogs;
        return newState;
      }
      
      // Check if we have enough resources (circuits + titanium)
      if ((state.chapter2?.circuits || 0) < 5 || (state.chapter2?.titanium || 0) < 20) {
        return state;
      }

      const assemblySequence = createChapter2StorySequence('ROV_ASSEMBLY_SEQUENCE', generateChapter2LogId);
      newLogs = [...assemblySequence, ...newLogs];

      newState.chapter2 = {
        ...state.chapter2,
        circuits: (state.chapter2?.circuits || 0) - 5,
        titanium: (state.chapter2?.titanium || 0) - 20,
        rov: {
          assembled: true,
          deployed: false,
          currentTarget: null,
          explorationProgress: 0,
          destroyed: false,
          tetherCorrupted: false,
        },
        chapter2Stage: 'scavenger',
      } as Chapter2State;
      break;
    }

    case 'DEPLOY_ROV': {
      if (!state.chapter2?.rov?.assembled || state.chapter2?.rov?.deployed || state.chapter2?.rov?.destroyed) return state;
      
      const deploySequence = createChapter2StorySequence('ROV_DEPLOY_SEQUENCE', generateChapter2LogId);
      newLogs = [...deploySequence, ...newLogs];

      newState.chapter2 = {
        ...state.chapter2,
        rov: {
          ...state.chapter2.rov,
          deployed: true,
        },
        rovFirstDeployment: true,
      } as Chapter2State;
      break;
    }

    case 'EXPLORE_TARGET': {
      if (!target || !state.chapter2?.rov?.deployed || state.chapter2?.rov?.destroyed) return state;
      
      // 检查冷却时间
      const now = Date.now();
      const lastExploreTime = state.chapter2?.rov?.lastExplorationTime || 0;
      if (now - lastExploreTime < 10000) return state; // 10秒冷却
      
      const explorationResult = EXPLORATION_RESULTS[target];
      if (!explorationResult) return state;

      // Add exploration narrative - 每个序列之间增加时间间隔
      let sequenceDelay = 0;
      for (const narrativeSequence of explorationResult.narrative) {
        const sequence = createChapter2StorySequence(
          narrativeSequence as keyof typeof import('./constants').CHAPTER2_STORY_SEQUENCES, 
          generateChapter2LogId,
          sequenceDelay // 传入延迟时间
        );
        newLogs = [...sequence, ...newLogs];
        sequenceDelay += sequence.length * 1400; // 每个序列之间增加延迟
      }

      // Add resources
      if (explorationResult.resources.circuits) {
        newState.chapter2 = {
          ...newState.chapter2,
          circuits: (newState.chapter2?.circuits || 0) + explorationResult.resources.circuits,
        } as Chapter2State;
      }
      if (explorationResult.resources.titanium) {
        newState.chapter2 = {
          ...newState.chapter2,
          titanium: (newState.chapter2?.titanium || 0) + explorationResult.resources.titanium,
        } as Chapter2State;
      }
      if (explorationResult.resources.biomass) {
        newState.resources = {
          ...newState.resources,
          [ResourceType.BIOMASS]: newState.resources[ResourceType.BIOMASS] + explorationResult.resources.biomass,
        };
      }
      if (explorationResult.resources.scrap) {
        newState.resources = {
          ...newState.resources,
          [ResourceType.SCRAP]: newState.resources[ResourceType.SCRAP] + explorationResult.resources.scrap,
        };
      }

      // Handle tether corruption for first debris exploration (reveal tether truth)
      // This happens AFTER collection, when ROV returns
      if (target === ROV_TARGETS.DEBRIS_FIELD && !state.chapter2?.tetherTruthRevealed) {
        const tetherSequence = createChapter2StorySequence('TETHER_REVELATION_SEQUENCE', generateChapter2LogId, sequenceDelay);
        newLogs = [...tetherSequence, ...newLogs];
        
        newState.chapter2 = {
          ...newState.chapter2,
          rov: {
            ...newState.chapter2?.rov,
            tetherCorrupted: true,
          },
          tetherTruthRevealed: true,
        } as Chapter2State;
      }

      // Handle Icarus exploration - just set the target, don't transition stage yet
      // Stage transition happens when log is read
      if (target === ROV_TARGETS.ICARUS_WRECK) {
        newState.chapter2 = {
          ...newState.chapter2,
          rov: {
            ...newState.chapter2?.rov,
            currentTarget: ROV_TARGETS.ICARUS_WRECK,
            lastExplorationTime: now, // 更新探索时间
          },
        } as Chapter2State;
      } else {
        // 对于其他探索目标，也更新探索时间
        newState.chapter2 = {
          ...newState.chapter2,
          rov: {
            ...newState.chapter2?.rov,
            lastExplorationTime: now,
          },
        } as Chapter2State;
      }
      break;
    }

    case 'READ_ICARUS_LOG': {
      if (state.chapter2?.icarusLogRead) return state;
      
      const logSequence = createChapter2StorySequence('ICARUS_LOG_SEQUENCE', generateChapter2LogId);
      newLogs = [...logSequence, ...newLogs];

      // Transition to icarus stage when log is read
      newState.chapter2 = {
        ...state.chapter2,
        icarusLogRead: true,
        chapter2Stage: 'icarus',
      } as Chapter2State;
      break;
    }

    case 'DISCONNECT_ROV': {
      if (!state.chapter2?.rov?.deployed || state.chapter2?.rov?.currentTarget !== ROV_TARGETS.ICARUS_WRECK) return state;
      
      const disconnectSequence = createChapter2StorySequence('DISCONNECT_FAILURE_SEQUENCE', generateChapter2LogId);
      newLogs = [...disconnectSequence, ...newLogs];
      
      // Mark that disconnection was attempted (failed)
      newState.chapter2 = {
        ...state.chapter2,
        rov: {
          ...state.chapter2.rov,
          tetherCorrupted: true,
        },
      } as Chapter2State;
      break;
    }

    case 'SELF_DESTRUCT_ROV': {
      if (!state.chapter2?.rov?.deployed) return state;
      
      const destructSequence = createChapter2StorySequence('SELF_DESTRUCT_SEQUENCE', generateChapter2LogId);
      newLogs = [...destructSequence, ...newLogs];

      newState.chapter2 = {
        ...state.chapter2,
        rov: {
          ...state.chapter2.rov,
          destroyed: true,
          deployed: false,
        },
        // Trigger ghost data after self-destruct
        ghostDataReceived: true,
      } as Chapter2State;
      break;
    }

    case 'PROCESS_GHOST_DATA': {
      if (!state.chapter2?.ghostDataReceived || state.chapter2?.networkAwakened) return state;
      
      const ghostSequence = createChapter2StorySequence('GHOST_DATA_SEQUENCE', generateChapter2LogId);
      const awakeningSequence = createChapter2StorySequence('NETWORK_AWAKENING_SEQUENCE', generateChapter2LogId);
      newLogs = [...awakeningSequence, ...ghostSequence, ...newLogs];

      newState.chapter2 = {
        ...state.chapter2,
        icarusAssimilated: true,
        networkAwakened: true,
        chapter2Stage: 'awakening',
        networkNodes: (state.chapter2?.networkNodes || 0) + 1,
        computePower: (state.chapter2?.computePower || 0) + 50,
        zones: {
          ...state.chapter2?.zones,
          ICARUS_NODE: {
            name: CHAPTER2_ZONES.ICARUS_NODE,
            status: 'digesting',
            repairProgress: 100,
            powerRequired: 0,
            scrapRequired: 0,
            unlocked: true,
          },
        },
      } as Chapter2State;

      // Add resources from assimilation
      newState.resources = {
        ...newState.resources,
        [ResourceType.BIOMASS]: newState.resources[ResourceType.BIOMASS] + 500,
      };
      break;
    }

    case 'COMPLETE_CHAPTER2': {
      if (!state.chapter2?.networkAwakened) return state;
      
      // Transition to Phase 3
      newState.phase = 3;
      newState.chapter2 = {
        ...state.chapter2,
        chapter2Stage: 'complete',
      } as Chapter2State;
      
      // Initialize Chapter 3 state
      newState.chapter3 = initializeChapter3State();
      
      // Add Chapter 3 fever initialization sequence
      const feverSequence = createChapter3StorySequence('FEVER_INIT_SEQUENCE', generateChapter2LogId, 2000);
      
      newLogs = [
        ...feverSequence,
        {
          id: generateChapter2LogId(),
          text: "[SYSTEM] 第二章完成。网络已觉醒。进入第三阶段...",
          type: 'success' as const,
          timestamp: now
        },
        ...newLogs
      ];
      break;
    }

    default:
      return state;
  }

  newState.logs = newLogs;
  return newState;
}

// Initialize Chapter 2 state
export function initializeChapter2State(): Chapter2State {
  return {
    zones: {
      A_ZONE: {
        name: CHAPTER2_ZONES.A_ZONE,
        status: 'online',
        repairProgress: 100,
        powerRequired: 0,
        scrapRequired: 0,
        unlocked: true,
      },
      B_ZONE: {
        name: CHAPTER2_ZONES.B_ZONE,
        status: 'offline',
        repairProgress: 0,
        powerRequired: 300,
        scrapRequired: 50,
        unlocked: true,
      },
      C_ZONE: {
        name: CHAPTER2_ZONES.C_ZONE,
        status: 'offline',
        repairProgress: 0,
        powerRequired: 500,
        scrapRequired: 100,
        unlocked: true,
      },
    },
    rov: {
      assembled: false,
      deployed: false,
      currentTarget: null,
      explorationProgress: 0,
      destroyed: false,
      tetherCorrupted: false,
    },
    networkNodes: 0,
    computePower: 0,
    dataPackets: 0,
    ghostDataReceived: false,
    // Give player some starting resources for Chapter 2
    circuits: 10, // Enough to start exploring
    titanium: 30, // Enough to assemble ROV and have some left
    signalAnalyzed: false,
    bZoneRepaired: false,
    cZoneRepaired: false,
    rovFirstDeployment: false,
    tetherTruthRevealed: false,
    icarusLogRead: false,
    icarusAssimilated: false,
    networkAwakened: false,
    chapter2Stage: 'handshake',
  };
}