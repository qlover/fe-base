declare module 'fs-extra' {
  export const readFileSync: (path: string, encoding: string) => string;
  export const writeFileSync: (
    path: string,
    data: string,
    encoding: string
  ) => void;
  export const readJSONSync: (path: string) => unknown;
  export const existsSync: (path: string) => boolean;
  export const removeSync: (path: string) => void;
  export const ensureFileSync: (path: string) => void;
}
