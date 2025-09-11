from typing import Optional, Dict, Any, List, Literal
from .http_client import HttpClient
from .types import (
    OrganizationInfo,
    OrganizationMembership,
    CreateOrganizationRequest,
    UpdateOrganizationRequest,
    InviteMemberRequest,
    UpdateMemberRequest,
)


class OrganizationClient:
    """Client for organization management operations"""
    
    def __init__(self, http: HttpClient):
        self.http = http
    
    async def create_organization(
        self,
        name: str,
        slug: Optional[str] = None,
        description: Optional[str] = None,
        logo_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> OrganizationInfo:
        """
        Create a new organization
        
        Args:
            name: Organization name
            slug: URL-friendly identifier
            description: Organization description
            logo_url: URL to organization logo
            metadata: Additional metadata
        
        Returns:
            Created organization
        """
        request = CreateOrganizationRequest(
            name=name,
            slug=slug,
            description=description,
            logo_url=logo_url,
            metadata=metadata,
        )
        
        response = await self.http.post(
            "/api/v1/organizations",
            json=request.model_dump(exclude_none=True)
        )
        return OrganizationInfo(**response)
    
    async def get_organization(self, org_id: str) -> OrganizationInfo:
        """
        Get organization by ID
        
        Args:
            org_id: Organization ID
        
        Returns:
            Organization information
        """
        response = await self.http.get(f"/api/v1/organizations/{org_id}")
        return OrganizationInfo(**response)
    
    async def update_organization(
        self,
        org_id: str,
        name: Optional[str] = None,
        slug: Optional[str] = None,
        description: Optional[str] = None,
        logo_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> OrganizationInfo:
        """
        Update organization information
        
        Args:
            org_id: Organization ID
            name: New organization name
            slug: New URL-friendly identifier
            description: New description
            logo_url: New logo URL
            metadata: New metadata
        
        Returns:
            Updated organization
        """
        request = UpdateOrganizationRequest(
            name=name,
            slug=slug,
            description=description,
            logo_url=logo_url,
            metadata=metadata,
        )
        
        response = await self.http.patch(
            f"/api/v1/organizations/{org_id}",
            json=request.model_dump(exclude_none=True)
        )
        return OrganizationInfo(**response)
    
    async def delete_organization(self, org_id: str):
        """
        Delete an organization
        
        Args:
            org_id: Organization ID to delete
        """
        await self.http.delete(f"/api/v1/organizations/{org_id}")
    
    async def list_organizations(
        self,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        List organizations
        
        Args:
            limit: Maximum number of organizations to return
            offset: Number of organizations to skip
            search: Search query
        
        Returns:
            Dictionary with 'organizations' list and 'total' count
        """
        params = {}
        if limit is not None:
            params["limit"] = str(limit)
        if offset is not None:
            params["offset"] = str(offset)
        if search:
            params["search"] = search
        
        response = await self.http.get("/api/v1/organizations", params=params)
        response["organizations"] = [OrganizationInfo(**org) for org in response["organizations"]]
        return response
    
    async def get_user_organizations(self) -> List[OrganizationMembership]:
        """
        Get current user's organizations
        
        Returns:
            List of organization memberships
        """
        response = await self.http.get("/api/v1/users/organizations")
        return [OrganizationMembership(**membership) for membership in response]
    
    async def get_organization_members(
        self,
        org_id: str,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        role: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get organization members
        
        Args:
            org_id: Organization ID
            limit: Maximum number of members to return
            offset: Number of members to skip
            role: Filter by role
            search: Search query
        
        Returns:
            Dictionary with 'members' list and 'total' count
        """
        params = {}
        if limit is not None:
            params["limit"] = str(limit)
        if offset is not None:
            params["offset"] = str(offset)
        if role:
            params["role"] = role
        if search:
            params["search"] = search
        
        return await self.http.get(f"/api/v1/organizations/{org_id}/members", params=params)
    
    async def invite_member(
        self,
        org_id: str,
        email: str,
        role: str,
        permissions: Optional[List[str]] = None,
        send_email: bool = True,
    ) -> Dict[str, Any]:
        """
        Invite a member to the organization
        
        Args:
            org_id: Organization ID
            email: Email address to invite
            role: Role to assign
            permissions: Additional permissions
            send_email: Whether to send invitation email
        
        Returns:
            Invitation details
        """
        request = InviteMemberRequest(
            email=email,
            role=role,
            permissions=permissions,
            send_email=send_email,
        )
        
        return await self.http.post(
            f"/api/v1/organizations/{org_id}/invitations",
            json=request.model_dump(exclude_none=True)
        )
    
    async def update_member(
        self,
        org_id: str,
        user_id: str,
        role: Optional[str] = None,
        permissions: Optional[List[str]] = None,
    ) -> OrganizationMembership:
        """
        Update a member's role and permissions
        
        Args:
            org_id: Organization ID
            user_id: User ID to update
            role: New role
            permissions: New permissions
        
        Returns:
            Updated membership
        """
        request = UpdateMemberRequest(role=role, permissions=permissions)
        
        response = await self.http.patch(
            f"/api/v1/organizations/{org_id}/members/{user_id}",
            json=request.model_dump(exclude_none=True)
        )
        return OrganizationMembership(**response)
    
    async def remove_member(self, org_id: str, user_id: str):
        """
        Remove a member from the organization
        
        Args:
            org_id: Organization ID
            user_id: User ID to remove
        """
        await self.http.delete(f"/api/v1/organizations/{org_id}/members/{user_id}")
    
    async def leave_organization(self, org_id: str):
        """
        Leave an organization
        
        Args:
            org_id: Organization ID to leave
        """
        await self.http.post(f"/api/v1/organizations/{org_id}/leave")
    
    async def accept_invitation(self, invitation_id: str) -> OrganizationMembership:
        """
        Accept an organization invitation
        
        Args:
            invitation_id: Invitation ID
        
        Returns:
            Organization membership
        """
        response = await self.http.post(f"/api/v1/organizations/invitations/{invitation_id}/accept")
        return OrganizationMembership(**response)
    
    async def decline_invitation(self, invitation_id: str):
        """
        Decline an organization invitation
        
        Args:
            invitation_id: Invitation ID
        """
        await self.http.post(f"/api/v1/organizations/invitations/{invitation_id}/decline")
    
    async def revoke_invitation(self, org_id: str, invitation_id: str):
        """
        Revoke an organization invitation
        
        Args:
            org_id: Organization ID
            invitation_id: Invitation ID
        """
        await self.http.delete(f"/api/v1/organizations/{org_id}/invitations/{invitation_id}")
    
    async def list_invitations(
        self,
        org_id: str,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        status: Optional[Literal["pending", "accepted", "expired"]] = None,
    ) -> Dict[str, Any]:
        """
        List organization invitations
        
        Args:
            org_id: Organization ID
            limit: Maximum number of invitations to return
            offset: Number of invitations to skip
            status: Filter by invitation status
        
        Returns:
            Dictionary with 'invitations' list and 'total' count
        """
        params = {}
        if limit is not None:
            params["limit"] = str(limit)
        if offset is not None:
            params["offset"] = str(offset)
        if status:
            params["status"] = status
        
        return await self.http.get(f"/api/v1/organizations/{org_id}/invitations", params=params)
    
    async def get_organization_roles(self, org_id: str) -> List[Dict[str, Any]]:
        """
        Get organization roles
        
        Args:
            org_id: Organization ID
        
        Returns:
            List of roles
        """
        return await self.http.get(f"/api/v1/organizations/{org_id}/roles")
    
    async def create_organization_role(
        self,
        org_id: str,
        name: str,
        description: Optional[str] = None,
        permissions: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Create a new organization role
        
        Args:
            org_id: Organization ID
            name: Role name
            description: Role description
            permissions: Role permissions
        
        Returns:
            Created role
        """
        data = {
            "name": name,
            "description": description,
            "permissions": permissions or [],
        }
        
        return await self.http.post(f"/api/v1/organizations/{org_id}/roles", json=data)
    
    async def update_organization_role(
        self,
        org_id: str,
        role_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        permissions: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Update an organization role
        
        Args:
            org_id: Organization ID
            role_id: Role ID
            name: New role name
            description: New role description
            permissions: New permissions
        
        Returns:
            Updated role
        """
        data = {}
        if name is not None:
            data["name"] = name
        if description is not None:
            data["description"] = description
        if permissions is not None:
            data["permissions"] = permissions
        
        return await self.http.patch(f"/api/v1/organizations/{org_id}/roles/{role_id}", json=data)
    
    async def delete_organization_role(self, org_id: str, role_id: str):
        """
        Delete an organization role
        
        Args:
            org_id: Organization ID
            role_id: Role ID
        """
        await self.http.delete(f"/api/v1/organizations/{org_id}/roles/{role_id}")
    
    async def transfer_ownership(self, org_id: str, new_owner_id: str):
        """
        Transfer organization ownership
        
        Args:
            org_id: Organization ID
            new_owner_id: New owner's user ID
        """
        await self.http.post(f"/api/v1/organizations/{org_id}/transfer", json={"new_owner_id": new_owner_id})