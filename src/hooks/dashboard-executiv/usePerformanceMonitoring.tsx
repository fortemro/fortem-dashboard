
import { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  componentLoadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  apiResponseTimes: Record<string, number>;
}

interface ComponentTimings {
  [componentName: string]: {
    mountTime: number;
    renderCount: number;
    averageRenderTime: number;
    lastRender: number;
  };
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    componentLoadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    cacheHitRate: 0,
    apiResponseTimes: {}
  });
  
  const [componentTimings, setComponentTimings] = useState<ComponentTimings>({});
  const renderStartTime = useRef<number>(0);
  const apiStartTimes = useRef<Record<string, number>>({});

  // Track component render performance
  const trackComponentRender = (componentName: string) => {
    const startTime = performance.now();
    renderStartTime.current = startTime;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setComponentTimings(prev => {
        const existing = prev[componentName] || {
          mountTime: startTime,
          renderCount: 0,
          averageRenderTime: 0,
          lastRender: startTime
        };

        const newRenderCount = existing.renderCount + 1;
        const newAverageRenderTime = 
          (existing.averageRenderTime * existing.renderCount + renderTime) / newRenderCount;

        return {
          ...prev,
          [componentName]: {
            ...existing,
            renderCount: newRenderCount,
            averageRenderTime: newAverageRenderTime,
            lastRender: endTime
          }
        };
      });

      setMetrics(prev => ({
        ...prev,
        renderTime: renderTime
      }));
    };
  };

  // Track API call performance
  const trackApiCall = (apiName: string) => {
    const startTime = performance.now();
    apiStartTimes.current[apiName] = startTime;

    return () => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      setMetrics(prev => ({
        ...prev,
        apiResponseTimes: {
          ...prev.apiResponseTimes,
          [apiName]: responseTime
        },
        networkLatency: responseTime
      }));

      delete apiStartTimes.current[apiName];
    };
  };

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memInfo.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  // Calculate cache hit rate
  const updateCacheHitRate = (hits: number, total: number) => {
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: total > 0 ? (hits / total) * 100 : 0
    }));
  };

  // Get performance insights
  const getPerformanceInsights = () => {
    const insights = [];
    
    if (metrics.renderTime > 100) {
      insights.push({
        type: 'warning',
        message: `Render time înalt: ${metrics.renderTime.toFixed(2)}ms`,
        recommendation: 'Considerați optimizarea componentelor sau lazy loading'
      });
    }

    if (metrics.memoryUsage > 50) {
      insights.push({
        type: 'warning',
        message: `Utilizare memorie ridicată: ${metrics.memoryUsage.toFixed(2)}MB`,
        recommendation: 'Verificați memory leaks sau componentele heavy'
      });
    }

    if (metrics.networkLatency > 1000) {
      insights.push({
        type: 'error',
        message: `Latență rețea ridicată: ${metrics.networkLatency.toFixed(2)}ms`,
        recommendation: 'Verificați conexiunea sau optimizați API calls'
      });
    }

    if (metrics.cacheHitRate < 70) {
      insights.push({
        type: 'info',
        message: `Cache hit rate scăzut: ${metrics.cacheHitRate.toFixed(1)}%`,
        recommendation: 'Optimizați strategia de caching'
      });
    }

    return insights;
  };

  return {
    metrics,
    componentTimings,
    trackComponentRender,
    trackApiCall,
    updateCacheHitRate,
    getPerformanceInsights
  };
}
