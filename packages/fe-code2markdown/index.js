import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import CircularJSON from 'circular-json';
import { ProjectReflectionParser } from './lib/ProjectReflectionParser.js';
import { ProjectReflectionGenerater } from './lib/ProjectReflectionGenerater.js';
import { resolve } from 'path';
const entryPoints = [resolve('../fe-utils/common/index.ts')];
const output = 'fe-code2markdown.output';

const init = async () => {
  const app = await Application.bootstrap(
    {
      // typedoc options here
      entryPoints,
      skipErrorChecking: true
    },
    [new TSConfigReader(), new TypeDocReader()]
  );

  const project = await app.convert();
  if (project) {
    fsExtra.writeFileSync(
      output,
      CircularJSON.stringify(project, null, 2),
      'utf-8'
    );
  }
};

const main = async () => {
  if (0) {
    await init();
  }

  const parser = new ProjectReflectionParser({ path: output });
  parser.parseClasses();
  return;
  const content = parser.parsePath(
    'D:\\qrj\\workspace\\fe-base\\packages\\fe-utils\\common\\request\\RequestExecutor.ts'
  );
  console.log(content);
  return;
  const generater = new ProjectReflectionGenerater({
    parser,
    entryPoints,
    logger: console,
    generatePath: resolve('../fe-utils/docs')
  });
  generater.generate();
};

main();
