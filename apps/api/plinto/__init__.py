"""
Plinto Package - Public API Interface

This module provides the public API interface for the Plinto package,
making it available for external consumption via pip install.
"""

# Re-export everything from the internal app module
from app import *

# Ensure version is available at package level
from app import __version__

# Package-level metadata
__package_name__ = "plinto"
__description__ = "Enterprise-grade authentication and user management platform"