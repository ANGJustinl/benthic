import React, { useState } from 'react';
import { LogDeduplicationConfig } from '../utils/logAggregator';

interface LogSettingsProps {
  config: LogDeduplicationConfig;
  onConfigChange: (config: LogDeduplicationConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const LogSettings: React.FC<LogSettingsProps> = ({
  config,
  onConfigChange,
  isOpen,
  onToggle
}) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = (key: keyof LogDeduplicationConfig, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute top-2 right-2 text-xs opacity-40 hover:opacity-80 transition-opacity font-mono"
        title="日志设置"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="absolute top-0 right-0 bg-gray-900 border border-gray-700 rounded p-3 z-10 min-w-64">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-300">日志设置</h3>
        <button
          onClick={onToggle}
          className="text-xs opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* 启用聚合 */}
        <div className="flex items-center justify-between">
          <label className="text-gray-400">启用消息聚合</label>
          <input
            type="checkbox"
            checked={localConfig.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="w-4 h-4"
          />
        </div>

        {localConfig.enabled && (
          <>
            {/* 时间窗口 */}
            <div>
              <label className="text-gray-400 block mb-1">
                聚合时间窗口: {localConfig.timeWindow / 1000}秒
              </label>
              <input
                type="range"
                min="1000"
                max="30000"
                step="1000"
                value={localConfig.timeWindow}
                onChange={(e) => handleChange('timeWindow', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs opacity-60 mt-1">
                <span>1秒</span>
                <span>30秒</span>
              </div>
            </div>

            {/* 最大连续数量 */}
            <div>
              <label className="text-gray-400 block mb-1">
                最大连续显示: {localConfig.maxConsecutive}条
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={localConfig.maxConsecutive}
                onChange={(e) => handleChange('maxConsecutive', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs opacity-60 mt-1">
                <span>1条</span>
                <span>10条</span>
              </div>
            </div>

            {/* 按类型聚合 */}
            <div className="flex items-center justify-between">
              <label className="text-gray-400">按类型分别聚合</label>
              <input
                type="checkbox"
                checked={localConfig.aggregateByType}
                onChange={(e) => handleChange('aggregateByType', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </>
        )}

        {/* 预设配置 */}
        <div className="border-t border-gray-700 pt-3">
          <label className="text-gray-400 block mb-2">快速设置</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const preset = { enabled: false, timeWindow: 5000, maxConsecutive: 3, aggregateByType: true };
                setLocalConfig(preset);
                onConfigChange(preset);
              }}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
            >
              关闭聚合
            </button>
            <button
              onClick={() => {
                const preset = { enabled: true, timeWindow: 2000, maxConsecutive: 2, aggregateByType: true };
                setLocalConfig(preset);
                onConfigChange(preset);
              }}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
            >
              快速聚合
            </button>
            <button
              onClick={() => {
                const preset = { enabled: true, timeWindow: 5000, maxConsecutive: 3, aggregateByType: true };
                setLocalConfig(preset);
                onConfigChange(preset);
              }}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
            >
              默认设置
            </button>
            <button
              onClick={() => {
                const preset = { enabled: true, timeWindow: 8000, maxConsecutive: 5, aggregateByType: false };
                setLocalConfig(preset);
                onConfigChange(preset);
              }}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
            >
              宽松聚合
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};