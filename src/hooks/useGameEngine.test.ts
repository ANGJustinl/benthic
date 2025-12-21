import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { ResourceType } from '../types';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { ResourceType } from '../types';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { act } from '@testing-library/react';
import { ResourceType } from '../types';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { renderHook } from '@testing-library/react';
import { useGameEngine } from './useGameEngine';
import { renderHook } from '@testing-library/react';
import { ResourceType } from '../types';
import { useGameEngine } from './useGameEngine';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useGameEngine - Chapter 1 Story System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with correct Chapter 1 starting state', () => {
      const { result } = renderHook(() => useGameEngine());
      
      expect(result.current.state.phase).toBe(1);
      expect(result.current.state.chapter1Phase).toBe('gasp');
      expect(result.current.state.resources[ResourceType.OXYGEN]).toBe(0);
      expect(result.current.state.flags.systemInitialized).toBe(false);
      expect(result.current.state.flags.firstBreathTaken).toBe(false);
      expect(result.current.state.hullIntegrity).toBe(98);
      expect(result.current.state.cabinPressure).toBe(1100);
    });

    it('should have initial boot sequence logs', () => {
      const { result } = renderHook(() => useGameEngine());
      
      expect(result.current.state.logs).toHaveLength(4);
      expect(result.current.state.logs[0].text).toContain('Boot sequence initiated');
      expect(result.current.state.logs[1].text).toContain('Main generator non-responsive');
      expect(result.current.state.logs[2].text).toContain('Life support offline');
      expect(result.current.state.logs[3].text).toContain('manual override');
    });
  });

  describe('Phase 1: The Gasp - Manual Breathing', () => {
    it('should initialize system on first manual breathe', () => {
      const { result } = renderHook(() => useGameEngine());
      
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      expect(result.current.state.flags.systemInitialized).toBe(true);
      expect(result.current.state.flags.firstBreathTaken).toBe(true);
      expect(result.current.state.totalClicks).toBe(1);
      expect(result.current.state.resources[ResourceType.OXYGEN]).toBe(5);
    });

    it('should add first breath narrative logs', () => {
      const { result } = renderHook(() => useGameEngine());
      
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('进气阀门打开'))).toBe(true);
      expect(logs.some(log => log.text.includes('一声干涩的咳嗽'))).toBe(true);
    });

    it('should enforce cooldown between manual breathes', () => {
      const { result } = renderHook(() => useGameEngine());
      
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });
      
      const oxygenAfterFirst = result.current.state.resources[ResourceType.OXYGEN];
      
      // Try to breathe again immediately (should be blocked by cooldown)
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });
      
      expect(result.current.state.resources[ResourceType.OXYGEN]).toBe(oxygenAfterFirst);
      expect(result.current.state.totalClicks).toBe(1);
    });

    it('should trigger overheat warning for rapid clicking', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Simulate rapid clicking by advancing time slightly between clicks
      for (let i = 0; i < 4; i++) {
        act(() => {
          vi.advanceTimersByTime(1100); // Just over cooldown
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }

      expect(result.current.state.flags.overheatWarningShown).toBe(true);
      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('Actuator Overheat'))).toBe(true);
      expect(logs.some(log => log.text.includes('肌肉痉挛'))).toBe(true);
    });

    it('should transition to filth phase after stabilizing oxygen', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Breathe enough times to get oxygen above 30 and clicks above 10
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }

      expect(result.current.state.chapter1Phase).toBe('filth');
      expect(result.current.state.flags.furnaceUnlocked).toBe(true);
      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('部署清理工具'))).toBe(true);
    });
  });

  describe('Phase 2: The Filth - Hull Scraping', () => {
    beforeEach(() => {
      // Helper to get to filth phase
      const { result } = renderHook(() => useGameEngine());
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }
      return { result };
    });

    it('should allow hull scraping and gain biomass', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Get to filth phase first
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }

      const initialBiomass = result.current.state.resources[ResourceType.BIOMASS];
      const initialHull = result.current.state.hullIntegrity;
      
      act(() => {
        result.current.dispatch({ type: 'SCRAPE_HULL' });
      });

      expect(result.current.state.resources[ResourceType.BIOMASS]).toBeGreaterThan(initialBiomass);
      expect(result.current.state.hullIntegrity).toBeLessThan(initialHull);
    });

    it('should trigger hull breach warning when integrity is low', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Get to filth phase
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }

      // Scrape until hull integrity is compromised
      while (result.current.state.hullIntegrity > 60) {
        act(() => {
          result.current.dispatch({ type: 'SCRAPE_HULL' });
        });
      }

      expect(result.current.state.flags.hullIntegrityCompromised).toBe(true);
      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('Hull breach imminent'))).toBe(true);
      expect(logs.some(log => log.text.includes('痛！停下！'))).toBe(true);
    });

    it('should allow feeding furnace to convert biomass to lumens', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Get to filth phase and gain some biomass
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }
      
      act(() => {
        result.current.dispatch({ type: 'SCRAPE_HULL' });
      });

      const initialBiomass = result.current.state.resources[ResourceType.BIOMASS];
      const initialLumens = result.current.state.resources[ResourceType.LUMENS];
      
      act(() => {
        result.current.dispatch({ type: 'FEED_FURNACE' });
      });

      expect(result.current.state.resources[ResourceType.BIOMASS]).toBe(initialBiomass - 1);
      expect(result.current.state.resources[ResourceType.LUMENS]).toBe(initialLumens + 2);
      
      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('焚化炉点火'))).toBe(true);
      expect(logs.some(log => log.text.includes('烤肉的焦香'))).toBe(true);
    });

    it('should transition to grafts phase with enough biomass', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Get to filth phase
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }

      // Scrape until we have enough biomass to trigger grafts phase
      while (result.current.state.resources[ResourceType.BIOMASS] < 15) {
        act(() => {
          result.current.dispatch({ type: 'SCRAPE_HULL' });
        });
      }

      expect(result.current.state.chapter1Phase).toBe('grafts');
      expect(result.current.state.flags.graftsDiscovered).toBe(true);
      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('高密度物体'))).toBe(true);
    });
  });

  describe('Phase 3: The Grafts - Object Inspection', () => {
    it('should allow graft inspection with random discoveries', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Get to grafts phase
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }
      
      while (result.current.state.chapter1Phase !== 'grafts') {
        act(() => {
          result.current.dispatch({ type: 'SCRAPE_HULL' });
        });
      }

      act(() => {
        result.current.dispatch({ type: 'INSPECT_GRAFT' });
      });

      const logs = result.current.state.logs;
      // Should have either heartbeat needle or human arm discovery
      const hasHeartbeat = logs.some(log => log.text.includes('心跳摆动'));
      const hasHumanArm = logs.some(log => log.text.includes('人类手臂骨骼'));
      
      expect(hasHeartbeat || hasHumanArm).toBe(true);
    });

    it('should potentially trigger breach event during graft inspection', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Get to grafts phase
      for (let i = 0; i < 12; i++) {
        act(() => {
          vi.advanceTimersByTime(1100);
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }
      
      while (result.current.state.chapter1Phase !== 'grafts') {
        act(() => {
          result.current.dispatch({ type: 'SCRAPE_HULL' });
        });
      }

      // Keep inspecting until breach event triggers (or max attempts)
      let attempts = 0;
      while (result.current.state.chapter1Phase !== 'breach' && attempts < 20) {
        act(() => {
          result.current.dispatch({ type: 'INSPECT_GRAFT' });
        });
        attempts++;
      }

      // If breach triggered, verify the state changes
      if (result.current.state.chapter1Phase === 'breach') {
        expect(result.current.state.flags.breachEvent).toBe(true);
        expect(result.current.state.hullIntegrity).toBe(40);
        const logs = result.current.state.logs;
        expect(logs.some(log => log.text.includes('IMPACT DETECTED'))).toBe(true);
      }
    });
  });

  describe('Phase 4: The Breach - Assimilation', () => {
    it('should allow sealing breach', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Manually set breach state for testing
      act(() => {
        result.current.dispatch({ type: 'LOAD_GAME', payload: {
          ...result.current.state,
          chapter1Phase: 'breach',
          flags: { ...result.current.state.flags, breachEvent: true },
          hullIntegrity: 40
        }});
      });

      act(() => {
        result.current.dispatch({ type: 'SEAL_BREACH' });
      });

      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('伤口在收缩'))).toBe(true);
      expect(logs.some(log => log.text.includes('修复凝胶'))).toBe(true);
    });

    it('should complete Chapter 1 through assimilation', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Manually set breach state for testing
      act(() => {
        result.current.dispatch({ type: 'LOAD_GAME', payload: {
          ...result.current.state,
          chapter1Phase: 'breach',
          flags: { ...result.current.state.flags, breachEvent: true },
          hullIntegrity: 40
        }});
      });

      act(() => {
        result.current.dispatch({ type: 'ASSIMILATE' });
      });

      expect(result.current.state.chapter1Phase).toBe('complete');
      expect(result.current.state.phase).toBe(2);
      expect(result.current.state.flags.assimilationComplete).toBe(true);
      expect(result.current.state.flags.revealedTruth).toBe(true);
      expect(result.current.state.hullIntegrity).toBe(100); // Healed by assimilation
      expect(result.current.state.resources[ResourceType.EVOLUTION]).toBe(1);
      
      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('睁开眼睛吧'))).toBe(true);
      expect(logs.some(log => log.text.includes('外部声呐阵列'))).toBe(true);
    });
  });

  describe('Oxygen Crisis System', () => {
    it('should trigger oxygen crisis when oxygen is low', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Manually set low oxygen state
      act(() => {
        result.current.dispatch({ type: 'LOAD_GAME', payload: {
          ...result.current.state,
          resources: { ...result.current.state.resources, [ResourceType.OXYGEN]: 4 },
          chapter1Phase: 'gasp'
        }});
      });

      // Trigger tick to check oxygen crisis
      act(() => {
        result.current.dispatch({ type: 'TICK', payload: { now: Date.now() } });
      });

      expect(result.current.state.flags.oxygenCrisis).toBe(true);
      const logs = result.current.state.logs;
      expect(logs.some(log => log.text.includes('视野边缘开始出现黑斑'))).toBe(true);
      expect(logs.some(log => log.text.includes('CRITICAL ALERT'))).toBe(true);
    });

    it('should clear oxygen crisis when oxygen recovers', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // Set crisis state
      act(() => {
        result.current.dispatch({ type: 'LOAD_GAME', payload: {
          ...result.current.state,
          resources: { ...result.current.state.resources, [ResourceType.OXYGEN]: 15 },
          flags: { ...result.current.state.flags, oxygenCrisis: true }
        }});
      });

      // Trigger tick
      act(() => {
        result.current.dispatch({ type: 'TICK', payload: { now: Date.now() } });
      });

      expect(result.current.state.flags.oxygenCrisis).toBe(false);
    });
  });

  describe('Game Persistence', () => {
    it('should save game state to localStorage', () => {
      const { result } = renderHook(() => useGameEngine());
      
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'benthic_save',
        expect.stringContaining('"totalClicks":1')
      );
    });

    it('should load game state from localStorage', () => {
      const savedState = {
        ...renderHook(() => useGameEngine()).result.current.state,
        totalClicks: 5,
        chapter1Phase: 'filth'
      };
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const { result } = renderHook(() => useGameEngine());
      
      expect(result.current.state.totalClicks).toBe(5);
      expect(result.current.state.chapter1Phase).toBe('filth');
    });
  });
});