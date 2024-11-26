import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import CircularJSON from 'circular-json';

const main = async () => {
  const app = await Application.bootstrap(
    {
      // typedoc options here
      entryPoints: ['common/index.ts', 'server/index.ts'],
      skipErrorChecking: true
    },
    [new TSConfigReader(), new TypeDocReader()]
  );

  const project = await app.convert();
  if (project) {
    fsExtra.writeFileSync(
      'fe-utils.json',
      CircularJSON.stringify(project, null, 2),
      'utf-8'
    );
  }
};

main();
