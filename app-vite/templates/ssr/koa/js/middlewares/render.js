import { defineSsrMiddleware } from '#q-app'

/**
 * This middleware should execute as last one
 * since it captures everything and tries to
 * render the page with Vue
 */
export default defineSsrMiddleware(({ app, publicPath, render, serve }) => {
  /**
   * We act as the catch-all, manually verifying
   * the method and base path.
   */
  app.use(async (ctx, next) => {
    if (ctx.method !== 'GET' || !ctx.path.startsWith(publicPath)) {
      return next()
    }

    ctx.type = 'text/html'

    try {
      /**
       * We hand over to Vue to render our page
       */
      const renderedHtml = await render(
        /* the ssrContext: */ { req: ctx.request, res: ctx.response }
      )
      ctx.body = renderedHtml
    } catch (err) {
      if (err?.routeNotFound) {
        /**
         * Hmm, Vue Router could not find the requested route
         * and it does not have a "catch-all" route
         */
        ctx.status = 404
        ctx.body = '404 | Page Not Found'
        return
      }

      if (err?.redirectUrl) {
        /**
         * We were told to redirect to another URL
         */
        ctx.status = err.redirectHttpStatusCode
        ctx.redirect(err.redirectUrl)
        return
      }

      if (import.meta.env.QUASAR_DEV) {
        /**
         * Well, we treat any other code as error;
         * if we're in dev mode, then we can use Quasar CLI
         * to display a nice error page that contains the stack
         * and other useful information
         *
         * Note that serve.devError is available on dev only
         */
        const { errorHeaders, errorHtml } = serve.devError({
          err,
          req: ctx.request
        })
        ctx.status = 500
        ctx.set(errorHeaders)
        ctx.body = errorHtml
        return
      }

      if (import.meta.env.QUASAR_DEBUG) {
        console.error(
          err instanceof Error ? err.stack : (err ?? 'Unknown error')
        )
      }

      /**
       * Render Error Page on production or
       * alternatively, create a route (/src/routes) for an error page and redirect to it
       * (just make sure that route won't crash too, otherwise you'll end up in an infinite loop!)
       */
      ctx.status = 500
      ctx.body = '500 | Internal Server Error'
    }
  })
})
