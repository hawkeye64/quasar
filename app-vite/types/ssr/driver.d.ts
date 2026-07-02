/**
 * This interface MUST be augmented by users to inject their own server types.
 *
 * @example
 * declare module '#q-app' {
 *   interface SsrDriver {
 *     app: Application;
 *     listenResult: Server;
 *     request: Request;
 *     response: Response;
 *   }
 * }
 */
export interface SsrDriver extends Record<string, unknown> {}

/**
 * @private
 */
export interface SsrDriverTypes {
  app: SsrDriver["app"];
  listenResult: SsrDriver["listenResult"];
  request: SsrDriver["request"];
  response: SsrDriver["response"];
}
