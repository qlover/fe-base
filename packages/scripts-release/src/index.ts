import { AsyncExecutor } from '@qlover/fe-utils';
import { ReleaseReturnValue, ReleaseContextOptions } from './type';
import Plugin from './Plugin';
import CheckEnvironment from './plugins/CheckEnvironment';
import PublishNpm from './plugins/PublishNpm';
import ReleaseContext from './ReleaseContext';

function getPlugins(context: ReleaseContext): Plugin[] {
  return [
    new CheckEnvironment(context),
    new PublishNpm(context, context.options.releaseIt!)
  ];
}

export function main(
  context: ReleaseContextOptions
): Promise<ReleaseReturnValue> {
  const releaseContext = new ReleaseContext(context);

  const executor = new AsyncExecutor();

  getPlugins(releaseContext).forEach((plugin) => {
    executor.use(plugin);
  });

  return executor.exec(releaseContext, ({ returnValue }) => {
    return Promise.resolve(returnValue as ReleaseReturnValue);
  });
}
