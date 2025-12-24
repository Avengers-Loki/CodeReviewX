<div align="center">

# 🚀 CodeWiki

### Transform GitHub Repositories into Interactive AI-Powered Documentation

[![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

[Live Demo](https://your-demo-url.vercel.app) • [Documentation](#-features) • [Installation](#-installation) • [Contributing](#-contributing)

---

![CodeWiki Banner](./docs/images/codewiki_banner.png)

</div>

---

## 📖 About

**CodeWiki** is an intelligent code analysis platform that transforms any GitHub repository into comprehensive, interactive documentation. Powered by Google's Gemini AI, it provides instant code understanding, architectural insights, and intelligent Q&A capabilities.

Whether you're onboarding to a new codebase, conducting code reviews, or documenting your projects, CodeWiki accelerates your workflow with AI-driven insights.

---

## ✨ Features

![Features Showcase](./docs/images/features_showcase.png)

### 🔍 **Instant Repository Analysis**
- Paste any public GitHub repository URL
- Automatic codebase structure analysis
- File explorer with intelligent highlighting
- Syntax-highlighted code viewer

### 🤖 **AI-Powered Code Assistant**
- Ask questions about any part of the codebase
- Get detailed explanations of complex logic
- Receive architectural recommendations
- Context-aware responses with code citations

### 📚 **Auto-Generated Documentation**
- Automatic README.md generation
- Interactive architecture diagrams (Mermaid.js)
- Function and class documentation
- Dependency analysis

### 🔐 **User Authentication**
- Secure Google OAuth integration
- JWT-based session management
- Guest mode with limited free analysis
- MongoDB-backed user profiles

### 🎨 **Modern UI/UX**
- Clean, professional interface
- Responsive design (mobile-friendly)
- Dark/light mode support
- Smooth animations with Framer Motion

---

## 🏗️ Architecture

![Architecture Diagram](./docs/images/architecture_diagram.png)

CodeWiki follows a modern, scalable architecture:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   GitHub    │ ───▶ │   Next.js    │ ───▶ │  Google AI  │
│ Repository  │      │   Frontend   │      │   (Gemini)  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            │
                            ▼
                     ┌──────────────┐
                     │   MongoDB    │
                     │   Database   │
                     └──────────────┘
```

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, React 18 |
| **Styling** | Vanilla CSS (CSS Variables), Framer Motion |
| **Backend** | Next.js API Routes, MongoDB, Mongoose |
| **Authentication** | JWT, bcryptjs, Google OAuth |
| **AI/ML** | Google Generative AI (Gemini) |
| **Diagrams** | Mermaid.js |
| **Icons** | Lucide React |
| **Deployment** | Vercel, MongoDB Atlas |

---

## 🖼️ Screenshots

### Main Interface
![Interface Preview](./docs/images/interface_preview.png)

*Code analysis interface with file explorer, code viewer, and AI assistant*

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (Atlas or local instance)
- **Google AI API Key** - [Get one here](https://ai.google.dev/)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Avengers-Loki/Code-Analyzer.git
   cd Code-Analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codewiki
   
   # Google AI
   GOOGLE_AI_API_KEY=your_gemini_api_key_here
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
Code-Analyzer/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── analyze/          # Repository analysis endpoint
│   │   ├── auth/             # Authentication endpoints
│   │   ├── chat/             # AI chat endpoint
│   │   └── github/           # GitHub API integration
│   ├── analyze/              # Analysis page
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
│
├── components/               # React components
│   ├── Navbar.tsx            # Navigation bar
│   └── Mermaid.tsx           # Mermaid diagram renderer
│
├── lib/                      # Utility libraries
│   └── mongodb.ts            # MongoDB connection
│
├── models/                   # Database models
│   └── User.ts               # User schema
│
├── public/                   # Static assets
│
├── .env.local                # Environment variables (not committed)
├── .env.local.example        # Environment template
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## 🔧 Configuration

### MongoDB Setup

1. Create a free MongoDB Atlas cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a database named `codewiki`
3. Add your connection string to `.env.local`

### Google AI Setup

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create a new API key
3. Add it to `.env.local` as `GOOGLE_AI_API_KEY`

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add credentials to `.env.local`

---

## 🎯 Usage

### Analyzing a Repository

1. **Navigate to the home page**
2. **Enter a GitHub repository URL**
   - Example: `https://github.com/facebook/react`
   - Or just: `facebook/react`
3. **Click "Analyze"**
4. **Explore the results:**
   - Browse file structure in the explorer
   - View code with syntax highlighting
   - Ask questions to the AI assistant
   - View generated documentation

### Using the AI Assistant

- Click on any file to view its contents
- Type questions in the AI chat panel
- Get instant explanations and insights
- Ask for refactoring suggestions or bug detection

---

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### Code Style

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** (recommended) for code formatting

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy!

### Environment Variables

Make sure to add these environment variables in Vercel:
- `MONGODB_URI`
- `GOOGLE_AI_API_KEY`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID` (if using OAuth)
- `GOOGLE_CLIENT_SECRET` (if using OAuth)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Write clean, maintainable TypeScript code
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 API Reference

### Analyze Repository
```typescript
POST /api/analyze
Body: { repoUrl: string }
Response: { files: FileTree[], readme: string }
```

### AI Chat
```typescript
POST /api/chat
Body: { message: string, context: string }
Response: { response: string }
```

### Authentication
```typescript
POST /api/auth/signup
Body: { email: string, password: string, name: string }

POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }
```

---

## 🔐 Security

- All passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- Environment variables for sensitive data
- HTTPS enforced in production
- MongoDB connection encrypted

---

## 📊 Features Roadmap

- [x] GitHub repository analysis
- [x] AI-powered code chat
- [x] User authentication
- [x] Free guest mode
- [ ] Private repository support
- [ ] Code complexity metrics
- [ ] Multi-language support
- [ ] Export documentation as PDF
- [ ] Team collaboration features
- [ ] VS Code extension
- [ ] API rate limiting
- [ ] Analytics dashboard

---

## 🐛 Known Issues

- Large repositories (>1000 files) may take longer to analyze
- Some syntax highlighting edge cases with uncommon languages
- Guest mode limited to 1 free analysis

See the [issues page](https://github.com/Avengers-Loki/Code-Analyzer/issues) for a full list.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Vinayagamoorthi**

- GitHub: [@Avengers-Loki](https://github.com/Avengers-Loki)
- Project: [Code-Analyzer](https://github.com/Avengers-Loki/Code-Analyzer)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Google AI](https://ai.google.dev/) - Gemini AI model
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Hosting platform
- [Lucide](https://lucide.dev/) - Beautiful icons

---

## 📞 Support

If you have any questions or need help:

- 📧 Email: your-email@example.com
- 💬 [Open an issue](https://github.com/Avengers-Loki/Code-Analyzer/issues)
- 📖 [Read the docs](#-features)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

Made with ❤️ and ☕ by Vinayagamoorthi

</div>
