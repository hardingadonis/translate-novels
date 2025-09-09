# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-09

### Added

- **Novel Management System**
  - Create, view, and manage novel collections
  - Support for adding multiple novels with titles
  - Novel listing and selection interface

- **Chapter Management**
  - Upload and organize chapters for each novel
  - Chapter ordering system with automatic sequencing
  - Support for raw content input
  - Chapter listing and navigation

- **Translation Features**
  - Integration with LM Studio for AI-powered translation
  - Vietnamese translation support
  - Translation status tracking
  - Batch translation capabilities

- **LM Studio Integration**
  - Configurable API endpoints for LM Studio
  - Multiple endpoint management
  - Connection testing and validation
  - API endpoint CRUD operations

- **Dashboard and Analytics**
  - Statistics dashboard showing total novels and chapters
  - Translation progress tracking
  - Translated vs untranslated chapter counts
  - Recent activity overview

- **Database Layer**
  - SQLite database with Prisma ORM
  - Database migrations for schema management
  - Data persistence for novels, chapters, and translations
  - API endpoint storage

- **Web Interface**
  - Modern React/Next.js frontend with Ant Design
  - Responsive design for desktop and mobile
  - Intuitive navigation between sections
  - User-friendly forms and interfaces

- **Docker Support**
  - Complete Docker containerization
  - Docker Compose configuration
  - GitHub Container Registry (GHCR) images
  - Volume persistence for data

- **Text Processing**
  - Chapter content parsing and formatting
  - Text cleaning and preparation for translation
  - Content validation and error handling

- **API Endpoints**
  - RESTful API for novels management (`/api/novels`)
  - Chapter operations API (`/api/chapters`)
  - Translation processing API (`/api/translate`)
  - LM Studio configuration API (`/api/lmstudio`)
  - Chapter parsing utilities (`/api/parse-chapters`)

- **Development Tools**
  - TypeScript configuration and strict typing
  - ESLint for code quality
  - Prettier for code formatting
  - Prisma CLI integration scripts

### Security

- Input validation for all user-submitted content
- Database query parameterization to prevent SQL injection
- API endpoint validation and error handling

[1.0.0]: https://github.com/hardingadonis/translate-novels/releases/tag/v1.0.0
