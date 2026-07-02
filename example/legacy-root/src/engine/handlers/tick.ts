import { OXYGEN_DECAY_BASE, PRODUCTION, createStorySequence } from '../../constants';
import { BuildingType, GameState, ResourceType } from '../../types';
import { generateLogId } from '../logs';

export function handleTick(state: GameState, now: number): GameState {
  const nextState: GameState = {
    ...state,
    flags: { ...state.flags },
    resources: { ...state.resources },
    chapter2: state.chapter2 ? { ...state.chapter2 } : undefined,
    lastTick: now,
  };

  if (!state.flags.systemBooted && state.logs.length === 0) {
    nextState.logs = createStorySequence('BOOT_SEQUENCE', generateLogId);
    return nextState;
  }

  const oxygenGen = state.buildings[BuildingType.PUMP] * PRODUCTION[BuildingType.PUMP][ResourceType.OXYGEN] || 0;
  const bioFilterCount = state.buildings[BuildingType.BIO_FILTER];
  let biomassGen = 0;
  let scrapGen = 0;
  let lumensGen = 0;

  for (let i = 0; i < bioFilterCount; i++) {
    if (Math.random() < 0.1) {
      const resourceTypes = [ResourceType.BIOMASS, ResourceType.SCRAP, ResourceType.LUMENS];
      const randomResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

      switch (randomResource) {
        case ResourceType.BIOMASS:
          biomassGen += Math.random() * 2 + 1;
          break;
        case ResourceType.SCRAP:
          scrapGen += Math.random() * 3 + 5;
          break;
        case ResourceType.LUMENS:
          lumensGen += Math.random() * 1 + 0.5;
          break;
      }
    }
  }

  if (state.phase === 3) {
    biomassGen += state.buildings[BuildingType.NODE] * 0.2;
  }

  const oxygenConsumption = state.phase === 1 ? OXYGEN_DECAY_BASE * 0.8 : OXYGEN_DECAY_BASE;
  let newOxygen = state.resources[ResourceType.OXYGEN] + oxygenGen - oxygenConsumption;

  if (newOxygen > state.maxOxygen) {
    newOxygen = state.maxOxygen;
  }

  if (newOxygen <= 1 && state.chapter1Stage === 'boot' && !state.flags.oxygenCrisis) {
    nextState.flags.oxygenCrisis = true;
    nextState.logs = [
      ...createStorySequence('OXYGEN_CRISIS_SEQUENCE', generateLogId),
      ...state.logs,
    ];
  } else if (newOxygen > 5) {
    nextState.flags.oxygenCrisis = false;
  }

  if (newOxygen <= 0) {
    newOxygen = 0;
  }

  nextState.resources = {
    ...nextState.resources,
    [ResourceType.OXYGEN]: newOxygen,
    [ResourceType.BIOMASS]: state.resources[ResourceType.BIOMASS] + biomassGen,
    [ResourceType.SCRAP]: state.resources[ResourceType.SCRAP] + scrapGen,
    [ResourceType.LUMENS]: state.resources[ResourceType.LUMENS] + lumensGen,
  };

  if (state.coreTemperature < 5 && !state.flags.lowTempWarning) {
    nextState.flags.lowTempWarning = true;
    nextState.logs = [
      ...createStorySequence('LOW_TEMP_SEQUENCE', generateLogId),
      ...nextState.logs,
    ];
  }

  if (state.damageControlTimer > 0) {
    nextState.damageControlTimer = Math.max(0, state.damageControlTimer - 1);
    if (nextState.damageControlTimer === 0) {
      nextState.flags.damageControlActive = false;
    }
  }

  if (state.flags.overheated && now - state.lastCrankTime > 5000) {
    nextState.flags.overheated = false;
  }

  if (state.phase >= 2 && state.chapter2 && nextState.chapter2) {
    if (state.chapter2.bZoneRepaired) {
      if (Math.random() < 0.1) {
        nextState.chapter2 = {
          ...nextState.chapter2,
          circuits: (nextState.chapter2.circuits || 0) + 1,
        };
      }
      if (Math.random() < 0.15) {
        nextState.chapter2 = {
          ...nextState.chapter2,
          titanium: (nextState.chapter2.titanium || 0) + 2,
        };
      }
    }

    if (state.chapter2.networkAwakened) {
      nextState.chapter2 = {
        ...nextState.chapter2,
        computePower: (nextState.chapter2.computePower || 0) + 0.5,
      };
      if (Math.random() < 0.2) {
        nextState.resources = {
          ...nextState.resources,
          [ResourceType.BIOMASS]: nextState.resources[ResourceType.BIOMASS] + 5,
        };
      }
    }
  }

  return nextState;
}
