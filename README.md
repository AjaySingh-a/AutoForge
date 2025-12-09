# AutoForge

**Multi-Agent AI Development System**

A full-stack AI-powered developer assistant that can generate, refactor, optimize, and deploy code. Features multi-agent architecture with integrated GitHub CodeRabbit for PR reviews and a web dashboard deployed on Vercel.

## 🏆 Hackathon Awards

- **Infinity Build Award**: Cline CLI integration in `/core`
- **Captain Code Award**: CodeRabbit GitHub PR automation
- **Stormbreaker Award**: Full-stack AI development system

## 🏗️ Architecture

```
/src
  /modules      # Feature modules
  /services     # Business logic
  /routes       # API endpoints
  /core         # Core logic & CLI integration
  /db           # Database schemas and queries
  /utils        # Helper functions
  /ui           # Frontend components and pages
  /tests        # Unit & integration tests
  /scripts      # Automation scripts
  /docs         # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
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

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## 📦 Project Structure

- `backend/` - Node.js + TypeScript API server
- `frontend/` - Next.js + React dashboard
- `backend/src/core/` - Cline CLI integration
- `backend/src/scripts/` - CodeRabbit automation

## 🔧 Tech Stack

**Backend:**
- Node.js
- TypeScript
- Express
- Prisma (database)

**Frontend:**
- Next.js 14
- React
- TypeScript
- Tailwind CSS

**DevOps:**
- Vercel (deployment)
- GitHub Actions (CI/CD)

## 🤖 Agents

1. **Planner Agent** - Task breakdown and roadmap generation
2. **Developer Agent** - Code generation and implementation
3. **Reviewer Agent** - Code review and quality checks
4. **Fixer/Refactor Agent** - Optimization and bug fixes
5. **DevOps Agent** - Deployment and CI/CD automation

## 📝 License

MIT

