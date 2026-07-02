import type { Router } from "vue-router";

import type { HasSsrParam } from "./ssr/index.d.ts";
import type { HasStoreParam } from "./store.d.ts";

export type RouteParams = {} & HasSsrParam & HasStoreParam;
export type RouteCallback = (params: RouteParams) => Router | Promise<Router>;
