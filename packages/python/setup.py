"""
Plinto Python SDK Setup
Enterprise authentication and identity management SDK
"""

from setuptools import setup, find_packages
import os

# Read README for long description
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements
with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="plinto-python",
    version="1.0.0",
    author="Plinto Team",
    author_email="sdk@plinto.dev",
    description="Enterprise authentication and identity management SDK for Python",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/plinto/plinto-python",
    project_urls={
        "Documentation": "https://docs.plinto.dev/sdks/python",
        "Source": "https://github.com/plinto/plinto-python",
        "Tracker": "https://github.com/plinto/plinto-python/issues",
    },
    packages=find_packages(exclude=["tests", "tests.*", "examples", "examples.*"]),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Systems Administration :: Authentication/Directory",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
            "pylint>=2.17.0",
            "sphinx>=6.0.0",
            "sphinx-rtd-theme>=1.3.0",
        ],
        "async": [
            "aiohttp>=3.8.0",
            "httpx>=0.24.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "plinto=plinto.cli:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords="authentication identity sso oauth jwt mfa passkeys webauthn saml oidc",
)