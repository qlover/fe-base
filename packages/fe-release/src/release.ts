import type { ReleaseContextOptions } from './type';
import ReleaseContext from './interface/ReleaseContext';
import ReleaseTask from './implments/ReleaseTask';
import { AsyncExecutor } from '@qlover/fe-corekit';

export function release(context: ReleaseContextOptions): Promise<unknown> {
  const releaseContext = new ReleaseContext(context);

  const releaseTask = new ReleaseTask(releaseContext, new AsyncExecutor());

  return releaseTask.exec();
}
