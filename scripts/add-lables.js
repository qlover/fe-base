#!/usr/bin/env node

const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_REF } = process.env;
const [owner, repo] = GITHUB_REPOSITORY.split('/');

console.log('jj process.argv', process.argv);

console.log('jj has GITHUB_TOKEN', !!GITHUB_TOKEN);
console.log('jj GITHUB_REPOSITORY', GITHUB_REPOSITORY);
console.log('jj GITHUB_REF', GITHUB_REF);
console.log('jj owner', owner);
console.log('jj repo', repo);

// // 从命令行参数获取标签信息
// const feScriptsChanged = process.argv[2] === 'true';
// const feUtilsChanged = process.argv[3] === 'true';
// const changedPackages = process.argv[4] ? process.argv[4].split(',') : []; // 获取变化的包
// // 读取 fe-config.json 文件
// const config = JSON.parse(fs.readFileSync('fe-config.json', 'utf-8'));
// const labels = [];
// // 根据变化添加标签
// if (feScriptsChanged) labels.push('pkg:fe-scripts');
// if (feUtilsChanged) labels.push('pkg:fe-utils');
// // 动态添加 releasePackages 标签
// changedPackages.forEach((pkg) => {
//   if (config.releasePackages.includes(pkg)) {
//     labels.push(`pkg:${pkg}`);
//   }
// });
// if (labels.length > 0) {
//   const octokit = new Octokit({ auth: GITHUB_TOKEN });
//   const issueNumber = GITHUB_REF.split('/').pop(); // 获取当前 PR 的编号
//   await octokit.issues.addLabels({
//     owner,
//     repo,
//     issue_number: issueNumber,
//     labels
//   });
// }
