import { ScriptPlugin } from '@qlover/scripts-context';
import Code2MDContext from '../implments/Code2MDContext';
import { FormatProjectValue } from './typeDocs';
import { HBSTemplate } from '../implments/HBSTemplate';

export class Formats extends ScriptPlugin<Code2MDContext> {
  private hbsTemplate: HBSTemplate;

  constructor(context: Code2MDContext) {
    super(context, 'Formats');

    this.hbsTemplate = new HBSTemplate({
      name: 'format-project',
      hbsRootDir: this.context.options.hbsRootDir
    });
  }

  async onBefore(): Promise<void> {
    const { formatProject = [] } = this.context.options;
    const fileGroups = this.groupByFile(formatProject);

    const target = fileGroups.get('example/test/ExampleEnum.ts');

    this.logger.info(this.formatProjectValue(target![0]));

    // const hbsContentMap = new Map<string, string>();

    // fileGroups.forEach((items, filePath) => {
    //   const content: string[] = [];
    //   for (const item of items) {
    //     content.push(this.formatProjectValue(item));
    //   }

    //   hbsContentMap.set(filePath, content.join('\n'));
    // });

    // this.logger.info(
    //   JSON.stringify(Object.fromEntries(hbsContentMap), null, 2)
    // );
  }

  groupByFile(data: FormatProjectValue[]): Map<string, FormatProjectValue[]> {
    const fileGroups = new Map<string, FormatProjectValue[]>();

    for (const item of data) {
      const filePath = item.source?.fileName;
      if (filePath) {
        fileGroups.set(filePath, [...(fileGroups.get(filePath) || []), item]);
      }
    }
    return fileGroups;
  }

  formatProjectValue(data: FormatProjectValue): string {
    return this.hbsTemplate.compile(data);
  }
}
