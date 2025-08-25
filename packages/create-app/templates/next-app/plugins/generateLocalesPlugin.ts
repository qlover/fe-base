import { generateLocales } from '../build/generateLocales';

export function withGenerateLocales(nextConfig = {}) {
  return {
    ...nextConfig,
    onDevelopmentStart: async () => {
      try {
        await generateLocales();
        console.log('✅ Locales generated successfully');
      } catch (error) {
        console.error('❌ Failed to generate locales:', error);
      }
    },
    webpack: (config, options) => {
      const { dev, isServer } = options;

      // 在生产构建开始时生成本地化文件
      if (!dev && isServer) {
        generateLocales().catch(error => {
          console.error('❌ Failed to generate locales:', error);
        });
      }

      // 如果原配置有 webpack 配置，则调用它
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  };
}
