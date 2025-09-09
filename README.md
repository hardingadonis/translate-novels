# Translate Novels

> 📚 A simple website for translating novels via LM Studio

## � Quick Start with Docker

The easiest way to run Translate Novels is using Docker. Pre-built images are available on GitHub Container Registry (GHCR).

### Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (optional, for easier management)
- **LM Studio** (running on your host machine for AI translation functionality)

### 🚀 Running with Docker

#### Option 1: Docker Run (Simple)

```bash
# Pull and run the latest version
docker run -d \
  --name translate-novels \
  -p 3000:3000 \
  -v translate-novels-data:/app/prisma \
  ghcr.io/hardingadonis/translate-novels:latest
```

#### Option 2: Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  translate-novels:
    image: ghcr.io/hardingadonis/translate-novels:latest
    container_name: translate-novels
    ports:
      - '3000:3000'
    volumes:
      - translate-novels-data:/app/prisma
    restart: unless-stopped

volumes:
  translate-novels-data:
```

Then run:

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 📱 Accessing the Application

Once running, the application will be available at:

- **Web Interface**: [http://localhost:3000](http://localhost:3000)

### 🔧 Configuration

#### LM Studio Integration

Since LM Studio runs on your host machine, you'll need to configure the connection:

1. **Start LM Studio** on your host machine
2. **Enable API Server** in LM Studio (usually on `http://localhost:1234`)
3. **Configure in App**:
   - Access the web interface at `http://localhost:3000`
   - Navigate to LM Studio settings
   - Set API endpoint to `http://host.docker.internal:1234` (Windows/Mac) or `http://172.17.0.1:1234` (Linux)

### 📋 Changelog

For a detailed list of changes and version history, see [CHANGELOG.md](CHANGELOG.md).

### 📄 License

This project is licensed under the MIT License.

### 🤝 Contributing

Contributions are welcome! Please visit the [GitHub repository](https://github.com/hardingadonis/translate-novels) for more information on how to contribute.

### 🙏 Acknowledgments

- Docker community for containerization best practices
- GitHub Container Registry for reliable image hosting
- Next.js and React teams for the excellent framework
- LM Studio for AI translation capabilities
