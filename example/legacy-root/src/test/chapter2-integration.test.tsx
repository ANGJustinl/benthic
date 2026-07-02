/**
 * Chapter 2 Integration Tests
 * Tests all functionality described in CHAPTER2_TEST_CHECKLIST.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../hooks/useGameEngine';
import { GameAction, ResourceType } from '../types';
import { initializeChapter2State, ROV_TARGETS } from '../chapters/chapter2';

describe('Chapter 2: The Silent Network - Integration Tests', () => {
  let result: any;

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useGameEngine());
    result = hookResult;
    
    // Fast-forward to Chapter 2 by setting phase to 2
    act(() => {
      result.current.dispatch({
        type: 'SET_PHASE',
        payload: { phase: 2 }
      });
    });
  });

  describe('🚀 Quick Jump to Chapter 2', () => {
    it('should transition to Phase 2 and initialize Chapter 2 state', () => {
      expect(result.current.state.phase).toBe(2);
      expect(result.current.state.chapter2).toBeDefined();
      expect(result.current.state.chapter2.chapter2Stage).toBe('handshake');
    });

    it('should display Chapter 2 resources', () => {
      const state = result.current.state;
      expect(state.chapter2.circuits).toBeGreaterThanOrEqual(0);
      expect(state.chapter2.titanium).toBeGreaterThanOrEqual(0);
      expect(state.chapter2.computePower).toBeGreaterThanOrEqual(0);
      expect(state.chapter2.networkNodes).toBeGreaterThanOrEqual(0);
    });

    it('should have zones initialized', () => {
      const zones = result.current.state.chapter2.zones;
      expect(zones.A_ZONE).toBeDefined();
      expect(zones.B_ZONE).toBeDefined();
      expect(zones.C_ZONE).toBeDefined();
      expect(zones.A_ZONE.status).toBe('online');
      expect(zones.B_ZONE.status).toBe('offline');
    });
  });

  describe('📡 Stage I: Signal Analysis', () => {
    it('should analyze external signal and display sequence', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ANALYZE_SIGNAL' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.signalAnalyzed).toBe(true);
      expect(state.chapter2.chapter2Stage).toBe('handshake');
      
      // Check that signal analysis logs were added
      const logs = state.logs;
      const signalLogs = logs.filter((log: any) => 
        log.text.includes('COMMS') || log.text.includes('信号')
      );
      expect(signalLogs.length).toBeGreaterThan(0);
    });

    it('should not analyze signal twice', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ANALYZE_SIGNAL' }
        });
      });

      const logCountAfterFirst = result.current.state.logs.length;

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ANALYZE_SIGNAL' }
        });
      });

      // Should not add more logs
      expect(result.current.state.logs.length).toBe(logCountAfterFirst);
    });
  });

  describe('🔧 Zone Management', () => {
    it('should display three zones with correct initial states', () => {
      const zones = result.current.state.chapter2.zones;
      
      expect(zones.A_ZONE.status).toBe('online');
      expect(zones.A_ZONE.repairProgress).toBe(100);
      
      expect(zones.B_ZONE.status).toBe('offline');
      expect(zones.B_ZONE.repairProgress).toBe(0);
      expect(zones.B_ZONE.powerRequired).toBe(300);
      expect(zones.B_ZONE.scrapRequired).toBe(50);
      
      expect(zones.C_ZONE.status).toBe('offline');
      expect(zones.C_ZONE.repairProgress).toBe(0);
    });

    it('should repair B zone with sufficient resources', () => {
      // Give player enough resources
      act(() => {
        result.current.dispatch({
          type: 'ADD_RESOURCE',
          payload: { 
            resourceType: ResourceType.SCRAP, 
            amount: 100 
          }
        });
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 500 }
        });
      });

      // Start repair
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.zones.B_ZONE.repairProgress).toBeGreaterThan(0);
      expect(state.chapter2.zones.B_ZONE.status).toBe('repairing');
    });

    it('should not repair zone without sufficient resources', () => {
      // Ensure insufficient resources
      act(() => {
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 0 }
        });
      });

      const initialProgress = result.current.state.chapter2.zones.B_ZONE.repairProgress;

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
        });
      });

      expect(result.current.state.chapter2.zones.B_ZONE.repairProgress).toBe(initialProgress);
    });
  });

  describe('🤖 ROV System', () => {
    beforeEach(() => {
      // Repair B zone first (required for ROV assembly)
      act(() => {
        result.current.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resourceType: ResourceType.SCRAP, amount: 100 }
        });
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 500 }
        });
        
        // Complete B zone repair
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
        });
      });
    });

    it('should assemble ROV with sufficient resources', () => {
      // Give player enough circuits and titanium
      act(() => {
        result.current.dispatch({
          type: 'SET_CHAPTER2_RESOURCES',
          payload: { circuits: 10, titanium: 30 }
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.rov.assembled).toBe(true);
      expect(state.chapter2.chapter2Stage).toBe('scavenger');
      
      // Check resources were consumed
      expect(state.chapter2.circuits).toBe(5); // 10 - 5
      expect(state.chapter2.titanium).toBe(10); // 30 - 20
    });

    it('should not assemble ROV without B zone repaired', () => {
      // Reset B zone to offline
      act(() => {
        result.current.dispatch({
          type: 'RESET_CHAPTER2_ZONE',
          payload: { zone: 'B_ZONE' }
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
      });

      expect(result.current.state.chapter2.rov.assembled).toBe(false);
    });

    it('should not assemble ROV without sufficient resources', () => {
      act(() => {
        result.current.dispatch({
          type: 'SET_CHAPTER2_RESOURCES',
          payload: { circuits: 2, titanium: 10 }
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
      });

      expect(result.current.state.chapter2.rov.assembled).toBe(false);
    });
  });

  describe('🌊 ROV Deployment', () => {
    beforeEach(() => {
      // Setup: Repair B zone and assemble ROV
      act(() => {
        result.current.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resourceType: ResourceType.SCRAP, amount: 100 }
        });
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 500 }
        });
        result.current.dispatch({
          type: 'SET_CHAPTER2_RESOURCES',
          payload: { circuits: 10, titanium: 30 }
        });
        
        // Complete B zone repair
        for (let i = 0; i < 3; i++) {
          result.current.dispatch({
            type: 'CHAPTER2_ACTION',
            payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
          });
        }
        
        // Assemble ROV
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
      });
    });

    it('should deploy ROV after assembly', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.rov.deployed).toBe(true);
      expect(state.chapter2.rovFirstDeployment).toBe(true);
      
      // Check deployment logs
      const deployLogs = state.logs.filter((log: any) => 
        log.text.includes('气闸') || log.text.includes('入水')
      );
      expect(deployLogs.length).toBeGreaterThan(0);
    });

    it('should not deploy ROV if not assembled', () => {
      // Reset ROV state
      act(() => {
        result.current.dispatch({
          type: 'RESET_CHAPTER2_ROV'
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
      });

      expect(result.current.state.chapter2.rov.deployed).toBe(false);
    });

    it('should not deploy ROV if already deployed', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
      });

      const logCountAfterFirst = result.current.state.logs.length;

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
      });

      // Should not add more logs
      expect(result.current.state.logs.length).toBe(logCountAfterFirst);
    });
  });

  describe('🔍 Exploration', () => {
    beforeEach(() => {
      // Setup: Complete all prerequisites and deploy ROV
      act(() => {
        result.current.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resourceType: ResourceType.SCRAP, amount: 100 }
        });
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 500 }
        });
        result.current.dispatch({
          type: 'SET_CHAPTER2_RESOURCES',
          payload: { circuits: 10, titanium: 30 }
        });
        
        // Complete B zone repair
        for (let i = 0; i < 3; i++) {
          result.current.dispatch({
            type: 'CHAPTER2_ACTION',
            payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
          });
        }
        
        // Assemble and deploy ROV
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
      });
    });

    it('should explore debris field and gain resources', () => {
      const initialCircuits = result.current.state.chapter2.circuits;
      const initialTitanium = result.current.state.chapter2.titanium;

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.DEBRIS_FIELD }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.circuits).toBeGreaterThan(initialCircuits);
      expect(state.chapter2.titanium).toBeGreaterThan(initialTitanium);
    });

    it('should explore thermal vents and gain resources', () => {
      const initialTitanium = result.current.state.chapter2.titanium;
      const initialScrap = result.current.state.resources[ResourceType.SCRAP];

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.THERMAL_VENTS }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.titanium).toBeGreaterThan(initialTitanium);
      expect(state.resources[ResourceType.SCRAP]).toBeGreaterThan(initialScrap);
    });

    it('should reveal tether truth after first debris exploration', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.DEBRIS_FIELD }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.tetherTruthRevealed).toBe(true);
      expect(state.chapter2.rov.tetherCorrupted).toBe(true);
    });
  });

  describe('⚠️ Icarus Exploration and ROV Connection Issues', () => {
    beforeEach(() => {
      // Setup: Complete all prerequisites and deploy ROV
      act(() => {
        result.current.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resourceType: ResourceType.SCRAP, amount: 100 }
        });
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 500 }
        });
        result.current.dispatch({
          type: 'SET_CHAPTER2_RESOURCES',
          payload: { circuits: 10, titanium: 30 }
        });
        
        // Complete B zone repair
        for (let i = 0; i < 3; i++) {
          result.current.dispatch({
            type: 'CHAPTER2_ACTION',
            payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
          });
        }
        
        // Assemble and deploy ROV
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
      });
    });

    it('should explore Icarus wreck and display descent sequence', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.ICARUS_WRECK }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.rov.currentTarget).toBe(ROV_TARGETS.ICARUS_WRECK);
      
      // Check for Icarus-related logs
      const icarusLogs = state.logs.filter((log: any) => 
        log.text.includes('伊卡洛斯') || log.text.includes('Icarus')
      );
      expect(icarusLogs.length).toBeGreaterThan(0);
    });

    it('should read Icarus log and transition to icarus stage', () => {
      // First explore Icarus
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.ICARUS_WRECK }
        });
      });

      // Then read the log
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'READ_ICARUS_LOG' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.icarusLogRead).toBe(true);
      expect(state.chapter2.chapter2Stage).toBe('icarus');
    });

    it('should fail to disconnect ROV from Icarus', () => {
      // Explore Icarus first
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.ICARUS_WRECK }
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DISCONNECT_ROV' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.rov.tetherCorrupted).toBe(true);
      
      // Check for disconnect failure logs
      const disconnectLogs = state.logs.filter((log: any) => 
        log.text.includes('无响应') || log.text.includes('卡死')
      );
      expect(disconnectLogs.length).toBeGreaterThan(0);
    });

    it('should self-destruct ROV and trigger ghost data', () => {
      // Explore Icarus first
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.ICARUS_WRECK }
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'SELF_DESTRUCT_ROV' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.rov.destroyed).toBe(true);
      expect(state.chapter2.rov.deployed).toBe(false);
      expect(state.chapter2.ghostDataReceived).toBe(true);
    });
  });

  describe('👻 Ghost Data and Network Awakening', () => {
    beforeEach(() => {
      // Setup: Complete full Icarus sequence
      act(() => {
        result.current.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resourceType: ResourceType.SCRAP, amount: 100 }
        });
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 500 }
        });
        result.current.dispatch({
          type: 'SET_CHAPTER2_RESOURCES',
          payload: { circuits: 10, titanium: 30 }
        });
        
        // Complete B zone repair
        for (let i = 0; i < 3; i++) {
          result.current.dispatch({
            type: 'CHAPTER2_ACTION',
            payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
          });
        }
        
        // Assemble, deploy, explore, and self-destruct
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.ICARUS_WRECK }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'SELF_DESTRUCT_ROV' }
        });
      });
    });

    it('should process ghost data and awaken network', () => {
      const initialBiomass = result.current.state.resources[ResourceType.BIOMASS];

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'PROCESS_GHOST_DATA' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.networkAwakened).toBe(true);
      expect(state.chapter2.icarusAssimilated).toBe(true);
      expect(state.chapter2.chapter2Stage).toBe('awakening');
      expect(state.chapter2.networkNodes).toBeGreaterThan(0);
      expect(state.chapter2.computePower).toBeGreaterThan(0);
      
      // Should gain biomass from assimilation
      expect(state.resources[ResourceType.BIOMASS]).toBeGreaterThan(initialBiomass);
    });

    it('should add Icarus node to zones after network awakening', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'PROCESS_GHOST_DATA' }
        });
      });

      const state = result.current.state;
      expect(state.chapter2.zones.ICARUS_NODE).toBeDefined();
      expect(state.chapter2.zones.ICARUS_NODE.status).toBe('digesting');
    });

    it('should display horror narrative in logs', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'PROCESS_GHOST_DATA' }
        });
      });

      const state = result.current.state;
      const horrorLogs = state.logs.filter((log: any) => 
        log.text.includes('NEW_ORGAN') || 
        log.text.includes('ASSIMILATION') ||
        log.text.includes('吞并')
      );
      expect(horrorLogs.length).toBeGreaterThan(0);
    });

    it('should not process ghost data twice', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'PROCESS_GHOST_DATA' }
        });
      });

      const logCountAfterFirst = result.current.state.logs.length;
      const nodesAfterFirst = result.current.state.chapter2.networkNodes;

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'PROCESS_GHOST_DATA' }
        });
      });

      // Should not add more logs or nodes
      expect(result.current.state.logs.length).toBe(logCountAfterFirst);
      expect(result.current.state.chapter2.networkNodes).toBe(nodesAfterFirst);
    });
  });

  describe('🔄 Phase Transition', () => {
    beforeEach(() => {
      // Setup: Complete full Chapter 2 sequence
      act(() => {
        result.current.dispatch({
          type: 'ADD_RESOURCE',
          payload: { resourceType: ResourceType.SCRAP, amount: 100 }
        });
        result.current.dispatch({
          type: 'SET_POWER',
          payload: { power: 500 }
        });
        result.current.dispatch({
          type: 'SET_CHAPTER2_RESOURCES',
          payload: { circuits: 10, titanium: 30 }
        });
        
        // Complete B zone repair
        for (let i = 0; i < 3; i++) {
          result.current.dispatch({
            type: 'CHAPTER2_ACTION',
            payload: { action: 'REPAIR_ZONE', target: 'B_ZONE' }
          });
        }
        
        // Complete full sequence
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'ASSEMBLE_ROV' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'DEPLOY_ROV' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'EXPLORE_TARGET', target: ROV_TARGETS.ICARUS_WRECK }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'SELF_DESTRUCT_ROV' }
        });
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'PROCESS_GHOST_DATA' }
        });
      });
    });

    it('should complete Chapter 2 and transition to Phase 3', () => {
      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'COMPLETE_CHAPTER2' }
        });
      });

      const state = result.current.state;
      expect(state.phase).toBe(3);
      expect(state.chapter2.chapter2Stage).toBe('complete');
    });

    it('should not complete Chapter 2 without network awakening', () => {
      // Reset to before network awakening
      act(() => {
        result.current.dispatch({
          type: 'RESET_CHAPTER2_NETWORK'
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'CHAPTER2_ACTION',
          payload: { action: 'COMPLETE_CHAPTER2' }
        });
      });

      expect(result.current.state.phase).toBe(2);
    });
  });

  describe('📊 Resource Panel Updates', () => {
    it('should track Chapter 2 specific resources', () => {
      const state = result.current.state;
      
      // Standard resources should still exist
      expect(state.resources[ResourceType.OXYGEN]).toBeDefined();
      expect(state.resources[ResourceType.SCRAP]).toBeDefined();
      expect(state.resources[ResourceType.BIOMASS]).toBeDefined();
      expect(state.resources[ResourceType.LUMENS]).toBeDefined();
      
      // Chapter 2 resources
      expect(state.chapter2.circuits).toBeDefined();
      expect(state.chapter2.titanium).toBeDefined();
      expect(state.chapter2.computePower).toBeDefined();
      expect(state.chapter2.networkNodes).toBeDefined();
    });

    it('should track Chapter 2 status', () => {
      const state = result.current.state;
      
      expect(state.power).toBeDefined();
      expect(state.phase).toBe(2);
      expect(state.chapter2.rov).toBeDefined();
      expect(state.chapter2.chapter2Stage).toBeDefined();
    });
  });
});
