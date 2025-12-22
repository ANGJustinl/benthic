// Chapter 3 action handlers
import { GameState, GameAction, ResourceType } from '../../types';
import { Chapter3State } from './types';
import { createChapter3StorySequence, ZONE_TRANSFORMATIONS } from './constants';

// Helper function to generate unique log IDs
let chapter3LogIdCounter = 0;
function generateChapter3LogId(): string {
  return `ch3-${Date.now()}-${++chapter3LogIdCounter}`;
}

// Helper to check if epilogue was already triggered
function triggeredEpilogue(state: GameState): boolean {
  return state.chapter3?.epilogueTriggered === true;
}

export function handleChapter3Action(state: GameState, action: GameAction): GameState {
  if (action.type !== 'CHAPTER3_ACTION') {
    return state;
  }

  const { action: actionType, target, ending } = action.payload;
  let newState = { ...state };
  let newLogs = [...state.logs];
  const now = Date.now();

  switch (actionType) {
    case 'INJECT_COOLANT': {
      if (state.chapter3?.coolantInjected) return state;
      
      const coolantSequence = createChapter3StorySequence('COOLANT_SEQUENCE', generateChapter3LogId);
      newLogs = [...coolantSequence, ...newLogs];
      
      newState.chapter3 = {
        ...state.chapter3,
        coolantInjected: true,
        metabolismAccelerated: false, // Will be set to true after button transforms
        coreTemperatureOrganic: 38.5,
        uiCorruptionLevel: Math.min(100, (state.chapter3?.uiCorruptionLevel || 0) + 20),
      } as Chapter3State;
      break;
    }

    case 'ACCELERATE_METABOLISM': {
      if (!state.chapter3?.coolantInjected) return state;
      
      // 代谢序列
      const metabolismSequence = createChapter3StorySequence('METABOLISM_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...metabolismSequence, ...newLogs];
      
      // Increase resources dramatically
      newState.resources = {
        ...state.resources,
        [ResourceType.BIOMASS]: state.resources[ResourceType.BIOMASS] + 100,
      };
      
      const newNeuralVoltage = (state.chapter3?.neuralVoltage || 0) + 50;
      
      newState.chapter3 = {
        ...state.chapter3,
        metabolismAccelerated: true,
        coreTemperatureOrganic: (state.chapter3?.coreTemperatureOrganic || 38.5) + 0.5,
        neuralVoltage: newNeuralVoltage,
        uiCorruptionLevel: Math.min(100, (state.chapter3?.uiCorruptionLevel || 0) + 10),
      } as Chapter3State;
      
      // Check if ready to transition to molt stage
      // 只更新状态，不触发蜕皮警告序列（让用户再次点击时触发）
      if (newNeuralVoltage >= 150 && state.chapter3?.chapter3Stage === 'fever') {
        newState.chapter3 = {
          ...newState.chapter3,
          chapter3Stage: 'molt',
          structuralIntegrity: 100,
        } as Chapter3State;
      }
      break;
    }
    
    // 新增：蜕皮警告动作（当进入 molt 阶段时自动触发）
    case 'TRIGGER_MOLT_WARNING': {
      if (state.chapter3?.chapter3Stage !== 'molt') return state;
      // 检查是否已经显示过警告（通过检查 structuralIntegrity 是否还是 100）
      if (state.chapter3?.structuralIntegrity !== 100) return state;
      
      const moltWarningSequence = createChapter3StorySequence('MOLT_WARNING_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...moltWarningSequence, ...newLogs];
      
      // 降低结构完整性，表示警告已触发
      newState.chapter3 = {
        ...state.chapter3,
        structuralIntegrity: 99,
      } as Chapter3State;
      break;
    }

    case 'EMERGENCY_REINFORCE': {
      if (state.chapter3?.emergencyReinforceAttempted) return state;
      
      // This always fails - it's part of the narrative
      const reinforceSequence = createChapter3StorySequence('REINFORCE_FAIL_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...reinforceSequence, ...newLogs];
      
      newState.chapter3 = {
        ...state.chapter3,
        emergencyReinforceAttempted: true,
        structuralIntegrity: 0, // Drops to 0
        uiCorruptionLevel: Math.min(100, (state.chapter3?.uiCorruptionLevel || 0) + 30),
      } as Chapter3State;
      // shellShed 序列将通过 TRIGGER_SHELL_SHED action 触发
      break;
    }

    case 'TRIGGER_SHELL_SHED': {
      if (!state.chapter3?.emergencyReinforceAttempted || state.chapter3?.shellShed) return state;
      if (state.chapter3?.carapaceDensity !== 'softening') return state;
      
      const shellShedSequence = createChapter3StorySequence('SHELL_SHED_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...shellShedSequence, ...newLogs];
      
      // 不改变 shellShed，等待 CONTINUE_MOLT 完成
      break;
    }

    case 'CONTINUE_MOLT': {
      if (state.chapter3?.shellShed) return state;
      
      const currentCara = state.chapter3?.carapaceDensity || 'softening';
      let newCarapace: 'softening' | 'hardening' | 'complete' = 'softening';
      
      if (currentCara === 'softening') {
        newCarapace = 'hardening';
        newLogs = [{
          id: generateChapter3LogId(),
          text: '[UPDATE] 甲壳硬度: 硬化中',
          type: 'success' as const,
          timestamp: now
        }, ...newLogs];
      } else if (currentCara === 'hardening') {
        newCarapace = 'complete';
        
        // 只显示地图转换序列
        const mapSequence = createChapter3StorySequence('MAP_TRANSFORM_SEQUENCE', generateChapter3LogId, 0);
        newLogs = [...mapSequence, ...newLogs];
        
        // Initialize organic zones
        const organicZones: Chapter3State['organicZones'] = {};
        Object.entries(ZONE_TRANSFORMATIONS).forEach(([key, value]) => {
          organicZones[key] = {
            oldName: value.mechanical,
            newName: value.organic,
            status: 'organic'
          };
        });
        
        newState.chapter3 = {
          ...state.chapter3,
          shellShed: true,
          mapOrganicized: true,
          organicZones,
          uiCorruptionLevel: 80,
        } as Chapter3State;
        // interpret 和 encounter 序列将通过后续 action 触发
      }
      
      newState.chapter3 = {
        ...newState.chapter3,
        carapaceDensity: newCarapace,
      } as Chapter3State;
      break;
    }

    case 'TRIGGER_INTERPRET': {
      if (!state.chapter3?.shellShed || state.chapter3?.chapter3Stage === 'encounter') return state;
      
      const interpretSequence = createChapter3StorySequence('INTERPRET_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...interpretSequence, ...newLogs];
      break;
    }

    case 'TRIGGER_ENCOUNTER': {
      if (!state.chapter3?.shellShed || state.chapter3?.poseidonDetected) return state;
      
      const encounterSequence = createChapter3StorySequence('ENCOUNTER_DETECT_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...encounterSequence, ...newLogs];
      
      newState.chapter3 = {
        ...state.chapter3,
        chapter3Stage: 'encounter',
        poseidonDetected: true,
        poseidonApproaching: true,
      } as Chapter3State;
      break;
    }

    case 'SING': {
      if (state.chapter3?.hasSung || !state.chapter3?.poseidonDetected) return state;
      
      // 只显示歌唱序列
      const singSequence = createChapter3StorySequence('SING_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...singSequence, ...newLogs];
      
      newState.chapter3 = {
        ...state.chapter3,
        hasSung: true,
        poseidonSongSent: true,
      } as Chapter3State;
      // 波塞冬响应将通过 TRIGGER_POSEIDON_RESPONSE action 触发
      break;
    }

    case 'TRIGGER_POSEIDON_RESPONSE': {
      if (!state.chapter3?.hasSung || state.chapter3?.poseidonAssimilated) return state;
      
      const responseSequence = createChapter3StorySequence('POSEIDON_RESPONSE_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...responseSequence, ...newLogs];
      
      // Add Poseidon to organic zones
      const updatedZones = {
        ...state.chapter3?.organicZones,
        POSEIDON_NODE: {
          oldName: ZONE_TRANSFORMATIONS.POSEIDON_NODE.mechanical,
          newName: ZONE_TRANSFORMATIONS.POSEIDON_NODE.organic,
          status: 'organic' as const
        }
      };
      
      newState.chapter3 = {
        ...state.chapter3,
        poseidonAssimilated: true,
        organicZones: updatedZones,
        uiCorruptionLevel: 100,
      } as Chapter3State;
      // 飞升提示将通过 TRIGGER_ASCENSION_PROMPT action 触发
      break;
    }

    case 'TRIGGER_ASCENSION_PROMPT': {
      if (!state.chapter3?.poseidonAssimilated || state.chapter3?.finalChoiceAvailable) return state;
      
      const ascensionSequence = createChapter3StorySequence('ASCENSION_PROMPT_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...ascensionSequence, ...newLogs];
      
      newState.chapter3 = {
        ...state.chapter3,
        chapter3Stage: 'ascension',
        finalChoiceAvailable: true,
      } as Chapter3State;
      break;
    }

    case 'CHOOSE_ENDING': {
      if (!state.chapter3?.finalChoiceAvailable || !ending) return state;
      
      let endingSequence: any[] = [];
      
      switch (ending) {
        case 'deep':
          endingSequence = createChapter3StorySequence('ENDING_DEEP_SEQUENCE', generateChapter3LogId, 0);
          break;
        case 'spore':
          endingSequence = createChapter3StorySequence('ENDING_SPORE_SEQUENCE', generateChapter3LogId, 0);
          break;
        case 'beacon':
          endingSequence = createChapter3StorySequence('ENDING_BEACON_SEQUENCE', generateChapter3LogId, 0);
          break;
      }
      
      // 只显示结局序列
      newLogs = [...endingSequence, ...newLogs];
      
      newState.chapter3 = {
        ...state.chapter3,
        chosenEnding: ending,
      } as Chapter3State;
      // 尾声将通过 TRIGGER_EPILOGUE action 触发
      break;
    }

    case 'TRIGGER_EPILOGUE': {
      if (!state.chapter3?.chosenEnding) return state;
      // 只触发尾声序列，不设置 complete（让 COMPLETE_CHAPTER3 来设置）
      if (triggeredEpilogue(state)) return state;
      
      const epilogueSequence = createChapter3StorySequence('EPILOGUE_SEQUENCE', generateChapter3LogId, 0);
      newLogs = [...epilogueSequence, ...newLogs];
      
      // 标记尾声已触发，但不设置 complete
      newState.chapter3 = {
        ...state.chapter3,
        epilogueTriggered: true,
      } as Chapter3State;
      break;
    }

    case 'COMPLETE_CHAPTER3': {
      // Game is complete - this is just for cleanup if needed
      newState.chapter3 = {
        ...state.chapter3,
        chapter3Stage: 'complete',
      } as Chapter3State;
      break;
    }

    default:
      return state;
  }

  newState.logs = newLogs;
  return newState;
}

// Initialize Chapter 3 state
export function initializeChapter3State(): Chapter3State {
  return {
    chapter3Stage: 'fever',
    resourceOverflow: true,
    metabolismAccelerated: false,
    coreTemperatureOrganic: 38.5,
    neuralVoltage: 100, // Start with high neural voltage from Chapter 2
    structuralIntegrity: 100,
    carapaceDensity: 'softening',
    shellShed: false,
    mapOrganicized: false,
    organicZones: {},
    poseidonDetected: false,
    poseidonApproaching: false,
    poseidonAssimilated: false,
    hasSung: false,
    finalChoiceAvailable: false,
    chosenEnding: null,
    uiCorruptionLevel: 30, // Start with some corruption from Chapter 2
    coolantInjected: false,
    emergencyReinforceAttempted: false,
    poseidonSongSent: false,
  };
}
