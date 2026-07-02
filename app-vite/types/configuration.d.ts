import type { QuasarContext } from "./configuration/context.d.ts";
import type { QuasarConf } from "./configuration/conf.d.ts";

export type ConfigureCallback = (
  ctx: QuasarContext
) => QuasarConf | Promise<QuasarConf>;
