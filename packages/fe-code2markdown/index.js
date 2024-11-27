import { ProjectReflectionGenerater } from './lib/ProjectReflectionGenerater.js';
import { resolve } from 'path';

const main = async () => {
  const generater = new ProjectReflectionGenerater({
    logger: console,
    entryPoints: [resolve('./example/example.ts')],
    outputJSONFilePath: resolve('./fe-code2markdown.output'),
    generatePath: resolve('./docs.output')
  });

  // await generater.generateJson();
  await generater.generate();
};

main();
