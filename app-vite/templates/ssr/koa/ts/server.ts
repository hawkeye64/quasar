/**
 * https://v2.quasar.dev/quasar-cli-vite/developing-ssr/ssr-webserver
 *
 * Runs in Node.js context.
 *
 * Make sure to pnpm/yarn/npm/bun install (in /src-ssr folder)
 * anything you import here.
 */

import Koa from "koa";
import {
  defineSsrClose,
  defineSsrCreate,
  defineSsrInjectDevMiddleware,
  defineSsrListen,
  defineSsrRenderPreloadTag,
  defineSsrServeStaticContent
} from "#q-app";

declare module "#q-app" {
  interface SsrDriver {
    app: Koa;
    listenResult: ReturnType<Koa["listen"]>;
    request: Koa.Request;
    response: Koa.Response;
  }
}

/**
 * Create your webserver and return its instance.
 */
export const create = defineSsrCreate(async (/* { ... } */) => {
  const app = new Koa();

  if (import.meta.env.QUASAR_PROD) {
    const { default: compress } = await import("koa-compress");
    app.use(compress());
  }

  return app;
});

/**
 * Used by Quasar SSR dev server to inject middleware into the webserver.
 * It uses it to handle Vite dev server, handle public paths, etc.
 * The given middleware is compatible with `node:http`'s Server, Express, Connect, etc.
 */
export const injectDevMiddleware = defineSsrInjectDevMiddleware(
  async ({ app }) => {
    const { default: koaConnect } = await import("koa-connect");
    return middleware => {
      app.use(
        koaConnect((req, res, next) => {
          middleware(req, res, next);
        })
      );
    };
  }
);

/**
 * You need to make the server listen to the indicated port
 * and return the listening instance or whatever you need to
 * close the server with.
 *
 * The "listenResult" param for the "close()" definition below
 * is what you return here.
 *
 * For production, you can instead export your
 * handler for serverless use or whatever else fits your needs.
 */
export const listen = defineSsrListen(
  async ({ app, devHttpsOptions, port }) => {
    /**
     * For production HTTPS you can use the /src-ssr/server-assets folder
     * to place your certificates and then read them here to create the server.
     *
     * Use resolve.serverAssets('path-to-file') to get the absolute path to the file
     * or directly play with folders.serverAssets.
     */

    if (import.meta.env.QUASAR_DEV && devHttpsOptions) {
      const https = await import("node:https");
      const handler = app.callback();
      const server = https.createServer(devHttpsOptions, (req, res) => {
        void handler(req, res);
      });
      return server.listen(port);
    }

    return app.listen(port, () => {
      if (import.meta.env.QUASAR_PROD) {
        console.log(`🚀 Server listening at port ${port}`);
      }
    });
  }
);

/**
 * Should close the server and free up any resources.
 * Will be used on development only when the server needs
 * to be rebooted.
 *
 * Should you need the result of the "listen()" call above,
 * you can use the "listenResult" param.
 *
 * Can be async: defineSsrClose(async ({ listenResult }) => { ... })
 */
export const close = defineSsrClose(({ listenResult }) => listenResult.close());

const maxAge = import.meta.env.QUASAR_DEV ? 0 : 1000 * 60 * 60 * 24 * 30;

/**
 * Should return a function that will be used to configure the webserver
 * to serve static content at "urlPath" from "pathToServe" folder/file.
 *
 * Notice resolve.urlPath(urlPath) and resolve.public(pathToServe) usages.
 *
 * Can return an async function: return async ({ urlPath = '/', pathToServe = '.', opts = {} }) => {
 */
export const serveStaticContent = defineSsrServeStaticContent(
  async ({ app, resolve }) => {
    const { default: serve } = await import("koa-static");
    const { default: mount } = await import("koa-mount");

    return ({ urlPath, pathToServe, opts = {} }) => {
      const { maxAge: localMaxAge, ...otherOpts } = opts;
      const serveFn = serve(resolve.public(pathToServe), {
        maxage: localMaxAge ?? maxAge,
        ...otherOpts
      });

      app.use(mount(resolve.urlPath(urlPath), serveFn));
    };
  }
);

const jsRE = /\.js$/;
const cssRE = /\.css$/;
const woffRE = /\.woff$/;
const woff2RE = /\.woff2$/;
const gifRE = /\.gif$/;
const jpgRE = /\.jpe?g$/;
const pngRE = /\.png$/;

/**
 * Should return a String with HTML output
 * (if any) for preloading indicated file
 */
export const renderPreloadTag = defineSsrRenderPreloadTag(
  (file /* , { ssrContext } */) => {
    if (jsRE.test(file)) {
      return `<link rel="modulepreload" href="${file}" crossorigin>`;
    }

    if (cssRE.test(file)) {
      return `<link rel="stylesheet" href="${file}" crossorigin>`;
    }

    if (woffRE.test(file)) {
      return `<link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
    }

    if (woff2RE.test(file)) {
      return `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
    }

    if (gifRE.test(file)) {
      return `<link rel="preload" href="${file}" as="image" type="image/gif" crossorigin>`;
    }

    if (jpgRE.test(file)) {
      return `<link rel="preload" href="${file}" as="image" type="image/jpeg" crossorigin>`;
    }

    if (pngRE.test(file)) {
      return `<link rel="preload" href="${file}" as="image" type="image/png" crossorigin>`;
    }

    return "";
  }
);
