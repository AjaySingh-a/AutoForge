# AutoForge 🚀

**Multi-Agent AI Development System - Your Complete AI-Powered Development Assistant**

AutoForge is a revolutionary full-stack AI development platform that automates the entire software development lifecycle. From planning to deployment, our multi-agent system works together to generate, review, fix, and deploy code automatically.

## 🎯 What is AutoForge?

AutoForge is an intelligent development assistant that uses multiple specialized AI agents to help developers build software faster and better. Think of it as having a team of expert developers working for you 24/7:

- **Planner Agent** breaks down complex tasks into actionable roadmaps
- **Developer Agent** generates production-ready code
- **Reviewer Agent** reviews code for bugs and quality issues
- **Fixer Agent** automatically fixes issues and optimizes code
- **DevOps Agent** handles deployment and CI/CD
- **Cline Agent** provides AI-powered code generation via CLI
- **CodeRabbit Agent** automates GitHub PR reviews

## 🏆 Hackathon Awards

This project fulfills multiple hackathon award requirements:

- ✅ **Infinity Build Award**: Cline CLI integration in `/core` directory
- ✅ **Captain Code Award**: Full CI/CD-based PR automation with CodeRabbit
- ✅ **Stormbreaker Award**: Complete full-stack AI development system

## 🌟 Key Features

### 1. **Multi-Agent Architecture**
Seven specialized AI agents working together:
- Each agent has specific capabilities (plan, develop, review, fix, deploy)
- Agents can work independently or collaborate on complex tasks
- Real-time status monitoring and task execution

### 2. **Intelligent Code Generation**
- Generate code from natural language requirements
- Support for multiple languages (TypeScript, JavaScript, Python, etc.)
- Framework-aware code generation (React, Express, Next.js)
- Automatic dependency detection and installation

### 3. **Automated Code Review**
- Real-time code quality analysis
- Security vulnerability detection
- Performance optimization suggestions
- Type safety improvements
- Best practices enforcement

### 4. **Smart Code Fixing**
- Automatic bug fixes
- Security issue resolution (password hashing, input validation)
- Error handling improvements
- Code refactoring and optimization
- Type safety enhancements

### 5. **GitHub Integration**
- Automated PR creation and management
- CodeRabbit integration for AI-powered reviews
- Automatic fix application via FixerAgent
- Webhook support for real-time updates

### 6. **Cline CLI Integration**
- AI-powered code generation via Cline CLI
- Task-based code modifications
- File-specific code changes
- Context-aware code generation

### 7. **Beautiful Web Dashboard**
- Real-time agent status monitoring
- Task execution interface
- Results visualization
- PR management dashboard
- Cline CLI integration panel

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dashboard  │  │  Cline Panel │  │ CodeRabbit   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)              │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Agent Service (Orchestrator)          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Planner  │ │Developer │ │ Reviewer │ │  Fixer   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │  DevOps  │ │  Cline   │ │CodeRabbit│                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Core Services (Cline & CodeRabbit)       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Workflow Example

1. **User submits a task**: "Create a user authentication API endpoint"
2. **Planner Agent** analyzes and creates a roadmap:
   - Step 1: Design API Structure
   - Step 2: Implement authentication logic
   - Step 3: Add error handling
3. **Developer Agent** generates the code:
   - Creates Express routes
   - Implements JWT authentication
   - Adds password hashing with bcrypt
4. **Reviewer Agent** reviews the code:
   - Checks for security issues
   - Validates code quality
   - Suggests improvements
5. **Fixer Agent** applies fixes automatically:
   - Fixes security issues
   - Adds error handling
   - Optimizes code structure
6. **Result**: Production-ready code delivered!

## 🛠️ How It Was Built

## Development Notes

Some parts of this project were developed with the assistance of the Cline CLI (AI-powered coding tool),
used for scaffolding, refactoring, and accelerating development.
All architecture decisions, validations, and final implementations were reviewed and controlled by the developer.


### Tech Stack

**Backend:**
- **Node.js** + **TypeScript** - Type-safe server-side development
- **Express.js** - RESTful API framework
- **Axios** - HTTP client for external APIs
- **Zod** - Runtime type validation

**Frontend:**
- **Next.js 14** - React framework with SSR
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - API communication

