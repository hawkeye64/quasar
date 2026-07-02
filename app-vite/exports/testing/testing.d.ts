import type { UserConfig } from "vite";

export type TestingCtxParams = {
  dev?: boolean;
  prod?: boolean;
  mode?: string;
  target?: string;
  arch?: string;
  bundler?: string;
  debug?: boolean;
};

export function getTestingConfig(
  ctxParams?: TestingCtxParams
): Promise<UserConfig>;
