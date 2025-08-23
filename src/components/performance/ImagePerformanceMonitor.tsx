import { useEffect } from 'react';

export default function ImagePerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP) for images
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry && (lastEntry as any).element?.tagName === 'IMG') {
          console.log('LCP Image:', {
            url: (lastEntry as any).url,
            loadTime: (lastEntry as any).loadTime,
            renderTime: (lastEntry as any).renderTime,
            size: (lastEntry as any).size
          });
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor image loading performance
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === 'img') {
            const loadTime = entry.responseEnd - entry.startTime;
            
            // Log slow loading images (>500ms)
            if (loadTime > 500) {
              console.warn('Slow image load:', {
                url: entry.name,
                loadTime: Math.round(loadTime),
                size: entry.transferSize
              });
            }
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });

      return () => {
        lcpObserver.disconnect();
        resourceObserver.disconnect();
      };
    }
  }, []);

  return null;
}