**DevOps & Deployment:**
- **Vercel** - Serverless deployment platform
- **GitHub Actions** - CI/CD automation
- **GitHub API** - PR management and automation

**Integrations:**
- **Cline CLI** - AI-powered code generation
- **CodeRabbit** - Automated PR reviews
- **GitHub** - Version control and PR management

### Development Process

1. **Planning Phase**
   - Designed multi-agent architecture
   - Defined agent capabilities and responsibilities
   - Planned integration points for Cline and CodeRabbit

2. **Backend Development**
   - Built base agent system with TypeScript
   - Implemented each agent with specific capabilities
   - Created RESTful API endpoints
   - Integrated Cline CLI service
   - Integrated CodeRabbit GitHub automation

3. **Frontend Development**
   - Built Next.js dashboard
   - Created agent monitoring interface
   - Implemented task execution modals
   - Added Cline and CodeRabbit panels
   - Styled with Tailwind CSS

4. **Integration & Testing**
   - Connected frontend with backend APIs
   - Tested agent workflows
   - Verified Cline CLI integration
   - Tested CodeRabbit automation
   - Fixed deployment issues on Vercel

5. **Deployment**
   - Deployed backend to Vercel (serverless functions)
   - Deployed frontend to Vercel
   - Configured environment variables
   - Set up CORS and API routing

### Key Implementation Details

**Agent System:**
- Base agent class with common functionality
- Each agent extends base class with specific capabilities
- Task queue system for managing concurrent tasks
- Status tracking (idle, active, error, completed)

**Code Generation:**
- Keyword-based requirement analysis
- Template-based code generation
- Context-aware code modifications
- Automatic dependency detection

**Code Review:**
- Pattern-based issue detection
- Security vulnerability scanning
- Code quality scoring
- Actionable suggestions

**Code Fixing:**
- Automatic issue resolution
- Security fixes (password hashing, input validation)
- Error handling improvements
- Code refactoring

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- (Optional) Cline CLI: `npm install -g cline`
- (Optional) GitHub token for CodeRabbit features

### Installation

```bash
# Clone the repository
git clone https://github.com/AjaySingh-a/AutoForge.git
cd AutoForge

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Development

```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

### Environment Variables

Create `backend/.env`:

```env
PORT=3001
NODE_ENV=development
GITHUB_TOKEN=your_github_token (optional)
GITHUB_OWNER=your_username (optional)
GITHUB_REPO=your_repo (optional)
FRONTEND_URL=http://localhost:3000
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Build

```bash
npm run build
```

## 📦 Project Structure

```
AutoForge/
├── backend/
│   ├── src/
│   │   ├── core/              # Core services
│   │   │   ├── Agent.ts       # Base agent class
│   │   │   ├── ClineService.ts # Cline CLI integration
│   │   │   └── coderabbit/    # CodeRabbit integration
│   │   ├── modules/
│   │   │   └── agents/        # All AI agents
│   │   │       ├── PlannerAgent.ts
│   │   │       ├── DeveloperAgent.ts
│   │   │       ├── ReviewerAgent.ts
│   │   │       ├── FixerAgent.ts
│   │   │       ├── DevOpsAgent.ts
│   │   │       ├── ClineAgent.ts
│   │   │       └── CodeRabbitAgent.ts
│   │   ├── services/
│   │   │   └── AgentService.ts # Agent orchestration
│   │   ├── routes/            # API endpoints
│   │   └── utils/             # Helper functions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   ├── components/       # React components
│   │   │   ├── AgentDashboard.tsx
│   │   │   ├── TaskExecutionModal.tsx
│   │   │   ├── ClinePanel.tsx
│   │   │   └── CodeRabbitPanel.tsx
│   │   └── utils/             # Utilities
│   └── package.json
└── README.md
```

## 🤖 Agents Explained

### 1. Planner Agent
**What it does:** Breaks down complex tasks into step-by-step roadmaps

**How it works:**
- Analyzes task requirements and context
- Identifies keywords (API, database, frontend, etc.)
- Generates ordered steps with dependencies
- Estimates time for each step

**Example:**
```
Input: "Build a full-stack e-commerce app"
Output: 
  - Step 1: Design API Structure
  - Step 2: Design Database Schema
  - Step 3: Build Frontend Components
  - Step 4: Integrate Payment Gateway
