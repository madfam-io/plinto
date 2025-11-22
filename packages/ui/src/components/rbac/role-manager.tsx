import * as React from 'react'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { Input } from '../input'
import { Label } from '../label'
import { cn } from '../../lib/utils'

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  organization_id: string
  is_system_role: boolean
  created_at: string
}

export interface RoleManagerProps {
  className?: string
  organizationId: string
  roles?: Role[]
  permissions?: string[]
  onCreateRole?: (role: Omit<Role, 'id' | 'created_at'>) => Promise<Role>
  onUpdateRole?: (roleId: string, updates: Partial<Role>) => Promise<Role>
  onDeleteRole?: (roleId: string) => Promise<void>
  onError?: (error: Error) => void
  januaClient?: any
  apiUrl?: string
}

export function RoleManager({
  className,
  organizationId,
  roles = [],
  permissions = [],
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onError,
  januaClient,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
}: RoleManagerProps) {
  const [isCreating, setIsCreating] = React.useState(false)
  const [newRoleName, setNewRoleName] = React.useState('')
  const [newRoleDescription, setNewRoleDescription] = React.useState('')
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setError('Role name is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const roleData = {
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
        permissions: selectedPermissions,
        organization_id: organizationId,
        is_system_role: false,
      }

      if (januaClient) {
        await januaClient.rbac.createRole(roleData)
      } else if (onCreateRole) {
        await onCreateRole(roleData)
      } else {
        const res = await fetch(`${apiUrl}/api/v1/rbac/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(roleData),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || 'Failed to create role')
        }
      }

      setNewRoleName('')
      setNewRoleDescription('')
      setSelectedPermissions([])
      setIsCreating(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create role'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage custom roles for your organization</CardDescription>
            </div>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>Create Role</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Project Manager"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <textarea
                  id="roleDescription"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Describe this role's responsibilities..."
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid max-h-60 gap-2 overflow-y-auto rounded-lg border p-4 md:grid-cols-2">
                  {permissions.map((permission) => (
                    <label
                      key={permission}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        disabled={isSubmitting}
                        className="h-4 w-4 rounded"
                      />
                      <span className="text-sm">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setNewRoleName('')
                    setNewRoleDescription('')
                    setSelectedPermissions([])
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRole} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {roles.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No roles created yet</p>
              ) : (
                roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{role.name}</h4>
                        {role.is_system_role && (
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            System
                          </span>
                        )}
                      </div>
                      {role.description && (
                        <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        {role.permissions.length} permissions
                      </p>
                    </div>
                    {!role.is_system_role && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
