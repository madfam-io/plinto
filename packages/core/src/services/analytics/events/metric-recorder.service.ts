/**
 * Metric Recorder Service
 * Handles metric definition and recording
 * Extracted from AnalyticsReportingService
 */

import { EventEmitter } from 'events';
import {
  MetricDefinition,
  TimeSeriesData,
  AnalyticsEvent
} from '../core/types';

export class MetricRecorderService extends EventEmitter {
  private metrics: Map<string, MetricDefinition> = new Map();
  private timeSeries: Map<string, TimeSeriesData[]> = new Map();

  constructor() {
    super();
    this.initializeDefaultMetrics();
  }

  /**
   * Define a new metric
   */
  defineMetric(metric: MetricDefinition): void {
    this.metrics.set(metric.id, metric);
    this.emit('metric:defined', metric);
  }

  /**
   * Get metric definition
   */
  getMetric(metricId: string): MetricDefinition | undefined {
    return this.metrics.get(metricId);
  }

  /**
   * Get all metric definitions
   */
  getAllMetrics(): MetricDefinition[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Record a metric value
   */
  async recordMetric(
    metricName: string,
    value: number,
    dimensions?: Record<string, string>
  ): Promise<void> {
    const metric = this.metrics.get(metricName);
    if (!metric) {
      throw new Error(`Metric ${metricName} not defined`);
    }

    const dataPoint: TimeSeriesData = {
      metric: metricName,
      timestamp: new Date(),
      value,
      dimensions
    };

    // Store time series data
    const key = this.getTimeSeriesKey(metricName, dimensions);
    if (!this.timeSeries.has(key)) {
      this.timeSeries.set(key, []);
    }
    this.timeSeries.get(key)!.push(dataPoint);

    // Emit for real-time dashboards
    this.emit('metric:recorded', dataPoint);
  }

  /**
   * Update real-time metrics based on analytics event
   */
  async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    // Update relevant metrics based on event type
    switch (event.event_category) {
      case 'user':
        await this.recordMetric('active_users', 1, {
          organization: event.organization_id || 'unknown'
        });
        break;

      case 'performance':
        if (event.properties.response_time) {
          await this.recordMetric('response_time', event.properties.response_time, {
            endpoint: event.properties.endpoint
          });
        }
        if (event.properties.requests) {
          await this.recordMetric('api_requests', event.properties.requests, {
            endpoint: event.properties.endpoint,
            method: event.properties.method,
            status: event.properties.status
          });
        }
        break;

      case 'business':
        if (event.properties.revenue) {
          await this.recordMetric('revenue', event.properties.revenue, {
            plan: event.properties.plan,
            billing_cycle: event.properties.billing_cycle
          });
        }
        break;
    }
  }

  /**
   * Get metric history
   */
  async getMetricHistory(
    metricName: string,
    dimensions?: Record<string, string>
  ): Promise<TimeSeriesData[]> {
    const key = this.getTimeSeriesKey(metricName, dimensions);
    return this.timeSeries.get(key) || [];
  }

  /**
   * Get time series data within a time range
   */
  async getTimeSeries(
    metricName: string,
    startDate: Date,
    endDate: Date,
    dimensions?: Record<string, string>
  ): Promise<TimeSeriesData[]> {
    const history = await this.getMetricHistory(metricName, dimensions);

    return history.filter(
      point => point.timestamp >= startDate && point.timestamp <= endDate
    );
  }

  /**
   * Clear old time series data (for retention management)
   */
  clearOldData(beforeDate: Date): void {
    for (const [key, data] of this.timeSeries.entries()) {
      const filtered = data.filter(point => point.timestamp >= beforeDate);

      if (filtered.length > 0) {
        this.timeSeries.set(key, filtered);
      } else {
        this.timeSeries.delete(key);
      }
    }
  }

  /**
   * Get metric statistics
   */
  getMetricStats(metricName: string): {
    totalDataPoints: number;
    uniqueDimensions: number;
    oldestDataPoint?: Date;
    newestDataPoint?: Date;
  } {
    let totalDataPoints = 0;
    const dimensionKeys = new Set<string>();
    let oldest: Date | undefined;
    let newest: Date | undefined;

    // Iterate through all time series for this metric
    for (const [key, data] of this.timeSeries.entries()) {
      if (key.startsWith(metricName)) {
        totalDataPoints += data.length;
        dimensionKeys.add(key);

        for (const point of data) {
          if (!oldest || point.timestamp < oldest) {
            oldest = point.timestamp;
          }
          if (!newest || point.timestamp > newest) {
            newest = point.timestamp;
          }
        }
      }
    }

    return {
      totalDataPoints,
      uniqueDimensions: dimensionKeys.size,
      oldestDataPoint: oldest,
      newestDataPoint: newest
    };
  }

  /**
   * Private: Initialize default metrics
   */
  private initializeDefaultMetrics(): void {
    const defaultMetrics: MetricDefinition[] = [
      {
        id: 'api_requests',
        name: 'API Requests',
        description: 'Total number of API requests',
        type: 'counter',
        aggregation: 'sum',
        dimensions: ['endpoint', 'method', 'status'],
        retention_days: 90
      },
      {
        id: 'response_time',
        name: 'Response Time',
        description: 'API response time in milliseconds',
        type: 'histogram',
        unit: 'ms',
        aggregation: 'percentile',
        dimensions: ['endpoint'],
        retention_days: 30
      },
      {
        id: 'active_users',
        name: 'Active Users',
        description: 'Number of active users',
        type: 'gauge',
        aggregation: 'count',
        dimensions: ['organization'],
        retention_days: 365
      },
      {
        id: 'revenue',
        name: 'Revenue',
        description: 'Total revenue',
        type: 'counter',
        unit: 'USD',
        aggregation: 'sum',
        dimensions: ['plan', 'billing_cycle'],
        retention_days: 999
      }
    ];

    for (const metric of defaultMetrics) {
      this.metrics.set(metric.id, metric);
    }

    this.emit('metrics:initialized', defaultMetrics);
  }

  /**
   * Private: Get time series storage key
   */
  private getTimeSeriesKey(metric: string, dimensions?: Record<string, string>): string {
    if (!dimensions) return metric;

    const dimStr = Object.entries(dimensions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');

    return `${metric}:${dimStr}`;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.removeAllListeners();
  }
}