```

### 2. Developer Agent
**What it does:** Generates production-ready code from requirements

**How it works:**
- Analyzes requirement keywords
- Detects language and framework
- Generates appropriate code templates
- Adds dependencies automatically

**Example:**
```
Input: "Create authentication API with JWT"
Output: Complete Express.js routes with:
  - Signup endpoint with password hashing
  - Login endpoint with JWT generation
  - Proper error handling
  - TypeScript types
```

### 3. Reviewer Agent
**What it does:** Reviews code for quality, security, and best practices

**How it works:**
- Scans code for common issues
- Checks security vulnerabilities
- Validates code structure
- Provides quality score and suggestions

**Checks for:**
- Console.log usage
- Type safety (any types)
- Error handling
- Security issues
- Code formatting

### 4. Fixer/Refactor Agent
**What it does:** Automatically fixes code issues and optimizes code

**How it works:**
- Identifies issues from Reviewer Agent
- Applies automatic fixes
- Refactors code structure
- Improves type safety

**Fixes:**
- Replaces console.log with logger
- Fixes password comparison (bcrypt)
- Adds error handling (try-catch)
- Improves type safety (any → unknown)
- Adds input validation

### 5. DevOps Agent
**What it does:** Handles deployment and CI/CD automation

**Capabilities:**
- Build configuration
- Deployment automation
- Environment management
- CI/CD pipeline setup

### 6. Cline Agent
**What it does:** Integrates Cline CLI for AI-powered code generation

**How it works:**
- Executes Cline CLI commands
- Processes task descriptions
- Modifies specific files
- Provides context-aware code changes

### 7. CodeRabbit Agent
**What it does:** Automates GitHub PR reviews and fixes

**How it works:**
- Creates PRs automatically
- Triggers CodeRabbit reviews
- Fetches review comments
- Applies fixes via FixerAgent
- Posts fixes back to PR

## 🌐 Live Demo

- **Frontend:** https://auto-forge-frontend.vercel.app
- **Backend API:** https://auto-forge-backend.vercel.app

## 📝 Usage Examples

### Example 1: Planning a Feature

```json
{
  "type": "plan",
  "payload": {
    "objective": "Build a user authentication system",
    "context": "Need login, signup, and JWT tokens"
  }
}
```

**Result:** Detailed roadmap with steps and dependencies

### Example 2: Generating Code

```json
{
  "type": "develop",
  "payload": {
    "requirement": "Create authentication API endpoint",
    "language": "typescript",
    "framework": "express",
    "context": "Need JWT and password hashing"
  }
}
```

**Result:** Complete authentication API code

### Example 3: Reviewing Code

```json
{
  "type": "review",
  "payload": {
    "code": "function test() { console.log('test'); }",
    "language": "typescript"
  }
}
```

**Result:** Code quality score, issues, and suggestions

### Example 4: Fixing Code

```json
{
  "type": "fix",
  "payload": {
    "code": "if (user.password === password) { ... }",
    "issues": [
      {
        "type": "warning",
        "message": "Security issue: plain text password"
      }
    ],
    "language": "typescript"
  }
}
```

**Result:** Fixed code with bcrypt password comparison

## 🎓 Learning Outcomes

Building AutoForge taught us:

1. **Multi-Agent Systems:** How to design and orchestrate multiple AI agents
2. **Code Generation:** Techniques for generating production-ready code
3. **Code Analysis:** Pattern recognition for code quality and security
4. **Automated Fixing:** How to automatically resolve code issues
5. **API Integration:** Integrating external tools (Cline, CodeRabbit, GitHub)
6. **Full-Stack Development:** Building complete applications from scratch
7. **DevOps:** Deployment and CI/CD automation

## 🔮 Future Enhancements

- [ ] Database integration for task history
- [ ] Real-time collaboration features
- [ ] More language support
- [ ] Advanced AI model integration
- [ ] Custom agent creation
- [ ] Team management features
- [ ] Analytics and reporting

## 📄 License

MIT License - feel free to use this project for learning and development!

## 👨‍💻 Author

**Ajay Singh**

Built with ❤️ for the hackathon

---

**AutoForge** - Automating Development, One Agent at a Time 🚀
