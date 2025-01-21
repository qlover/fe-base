import { main } from '../src/index';
import { ReleaseItInstanceType } from '../src/type';

describe('index', () => {
  let releaseIt: ReleaseItInstanceType;

  beforeEach(() => {
    releaseIt = jest.fn();
  });

  it('should throw an error if packageJson is not provided', async () => {
    releaseIt = jest.fn().mockReturnValue({
      changelog: 'test',
      version: '1.0.0'
    });

    try {
      await main({ options: { releaseIt } });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('packageJson is not supported');
    }
  });
});
