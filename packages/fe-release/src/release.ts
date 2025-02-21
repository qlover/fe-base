import { AsyncExecutor } from '@qlover/fe-utils';
import ReleaseContext from './interface/ReleaseContext';
import Plugin from './Plugin';
import { ReleaseContextOptions, ReleaseReturnValue } from './type';
import CheckEnvironment from './plugins/CheckEnvironment';
import CreateReleasePullRequest from './plugins/CreateReleasePullRequest';
import GithubReleasePR from './implments/GithubReleasePR';
import PublishNpm from './plugins/PublishNpm';
import PublishPath from './plugins/PublishPath';

function getPlugins(context: ReleaseContext): Plugin[] {
  const result: Plugin[] = [];

  result.push(new CheckEnvironment(context, context.options.releaseIt!));

  if (context.options.pullRequest) {
    result.push(new CreateReleasePullRequest(context, new GithubReleasePR()));
  } else {
    result.push(new PublishNpm(context));
  }

  // use checkPublishPath to switch to the publish path
  result.push(new PublishPath(context));

  return result;
}

export function release(
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
