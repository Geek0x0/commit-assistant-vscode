import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { getSettings } from '../config/settings';
import type { GitContext } from '../types';

const execFileAsync = promisify(execFile);

function throwIfCancelled(token?: vscode.CancellationToken): void {
  if (token?.isCancellationRequested) {
    throw new vscode.CancellationError();
  }
}

async function runGit(repoPath: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: repoPath,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });
    return stdout.trim();
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err?.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
      throw new Error('Git output is too large. Reduce changed files or lower commitAssistant.maxDiffChars.');
    }
    throw error;
  }
}

function getWorkspaceRepoPath(): string {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    throw new Error('No workspace folder is opened.');
  }
  return folder.uri.fsPath;
}

async function ensureGitRepo(repoPath: string): Promise<void> {
  try {
    await runGit(repoPath, ['rev-parse', '--is-inside-work-tree']);
  } catch {
    throw new Error('Current workspace is not a git repository.');
  }
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }
  return `${value.slice(0, maxChars)}\n... [truncated]`;
}

async function summarizeUntracked(
  repoPath: string,
  files: string[],
  maxChars: number,
  token?: vscode.CancellationToken
): Promise<string> {
  if (files.length === 0) {
    return '';
  }

  const chunks: string[] = [];
  const maxFileSize = 100 * 1024;
  for (const file of files.slice(0, 10)) {
    throwIfCancelled(token);
    const absolutePath = path.join(repoPath, file);
    try {
      const stat = await fs.stat(absolutePath);
      if (!stat.isFile()) {
        continue;
      }
      if (stat.size > maxFileSize) {
        chunks.push(`File: ${file}\n[Skipped: file too large (${stat.size} bytes)]`);
        continue;
      }
      const content = await fs.readFile(absolutePath, 'utf8');
      const sample = content.slice(0, 800);
      chunks.push(`File: ${file}\n${sample}`);
    } catch (error) {
      console.warn('Failed to read untracked file for summary:', file, error);
      chunks.push(`File: ${file}\n[Unable to read content]`);
    }
  }

  return truncate(chunks.join('\n\n'), maxChars);
}

async function getRelatedHistory(
  repoPath: string,
  changedFiles: string[],
  token?: vscode.CancellationToken
): Promise<string> {
  if (changedFiles.length === 0) {
    return '';
  }

  try {
    throwIfCancelled(token);
    const fileLimited = changedFiles.slice(0, 15);
    const history = await runGit(repoPath, [
      'log',
      '--max-count=20',
      '--pretty=format:%h %ad %s',
      '--date=short',
      '--',
      ...fileLimited
    ]);
    return history;
  } catch (error) {
    console.warn('Failed to retrieve related git history:', error);
    return '';
  }
}

export async function collectGitContext(token?: vscode.CancellationToken): Promise<GitContext> {
  const repoPath = getWorkspaceRepoPath();
  throwIfCancelled(token);
  await ensureGitRepo(repoPath);

  const { maxDiffChars } = getSettings();

  throwIfCancelled(token);
  const stagedDiff = truncate(await runGit(repoPath, ['diff', '--cached', '--no-color', '--']), maxDiffChars);
  throwIfCancelled(token);
  const unstagedDiff = truncate(await runGit(repoPath, ['diff', '--no-color', '--']), maxDiffChars);

  throwIfCancelled(token);
  const stagedFiles = await runGit(repoPath, ['diff', '--cached', '--name-only']);
  throwIfCancelled(token);
  const unstagedFiles = await runGit(repoPath, ['diff', '--name-only']);
  throwIfCancelled(token);
  const untrackedFilesRaw = await runGit(repoPath, ['ls-files', '--others', '--exclude-standard']);

  const untrackedFiles = untrackedFilesRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const changedFiles = Array.from(
    new Set(
      [...stagedFiles.split('\n'), ...unstagedFiles.split('\n'), ...untrackedFiles]
        .map((line) => line.trim())
        .filter(Boolean)
    )
  );

  if (!stagedDiff && !unstagedDiff && changedFiles.length === 0) {
    throw new Error('No changes detected.');
  }

  const untrackedSummary = await summarizeUntracked(repoPath, untrackedFiles, Math.floor(maxDiffChars / 2), token);
  const relatedHistory = truncate(
    await getRelatedHistory(repoPath, changedFiles, token),
    Math.floor(maxDiffChars / 2)
  );

  return {
    repoPath,
    stagedDiff,
    unstagedDiff,
    untrackedSummary,
    changedFiles,
    relatedHistory
  };
}

export async function writeToScmInputBox(message: string): Promise<boolean> {
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (!gitExtension) {
    return false;
  }

  const extension = gitExtension.isActive ? gitExtension : await gitExtension.activate();
  const git = extension.exports?.getAPI?.(1);
  const repositories = git?.repositories;

  if (!Array.isArray(repositories) || repositories.length === 0) {
    return false;
  }

  repositories[0].inputBox.value = message;
  return true;
}
