from typing import Optional, Dict, Any, List, BinaryIO
from .http_client import HttpClient
from .types import User, UpdateUserRequest


class UserClient:
    """Client for user management operations"""
    
    def __init__(self, http: HttpClient):
        self.http = http
    
    async def get_user(self, user_id: Optional[str] = None) -> User:
        """
        Get user information
        
        Args:
            user_id: User ID to retrieve. If None, gets current user
        
        Returns:
            User object
        """
        path = f"/api/v1/users/{user_id}" if user_id else "/api/v1/auth/me"
        response = await self.http.get(path)
        return User(**response)
    
    async def get_current_user(self) -> User:
        """
        Get current authenticated user
        
        Returns:
            Current user object
        """
        return await self.get_user()
    
    async def update_user(
        self,
        user_id: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        username: Optional[str] = None,
        profile_image_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> User:
        """
        Update user information
        
        Args:
            user_id: User ID to update
            first_name: New first name
            last_name: New last name
            username: New username
            profile_image_url: New profile image URL
            metadata: New metadata
        
        Returns:
            Updated user object
        """
        request = UpdateUserRequest(
            first_name=first_name,
            last_name=last_name,
            username=username,
            profile_image_url=profile_image_url,
            metadata=metadata,
        )
        
        response = await self.http.patch(
            f"/api/v1/users/{user_id}",
            json=request.model_dump(exclude_none=True)
        )
        return User(**response)
    
    async def update_current_user(
        self,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        username: Optional[str] = None,
        profile_image_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> User:
        """
        Update current user information
        
        Args:
            first_name: New first name
            last_name: New last name
            username: New username
            profile_image_url: New profile image URL
            metadata: New metadata
        
        Returns:
            Updated user object
        """
        request = UpdateUserRequest(
            first_name=first_name,
            last_name=last_name,
            username=username,
            profile_image_url=profile_image_url,
            metadata=metadata,
        )
        
        response = await self.http.patch(
            "/api/v1/auth/me",
            json=request.model_dump(exclude_none=True)
        )
        return User(**response)
    
    async def delete_user(self, user_id: str):
        """
        Delete a user
        
        Args:
            user_id: User ID to delete
        """
        await self.http.delete(f"/api/v1/users/{user_id}")
    
    async def delete_current_user(self):
        """Delete the current user"""
        await self.http.delete("/api/v1/auth/me")
    
    async def list_users(
        self,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        email: Optional[str] = None,
        search: Optional[str] = None,
        order_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        List users with optional filters
        
        Args:
            limit: Maximum number of users to return
            offset: Number of users to skip
            email: Filter by email address
            search: Search query
            order_by: Field to order by
        
        Returns:
            Dictionary with 'users' list and 'total' count
        """
        params = {}
        if limit is not None:
            params["limit"] = str(limit)
        if offset is not None:
            params["offset"] = str(offset)
        if email:
            params["email"] = email
        if search:
            params["search"] = search
        if order_by:
            params["order_by"] = order_by
        
        response = await self.http.get("/api/v1/users", params=params)
        response["users"] = [User(**user) for user in response["users"]]
        return response
    
    async def upload_profile_image(self, file: BinaryIO, filename: str) -> Dict[str, str]:
        """
        Upload a profile image
        
        Args:
            file: File object to upload
            filename: Name of the file
        
        Returns:
            Dictionary with 'url' of uploaded image
        """
        files = {"file": (filename, file, "image/jpeg")}
        return await self.http.post("/api/v1/users/profile-image", files=files)
    
    async def remove_profile_image(self):
        """Remove the current user's profile image"""
        await self.http.delete("/api/v1/users/profile-image")
    
    async def get_user_sessions(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get user sessions
        
        Args:
            user_id: User ID. If None, gets current user's sessions
        
        Returns:
            List of session objects
        """
        path = f"/api/v1/users/{user_id}/sessions" if user_id else "/api/v1/auth/sessions"
        return await self.http.get(path)
    
    async def revoke_session(self, session_id: str):
        """
        Revoke a specific session
        
        Args:
            session_id: Session ID to revoke
        """
        await self.http.post(f"/api/v1/auth/sessions/{session_id}/revoke")
    
    async def revoke_all_sessions(self, except_ids: Optional[List[str]] = None):
        """
        Revoke all sessions except specified ones
        
        Args:
            except_ids: List of session IDs to keep active
        """
        data = {"except": except_ids} if except_ids else {}
        await self.http.post("/api/v1/auth/sessions/revoke-all", json=data)
    
    async def get_user_metadata(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get user metadata
        
        Args:
            user_id: User ID. If None, gets current user's metadata
        
        Returns:
            User metadata dictionary
        """
        path = f"/api/v1/users/{user_id}/metadata" if user_id else "/api/v1/auth/metadata"
        return await self.http.get(path)
    
    async def update_user_metadata(
        self,
        metadata: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update user metadata
        
        Args:
            metadata: New metadata to set
            user_id: User ID. If None, updates current user's metadata
        
        Returns:
            Updated metadata dictionary
        """
        path = f"/api/v1/users/{user_id}/metadata" if user_id else "/api/v1/auth/metadata"
        return await self.http.patch(path, json=metadata)
    
    async def get_user_public_profile(self, username: str) -> Dict[str, Any]:
        """
        Get a user's public profile by username
        
        Args:
            username: Username to look up
        
        Returns:
            Public profile information
        """
        return await self.http.get(f"/api/v1/users/profile/{username}")
    
    async def check_username_availability(self, username: str) -> Dict[str, bool]:
        """
        Check if a username is available
        
        Args:
            username: Username to check
        
        Returns:
            Dictionary with 'available' boolean
        """
        return await self.http.get("/api/v1/users/username/check", params={"username": username})
    
    async def check_email_availability(self, email: str) -> Dict[str, bool]:
        """
        Check if an email is available
        
        Args:
            email: Email address to check
        
        Returns:
            Dictionary with 'available' boolean
        """
        return await self.http.get("/api/v1/users/email/check", params={"email": email})
    
    async def export_user_data(self) -> bytes:
        """
        Export all user data
        
        Returns:
            User data as bytes (typically JSON or ZIP)
        """
        response = await self.http.get(
            "/api/v1/users/export",
            headers={"Accept": "application/json"}
        )
        
        if isinstance(response, bytes):
            return response
        else:
            raise ValueError("Invalid response format for user data export")
    
    async def get_user_activity_log(
        self,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get user activity log
        
        Args:
            limit: Maximum number of activities to return
            offset: Number of activities to skip
            start_date: Start date for filtering (ISO format)
            end_date: End date for filtering (ISO format)
        
        Returns:
            Dictionary with 'activities' list and 'total' count
        """
        params = {}
        if limit is not None:
            params["limit"] = str(limit)
        if offset is not None:
            params["offset"] = str(offset)
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        
        return await self.http.get("/api/v1/users/activity", params=params)