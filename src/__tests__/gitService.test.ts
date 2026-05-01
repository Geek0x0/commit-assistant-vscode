jest.mock('child_process', () => ({
  execFile: jest.fn()
}));

jest.mock('../config/settings', () => ({
  getSettings: () => ({ maxDiffChars: 16000 })
}));

jest.mock('../log', () => ({
  logWarn: jest.fn(),
  logInfo: jest.fn()
}));

jest.mock('../i18n', () => ({
  t: () => ({
    messages: {
      noWorkspace: 'No workspace folder is opened.',
      notGitRepo: 'Current workspace is not a git repository.',
      prompts: { selectRepository: 'Select a repository' }
    }
  })
}));

import * as vscode from 'vscode';

const mockExecFile = jest.requireMock('child_process').execFile;

function setupWorkspaceFolders(folders: { name: string; path: string }[] | undefined) {
  (vscode as unknown as Record<string, unknown>).workspace = {
    ...vscode.workspace,
    workspaceFolders: folders
      ? folders.map((f) => ({
          name: f.name,
          uri: { fsPath: f.path }
        }))
      : undefined
  };
}

describe('getWorkspaceRepoPath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupWorkspaceFolders(undefined);
  });

  test('throws when no workspace is opened', async () => {
    setupWorkspaceFolders(undefined);
    const { getWorkspaceRepoPath } = await import('../core/gitService');
    await expect(getWorkspaceRepoPath()).rejects.toThrow('No workspace folder is opened');
  });

  test('throws when single folder is not a git repo', async () => {
    setupWorkspaceFolders([{ name: 'test', path: '/tmp/notgit' }]);
    mockExecFile.mockImplementation((_cmd: string, _args: string[], _opts: object, cb: Function) => {
      cb(new Error('not a git repo'));
    });
    const { getWorkspaceRepoPath } = await import('../core/gitService');
    await expect(getWorkspaceRepoPath()).rejects.toThrow('not a git repository');
  });

  test('returns single folder when it is a git repo', async () => {
    setupWorkspaceFolders([{ name: 'test', path: '/tmp/myrepo' }]);
    mockExecFile.mockImplementation((_cmd: string, _args: string[], _opts: object, cb: Function) => {
      cb(null, { stdout: 'true\n' });
    });
    const { getWorkspaceRepoPath } = await import('../core/gitService');
    const result = await getWorkspaceRepoPath();
    expect(result).toBe('/tmp/myrepo');
  });
});

describe('writeToScmInputBox', () => {
  test('returns false when git extension is not available', async () => {
    const { writeToScmInputBox } = await import('../core/gitService');
    expect(await writeToScmInputBox('test message')).toBe(false);
  });
});
