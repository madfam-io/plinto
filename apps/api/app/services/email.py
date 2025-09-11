"""
Email service for sending transactional emails
"""

import logging
from typing import Optional, Dict, Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def get_base_url() -> str:
        """Get the base URL for email links"""
        return settings.FRONTEND_URL or settings.BASE_URL
    
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using configured provider"""
        
        if not settings.EMAIL_ENABLED:
            logger.warning(f"Email service disabled, would send: {subject} to {to_email}")
            return False
        
        try:
            if settings.EMAIL_PROVIDER == "sendgrid" and settings.SENDGRID_API_KEY:
                return await EmailService._send_with_sendgrid(to_email, subject, html_content, text_content)
            elif settings.SMTP_HOST:
                return await EmailService._send_with_smtp(to_email, subject, html_content, text_content)
            else:
                logger.error("No email provider configured")
                return False
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False
    
    @staticmethod
    async def _send_with_sendgrid(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email using SendGrid"""
        try:
            # Import sendgrid only if needed
            import sendgrid
            from sendgrid.helpers.mail import Mail, From, To, Content
            
            sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
            
            from_email = From(settings.EMAIL_FROM_ADDRESS, settings.EMAIL_FROM_NAME)
            to_email = To(to_email)
            
            mail = Mail(from_email, to_email, subject, html_content=html_content)
            
            if text_content:
                mail.plain_text_content = Content("text/plain", text_content)
            
            response = sg.send(mail)
            
            if response.status_code >= 200 and response.status_code < 300:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code}")
                return False
                
        except ImportError:
            logger.error("SendGrid library not installed")
            return False
        except Exception as e:
            logger.error(f"SendGrid error: {e}")
            return False
    
    @staticmethod
    async def _send_with_smtp(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email using SMTP"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
            message["To"] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email asynchronously
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USERNAME,
                password=settings.SMTP_PASSWORD,
                start_tls=settings.SMTP_TLS
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"SMTP error: {e}")
            return False
    
    @staticmethod
    async def send_verification_email(email: str, token: str) -> bool:
        """Send email verification email"""
        base_url = EmailService.get_base_url()
        verify_url = f"{base_url}/verify-email?token={token}"
        
        subject = "Verify your Plinto account"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #007bff; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to Plinto!</h2>
                <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
                <a href="{verify_url}" class="button">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">{verify_url}</p>
                <p>This link will expire in 48 hours.</p>
                <div class="footer">
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                    <p>&copy; 2025 Plinto. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to Plinto!
        
        Thank you for signing up. Please verify your email address by visiting:
        {verify_url}
        
        This link will expire in 48 hours.
        
        If you didn't create an account, you can safely ignore this email.
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content)
    
    @staticmethod
    async def send_password_reset_email(email: str, token: str) -> bool:
        """Send password reset email"""
        base_url = EmailService.get_base_url()
        reset_url = f"{base_url}/reset-password?token={token}"
        
        subject = "Reset your Plinto password"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #dc3545; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <a href="{reset_url}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">{reset_url}</p>
                <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
                <div class="footer">
                    <p>If you didn't request a password reset, please ignore this email. Your password won't be changed.</p>
                    <p>&copy; 2025 Plinto. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        We received a request to reset your password. Visit the following link to create a new password:
        {reset_url}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request a password reset, please ignore this email. Your password won't be changed.
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content)
    
    @staticmethod
    async def send_magic_link_email(email: str, token: str, redirect_url: Optional[str] = None) -> bool:
        """Send magic link email for passwordless signin"""
        base_url = EmailService.get_base_url()
        magic_url = f"{base_url}/magic-link?token={token}"
        if redirect_url:
            magic_url += f"&redirect={redirect_url}"
        
        subject = "Sign in to Plinto"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #28a745; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Sign in to Plinto</h2>
                <p>Click the button below to sign in to your account:</p>
                <a href="{magic_url}" class="button">Sign In</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">{magic_url}</p>
                <p><strong>This link will expire in 15 minutes for security reasons.</strong></p>
                <div class="footer">
                    <p>If you didn't request this email, you can safely ignore it.</p>
                    <p>&copy; 2025 Plinto. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Sign in to Plinto
        
        Click the following link to sign in to your account:
        {magic_url}
        
        This link will expire in 15 minutes for security reasons.
        
        If you didn't request this email, you can safely ignore it.
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content)
    
    @staticmethod
    async def send_organization_invitation_email(
        email: str,
        organization_name: str,
        inviter_name: str,
        token: str
    ) -> bool:
        """Send organization invitation email"""
        base_url = EmailService.get_base_url()
        invite_url = f"{base_url}/accept-invitation?token={token}"
        
        subject = f"You've been invited to join {organization_name} on Plinto"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background-color: #17a2b8; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }}
                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>You're invited to {organization_name}!</h2>
                <p>{inviter_name} has invited you to join <strong>{organization_name}</strong> on Plinto.</p>
                <a href="{invite_url}" class="button">Accept Invitation</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">{invite_url}</p>
                <p>This invitation will expire in 7 days.</p>
                <div class="footer">
                    <p>If you don't want to join this organization, you can ignore this email.</p>
                    <p>&copy; 2025 Plinto. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        You're invited to {organization_name}!
        
        {inviter_name} has invited you to join {organization_name} on Plinto.
        
        Accept the invitation: {invite_url}
        
        This invitation will expire in 7 days.
        
        If you don't want to join this organization, you can ignore this email.
        """
        
        return await EmailService.send_email(email, subject, html_content, text_content)