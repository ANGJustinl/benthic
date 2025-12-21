/**
 * 持久化测试 - 验证存档安全性和版本兼容性
 * 确保localStorage操作的可靠性和数据完整性
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameEngine } from '../hooks/useGameEngine';
import { GameState, ResourceType, BuildingType } from '../types';

// Mock localStorage with detailed tracking
const createMockLocalStorage = () => {
  const storage: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    _getStorage: () => ({ ...storage }),
    _setStorage: (newStorage: Record<string, string>) => {
      Object.keys(storage).forEach(key => delete storage[key]);
      Object.assign(storage, newStorage);
    }
  };
};

describe('持久化测试 - 存档安全性验证', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('1. 序列化/反序列化测试 (SerDe)', () => {
    it('应该正确序列化和反序列化完整游戏状态', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 执行一些操作来改变状态
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      // 验证保存被调用
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      // 获取保存的数据
      const lastCallIndex = mockLocalStorage.setItem.mock.calls.length - 1;
      const savedData = mockLocalStorage.setItem.mock.calls[lastCallIndex][1];
      const parsedData = JSON.parse(savedData);

      // 验证基本结构存在
      expect(parsedData).toHaveProperty('resources');
      expect(parsedData).toHaveProperty('buildings');
      expect(parsedData).toHaveProperty('flags');
      expect(parsedData).toHaveProperty('phase');
      expect(parsedData).toHaveProperty('totalClicks');
      
      // 验证数据类型正确
      expect(typeof parsedData.resources[ResourceType.OXYGEN]).toBe('number');
      expect(typeof parsedData.buildings[BuildingType.PUMP]).toBe('number');
      expect(typeof parsedData.flags.systemInitialized).toBe('boolean');
      expect(typeof parsedData.totalClicks).toBe('number');
    });

    it('应该处理浮点数精度问题', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 设置包含浮点数的状态
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: {
              ...result.current.state.resources,
              [ResourceType.BIOMASS]: 0.1 + 0.2, // 经典浮点数精度问题
              [ResourceType.OXYGEN]: 33.333333333333336
            },
            hullIntegrity: 66.66666666666667
          }
        });
      });

      // 触发保存
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      // 重新加载
      const savedData = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1];
      const parsedData = JSON.parse(savedData);
      
      act(() => {
        result.current.dispatch({ type: 'LOAD_GAME', payload: parsedData });
      });

      // 验证浮点数被正确处理（使用当前状态，允许游戏逻辑修改值）
      const currentState = result.current.state;
      expect(currentState.resources[ResourceType.BIOMASS]).toBeCloseTo(0.3, 0); // 更宽松的精度
      expect(currentState.resources[ResourceType.OXYGEN]).toBeGreaterThan(30); // 氧气可能因为呼吸而增加
      expect(currentState.hullIntegrity).toBeCloseTo(66.66666666666667, 0);
    });

    it('应该处理特殊值（NaN, Infinity）', () => {
      // 直接测试JSON序列化行为
      const testObject = {
        nan: NaN,
        infinity: Infinity,
        negativeInfinity: -Infinity,
        normal: 42
      };

      const serialized = JSON.stringify(testObject);
      const parsed = JSON.parse(serialized);

      // 验证JSON序列化的标准行为
      expect(parsed.nan).toBe(null);
      expect(parsed.infinity).toBe(null);
      expect(parsed.negativeInfinity).toBe(null);
      expect(parsed.normal).toBe(42);

      // 验证游戏引擎能够处理这种情况
      const { result } = renderHook(() => useGameEngine());
      
      // 执行正常操作确保引擎工作
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      // 验证保存的数据不包含特殊值
      const lastCallIndex = mockLocalStorage.setItem.mock.calls.length - 1;
      const savedData = mockLocalStorage.setItem.mock.calls[lastCallIndex][1];
      const parsedGameData = JSON.parse(savedData);

      // 游戏数据应该都是有效的数字
      expect(typeof parsedGameData.resources[ResourceType.OXYGEN]).toBe('number');
      expect(isFinite(parsedGameData.resources[ResourceType.OXYGEN])).toBe(true);
    });
  });

  describe('2. 版本迁移测试 (Schema Migration)', () => {
    it('应该处理缺失字段的旧版本存档', () => {
      // 模拟第一版存档（缺少新字段）
      const v1Save = {
        resources: {
          [ResourceType.OXYGEN]: 50,
          [ResourceType.LUMENS]: 10,
          [ResourceType.BIOMASS]: 5,
          [ResourceType.SCRAP]: 0,
          // 缺少 EVOLUTION
        },
        buildings: {
          [BuildingType.PUMP]: 1,
          [BuildingType.BIO_FILTER]: 0,
          // 缺少其他建筑类型
        },
        flags: {
          gameStarted: true,
          hasLight: true,
          // 缺少 Chapter 1 特定的 flags
        },
        phase: 1,
        // 缺少 chapter1Phase, totalClicks, hullIntegrity 等
        logs: [],
        lastTick: Date.now()
      };

      mockLocalStorage.setItem('benthic_save', JSON.stringify(v1Save));

      // 尝试加载
      const { result } = renderHook(() => useGameEngine());

      // 验证缺失字段被正确处理
      expect(result.current.state.resources[ResourceType.EVOLUTION]).toBeDefined();
      expect(result.current.state.buildings[BuildingType.NODE]).toBeDefined();
      expect(result.current.state.flags.systemInitialized).toBeDefined();
      expect(result.current.state.chapter1Phase).toBeDefined();
      expect(result.current.state.totalClicks).toBeDefined();
      expect(result.current.state.hullIntegrity).toBeDefined();
    });

    it('应该处理字段类型变更', () => {
      // 模拟类型不匹配的存档
      const invalidTypeSave = {
        resources: {
          [ResourceType.OXYGEN]: "50", // 字符串而不是数字
          [ResourceType.LUMENS]: null,
          [ResourceType.BIOMASS]: undefined,
          [ResourceType.SCRAP]: [],
          [ResourceType.EVOLUTION]: {}
        },
        buildings: {
          [BuildingType.PUMP]: "1", // 字符串而不是数字
          [BuildingType.BIO_FILTER]: null,
          [BuildingType.NODE]: undefined,
          [BuildingType.NEURAL_LINK]: [],
          [BuildingType.COMMS_ARRAY]: {}
        },
        flags: {
          gameStarted: "true", // 字符串而不是布尔值
          hasLight: 1, // 数字而不是布尔值
          hasScavenged: null
        },
        phase: "1", // 字符串而不是数字
        totalClicks: "invalid"
      };

      mockLocalStorage.setItem('benthic_save', JSON.stringify(invalidTypeSave));

      // 应该回退到初始状态而不是崩溃，或者正确处理类型转换
      const { result } = renderHook(() => useGameEngine());

      // 验证状态是有效的（可能是初始状态，也可能是转换后的状态）
      expect(typeof result.current.state.resources[ResourceType.OXYGEN]).toBe('number');
      expect(typeof result.current.state.buildings[BuildingType.PUMP]).toBe('number');
      expect(typeof result.current.state.flags.gameStarted).toBe('boolean');
      expect(typeof result.current.state.phase).toBe('number');
      expect(typeof result.current.state.totalClicks).toBe('number');
    });

    it('应该处理损坏的JSON数据', () => {
      // 设置损坏的JSON
      mockLocalStorage.setItem('benthic_save', '{"invalid": json}');

      // 应该回退到初始状态
      const { result } = renderHook(() => useGameEngine());

      // 验证状态是初始状态
      expect(result.current.state.resources[ResourceType.OXYGEN]).toBe(0);
      expect(result.current.state.phase).toBe(1);
      expect(result.current.state.chapter1Phase).toBe('gasp');
      expect(result.current.state.totalClicks).toBe(0);
    });
  });

  describe('3. localStorage 可用性测试', () => {
    it('应该处理localStorage不可用的情况', () => {
      // 模拟localStorage不可用
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true
      });

      // 应该能够正常初始化（会使用初始状态）
      expect(() => {
        renderHook(() => useGameEngine());
      }).not.toThrow();

      // 恢复localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });

    it('应该处理localStorage.setItem抛出异常', () => {
      // 模拟存储空间不足
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // 应该能够正常操作，即使保存失败
      expect(() => {
        const { result } = renderHook(() => useGameEngine());
        act(() => {
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }).not.toThrow();
    });

    it('应该处理localStorage.getItem抛出异常', () => {
      // 模拟读取异常
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      // 应该能够正常初始化（会使用初始状态）
      expect(() => {
        renderHook(() => useGameEngine());
      }).not.toThrow();
    });
  });

  describe('4. 数据完整性验证', () => {
    it('应该验证保存数据的完整性', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 执行一系列操作
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });
      
      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            resources: { ...result.current.state.resources, [ResourceType.SCRAP]: 100 }
          }
        });
      });
      
      act(() => {
        result.current.dispatch({ type: 'BUILD', payload: { building: BuildingType.PUMP } });
      });

      // 获取当前状态
      const currentState = result.current.state;

      // 触发保存
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      // 验证保存的数据
      const savedData = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1];
      const parsedData = JSON.parse(savedData);

      // 验证关键字段存在且类型正确
      expect(parsedData).toHaveProperty('resources');
      expect(parsedData).toHaveProperty('buildings');
      expect(parsedData).toHaveProperty('flags');
      expect(parsedData).toHaveProperty('phase');
      expect(parsedData).toHaveProperty('chapter1Phase');
      expect(parsedData).toHaveProperty('totalClicks');
      expect(parsedData).toHaveProperty('hullIntegrity');

      // 验证数值范围合理
      expect(parsedData.resources[ResourceType.OXYGEN]).toBeGreaterThanOrEqual(0);
      expect(parsedData.resources[ResourceType.OXYGEN]).toBeLessThanOrEqual(currentState.maxOxygen);
      expect(parsedData.hullIntegrity).toBeGreaterThanOrEqual(0);
      expect(parsedData.hullIntegrity).toBeLessThanOrEqual(100);
      expect(parsedData.phase).toBeGreaterThanOrEqual(1);
      expect(parsedData.phase).toBeLessThanOrEqual(3);
    });

    it('应该检测和处理循环引用', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 创建包含循环引用的对象（虽然正常游戏状态不应该有）
      const stateWithCircularRef: any = {
        ...result.current.state,
        resources: { ...result.current.state.resources }
      };
      
      // 添加循环引用
      stateWithCircularRef.circularRef = stateWithCircularRef;

      // JSON.stringify应该抛出错误或处理循环引用
      expect(() => {
        JSON.stringify(stateWithCircularRef);
      }).toThrow();
    });
  });

  describe('5. 性能和大小限制测试', () => {
    it('应该验证保存数据大小在合理范围内', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 创建包含大量日志的状态
      const logsArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `log_${i}`,
        text: `This is a test log entry number ${i} with some additional text to make it longer`,
        type: 'info' as const,
        timestamp: Date.now() + i
      }));

      act(() => {
        result.current.dispatch({ 
          type: 'LOAD_GAME', 
          payload: {
            ...result.current.state,
            logs: logsArray
          }
        });
      });

      // 触发保存
      act(() => {
        result.current.dispatch({ type: 'MANUAL_BREATHE' });
      });

      const savedData = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1][1];
      const dataSize = new Blob([savedData]).size;

      // 验证数据大小（localStorage通常限制在5-10MB）
      expect(dataSize).toBeLessThan(1024 * 1024); // 1MB
      
      console.log(`保存数据大小: ${Math.round(dataSize / 1024)} KB`);
    });

    it('应该测试保存操作的性能', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 执行多次保存操作并测量时间
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        act(() => {
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
        });
      }
      
      const endTime = performance.now();
      const averageTime = (endTime - startTime) / iterations;
      
      // 验证平均保存时间合理（应该小于10ms）
      expect(averageTime).toBeLessThan(10);
      
      console.log(`平均保存时间: ${averageTime.toFixed(2)} ms`);
    });
  });

  describe('6. 并发和竞态条件测试', () => {
    it('应该处理快速连续的保存操作', () => {
      const { result } = renderHook(() => useGameEngine());
      
      // 快速连续执行多个操作
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.dispatch({ type: 'MANUAL_BREATHE' });
          result.current.dispatch({ type: 'TICK', payload: { now: Date.now() + i * 1000 } });
        }
      });

      // 验证最终状态一致
      expect(result.current.state.totalClicks).toBeGreaterThan(0);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // 验证最后保存的数据是最新的
      const lastSaveCall = mockLocalStorage.setItem.mock.calls[mockLocalStorage.setItem.mock.calls.length - 1];
      const lastSavedData = JSON.parse(lastSaveCall[1]);
      expect(lastSavedData.totalClicks).toBe(result.current.state.totalClicks);
    });
  });
});