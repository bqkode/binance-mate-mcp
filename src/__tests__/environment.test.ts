import { jest } from '@jest/globals';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should exit with error when BINANCE_API_KEY is missing', async () => {
    delete process.env.BINANCE_API_KEY;
    process.env.BINANCE_API_SECRET = 'test_secret';

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: any) => {
      throw new Error(`Process exited with code ${code}`);
    });
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    await expect(import('../index.js')).rejects.toThrow('Process exited with code 1');
    
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Please set BINANCE_API_KEY and BINANCE_API_SECRET in your .env file'
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should exit with error when BINANCE_API_SECRET is missing', async () => {
    process.env.BINANCE_API_KEY = 'test_key';
    delete process.env.BINANCE_API_SECRET;

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: any) => {
      throw new Error(`Process exited with code ${code}`);
    });
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    await expect(import('../index.js')).rejects.toThrow('Process exited with code 1');
    
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Please set BINANCE_API_KEY and BINANCE_API_SECRET in your .env file'
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should start successfully when both API credentials are provided', async () => {
    process.env.BINANCE_API_KEY = 'test_key';
    process.env.BINANCE_API_SECRET = 'test_secret';

    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    // Mock the server connection to prevent actual server startup
    jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
      Server: jest.fn().mockImplementation(() => ({
        setRequestHandler: jest.fn(),
        connect: jest.fn().mockResolvedValue(undefined),
      })),
    }));

    await import('../index.js');

    // Should not call process.exit
    expect(mockConsoleError).not.toHaveBeenCalledWith(
      'Please set BINANCE_API_KEY and BINANCE_API_SECRET in your .env file'
    );

    mockConsoleError.mockRestore();
  });
});