import { COSTS, STORY_EVENTS, createStorySequence } from '../../constants';
import { CHAPTER1_STORY_EVENTS } from '../../chapters/chapter1/constants';
import { initializeChapter2State } from '../../chapters/chapter2/actions';
import { BuildingType, GameAction, GameState, ResourceType } from '../../types';
import { applyScaledCost, canAffordScaledCost } from '../economy';
import { generateLogId } from '../logs';

export function handleChapter1Action(state: GameState, action: GameAction): GameState | null {
  switch (action.type) {
    case 'MANUAL_CRANK': {
      const now = Date.now();
      if (state.flags.overheated) return state;
      if (now - state.lastCrankTime < 1000) return state;

      const gain = 3;
      let newLogs = state.logs;
      const newCrankClicks = state.crankClicks + 1;
      const newFlags = { ...state.flags };
      let newChapter1Stage = state.chapter1Stage;
      const isRapidClicking = now - state.lastCrankTime < 2000;

      if (!state.flags.crankStarted) {
        newFlags.crankStarted = true;
        newFlags.gameStarted = true;
      }

      if (isRapidClicking && newCrankClicks > 10 && !state.flags.overheated) {
        newFlags.overheated = true;
        return {
          ...state,
          flags: newFlags,
          crankClicks: newCrankClicks,
          lastCrankTime: now,
          logs: [
            ...createStorySequence('OVERHEAT_SEQUENCE', generateLogId),
            ...state.logs,
          ],
        };
      }

      let isStageTransition = false;
      if (state.chapter1Stage === 'boot' && state.resources[ResourceType.OXYGEN] + gain > 20 && newCrankClicks > 15) {
        newChapter1Stage = 'rust';
        newFlags.filtersUnlocked = true;
        newLogs = [
          ...createStorySequence('RUST_STAGE_TRANSITION', generateLogId),
          ...state.logs,
        ];
        isStageTransition = true;
      }

      if (!isStageTransition) {
        if (newCrankClicks <= 5) {
          const rustMessages = [STORY_EVENTS.CRANK_RUST_1, STORY_EVENTS.CRANK_RUST_2, STORY_EVENTS.CRANK_RUST_3];
          const randomMessage = rustMessages[Math.floor(Math.random() * rustMessages.length)];
          newLogs = [{
            id: generateLogId(),
            text: randomMessage,
            type: 'warning',
            timestamp: now,
          }, ...state.logs];
        } else if (newCrankClicks <= 15) {
          const hopeMessages = [STORY_EVENTS.CRANK_HOPE_1, STORY_EVENTS.CRANK_HOPE_2];
          const randomMessage = hopeMessages[Math.floor(Math.random() * hopeMessages.length)];
          newLogs = [{
            id: generateLogId(),
            text: randomMessage,
            type: 'info',
            timestamp: now,
          }, ...state.logs];
        } else if (newCrankClicks <= 30) {
          const recoveryMessages = [STORY_EVENTS.CRANK_RECOVERY_1, STORY_EVENTS.CRANK_RECOVERY_2, STORY_EVENTS.CRANK_RECOVERY_3];
          const randomMessage = recoveryMessages[Math.floor(Math.random() * recoveryMessages.length)];
          newLogs = [{
            id: generateLogId(),
            text: randomMessage,
            type: 'info',
            timestamp: now,
          }, ...state.logs];
        }
      }

      return {
        ...state,
        resources: {
          ...state.resources,
          [ResourceType.OXYGEN]: Math.min(state.resources[ResourceType.OXYGEN] + gain, state.maxOxygen),
        },
        flags: newFlags,
        chapter1Stage: newChapter1Stage,
        crankClicks: newCrankClicks,
        lastCrankTime: now,
        logs: newLogs,
      };
    }

    case 'MANUAL_BREATHE': {
      const now = Date.now();
      if (now - state.lastCrankTime < 1000) return state;

      const gain = 5;
      let newLogs = state.logs;
      const newFlags = { ...state.flags };

      if (!state.flags.gameStarted) {
        newFlags.gameStarted = true;
        newLogs = [{
          id: generateLogId(),
          text: STORY_EVENTS.FIRST_BREATH,
          type: 'info',
          timestamp: now,
        }, ...state.logs];
      }

      return {
        ...state,
        resources: {
          ...state.resources,
          [ResourceType.OXYGEN]: Math.min(state.resources[ResourceType.OXYGEN] + gain, state.maxOxygen),
        },
        flags: newFlags,
        totalClicks: state.totalClicks + 1,
        lastCrankTime: now,
        logs: newLogs,
      };
    }

    case 'SCRUB_FILTERS': {
      if (!state.flags.filtersUnlocked) return state;

      const now = Date.now();
      if (now - state.lastFilterTime < 2000) return state;

      const wasteGain = Math.random() * 2 + 1;
      const newWasteTotal = state.filterWaste + wasteGain;
      const newFlags = { ...state.flags };
      let message = '';

      if (!state.flags.furnaceUnlocked && newWasteTotal >= 3) {
        message = STORY_EVENTS.FILTER_SCIENCE;
        newFlags.furnaceUnlocked = true;
      } else {
        const regularMessages = [STORY_EVENTS.FILTER_SCRUB_1, STORY_EVENTS.FILTER_SCRUB_2, STORY_EVENTS.FILTER_SCRUB_3];
        message = regularMessages[Math.floor(Math.random() * regularMessages.length)];
      }

      return {
        ...state,
        filterWaste: newWasteTotal,
        flags: newFlags,
        lastFilterTime: now,
        logs: [{
          id: generateLogId(),
          text: message,
          type: 'info',
          timestamp: now,
        }, ...state.logs],
      };
    }

    case 'FEED_FURNACE': {
      if (state.filterWaste < 1) return state;

      const now = Date.now();
      if (now - state.lastFurnaceTime < 3000) return state;

      const powerGain = 50;
      const tempGain = 2;
      const wasteConsumed = 1;
      const newFurnaceUses = state.furnaceUses + 1;
      let furnaceMessage = '';
      let messageType: 'info' | 'success' | 'warning' = 'info';

      if (newFurnaceUses === 1) {
        furnaceMessage = STORY_EVENTS.FURNACE_FIRST_USE;
      } else if (newFurnaceUses === 3) {
        furnaceMessage = STORY_EVENTS.FURNACE_WARMING_UP;
      } else if (newFurnaceUses === 5) {
        furnaceMessage = STORY_EVENTS.FURNACE_STABLE_BURN;
        messageType = 'warning';
      } else if (newFurnaceUses === 7) {
        furnaceMessage = STORY_EVENTS.FURNACE_EFFICIENT;
        messageType = 'success';
      } else if (newFurnaceUses === 10) {
        furnaceMessage = STORY_EVENTS.FURNACE_OPTIMAL;
        messageType = 'success';
      }

      let newLogs = state.logs;
      if (furnaceMessage) {
        newLogs = [{
          id: generateLogId(),
          text: furnaceMessage,
          type: messageType,
          timestamp: now,
        }, ...state.logs];
      }

      const newTemp = state.coreTemperature + tempGain;
      const newFlags = { ...state.flags };
      let newChapter1Stage = state.chapter1Stage;

      if (newTemp >= 20 && state.coreTemperature < 20) {
        newLogs = [
          ...createStorySequence('WARM_SEQUENCE', generateLogId),
          ...newLogs,
        ];
      }

      if (state.chapter1Stage === 'rust' && state.power + powerGain >= 60) {
        newChapter1Stage = 'ghost';
        newFlags.sonarUnlocked = true;
        newLogs = [{
          id: generateLogId(),
          text: STORY_EVENTS.SONAR_UNLOCK,
          type: 'success',
          timestamp: now,
        }, ...newLogs];
      }

      return {
        ...state,
        filterWaste: state.filterWaste - wasteConsumed,
        power: state.power + powerGain,
        coreTemperature: newTemp,
        furnaceUses: newFurnaceUses,
        flags: newFlags,
        chapter1Stage: newChapter1Stage,
        lastFurnaceTime: now,
        logs: newLogs,
      };
    }

    case 'COLLECT_RESOURCES': {
      const now = Date.now();
      if (now - (state.lastCollectTime || 0) < 3000) return state;

      const scrapGain = Math.floor(Math.random() * 4) + 2;
      const biomassGain = Math.floor(Math.random() * 3) + 1;
      const lumensGain = Math.floor(Math.random() * 2) + 1;
      const scavengeMessages = [
        'SCAVENGE_1', 'SCAVENGE_2', 'SCAVENGE_3', 'SCAVENGE_4',
        'SCAVENGE_5', 'SCAVENGE_6', 'SCAVENGE_7', 'SCAVENGE_8',
      ];
      const randomMessage = scavengeMessages[Math.floor(Math.random() * scavengeMessages.length)];
      const messageText = CHAPTER1_STORY_EVENTS[randomMessage as keyof typeof CHAPTER1_STORY_EVENTS];

      return {
        ...state,
        resources: {
          ...state.resources,
          [ResourceType.SCRAP]: state.resources[ResourceType.SCRAP] + scrapGain,
          [ResourceType.BIOMASS]: state.resources[ResourceType.BIOMASS] + biomassGain,
          [ResourceType.LUMENS]: state.resources[ResourceType.LUMENS] + lumensGain,
        },
        logs: [{
          id: generateLogId(),
          text: messageText,
          type: 'story',
          timestamp: now,
        }, ...state.logs],
        lastCollectTime: now,
      };
    }

    case 'SONAR_PING': {
      if (!state.flags.sonarUnlocked || state.power < 20) return state;

      const now = Date.now();
      if (now - state.lastSonarTime < 4000) return state;

      const newPings = state.sonarPings + 1;
      let newLogs = state.logs;

      if (newPings === 1) {
        newLogs = [...createStorySequence('SONAR_PING_1', generateLogId), ...state.logs];
      } else if (newPings === 2) {
        newLogs = [...createStorySequence('SONAR_PING_2', generateLogId), ...state.logs];
      } else if (newPings === 3) {
        newLogs = [...createStorySequence('SONAR_PING_3', generateLogId), ...state.logs];
      }

      return {
        ...state,
        power: state.power - 20,
        sonarPings: newPings,
        lastSonarTime: now,
        logs: newLogs,
      };
    }

    case 'FULL_DIAGNOSTICS': {
      if (!state.flags.sonarUnlocked || state.flags.coldWeldingDiscovered) return state;

      const now = Date.now();
      if (now - state.lastDiagnosticsTime < 8000) return state;

      const newFlags = {
        ...state.flags,
        coldWeldingDiscovered: true,
        impactOccurred: true,
        damageControlActive: true,
      };
      const diagnosticLogs = createStorySequence('DIAGNOSTIC_SEQUENCE', generateLogId);
      const impactLogs = createStorySequence('IMPACT_SEQUENCE', generateLogId);
      const adjustedImpactLogs = impactLogs.map((log, index) => ({
        ...log,
        timestamp: now + (index * 100),
      }));

      return {
        ...state,
        hullIntegrity: 62,
        damageControlTimer: 60,
        flags: newFlags,
        chapter1Stage: 'impact',
        lastDiagnosticsTime: now,
        logs: [...adjustedImpactLogs, ...diagnosticLogs, ...state.logs],
      };
    }

    case 'DAMAGE_CONTROL': {
      if (!state.flags.damageControlActive) return state;

      const actionType = action.payload.action;
      let success = false;
      let message = '';

      switch (actionType) {
        case 'seal_a':
          success = Math.random() < 0.3;
          message = success ? STORY_EVENTS.SEAL_B_SUCCESS : STORY_EVENTS.SEAL_A_FAIL;
          break;
        case 'seal_b':
          success = true;
          message = STORY_EVENTS.SEAL_B_SUCCESS;
          break;
        case 'pump':
          success = true;
          message = STORY_EVENTS.PUMP_OVERCLOCK;
          break;
        case 'hardener':
          success = true;
          message = STORY_EVENTS.HARDENER_RELEASE;
          break;
      }

      const newHullIntegrity = success ? Math.min(100, state.hullIntegrity + 10) : state.hullIntegrity;

      if (newHullIntegrity >= 80 || state.damageControlTimer <= 10) {
        return {
          ...state,
          chapter1Stage: 'complete',
          phase: 2,
          hullIntegrity: newHullIntegrity,
          resources: {
            ...state.resources,
            [ResourceType.SCRAP]: state.resources[ResourceType.SCRAP] + 20,
            [ResourceType.BIOMASS]: state.resources[ResourceType.BIOMASS] + 10,
          },
          flags: {
            ...state.flags,
            sosReceived: true,
            damageControlActive: false,
            revealedTruth: true,
            hasLight: true,
          },
          chapter2: initializeChapter2State(),
          damageControlTimer: 0,
          logs: [
            {
              id: generateLogId(),
              text: '系统重启完成。进入标准操作模式。',
              type: 'success',
              timestamp: Date.now() + 100,
            },
            ...createStorySequence('SOS_SEQUENCE', generateLogId),
            {
              id: generateLogId(),
              text: message,
              type: success ? 'success' : 'warning',
              timestamp: Date.now() - 1200,
            },
            ...state.logs,
          ],
        };
      }

      return {
        ...state,
        hullIntegrity: newHullIntegrity,
        logs: [{
          id: generateLogId(),
          text: message,
          type: success ? 'success' : 'warning',
          timestamp: Date.now(),
        }, ...state.logs],
      };
    }

    case 'IGNITE_FLARE': {
      if (state.flags.hasLight || state.resources[ResourceType.OXYGEN] < 10) return state;

      return {
        ...state,
        resources: {
          ...state.resources,
          [ResourceType.OXYGEN]: state.resources[ResourceType.OXYGEN] - 10,
        },
        flags: {
          ...state.flags,
          hasLight: true,
        },
        logs: [{
          id: generateLogId(),
          text: STORY_EVENTS.LIGHT_ON,
          type: 'success',
          timestamp: Date.now(),
        }, ...state.logs],
      };
    }

    case 'SCAVENGE': {
      if (!state.flags.hasLight) return state;

      const resourceTypes = [ResourceType.BIOMASS, ResourceType.SCRAP, ResourceType.LUMENS];
      const randomResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      let resourceGain = 0;
      let logMessage = STORY_EVENTS.DISCOVERY_BIOMASS;

      switch (randomResource) {
        case ResourceType.BIOMASS:
          resourceGain = Math.random() * 2 + 1;
          logMessage = STORY_EVENTS.DISCOVERY_BIOMASS;
          break;
        case ResourceType.SCRAP:
          resourceGain = Math.random() * 3 + 2;
          logMessage = '刮削器返回：金属碎片。可回收利用。';
          break;
        case ResourceType.LUMENS:
          resourceGain = Math.random() * 1 + 0.5;
          logMessage = '刮削器返回：发光藻类。生物荧光微弱但稳定。';
          break;
      }

      let newLogs = [{
        id: generateLogId(),
        text: logMessage,
        type: 'info',
        timestamp: Date.now(),
      }, ...state.logs];
      const newFlags = { ...state.flags };
      const totalScavenged = state.resources[ResourceType.BIOMASS] + state.resources[ResourceType.SCRAP];

      if (totalScavenged + resourceGain >= 10 && !state.flags.hasScavenged) {
        newFlags.hasScavenged = true;
        newLogs = [{
          id: generateLogId(),
          text: STORY_EVENTS.SCRAPER_JAMMED,
          type: 'warning',
          timestamp: Date.now(),
        }, ...newLogs];
      }

      return {
        ...state,
        resources: {
          ...state.resources,
          [randomResource]: state.resources[randomResource] + resourceGain,
        },
        flags: newFlags,
        logs: newLogs,
      };
    }

    case 'INSPECT_JAM':
      if (state.flags.inspectedJam) return state;

      return {
        ...state,
        flags: {
          ...state.flags,
          inspectedJam: true,
        },
        logs: [{
          id: generateLogId(),
          text: STORY_EVENTS.INSPECT_JAM,
          type: 'story',
          timestamp: Date.now(),
        }, ...state.logs],
      };

    case 'REPAIR_COMMS': {
      const building = BuildingType.COMMS_ARRAY;
      const costConfig = COSTS[building];
      const currentCount = state.buildings[building];

      if (!canAffordScaledCost(state.resources, costConfig, currentCount) || state.flags.commsRepaired) {
        return state;
      }

      const newResources = applyScaledCost(state.resources, costConfig, currentCount);

      return {
        ...state,
        phase: 2,
        resources: {
          ...newResources,
          [ResourceType.SCRAP]: newResources[ResourceType.SCRAP] + 15,
          [ResourceType.BIOMASS]: newResources[ResourceType.BIOMASS] + 10,
          [ResourceType.LUMENS]: newResources[ResourceType.LUMENS] + 5,
        },
        buildings: {
          ...state.buildings,
          [BuildingType.COMMS_ARRAY]: currentCount + 1,
        },
        flags: {
          ...state.flags,
          commsRepaired: true,
          revealedTruth: true,
          hasLight: true,
        },
        chapter2: initializeChapter2State(),
        logs: [
          ...createStorySequence('COMMS_REPAIR_SEQUENCE', generateLogId),
          {
            id: generateLogId(),
            text: '系统重启中... 检测到新的可用资源。',
            type: 'info',
            timestamp: Date.now() - 200,
          },
          ...state.logs,
        ],
      };
    }

    default:
      return null;
  }
}
