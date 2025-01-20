# @qlover/env-loader

@qlover/env-loader 是一个用于管理环境变量的包。它提供了一种集中化的方式来加载和管理.env文件中的环境变量。

## 安装

```bash
npm install @qlover/env-loader
or
yarn add @qlover/env-loader
```

## 使用方法

### 初始化

要使用Env类，首先需要创建一个实例。可以通过传递配置选项来初始化。

```ts
import { Env } from '@qlover/env-loader';

const env = new Env({ rootPath: process.cwd() });
```

### 加载环境变量

```ts
const env = new Env({ rootPath: process.cwd() });

env.load();
```

### 获取环境变量

```ts
const env = new Env({ rootPath: process.cwd() });

env.get('NODE_ENV');
```

### 搜索并加载.env文件

```ts
const env = Env.searchEnv({
  cwd: '/path/to/start',
  preloadList: ['.env'],
});
```

### 获取、设置和删除环境变量

```ts
env.set('NODE_ENV', 'development');
env.delete('NODE_ENV');
env.get('NODE_ENV');
```


## 配置选项

Env类提供了一些配置选项，可以用来控制环境变量的加载和搜索行为。

- `cwd`: 指定搜索的根目录。
- `preloadList`: 指定要加载的.env文件列表。
- `maxDepth`: 指定搜索的最大深度。
- `logger`: 指定日志记录器。
