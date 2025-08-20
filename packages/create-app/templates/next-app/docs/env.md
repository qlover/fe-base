# 环境配置指南

本项目使用 Next.js 内置的环境变量系统来管理不同环境的配置。

## 环境文件

项目支持以下环境配置文件：

- `.env` - 默认环境配置，适用于所有环境
- `.env.local` - 本地环境配置，会覆盖 `.env`（不应提交到版本控制）
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env.test` - 测试环境配置

加载优先级（从高到低）：
1. `.env.local`
2. `.env.[environment]`
3. `.env`

## 使用方法

1. 复制 `.env.template` 创建对应环境的配置文件：

```bash
# 开发环境
cp .env.template .env.development

# 生产环境
cp .env.template .env.production

# 测试环境
cp .env.template .env.test
```

2. 修改对应环境的配置文件内容

3. 启动应用时指定环境：

```bash
# 开发环境
APP_ENV=development npm run dev

# 生产环境
APP_ENV=production npm run build
APP_ENV=production npm run start

# 测试环境
APP_ENV=test npm run test
```

## 在代码中使用环境变量

1. 服务端和客户端都可访问的变量：
```typescript
// 在 .env 文件中定义
PUBLIC_API_URL=http://api.example.com

// 在代码中使用
console.log(process.env.PUBLIC_API_URL)
```

2. 仅服务端可访问的变量：
```typescript
// 在 .env 文件中定义（以 PRIVATE_ 开头）
PRIVATE_API_KEY=secret_key

// 在服务端代码中使用
console.log(process.env.PRIVATE_API_KEY)
```

3. 使用运行时配置：
```typescript
import getConfig from 'next/config'

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

// 服务端配置
console.log(serverRuntimeConfig.mySecret)

// 公共配置
console.log(publicRuntimeConfig.appEnv)
```

## 注意事项

1. 不要将包含敏感信息的 `.env` 文件提交到版本控制
2. 确保 `.env.local` 和 `*.env` 文件在 `.gitignore` 中
3. 使用 `.env.template` 作为配置模板
4. 环境变量命名推荐使用大写字母和下划线
5. 在 CI/CD 中使用环境变量时，直接在平台中配置，不要使用 .env 文件
