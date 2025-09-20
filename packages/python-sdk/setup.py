"""Setup configuration for the Plinto Python SDK."""

from setuptools import setup, find_packages
import os

# Read the README file
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read version from __init__.py
version_file = os.path.join(os.path.dirname(__file__), "plinto", "__init__.py")
with open(version_file, "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("__version__"):
            version = line.split('"')[1]
            break

setup(
    name="plinto",
    version=version,
    author="Plinto Team",
    author_email="support@plinto.dev",
    description="Python SDK for Plinto Authentication Platform",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/plinto/python-sdk",
    project_urls={
        "Bug Tracker": "https://github.com/plinto/python-sdk/issues",
        "Documentation": "https://docs.plinto.dev/sdks/python",
        "Source": "https://github.com/plinto/python-sdk",
    },
    packages=find_packages(exclude=["tests", "tests.*", "examples", "examples.*"]),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Security",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
        "Typing :: Typed",
    ],
    python_requires=">=3.8",
    install_requires=[
        "httpx>=0.25.0",
        "pydantic>=2.0.0",
        "pyjwt>=2.8.0",
        "cryptography>=41.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.5.0",
            "isort>=5.12.0",
            "pre-commit>=3.3.0",
        ],
        "async": [
            "httpx[http2]>=0.25.0",
        ],
    },
    keywords=[
        "plinto",
        "authentication",
        "auth",
        "user-management",
        "identity",
        "sso",
        "oauth",
        "saml",
        "mfa",
        "2fa",
        "passkeys",
        "webauthn",
        "security",
        "sdk",
        "api",
    ],
    zip_safe=False,
    include_package_data=True,
    package_data={
        "plinto": ["py.typed"],
    },
)