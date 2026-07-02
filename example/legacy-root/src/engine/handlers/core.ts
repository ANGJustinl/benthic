import { COSTS, STORY_EVENTS } from '../../constants';
import { initializeChapter2State } from '../../chapters/chapter2/actions';
import { BuildingType, GameAction, GameState } from '../../types';
import { applyScaledCost, canAffordScaledCost } from '../economy';
import { generateLogId } from '../logs';
import { createInitialGameState } from '../state';

export function handleCoreAction(state: GameState, action: GameAction): GameState | null {
  switch (action.type) {
    case 'BUILD': {
      const building = action.payload.building;
      const currentCount = state.buildings[building];
      const costConfig = COSTS[building];

      if (!canAffordScaledCost(state.resources, costConfig, currentCount)) {
        return state;
      }

      const newResources = applyScaledCost(state.resources, costConfig, currentCount);
      const newBuildings = { ...state.buildings, [building]: currentCount + 1 };
      let newPhase = state.phase;
      let newLogs = state.logs;

      if (building === BuildingType.NODE && newBuildings[BuildingType.NODE] >= 5 && state.phase === 2) {
        newPhase = 3;
        newLogs = [{
          id: generateLogId(),
          text: STORY_EVENTS.PHASE_3_START,
          type: 'horror',
          timestamp: Date.now(),
        }, ...state.logs];
      }

      return {
        ...state,
        resources: newResources,
        buildings: newBuildings,
        phase: newPhase,
        logs: newLogs,
      };
    }

    case 'LOAD_GAME':
      return action.payload;

    case 'RESET_GAME':
      return createInitialGameState();

    case 'SET_PHASE': {
      const newState = { ...state, phase: action.payload.phase };
      if (action.payload.phase === 2 && !state.chapter2) {
        newState.chapter2 = initializeChapter2State();
      }
      return newState;
    }

    case 'ADD_RESOURCE':
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.resourceType]: state.resources[action.payload.resourceType] + action.payload.amount,
        },
      };

    case 'SET_POWER':
      return {
        ...state,
        power: action.payload.power,
      };

    case 'SET_CHAPTER2_RESOURCES':
      if (!state.chapter2) {
        return state;
      }
      return {
        ...state,
        chapter2: {
          ...state.chapter2,
          circuits: action.payload.circuits !== undefined ? action.payload.circuits : state.chapter2.circuits,
          titanium: action.payload.titanium !== undefined ? action.payload.titanium : state.chapter2.titanium,
        },
      };

    case 'RESET_CHAPTER2_ZONE':
      if (!state.chapter2) {
        return state;
      }
      return {
        ...state,
        chapter2: {
          ...state.chapter2,
          bZoneRepaired: action.payload.zone === 'B_ZONE' ? false : state.chapter2.bZoneRepaired,
          zones: {
            ...state.chapter2.zones,
            [action.payload.zone]: {
              ...state.chapter2.zones[action.payload.zone],
              status: 'offline',
              repairProgress: 0,
            },
          },
        },
      };

    case 'RESET_CHAPTER2_ROV':
      if (!state.chapter2) {
        return state;
      }
      return {
        ...state,
        chapter2: {
          ...state.chapter2,
          rov: {
            assembled: false,
            deployed: false,
            currentTarget: null,
            explorationProgress: 0,
            destroyed: false,
            tetherCorrupted: false,
          },
        },
      };

    case 'RESET_CHAPTER2_NETWORK':
      if (!state.chapter2) {
        return state;
      }
      return {
        ...state,
        chapter2: {
          ...state.chapter2,
          networkAwakened: false,
          icarusAssimilated: false,
        },
      };

    default:
      return null;
  }
}
