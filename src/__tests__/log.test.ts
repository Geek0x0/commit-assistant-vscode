import { getOutputChannel, logWarn, logInfo, disposeOutputChannel } from '../log';

jest.mock('vscode', () => {
  const mockChannel = {
    appendLine: jest.fn(),
    dispose: jest.fn()
  };
  return {
    window: {
      createOutputChannel: jest.fn(() => mockChannel)
    }
  };
});

const mockVscode = jest.requireMock('vscode');

describe('log', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    disposeOutputChannel();
  });

  describe('getOutputChannel', () => {
    test('creates channel on first call', () => {
      getOutputChannel();
      expect(mockVscode.window.createOutputChannel).toHaveBeenCalledWith('Commit Assistant');
    });

    test('reuses same channel on subsequent calls', () => {
      getOutputChannel();
      getOutputChannel();
      expect(mockVscode.window.createOutputChannel).toHaveBeenCalledTimes(1);
    });
  });

  describe('logWarn', () => {
    test('writes formatted warning message', () => {
      const channel = getOutputChannel();
      logWarn('test warning');
      const calls = (channel.appendLine as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain('[WARN] test warning');
    });

    test('writes additional args', () => {
      const channel = getOutputChannel();
      logWarn('test', 'arg1', { key: 'value' });
      const calls = (channel.appendLine as jest.Mock).mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('logInfo', () => {
    test('writes formatted info message', () => {
      const channel = getOutputChannel();
      logInfo('test info');
      const calls = (channel.appendLine as jest.Mock).mock.calls;
      expect(calls[0][0]).toContain('[INFO] test info');
    });
  });

  describe('disposeOutputChannel', () => {
    test('disposes the channel', () => {
      const channel = getOutputChannel();
      disposeOutputChannel();
      expect(channel.dispose).toHaveBeenCalled();
    });

    test('creates new channel after disposal', () => {
      getOutputChannel();
      disposeOutputChannel();
      getOutputChannel();
      expect(mockVscode.window.createOutputChannel).toHaveBeenCalledTimes(2);
    });
  });
});
