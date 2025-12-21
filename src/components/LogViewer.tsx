import React, { useMemo, useState } from 'react';
import { LogEntry, GameState } from '../types';
import { LogProcessor, AggregatedLogEntry, LogAggregator, DEFAULT_DEDUPLICATION_CONFIG, LogDeduplicationConfig } from '../utils/logAggregator';
import { useStorySequencer } from '../utils/storySequencer';
import { LogSettings } from './LogSettings';
import { LOG_STYLE_CONFIG, COLOR_THEMES, FONT_CONFIG } from '../constants';

interface LogViewerProps {
  logs: LogEntry[];
  phase: GameState['phase'];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, phase }) => {
  const [config, setConfig] = useState<LogDeduplicationConfig>(DEFAULT_DEDUPLICATION_CONFIG);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // 使用剧情序列器处理延迟显示
  const sequencedLogs = useStorySequencer(logs);
  
  // 创建日志处理器实例
  const logProcessor = useMemo(() => new LogProcessor(config), [config]);
  
  // 处理日志聚合
  const processedLogs = useMemo(() => {
    return logProcessor.process(sequencedLogs);
  }, [sequencedLogs, logProcessor]);

  // Check if we're in Chapter 1 impact phase by looking at the logs
  const isImpact = logs.some(log => log.text.includes('IMPACT DETECTED') || log.text.includes('HULL_BREACH_DETECTED'));
  
  const renderLogEntry = (log: AggregatedLogEntry, index: number) => {
    const isRepeated = (log.count || 1) > 1;
    
    // 根据游戏状态选择样式
    const getMessageTypeStyle = (type: string) => {
      const styles = LOG_STYLE_CONFIG.MESSAGE_TYPES;
      switch (type) {
        case 'warning':
          return isImpact ? styles.WARNING.IMPACT : styles.WARNING.NORMAL;
        case 'story':
          if (phase === 3) return styles.STORY.PHASE_3;
          return isImpact ? styles.STORY.IMPACT : styles.STORY.NORMAL;
        case 'horror':
          return styles.HORROR;
        case 'info':
          if (phase === 3) return styles.INFO.PHASE_3;
          return isImpact ? styles.INFO.IMPACT : styles.INFO.NORMAL;
        case 'success':
          return isImpact ? styles.SUCCESS.IMPACT : styles.SUCCESS.NORMAL;
        default:
          return '';
      }
    };
    
    return (
      <div 
        key={log.id} 
        className={`
          ${LOG_STYLE_CONFIG.BASE_CLASSES}
          ${index === 0 ? LOG_STYLE_CONFIG.ANIMATIONS.NEW_MESSAGE : LOG_STYLE_CONFIG.ANIMATIONS.OPACITY_NORMAL}
          ${isRepeated ? LOG_STYLE_CONFIG.ANIMATIONS.REPEATED_MESSAGE : ''}
          ${getMessageTypeStyle(log.type)}
        `}
      >
        <span className={LOG_STYLE_CONFIG.TIMESTAMP.BASE}>
          {phase === 3 
            ? LOG_STYLE_CONFIG.TIMESTAMP.PHASE_3
            : isImpact 
              ? LOG_STYLE_CONFIG.TIMESTAMP.IMPACT
              : `[T-${Math.floor(log.timestamp / 10000)}] `
          }
        </span>
        
        <div>
          {log.text}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`
      ${LOG_STYLE_CONFIG.CONTAINER.BASE}
      ${phase === 3 
        ? LOG_STYLE_CONFIG.CONTAINER.PHASE_3 
        : isImpact 
          ? LOG_STYLE_CONFIG.CONTAINER.IMPACT 
          : LOG_STYLE_CONFIG.CONTAINER.NORMAL
      }
    `}>
      {/* 日志设置 */}
      <LogSettings
        config={config}
        onConfigChange={setConfig}
        isOpen={settingsOpen}
        onToggle={() => setSettingsOpen(!settingsOpen)}
      />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className={`
          ${LOG_STYLE_CONFIG.TITLE.BASE}
          ${phase === 3 
            ? LOG_STYLE_CONFIG.TITLE.PHASE_3 
            : isImpact 
              ? LOG_STYLE_CONFIG.TITLE.IMPACT 
              : LOG_STYLE_CONFIG.TITLE.NORMAL
          }
        `}>
          {phase === 3 
            ? LOG_STYLE_CONFIG.TITLE_TEXT.PHASE_3 
            : isImpact 
              ? LOG_STYLE_CONFIG.TITLE_TEXT.IMPACT 
              : LOG_STYLE_CONFIG.TITLE_TEXT.NORMAL
          }
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {processedLogs.map((log, index) => renderLogEntry(log, index))}
        <div className="h-4" />
      </div>
    </div>
  );
};