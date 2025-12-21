/**
 * 优化的单元测试 - 验证原子逻辑和边界条件
 * 基于离散事件模拟系统的核心特性
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../hooks/useGameEngine';
import { ResourceType, BuildingType } from '../types';
import { SCALING_FACTOR, COSTS, PRODUCTION, OXYGEN_DECAY_BASE } from '../constants';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('优化单元测试 - 原子逻辑验证', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('1. 资源边界测试 (Boundary Value Analysis)', () => {
    it('应该防止资源变为负数', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置低资源状态
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { ...result.current.state.resources, [ResourceType.BIOMASS]: 0 }
          }
        });
      });

      // 尝试消耗不存在的资源
      act(() => {
        result.current.dispatch({ type: 'FEED_FURNACE' });
      });

      // 资源不应该变为负数
      expect(result.current.state.resources[ResourceType.BIOMASS]).toBe(0);
    });

    it('应该正确处理氧气上限', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置接近上限的氧气
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { ...result.current.state.resources, [ResourceType.OXYGEN]: 98 },
            maxOxygen: 100
          }
        });
      });

      // 尝试超过上限
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      // 氧气不应该超过上限
      expect(result.current.state.resources[ResourceType.OXYGEN]).toBeLessThanOrEqual(100);
    });

    it('应该防止船体完整性低于0', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置极低的船体完整性
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            hullIntegrity: 1,
            chapter1Phase: 'filth'
          }
        });
      });

      // 尝试继续刮削
      act(() => {
        result.current.dispatch({ type: 'SCRAPE_HULL' });
      });

      // 船体完整性不应该低于0
      expect(result.current.state.hullIntegrity).toBeGreaterThanOrEqual(0);
    });

    it('应该在船体完整性过低时阻止刮削', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置过低的船体完整性
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            hullIntegrity: 35, // 低于40的阈值
            chapter1Phase: 'filth'
          }
        });
      });

      const initialBiomass = result.current.state.resources[ResourceType.BIOMASS];
      
      // 尝试刮削
      act(() => {
        result.current.dispatch({ type: 'SCRAPE_HULL' });
      });

      // 生物质不应该增加（操作被阻止）
      expect(result.current.state.resources[ResourceType.BIOMASS]).toBe(initialBiomass);
    });
  });

  describe('2. 成本增长公式验证 (Cost Scaling)', () => {
    it('应该按指数公式正确计算建筑成本', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置足够的资源
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: {
              ...result.current.state.resources,
              [ResourceType.SCRAP]: 1000,
              [ResourceType.BIOMASS]: 1000,
              [ResourceType.LUMENS]: 1000
            }
          }
        });
      });

      // 建造第一个泵
      act(() => {
        result.current.dispatch({ type: 'BUILD', payload: { building: BuildingType.PUMP } });
      });

      const resourcesAfterFirst = { ...result.current.state.resources };

      // 建造第二个泵
      act(() => {
        result.current.dispatch({ type: 'BUILD', payload: { building: BuildingType.PUMP } });
      });

      // 验证成本按公式增长: newCost = baseCost * (SCALING_FACTOR ^ currentLevel)
      const baseCost = COSTS[BuildingType.PUMP];
      const expectedSecondCost = {
        [ResourceType.SCRAP]: Math.floor(baseCost[ResourceType.SCRAP] * Math.pow(SCALING_FACTOR, 1)),
        [ResourceType.BIOMASS]: Math.floor(baseCost[ResourceType.BIOMASS] * Math.pow(SCALING_FACTOR, 1))
      };

      const actualSecondCost = {
        [ResourceType.SCRAP]: resourcesAfterFirst[ResourceType.SCRAP] - result.current.state.resources[ResourceType.SCRAP],
        [ResourceType.BIOMASS]: resourcesAfterFirst[ResourceType.BIOMASS] - result.current.state.resources[ResourceType.BIOMASS]
      };

      expect(actualSecondCost[ResourceType.SCRAP]).toBe(expectedSecondCost[ResourceType.SCRAP]);
      expect(actualSecondCost[ResourceType.BIOMASS]).toBe(expectedSecondCost[ResourceType.BIOMASS]);
    });

    it('应该验证缩放因子在合理范围内', () => {
      // 验证SCALING_FACTOR在1.15-1.5范围内
      expect(SCALING_FACTOR).toBeGreaterThanOrEqual(1.15);
      expect(SCALING_FACTOR).toBeLessThanOrEqual(1.5);
    });

    it('应该防止浮点数精度问题导致的成本计算错误', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置精确的资源数量
      const exactCost = Math.floor(COSTS[BuildingType.PUMP][ResourceType.SCRAP] * Math.pow(SCALING_FACTOR, 5));
      
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: {
              ...result.current.state.resources,
              [ResourceType.SCRAP]: exactCost,
              [ResourceType.BIOMASS]: 1000
            },
            buildings: {
              ...result.current.state.buildings,
              [BuildingType.PUMP]: 5
            }
          }
        });
      });

      // 应该能够建造（没有浮点数精度问题）
      act(() => {
        result.current.dispatch({ type: 'BUILD', payload: { building: BuildingType.PUMP } });
      });

      expect(result.current.state.buildings[BuildingType.PUMP]).toBe(6);
    });
  });

  describe('3. 冷却和时序逻辑', () => {
    it('应该强制执行1秒呼吸冷却', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 初始化系统
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      const oxygenAfterFirst = result.current.state.resources[ResourceType.OXYGEN];
      const clicksAfterFirst = result.current.state.totalClicks;

      // 立即尝试再次呼吸（应该被冷却阻止）
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      expect(result.current.state.resources[ResourceType.OXYGEN]).toBe(oxygenAfterFirst);
      expect(result.current.state.totalClicks).toBe(clicksAfterFirst);

      // 等待冷却结束
      act(() => {
        vi.advanceTimersByTime(1100);
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      expect(result.current.state.totalClicks).toBe(clicksAfterFirst + 1);
    });

    it('应该正确跟踪快速点击以触发过热警告', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 快速点击4次（刚好超过冷却时间）
      for (let i = 0; i < 4; i++) {
        act(() => {
          vi.advanceTimersByTime(1100); // 刚好超过冷却时间
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }

      expect(result.current.state.flags.overheatWarningShown).toBe(true);
      expect(result.current.state.logs.some(log => log.text.includes('Actuator Overheat'))).toBe(true);
    });
  });

  describe('4. 氧气衰减和生产平衡', () => {
    it('应该按正确速率消耗氧气', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置初始氧气
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { ...result.current.state.resources, [ResourceType.OXYGEN]: 50 }
          }
        });
      });

      const initialOxygen = result.current.state.resources[ResourceType.OXYGEN];

      // 触发一个tick
      act(() => {
        result.current.dispatch({ type: 'TICK', payload: { now: Date.now() } });
      });

      // 氧气应该减少OXYGEN_DECAY_BASE的量
      expect(result.current.state.resources[ResourceType.OXYGEN]).toBe(initialOxygen - OXYGEN_DECAY_BASE);
    });

    it('应该正确计算泵的氧气生产', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置有泵的状态
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { ...result.current.state.resources, [ResourceType.OXYGEN]: 50 },
            buildings: { ...result.current.state.buildings, [BuildingType.PUMP]: 2 }
          }
        });
      });

      const initialOxygen = result.current.state.resources[ResourceType.OXYGEN];
      const expectedProduction = 2 * PRODUCTION[BuildingType.PUMP][ResourceType.OXYGEN];

      // 触发一个tick
      act(() => {
        result.current.dispatch({ type: 'TICK', payload: { now: Date.now() } });
      });

      // 净氧气变化 = 生产 - 消耗
      const expectedChange = expectedProduction - OXYGEN_DECAY_BASE;
      expect(result.current.state.resources[ResourceType.OXYGEN]).toBe(initialOxygen + expectedChange);
    });
  });

  describe('5. 状态转换逻辑', () => {
    it('应该在正确条件下从gasp转换到filth阶段', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置接近转换条件的状态
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { ...result.current.state.resources, [ResourceType.OXYGEN]: 35 },
            totalClicks: 11,
            chapter1Phase: 'gasp'
          }
        });
      });

      // 触发转换
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      expect(result.current.state.chapter1Phase).toBe('filth');
      expect(result.current.state.flags.furnaceUnlocked).toBe(true);
    });

    it('应该在生物质足够时从filth转换到grafts阶段', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置filth阶段，接近转换条件
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { ...result.current.state.resources, [ResourceType.BIOMASS]: 13 }, // 更低的起始值
            chapter1Phase: 'filth',
            hullIntegrity: 80 // 确保可以刮削
          }
        });
      });

      // 多次刮削确保获得足够生物质（因为biomassGain是随机的）
      let attempts = 0;
      while (result.current.state.chapter1Phase === 'filth' && attempts < 10) {
        act(() => {
          result.current.dispatch({ type: 'SCRAPE_HULL' });
        });
        attempts++;
      }

      expect(result.current.state.chapter1Phase).toBe('grafts');
      expect(result.current.state.flags.graftsDiscovered).toBe(true);
    });
  });

  describe('6. 资源转换精确性', () => {
    it('应该按正确比例转换生物质为流明', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置有生物质的状态
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { 
              ...result.current.state.resources, 
              [ResourceType.BIOMASS]: 5,
              [ResourceType.LUMENS]: 0
            }
          }
        });
      });

      // 喂养熔炉
      act(() => {
        result.current.dispatch({ type: 'FEED_FURNACE' });
      });

      // 验证转换比例：1生物质 -> 2流明
      expect(result.current.state.resources[ResourceType.BIOMASS]).toBe(4);
      expect(result.current.state.resources[ResourceType.LUMENS]).toBe(2);
    });
  });
});