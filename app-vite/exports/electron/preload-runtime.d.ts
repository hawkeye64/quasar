/**
 * Synchronously requests the main process to resolve the path to the
 * electron-assets directory.
 * @param args Path segments to join to the base electron-assets path
 * @returns The fully resolved path
 */
export declare function resolveElectronAssetsPath(...args: string[]): string;

/**
 * The resolved path to the electron-assets directory, determined at runtime
 */
export declare const electronAssetsDir: string;

/**
 * Synchronously requests the main process to resolve the path to the
 * public directory.
 * @param args Path segments to join to the base public path
 * @returns The fully resolved path
 */
export declare function resolvePublicPath(...args: string[]): string;

/**
 * The resolved path to the public directory, determined at runtime
 */
export declare const publicDir: string;

/**
 * An object grouping the synchronous path resolution utilities.
 */
export declare const quasarRuntime: {
  electronAssetsDir: string;
  resolveElectronAssetsPath: typeof resolveElectronAssetsPath;

  publicDir: string;
  resolvePublicPath: typeof resolvePublicPath;
};
