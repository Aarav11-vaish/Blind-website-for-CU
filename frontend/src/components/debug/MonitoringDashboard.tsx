"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analytics } from '@/lib/analytics';
import { getErrorReportingService } from '@/lib/errorReporting';
import { apiCache } from '@/lib/api-cache';
import { Activity, AlertTriangle, BarChart3, Database, Zap, RefreshCw } from 'lucide-react';

interface MonitoringDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export function MonitoringDashboard({ isVisible = false, onClose }: MonitoringDashboardProps) {
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      // Get analytics stats
      setAnalyticsStats(analytics.getStats());

      // Get error reporting stats
      const errorService = getErrorReportingService();
      setErrorStats(errorService.getErrorStats());

      // Get cache stats
      setCacheStats(apiCache.getStats());

      // Get performance metrics
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const memory = (performance as any).memory;

        setPerformanceMetrics({
          navigation: navigation ? {
            loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart),
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
            firstPaint: Math.round(navigation.responseEnd - navigation.fetchStart),
          } : null,
          memory: memory ? {
            usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
          } : null,
        });
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isVisible, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClearCache = () => {
    apiCache.clear();
    handleRefresh();
  };

  const handleClearErrors = () => {
    const errorService = getErrorReportingService();
    errorService.clearLocalErrorReports();
    handleRefresh();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="analytics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="cache">Cache</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Session</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsStats?.isEnabled ? 'Active' : 'Disabled'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ID: {analyticsStats?.sessionId?.slice(-8)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Queued Events</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analyticsStats?.queuedEvents || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Performance: {analyticsStats?.queuedPerformance || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">User</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsStats?.userId ? 'Identified' : 'Anonymous'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsStats?.userId?.slice(-8) || 'No user ID'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="errors" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Error Reports</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{errorStats?.reportCount || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Unique: {errorStats?.uniqueErrors || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Environment</CardTitle>
                    <Badge variant="outline">{errorStats?.environment || 'unknown'}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {errorStats?.sessionId?.slice(-8) || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Session ID</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" onClick={handleClearErrors}>
                      Clear Local Errors
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Page Load Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {performanceMetrics?.navigation ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Load Time:</span>
                          <Badge variant="outline">{performanceMetrics.navigation.loadTime}ms</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">DOM Content Loaded:</span>
                          <Badge variant="outline">{performanceMetrics.navigation.domContentLoaded}ms</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">First Paint:</span>
                          <Badge variant="outline">{performanceMetrics.navigation.firstPaint}ms</Badge>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No navigation data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {performanceMetrics?.memory ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Used Heap:</span>
                          <Badge variant="outline">{performanceMetrics.memory.usedJSHeapSize}MB</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Heap:</span>
                          <Badge variant="outline">{performanceMetrics.memory.totalJSHeapSize}MB</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Heap Limit:</span>
                          <Badge variant="outline">{performanceMetrics.memory.jsHeapSizeLimit}MB</Badge>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Memory data not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cache" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cache Entries</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{cacheStats?.totalEntries || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Valid: {cacheStats?.validEntries || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {cacheStats?.hitRate ? `${Math.round(cacheStats.hitRate * 100)}%` : '0%'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expired: {cacheStats?.expiredEntries || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" onClick={handleClearCache}>
                      Clear Cache
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Debug component to show monitoring dashboard in development
export function DebugMonitoring() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show dashboard with Ctrl+Shift+M (or Cmd+Shift+M on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        setIsVisible(true);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <MonitoringDashboard
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />

      {/* Debug indicator */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Activity className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    </>
  );
}