/**
 * Organization Member Management Service
 * Complete implementation for organization member lifecycle
 */

import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { logger } from '../utils/logger';

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'suspended' | 'removed';
  invitedBy?: string;
  invitedAt?: Date;
  joinedAt?: Date;
  removedAt?: Date;
  metadata?: Record<string, any>;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  token: string;
  invitedBy: string;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

export class OrganizationMemberService extends EventEmitter {
  private prisma: PrismaClient;
  private redisService: any;

  constructor(redisService?: any) {
    super();
    this.prisma = new PrismaClient();
    this.redisService = redisService;
  }

  /**
   * Add member to organization
   */
  async addMember(params: {
    organizationId: string;
    userId: string;
    role: 'admin' | 'member' | 'viewer';
    invitedBy: string;
  }): Promise<OrganizationMember> {
    // Check if user is already a member
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.organizationId,
        },
      },
    });

    if (existingMember) {
      throw new Error('User is already a member of this organization');
    }

    // Create membership
    const member = await this.prisma.organizationMember.create({
      data: {
        id: this.generateId('member'),
        userId: params.userId,
        organizationId: params.organizationId,
        role: params.role,
        status: 'active',
        invitedBy: params.invitedBy,
        joinedAt: new Date(),
      },
    });

    // Clear cache
    await this.clearOrganizationCache(params.organizationId);

    // Emit event
    this.emit('member:added', member);

    logger.info('Member added to organization', {
      organizationId: params.organizationId,
      userId: params.userId,
      role: params.role,
    });

    return member as OrganizationMember;
  }

  /**
   * Remove member from organization
   */
  async removeMember(params: {
    organizationId: string;
    userId: string;
    removedBy: string;
  }): Promise<void> {
    // Check if member exists
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.organizationId,
        },
      },
    });

    if (!member) {
      throw new Error('Member not found in organization');
    }

    // Prevent removing the last owner
    if (member.role === 'owner') {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          organizationId: params.organizationId,
          role: 'owner',
          status: 'active',
        },
      });

      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner of the organization');
      }
    }

    // Soft delete the member
    await this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.organizationId,
        },
      },
      data: {
        status: 'removed',
        removedAt: new Date(),
        metadata: {
          ...((member.metadata as any) || {}),
          removedBy: params.removedBy,
        },
      },
    });

    // Clear cache
    await this.clearOrganizationCache(params.organizationId);

    // Emit event
    this.emit('member:removed', {
      organizationId: params.organizationId,
      userId: params.userId,
      removedBy: params.removedBy,
    });

    logger.info('Member removed from organization', {
      organizationId: params.organizationId,
      userId: params.userId,
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(params: {
    organizationId: string;
    userId: string;
    newRole: 'owner' | 'admin' | 'member' | 'viewer';
    updatedBy: string;
  }): Promise<OrganizationMember> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.organizationId,
        },
      },
    });

    if (!member) {
      throw new Error('Member not found in organization');
    }

    // Special handling for owner role changes
    if (member.role === 'owner' && params.newRole !== 'owner') {
      const ownerCount = await this.prisma.organizationMember.count({
        where: {
          organizationId: params.organizationId,
          role: 'owner',
          status: 'active',
        },
      });

      if (ownerCount <= 1) {
        throw new Error('Cannot demote the last owner. Assign another owner first.');
      }
    }

    // Update role
    const updatedMember = await this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: params.userId,
          organizationId: params.organizationId,
        },
      },
      data: {
        role: params.newRole,
        metadata: {
          ...((member.metadata as any) || {}),
          lastRoleChange: {
            from: member.role,
            to: params.newRole,
            by: params.updatedBy,
            at: new Date().toISOString(),
          },
        },
      },
    });

    // Clear cache
    await this.clearOrganizationCache(params.organizationId);

    // Emit event
    this.emit('member:role-updated', {
      member: updatedMember,
      previousRole: member.role,
      newRole: params.newRole,
    });

    logger.info('Member role updated', {
      organizationId: params.organizationId,
      userId: params.userId,
      from: member.role,
      to: params.newRole,
    });

    return updatedMember as OrganizationMember;
  }

  /**
   * Create invitation
   */
  async createInvitation(params: {
    organizationId: string;
    email: string;
    role: 'admin' | 'member' | 'viewer';
    invitedBy: string;
    expiryDays?: number;
  }): Promise<Invitation> {
    // Check if user already has pending invitation
    const existingInvitation = await this.prisma.organizationInvitation.findFirst({
      where: {
        organizationId: params.organizationId,
        email: params.email.toLowerCase(),
        status: 'pending',
      },
    });

    if (existingInvitation) {
      throw new Error('An invitation already exists for this email');
    }

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (params.expiryDays || 7));

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        id: this.generateId('inv'),
        organizationId: params.organizationId,
        email: params.email.toLowerCase(),
        role: params.role,
        token: this.generateToken(),
        invitedBy: params.invitedBy,
        expiresAt,
        status: 'pending',
      },
    });

    // Store in Redis for quick lookup
    if (this.redisService) {
      await this.redisService.set(
        `invitation:${invitation.token}`,
        JSON.stringify(invitation),
        params.expiryDays ? params.expiryDays * 86400 : 604800 // 7 days default
      );
    }

    // Emit event for email sending
    this.emit('invitation:created', invitation);

    logger.info('Invitation created', {
      organizationId: params.organizationId,
      email: params.email,
      role: params.role,
    });

    return invitation as Invitation;
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(params: {
    token: string;
    userId: string;
  }): Promise<OrganizationMember> {
    // Get invitation from Redis first for performance
    let invitation: any;
    
    if (this.redisService) {
      const cached = await this.redisService.get(`invitation:${params.token}`);
      if (cached) {
        invitation = JSON.parse(cached);
      }
    }

    // Fallback to database
    if (!invitation) {
      invitation = await this.prisma.organizationInvitation.findUnique({
        where: { token: params.token },
      });
    }

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation has already been used');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Begin transaction
    const [member, _] = await this.prisma.$transaction([
      // Create membership
      this.prisma.organizationMember.create({
        data: {
          id: this.generateId('member'),
          userId: params.userId,
          organizationId: invitation.organizationId,
          role: invitation.role,
          status: 'active',
          invitedBy: invitation.invitedBy,
          invitedAt: invitation.createdAt,
          joinedAt: new Date(),
        },
      }),
      // Update invitation status
      this.prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          acceptedBy: params.userId,
        },
      }),
    ]);

    // Clear cache
    if (this.redisService) {
      await this.redisService.del(`invitation:${params.token}`);
    }
    await this.clearOrganizationCache(invitation.organizationId);

    // Emit event
    this.emit('invitation:accepted', {
      invitation,
      member,
    });

    logger.info('Invitation accepted', {
      organizationId: invitation.organizationId,
      userId: params.userId,
      email: invitation.email,
    });

    return member as OrganizationMember;
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(params: {
    invitationId: string;
    cancelledBy: string;
  }): Promise<void> {
    const invitation = await this.prisma.organizationInvitation.findUnique({
      where: { id: params.invitationId },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Can only cancel pending invitations');
    }

    await this.prisma.organizationInvitation.update({
      where: { id: params.invitationId },
      data: {
        status: 'cancelled',
        metadata: {
          cancelledBy: params.cancelledBy,
          cancelledAt: new Date().toISOString(),
        },
      },
    });

    // Clear from Redis
    if (this.redisService && invitation.token) {
      await this.redisService.del(`invitation:${invitation.token}`);
    }

    this.emit('invitation:cancelled', invitation);

    logger.info('Invitation cancelled', {
      invitationId: params.invitationId,
      organizationId: invitation.organizationId,
    });
  }

  /**
   * List organization members
   */
  async listMembers(params: {
    organizationId: string;
    includeRemoved?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    members: OrganizationMember[];
    total: number;
  }> {
    const where: any = {
      organizationId: params.organizationId,
    };

    if (!params.includeRemoved) {
      where.status = { in: ['active', 'invited', 'suspended'] };
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.prisma.organizationMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { role: 'asc' }, // Owners first
          { joinedAt: 'desc' },
        ],
      }),
      this.prisma.organizationMember.count({ where }),
    ]);

    return {
      members: members as any[],
      total,
    };
  }

  /**
   * Get member by user and organization
   */
  async getMember(userId: string, organizationId: string): Promise<OrganizationMember | null> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return member as OrganizationMember | null;
  }

  /**
   * Check if user has permission in organization
   */
  async hasPermission(params: {
    userId: string;
    organizationId: string;
    requiredRole: 'owner' | 'admin' | 'member' | 'viewer';
  }): Promise<boolean> {
    const member = await this.getMember(params.userId, params.organizationId);
    
    if (!member || member.status !== 'active') {
      return false;
    }

    const roleHierarchy = {
      owner: 4,
      admin: 3,
      member: 2,
      viewer: 1,
    };

    return roleHierarchy[member.role] >= roleHierarchy[params.requiredRole];
  }

  /**
   * Private helper methods
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async clearOrganizationCache(organizationId: string): Promise<void> {
    if (this.redisService) {
      await this.redisService.del([
        `org:${organizationId}:members`,
        `org:${organizationId}:stats`,
      ]);
    }
  }
}