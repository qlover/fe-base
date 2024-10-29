import dotenv from 'dotenv';
import { join } from 'path';

/**
 * load env
 * @param {string} rootPath project root path
 * @param {string[]} pre env file prefix
 */
export function loadEnv(rootPath, pre = ['.env.local', '.env']) {
  dotenv.config({
    path: pre.map((p) => join(rootPath, p))
  });
}
