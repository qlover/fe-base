import { ProjectReflectionGenerater } from './lib/ProjectReflectionGenerater.js';
import { resolve } from 'path';
import { ProjectReflectionParser } from './lib/ProjectReflectionParser.js';

const parser = new ProjectReflectionParser({
  entryPoints: [resolve('../fe-utils/common/index.ts')],
  outputPath: 'fe-code2markdown.output'
});

const init = async () => {
  const app = await parser.getApp();

  const project = await app.convert();
  if (project) {
    await parser.writeTo(project);
  }
};

const main = async () => {
  if (0) {
    await init();
  }

  const parser = new ProjectReflectionParser({
    entryPoints: [resolve('./example/example.ts')],
    outputPath: 'fe-code2markdown.output'
  });

  const generater = new ProjectReflectionGenerater({
    parser,
    logger: console,
    generatePath: resolve('./docs.output')
  });

  // const app = await parser.getApp();
  // const project = await app.convert();
  // await parser.load();
  // await parser.writeTo(project);
  // return;

  await parser.load();

  // await parser.parseClasses();
  // return;
  // // const content = parser.parsePath(
  // //   'D:\\qrj\\workspace\\fe-base\\packages\\fe-utils\\common\\request\\RequestExecutor.ts'
  // // );
  // // console.log(content);
  // // return;

  await generater.generate();
};

main();
