import { BaseAgent, AgentTask } from '../../core/Agent';
import { logger } from '../../utils/logger';

export interface DevelopmentTask {
  requirement: string;
  language?: string;
  framework?: string;
  context?: string;
  files?: string[];
}

export interface DevelopmentResult {
  files: GeneratedFile[];
  summary: string;
  dependencies?: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export class DeveloperAgent extends BaseAgent {
  constructor() {
    super(
      'developer-001',
      'Developer Agent',
      'developer',
      'Generates clean, production-ready, type-safe code following best practices',
      {
        canPlan: false,
        canDevelop: true,
        canReview: false,
        canFix: false,
        canDeploy: false,
      }
    );
  }

  async execute(task: AgentTask): Promise<AgentTask> {
    this.setStatus('active');
    logger.info(`Developer Agent executing task: ${task.id}`);

    try {
      const devTask = task.payload as DevelopmentTask;
      const result = await this.develop(devTask);

      this.setStatus('idle');
      return {
        ...task,
        status: 'completed',
        result,
      };
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Developer Agent error: ${errorMessage}`);
      
      return {
        ...task,
        status: 'failed',
        error: errorMessage,
      };
    }
  }

  private async develop(task: DevelopmentTask): Promise<DevelopmentResult> {
    // Simulate development process
    await this.delay(1500);

    const language = task.language || 'typescript';
    const framework = task.framework || 'none';

    // Generate code based on requirement
    const files = this.generateCode(task.requirement, language, framework);
    const summary = this.generateSummary(task.requirement, files);
    const dependencies = this.identifyDependencies(language, framework);

    return {
      files,
      summary,
      dependencies,
    };
  }

  private generateCode(
    requirement: string,
    language: string,
    framework: string
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Determine file structure based on requirement
    if (requirement.toLowerCase().includes('api') || requirement.toLowerCase().includes('endpoint')) {
      files.push({
        path: `src/routes/api.ts`,
        content: this.generateAPICode(language, framework),
        language,
      });
    }

    if (requirement.toLowerCase().includes('component') || requirement.toLowerCase().includes('ui')) {
      files.push({
        path: `src/components/Component.tsx`,
        content: this.generateComponentCode(framework),
        language: 'tsx',
      });
    }

    if (requirement.toLowerCase().includes('service') || requirement.toLowerCase().includes('logic')) {
      files.push({
        path: `src/services/Service.ts`,
        content: this.generateServiceCode(language),
        language,
      });
    }

    // Default: generate a basic module
    if (files.length === 0) {
      files.push({
        path: `src/modules/Module.ts`,
        content: this.generateModuleCode(language),
        language,
      });
    }

    return files;
  }

  private generateAPICode(language: string, framework: string): string {
    if (language === 'typescript' && framework === 'express') {
      return `import express, { Request, Response } from 'express';

export const router = express.Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
`;
    }
    return `// API implementation for ${language} with ${framework}`;
  }

  private generateComponentCode(framework: string): string {
    if (framework === 'react' || framework === 'next') {
      return `import React from 'react';

interface ComponentProps {
  // Add props here
}

export const Component: React.FC<ComponentProps> = () => {
  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};

export default Component;
`;
    }
    return `// Component implementation for ${framework}`;
  }

  private generateServiceCode(language: string): string {
    if (language === 'typescript') {
      return `export class Service {
  // Service implementation
}

export default Service;
`;
    }
    return `// Service implementation for ${language}`;
  }

  private generateModuleCode(language: string): string {
    if (language === 'typescript') {
      return `export class Module {
  // Module implementation
}

export default Module;
`;
    }
    return `// Module implementation for ${language}`;
  }

  private generateSummary(requirement: string, files: GeneratedFile[]): string {
    return `Generated ${files.length} file(s) for: ${requirement}`;
  }

  private identifyDependencies(language: string, framework: string): string[] {
    const deps: string[] = [];
    
    if (language === 'typescript') {
      deps.push('typescript');
    }
    
    if (framework === 'express') {
      deps.push('express', '@types/express');
    }
    
    if (framework === 'react' || framework === 'next') {
      deps.push('react', 'react-dom');
    }

    return deps;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

