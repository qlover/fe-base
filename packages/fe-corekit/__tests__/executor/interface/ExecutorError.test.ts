import { ExecutorError } from '../../../src';

describe('ExecutorError', () => {
  it('should create an error with a message from a string', () => {
    const error = new ExecutorError('ERROR_ID', 'This is an error message');
    expect(error.message).toBe('This is an error message');
    expect(error.id).toBe('ERROR_ID');
    expect(error.cause).toBeUndefined();
  });

  it('should create an error with a message from an Error object', () => {
    const originalError = new Error('Original error message');
    const error = new ExecutorError('ERROR_ID', originalError);
    expect(error.message).toBe('Original error message');
    expect(error.id).toBe('ERROR_ID');
    expect(error.cause).toBe(originalError);
    // expect(error.stack).toContain(originalError.stack);
  });

  it('should create an error with the id as the message if no originalError is provided', () => {
    const errorId = 'ERROR_ID';
    const error = new ExecutorError(errorId);
    expect(error.message).toBe(errorId);
    expect(error.id).toBe(errorId);
    expect(error.cause).toBeUndefined();
  });

  it('should maintain the prototype chain', () => {
    const error = new ExecutorError('ERROR_ID');
    expect(error).toBeInstanceOf(ExecutorError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should set the name property to ExecutorError', () => {
    const error = new ExecutorError('ERROR_ID', 'Test message');
    expect(error.name).toBe('ExecutorError');
  });

  it('should preserve name property for subclasses', () => {
    class CustomExecutorError extends ExecutorError {
      constructor(message: string) {
        super('CUSTOM_ERROR', message);
      }
    }

    const error = new CustomExecutorError('Custom message');
    expect(error.name).toBe('CustomExecutorError');
    expect(error).toBeInstanceOf(CustomExecutorError);
    expect(error).toBeInstanceOf(ExecutorError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should preserve the original error in cause property', () => {
    const originalError = new TypeError('Type mismatch');
    const executorError = new ExecutorError('TYPE_ERROR', originalError);

    expect(executorError.cause).toBe(originalError);
    expect(executorError.cause).toBeInstanceOf(TypeError);
    expect((executorError.cause as Error)?.message).toBe('Type mismatch');
  });

  it('should allow access to custom error properties via cause', () => {
    class CustomError extends Error {
      constructor(
        message: string,
        public code: number,
        public details: any
      ) {
        super(message);
      }
    }

    const customError = new CustomError('Custom error', 500, {
      reason: 'timeout'
    });
    const executorError = new ExecutorError('CUSTOM_ERROR', customError);

    expect(executorError.cause).toBe(customError);
    if (executorError.cause instanceof CustomError) {
      expect(executorError.cause.code).toBe(500);
      expect(executorError.cause.details).toEqual({ reason: 'timeout' });
    }
  });

  it('should support error chain traceability', () => {
    const level1Error = new Error('Level 1 error');
    const level2Error = new ExecutorError('LEVEL_2', level1Error);
    const level3Error = new ExecutorError('LEVEL_3', level2Error);

    expect(level3Error.cause).toBe(level2Error);
    expect((level3Error.cause as Error)?.cause).toBe(level1Error);

    // Trace the error chain
    let current: Error | undefined = level3Error;
    const chain: string[] = [];
    while (current) {
      if (current instanceof ExecutorError) {
        chain.push(current.id);
      } else {
        chain.push(current.message);
      }
      current = (current as any).cause;
    }

    expect(chain).toEqual(['LEVEL_3', 'LEVEL_2', 'Level 1 error']);
  });

  // it('should have a stack trace starting with ExecutorError', () => {
  //   const executorError = new ExecutorError('EXECUTOR_ERROR');

  //   expect(executorError.stack).toMatch(/^ExecutorError: EXECUTOR_ERROR/);
  // });

  // it('should maintain the original stack trace order', () => {
  //   const originalError = new Error('Original error');
  //   const executorError = new ExecutorError('EXECUTOR_ERROR', originalError);

  //   const originalStackIndex = executorError.stack
  //     ? executorError.stack.indexOf(originalError.stack!)
  //     : -1;
  //   const executorStackIndex = executorError.stack
  //     ? executorError.stack.indexOf('ExecutorError: EXECUTOR_ERROR')
  //     : -1;

  //   expect(originalStackIndex).toBeLessThan(executorStackIndex);
  // });
});
