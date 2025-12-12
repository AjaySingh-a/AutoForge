import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface ClineCommand {
  command: string;
  workingDirectory?: string;
  timeout?: number;
}

export interface ClineResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
}

export interface ClineTask {
  task: string;
  files?: string[];
  context?: string;
}

export class ClineService {
  private clinePath: string;
  private isAvailable: boolean | null = null;

  constructor() {
    // Try to find Cline CLI in PATH or use 'cline' as default
    this.clinePath = process.env.CLINE_PATH || 'cline';
    // Call checkAvailability but handle errors to prevent crashes
    this.checkAvailability().catch((error) => {
      logger.warn('Error checking Cline availability:', error);
      this.isAvailable = false;
    });
  }

  /**
   * Check if Cline CLI is available in the system
   */
  private async checkAvailability(): Promise<void> {
    try {
      await execAsync(`${this.clinePath} --version`, { timeout: 5000 });
      this.isAvailable = true;
      logger.info('Cline CLI is available');
    } catch (error) {
      this.isAvailable = false;
      logger.warn('Cline CLI is not available. Install with: npm install -g cline');
    }
  }

  /**
   * Check if Cline CLI is installed and available
   */
  async isClineAvailable(): Promise<boolean> {
    if (this.isAvailable === null) {
      await this.checkAvailability();
    }
    return this.isAvailable || false;
  }

  /**
   * Execute a Cline CLI command
   */
  async executeCommand(command: ClineCommand): Promise<ClineResult> {
    const isAvailable = await this.isClineAvailable();
    if (!isAvailable) {
      return {
        success: false,
        output: '',
        error: 'Cline CLI is not installed. Please install it with: npm install -g cline',
        exitCode: 1,
      };
    }

    const workingDir = command.workingDirectory || process.cwd();
    const timeout = command.timeout || 300000; // 5 minutes default

    try {
      logger.info(`Executing Cline command: ${command.command}`);
      logger.info(`Working directory: ${workingDir}`);

      const { stdout, stderr } = await execAsync(
        `${this.clinePath} ${command.command}`,
        {
          cwd: workingDir,
          timeout,
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        }
      );

      return {
        success: true,
        output: stdout,
        error: stderr || undefined,
        exitCode: 0,
      };
    } catch (error: unknown) {
      const execError = error as { code?: number; signal?: string; stdout?: string; stderr?: string };
      logger.error(`Cline command failed: ${execError.stderr || error}`);

      return {
        success: false,
        output: execError.stdout || '',
        error: execError.stderr || (error instanceof Error ? error.message : 'Unknown error'),
        exitCode: execError.code || 1,
      };
    }
  }

  /**
   * Execute a task using Cline CLI
   * This is the main method for interacting with Cline
   */
  async executeTask(task: ClineTask, workingDirectory?: string): Promise<ClineResult> {
    const isAvailable = await this.isClineAvailable();
    if (!isAvailable) {
      return {
        success: false,
        output: '',
        error: 'Cline CLI is not installed. Please install it with: npm install -g cline',
        exitCode: 1,
      };
    }

    // Build the Cline command
    let command = `"${task.task}"`;

    // Add file context if provided
    if (task.files && task.files.length > 0) {
      command += ` --files ${task.files.join(',')}`;
    }

    // Add context if provided
    if (task.context) {
      command += ` --context "${task.context}"`;
    }

    return this.executeCommand({
      command,
      workingDirectory,
      timeout: 300000, // 5 minutes for AI tasks
    });
  }

  /**
   * Execute Cline in interactive mode (streaming output)
   */
  async executeInteractive(
    task: ClineTask,
    onOutput?: (data: string) => void,
    onError?: (data: string) => void,
    workingDirectory?: string
  ): Promise<ClineResult> {
    const isAvailable = await this.isClineAvailable();
    if (!isAvailable) {
      return {
        success: false,
        output: '',
        error: 'Cline CLI is not installed. Please install it with: npm install -g cline',
        exitCode: 1,
      };
    }

    return new Promise((resolve) => {
      const workingDir = workingDirectory || process.cwd();
      let output = '';
      let errorOutput = '';

      // Build the Cline command
      let command = `"${task.task}"`;
      if (task.files && task.files.length > 0) {
        command += ` --files ${task.files.join(',')}`;
      }
      if (task.context) {
        command += ` --context "${task.context}"`;
      }

      const clineProcess = spawn(this.clinePath, [command], {
        cwd: workingDir,
        shell: true,
      });

      clineProcess.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        if (onOutput) {
          onOutput(text);
        }
      });

      clineProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        if (onError) {
          onError(text);
        }
      });

      clineProcess.on('close', (code) => {
        resolve({
          success: code === 0,
          output,
          error: errorOutput || undefined,
          exitCode: code || undefined,
        });
      });

      clineProcess.on('error', (err) => {
        resolve({
          success: false,
          output,
          error: err.message,
          exitCode: 1,
        });
      });
    });
  }

  /**
   * Get Cline version information
   */
  async getVersion(): Promise<string | null> {
    try {
      const result = await this.executeCommand({ command: '--version' });
      if (result.success) {
        return result.output.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check Cline authentication status
   */
  async checkAuth(): Promise<boolean> {
    try {
      // Try to run a simple command to check auth
      const result = await this.executeCommand({ command: '--help', timeout: 5000 });
      return result.success;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let clineServiceInstance: ClineService | null = null;

export const getClineService = (): ClineService => {
  if (!clineServiceInstance) {
    clineServiceInstance = new ClineService();
  }
  return clineServiceInstance;
};

