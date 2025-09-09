# Translate Novels

A modern web application for translating novels using AI-powered translation services. This Next.js application provides a comprehensive platform for managing novels, chapters, and automated translation workflows with LM Studio integration.

## 🚀 Features

- **Novel Management**: Create, organize, and manage your novel collections
- **Chapter Organization**: Structure your novels into organized chapters with proper ordering
- **AI Translation**: Integrate with LM Studio for automated translation services
- **Text Parsing**: Advanced text parsing capabilities for processing raw content
- **Progress Tracking**: Monitor translation progress across your novel collection
- **Modern UI**: Clean, responsive interface built with Ant Design components
- **Database Integration**: SQLite database with Prisma ORM for reliable data management

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: Ant Design v5
- **Database**: SQLite with Prisma ORM
- **HTTP Client**: Axios
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **pnpm** package manager
- **LM Studio** (for AI translation functionality)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd translate-novels
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:dev

# (Optional) Open Prisma Studio to view database
pnpm prisma:studio
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### LM Studio Setup

1. Install and configure LM Studio on your system
2. Start LM Studio server with your preferred language model
3. Configure the API endpoint in the application settings
4. Test the connection before starting translations

### Environment Variables

Create a `.env` file in the root directory (if needed):

```env
# Add any environment variables here
```

## 📖 Usage Guide

### Managing Novels

1. **Create Novel**: Add new novels to your collection
2. **Import Chapters**: Parse and import chapter content
3. **Organize Content**: Arrange chapters in proper order

### Translation Workflow

1. **Configure LM Studio**: Set up your translation API endpoint
2. **Select Chapters**: Choose chapters for translation
3. **Custom Prompts**: Use custom translation prompts for better results
4. **Batch Processing**: Translate multiple chapters efficiently
5. **Review Results**: Check and edit translated content

### Text Parsing

- Use the built-in text parser for processing raw novel content
- Automatically split content into manageable chapters
- Clean and format text for better translation results

## 🗄️ Database Schema

The application uses the following main models:

- **Novel**: Stores novel information and metadata
- **Chapter**: Individual chapters with raw and translated content
- **APILMStudio**: LM Studio API configuration

## 🎯 Available Scripts

```bash
# Development
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm start              # Start production server

# Code Quality
pnpm lint               # Run ESLint
pnpm format             # Format code with Prettier

# Database
pnpm prisma:dev         # Run database migrations
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:studio      # Open Prisma Studio
pnpm prisma:reset       # Reset database
```

## 🔍 API Endpoints

- `GET/POST /api/novels` - Novel management
- `GET/POST /api/chapters` - Chapter operations
- `POST /api/translate` - Translation services
- `POST /api/parse-chapters` - Text parsing
- `GET/POST /api/lmstudio` - LM Studio configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use Prettier for code formatting
- Maintain consistent naming conventions
- Add proper type definitions

### Database Changes

- Always create migrations for schema changes
- Test migrations in development environment
- Update Prisma client after schema modifications

### Translation Features

- Test with multiple language pairs
- Handle API failures gracefully
- Implement proper error logging
- Validate translation quality

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure SQLite database file permissions
2. **LM Studio**: Verify API endpoint and model availability
3. **Dependencies**: Run `pnpm install` if packages are missing
4. **Prisma**: Regenerate client after schema changes

### Debug Mode

Enable detailed logging by setting appropriate environment variables or checking browser console for client-side issues.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Ant Design for the beautiful UI components
- Prisma for the robust database toolkit
- LM Studio for AI translation capabilities
