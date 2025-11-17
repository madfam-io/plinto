import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { cn } from '../../lib/utils'

export interface SyncStatus {
  last_sync: string
  users_synced: number
  groups_synced: number
  errors: number
  status: 'active' | 'error' | 'pending' | 'disabled'
}

export interface SCIMSyncStatusProps {
  className?: string
  organizationId: string
  syncStatus?: SyncStatus
  plintoClient?: any
  apiUrl?: string
}

export function SCIMSyncStatus({
  className,
  syncStatus,
}: SCIMSyncStatusProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      disabled: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!syncStatus) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>SCIM Sync Status</CardTitle>
          <CardDescription>No SCIM configuration found</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>SCIM Sync Status</CardTitle>
        <CardDescription>
          <span className={cn('rounded-full px-2 py-1 text-xs', getStatusColor(syncStatus.status))}>
            {syncStatus.status}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Users Synced</p>
            <p className="text-2xl font-bold">{syncStatus.users_synced}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Groups Synced</p>
            <p className="text-2xl font-bold">{syncStatus.groups_synced}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-600">Sync Errors</p>
            <p className={cn('text-2xl font-bold', syncStatus.errors > 0 && 'text-red-600')}>
              {syncStatus.errors}
            </p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Last sync: {new Date(syncStatus.last_sync).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
