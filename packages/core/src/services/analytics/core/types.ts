/**
 * Analytics Module - Shared Type Definitions
 * Extracted from analytics-reporting.service.ts for better organization
 */

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_category: 'user' | 'system' | 'security' | 'business' | 'performance';
  timestamp: Date;
  user_id?: string;
  organization_id?: string;
  session_id?: string;
  properties: Record<string, any>;
  context: {
    ip_address?: string;
    user_agent?: string;
    location?: Location;
    device?: DeviceInfo;
    referrer?: string;
    utm_params?: Record<string, string>;
  };
}

export interface Location {
  country: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'bot';
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  device_model?: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  unit?: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile';
  dimensions?: string[];
  retention_days: number;
}

export interface TimeSeriesData {
  metric: string;
  timestamp: Date;
  value: number;
  dimensions?: Record<string, string>;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: 'dashboard' | 'scheduled' | 'adhoc' | 'realtime';
  created_by: string;
  created_at: Date;
  updated_at: Date;
  schedule?: ReportSchedule;
  widgets: ReportWidget[];
  filters: ReportFilter[];
  access_control?: AccessControl;
}

export interface ReportSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM format
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel' | 'json';
}

export interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'map' | 'funnel' | 'cohort' | 'heatmap';
  title: string;
  metric_id: string;
  visualization: VisualizationConfig;
  time_range: TimeRange;
  filters?: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface VisualizationConfig {
  chart_type?: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'bubble';
  colors?: string[];
  legend?: boolean;
  axis_labels?: { x?: string; y?: string };
  stacked?: boolean;
  show_values?: boolean;
  animation?: boolean;
}

export interface TimeRange {
  type: 'relative' | 'absolute';
  relative?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  };
  absolute?: {
    start: Date;
    end: Date;
  };
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in';
  value: any;
}

export interface AccessControl {
  visibility: 'private' | 'organization' | 'public';
  roles?: string[];
  users?: string[];
  teams?: string[];
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: QueryFilter[];
  time_range: TimeRange;
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  order_by?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
}

export interface QueryFilter {
  dimension: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'between' | 'in' | 'regex';
  value: any;
}

export interface QueryResult {
  query: AnalyticsQuery;
  data: any[];
  metadata: {
    total_rows: number;
    execution_time_ms: number;
    cache_hit: boolean;
    warnings?: string[];
  };
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  owner_id: string;
  reports: Report[];
  layout: DashboardLayout;
  refresh_interval?: number; // seconds
  created_at: Date;
  updated_at: Date;
  shared_with?: AccessControl;
}

export interface DashboardLayout {
  type: 'grid' | 'freeform' | 'responsive';
  columns?: number;
  rows?: number;
  widgets: Array<{
    report_id: string;
    widget_id: string;
    position: { x: number; y: number; width: number; height: number };
  }>;
}

export interface InsightDefinition {
  id: string;
  name: string;
  description: string;
  type: 'anomaly' | 'trend' | 'forecast' | 'correlation' | 'segmentation';
  algorithm: string;
  parameters: Record<string, any>;
  schedule: 'realtime' | 'hourly' | 'daily';
  threshold?: number;
  actions?: InsightAction[];
}

export interface InsightAction {
  type: 'alert' | 'webhook' | 'email' | 'slack';
  config: Record<string, any>;
}

export interface Insight {
  id: string;
  definition_id: string;
  timestamp: Date;
  type: InsightDefinition['type'];
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  data: Record<string, any>;
  affected_metrics?: string[];
  recommendations?: string[];
}

export interface FunnelAnalysis {
  id: string;
  name: string;
  steps: FunnelStep[];
  time_window: number; // minutes
  created_at: Date;
  conversion_rate: number;
  drop_off_rates: number[];
}

export interface FunnelStep {
  name: string;
  event_type: string;
  filters?: QueryFilter[];
  users_count: number;
  conversion_rate: number;
}

export interface CohortAnalysis {
  id: string;
  name: string;
  cohort_definition: {
    event: string;
    time_range: TimeRange;
    filters?: QueryFilter[];
  };
  retention_metric: {
    event: string;
    aggregation: 'count' | 'sum' | 'avg';
  };
  periods: number;
  period_type: 'day' | 'week' | 'month';
  data: CohortData[];
}

export interface CohortData {
  cohort_date: Date;
  cohort_size: number;
  retention: number[]; // Retention percentages for each period
}

export interface AnalyticsConfig {
  batch_size?: number;
  batch_interval?: number;
  enable_realtime?: boolean;
  enable_insights?: boolean;
  cache_ttl?: number;
  anomaly_threshold?: number;
}
