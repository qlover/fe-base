import path, { resolve } from 'path';
import ts2Locales from '@brain-toolkit/ts2locales/vite';
import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import postcss from '@tailwindcss/postcss';
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite';

import devConfig from './dev';
import prodConfig from './prod';
import { getAllI18nIdentifierFiles } from './tools/getAllI18nIdentifierFiles';

const relativePath = (path: string) => resolve(__dirname, path);

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(
  async (merge, { command: _cmd, mode: _mode }) => {
    const baseConfig: UserConfigExport<'vite'> = {
      projectName: 'taro-seed',
      // 路径别名：TS 用 tsconfig paths，Taro 运行用这里的 alias（与 tsconfig 保持一致）
      alias: {
        '@': path.resolve(__dirname, '../src'),
        '@interfaces': path.resolve(__dirname, '../types/interfaces')
      },
      date: '2026-3-3',
      designWidth: 750,
      deviceRatio: {
        640: 2.34 / 2,
        750: 1,
        375: 2,
        828: 1.81 / 2
      },
      sourceRoot: 'src',
      outputRoot: 'dist',
      plugins: ['@tarojs/plugin-generator'],
      defineConstants: {},
      copy: {
        patterns: [],
        options: {}
      },
      framework: 'react',
      compiler: {
        type: 'vite',
        vitePlugins: [
          {
            name: 'postcss-config-loader-plugin',
            config(config) {
              const postcssOpt = config.css?.postcss;
              if (postcssOpt && typeof postcssOpt === 'object') {
                const plugins =
                  'plugins' in postcssOpt ? postcssOpt.plugins : undefined;
                if (Array.isArray(plugins)) {
                  plugins.unshift(postcss());
                }
              }
            }
          },
          UnifiedViteWeappTailwindcssPlugin({
            rem2rpx: true,
            disabled:
              process.env.TARO_ENV === 'h5' ||
              process.env.TARO_ENV === 'harmony' ||
              process.env.TARO_ENV === 'rn',
            injectAdditionalCssVarScope: true,
            cssEntries: [path.resolve(__dirname, '../src/app.css')]
          }),
          ts2Locales({
            locales: ['zh', 'en'],
            // target: relativePath('./public/locales/{{lng}}/{{ns}}.json'),
            target: relativePath('../src/assets/locales/{{lng}}.json'),
            // 注释后只保留 common
            // resolveNs: (key) => key.split(':')[0],
            // 不保留命名空间
            // resolveKeyInFile: (key, ns) => key.slice(ns.length + 1),
            options: getAllI18nIdentifierFiles(
              relativePath('../src/config/i18n-identifier')
            )
          })
        ]
      },
      mini: {
        postcss: {
          pxtransform: {
            enable: true,
            config: {}
          },
          cssModules: {
            enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
            config: {
              namingPattern: 'module', // 转换模式，取值为 global/module
              generateScopedName: '[name]__[local]___[hash:base64:5]'
            }
          }
        }
      },
      h5: {
        publicPath: '/',
        staticDirectory: 'static',

        miniCssExtractPluginOption: {
          ignoreOrder: true,
          filename: 'css/[name].[hash].css',
          chunkFilename: 'css/[name].[chunkhash].css'
        },
        postcss: {
          autoprefixer: {
            enable: true,
            config: {}
          },
          cssModules: {
            enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
            config: {
              namingPattern: 'module', // 转换模式，取值为 global/module
              generateScopedName: '[name]__[local]___[hash:base64:5]'
            }
          }
        }
      },
      rn: {
        appName: 'taroDemo',
        postcss: {
          cssModules: {
            enable: false // 默认为 false，如需使用 css modules 功能，则设为 true
          }
        }
      }
    };

    process.env.BROWSERSLIST_ENV = process.env.NODE_ENV;

    if (process.env.NODE_ENV === 'development') {
      // 本地开发构建配置（不混淆压缩）
      return merge({}, baseConfig, devConfig);
    }
    // 生产构建配置（默认开启压缩混淆等）
    return merge({}, baseConfig, prodConfig);
  }
);
