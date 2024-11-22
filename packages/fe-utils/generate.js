import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// 读取并解析 JSON 数据
const jsonData = JSON.parse(readFileSync('./typedoc-ast.json', 'utf8'));

// 目标文档目录
const docsDir = './docs';

// 递归创建目录
function createDir(path) {
  mkdirSync(path, { recursive: true });
}

// 生成 Markdown 文件
function generateMarkdownFile(path, content) {
  writeFileSync(path, content, 'utf8');
}

// 生成文档
function generateDocs(data, baseDir) {
  if (data.children) {
    data.children.forEach((child) => {
      const childDir = join(baseDir, child.name);
      createDir(childDir);

      // 生成每个模块、类、接口的文档
      const markdownContent = `# ${child.name}\n\n${child.comment?.summary?.map((s) => s.text).join('\n') || ''}`;
      generateMarkdownFile(join(childDir, 'README.md'), markdownContent);

      // 递归处理子节点
      generateDocs(child, childDir);
    });
  }
}

// 开始生成文档
generateDocs(jsonData, docsDir);
