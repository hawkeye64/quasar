import "quasar/dist/types/globals";
import type * as Cordova from "cordova";

import type { BexBridge } from "./bex/index.d.ts";

declare module "quasar/dist/types/globals" {
  interface GlobalsTypesHolder {
    cordova: typeof Cordova;
    bex: BexBridge;
  }
}
