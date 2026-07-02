import type * as ElectronBuilderUtil from "builder-util";
import type * as ElectronBuilder from "electron-builder";
import type * as ElectronPackager from "@electron/packager";
import type { LiteralUnion } from "quasar";
import type { RolldownOptions } from "rolldown";

export type QuasarElectronBundlers = "builder" | "packager";

type ElectronBuilderConfiguration = ElectronBuilder.Configuration;
type ElectronPackagerOptions = ElectronPackager.Options;

interface QuasarElectronConfiguration {
  /**
   * The list of content scripts (js/ts) that you want embedded.
   * Each entry in the list should be a filename (WITHOUT its extension) from /src-electron/
   *
   * @default [ 'electron-preload' ]
   * @example [ 'my-other-preload-script' ]
   */
  preloadScripts?: string[];

  /**
   * Add/remove/change properties of Electron production generated package.json
   *
   * Can be async. Can directly modify the "pkgJson" parameter or
   * return a new one that will be merged with the default one.
   */
  extendElectronPackageJson?: (pkgJson: { [index in string]: any }) =>
    | void
    | { [index in string]: any }
    | Promise<void | { [index in string]: any }>;

  /**
   * Extend the Rolldown config that is used for the electron-main thread.
   *
   * Can be async. Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   *
   * @param config {@link RolldownOptions}
   */
  extendElectronMainConf?: (
    config: RolldownOptions
  ) => void | RolldownOptions | Promise<void | RolldownOptions>;

  /**
   * Extend the Rolldown config that is used for the electron-preload thread.
   *
   * Can be async. Can directly modify the "config" parameter or
   * return a new one that will be merged with the default one.
   *
   * @param config {@link RolldownOptions}
   */
  extendElectronPreloadConf?: (
    config: RolldownOptions
  ) => void | RolldownOptions | Promise<void | RolldownOptions>;

  /**
   * You have to choose to use either "packager" or "builder".
   * They are both excellent open-source projects,
   *  however they serve slightly different needs.
   * With packager you will be able to build unsigned projects
   *  for all major platforms from one machine.
   * Although this is great, if you just want something quick and dirty,
   *  there is more platform granularity (and general polish) in builder.
   * Cross-compiling your binaries from one computer doesn’t really work with builder,
   *  or we haven’t found the recipe yet.
   *
   * Use along with either the `packager` or `builder` property to
   * configure the options for the chosen bundler.
   *
   * @type options {@link QuasarElectronBundlers}
   * @default "packager"
   */
  bundler?: QuasarElectronBundlers;

  /**
   * Electron-packager options.
   * `dir` and `out` properties are overwritten by Quasar CLI to ensure the best results.
   * @type options {@link ElectronPackagerOptions}
   */
  packager?: Omit<ElectronPackagerOptions, "dir" | "out">;

  /**
   * Electron-builder options
   * @type options {@link ElectronBuilderConfiguration}
   */
  builder?: ElectronBuilderConfiguration;

  /**
   * Specify additional parameters when installing dependencies in
   * the UnPackaged folder, right before bundling with either
   * electron packager or electron builder;
   * Example: [ 'install', '--production', '--ignore-optional', '--some-other-param' ]
   */
  unPackagedInstallParams?: string[];

  /**
   * Specify the debugging port to use for the Electron app when running in development mode
   * @default 5858
   */
  inspectPort?: number;
}

export type ElectronBuilderArchs = ElectronBuilderUtil.Arch;
// ElectronBuilder doesn't export exact types for the target option
export type ElectronBuilderTargets =
  | "all"
  | "darwin"
  | "win32"
  | "linux"
  | "win"
  | "mac";

export type ElectronPackagerArchs = LiteralUnion<
  ElectronPackager.OfficialArch | "all"
>;
export type ElectronPackagerTargets = LiteralUnion<
  ElectronPackager.OfficialPlatform | "all"
>;
