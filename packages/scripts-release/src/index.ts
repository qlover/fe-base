import { AsyncExecutor } from '@qlover/fe-utils';
import { ReleaseReturnValue, ReleaseContextOptions } from './type';
import Plugin from './Plugin';
import CheckEnvironment from './plugins/CheckEnvironment';
import PublishNpm from './plugins/PublishNpm';
import ReleaseContext from './interface/ReleaseContext';
import CreateReleasePullRequest from './plugins/CreateReleasePullRequest';
import GithubReleasePR from './implments/GithubReleasePR';

function getPlugins(context: ReleaseContext): Plugin[] {
  const result: Plugin[] = [];

  result.push(new CheckEnvironment(context));

  if (context.options.releaseMode === 'release-pullrequest') {
    result.push(
      new CreateReleasePullRequest(context, new GithubReleasePR(context))
    );
  } else if (context.options.releaseMode === 'publish') {
    result.push(new PublishNpm(context, context.options.releaseIt!));
  }

  return result;
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
