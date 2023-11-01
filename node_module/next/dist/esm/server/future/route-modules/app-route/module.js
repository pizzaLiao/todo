import { RouteModule } from "../route-module";
import { RequestAsyncStorageWrapper } from "../../../async-storage/request-async-storage-wrapper";
import { StaticGenerationAsyncStorageWrapper } from "../../../async-storage/static-generation-async-storage-wrapper";
import { handleBadRequestResponse, handleInternalServerErrorResponse } from "../helpers/response-handlers";
import { HTTP_METHODS, isHTTPMethod } from "../../../web/http";
import { addImplicitTags, patchFetch } from "../../../lib/patch-fetch";
import { getTracer } from "../../../lib/trace/tracer";
import { AppRouteRouteHandlersSpan } from "../../../lib/trace/constants";
import { getPathnameFromAbsolutePath } from "./helpers/get-pathname-from-absolute-path";
import { proxyRequest } from "./helpers/proxy-request";
import { resolveHandlerError } from "./helpers/resolve-handler-error";
import { RouteKind } from "../../route-kind";
import * as Log from "../../../../build/output/log";
import { autoImplementMethods } from "./helpers/auto-implement-methods";
import { getNonStaticMethods } from "./helpers/get-non-static-methods";
import { SYMBOL_MODIFY_COOKIE_VALUES } from "../../../web/spec-extension/adapters/request-cookies";
import { ResponseCookies } from "../../../web/spec-extension/cookies";
import { HeadersAdapter } from "../../../web/spec-extension/adapters/headers";
/**
 * AppRouteRouteHandler is the handler for app routes.
 */ export class AppRouteRouteModule extends RouteModule {
    constructor({ userland , pathname , resolvedPagePath , nextConfigOutput  }){
        super({
            userland
        });
        /**
   * When true, indicates that the global interfaces have been patched via the
   * `patch()` method.
   */ this.hasSetup = false;
        this.definition = {
            kind: RouteKind.APP_ROUTE,
            pathname,
            // The following aren't needed for the route handler.
            page: "",
            bundlePath: "",
            filename: ""
        };
        this.pathname = pathname;
        this.resolvedPagePath = resolvedPagePath;
        this.nextConfigOutput = nextConfigOutput;
        // Automatically implement some methods if they aren't implemented by the
        // userland module.
        this.methods = autoImplementMethods(userland);
        // Get the non-static methods for this route.
        this.nonStaticMethods = getNonStaticMethods(userland);
        // Get the dynamic property from the userland module.
        this.dynamic = this.userland.dynamic;
        if (this.nextConfigOutput === "export") {
            if (!this.dynamic || this.dynamic === "auto") {
                this.dynamic = "error";
            } else if (this.dynamic === "force-dynamic") {
                throw new Error(`export const dynamic = "force-dynamic" on page "${pathname}" cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export`);
            }
        }
    }
    /**
   * Validates the userland module to ensure the exported methods and properties
   * are valid.
   */ async setup() {
        // If we've already setup, then return.
        if (this.hasSetup) return;
        // Mark the module as setup. The following warnings about the userland
        // module will run if we're in development. If the module files are modified
        // when in development, then the require cache will be busted for it and
        // this method will be called again (resetting the `hasSetup` flag).
        this.hasSetup = true;
        // We only warn in development after here, so return if we're not in
        // development.
        if (process.env.NODE_ENV === "development") {
            // Print error in development if the exported handlers are in lowercase, only
            // uppercase handlers are supported.
            const lowercased = HTTP_METHODS.map((method)=>method.toLowerCase());
            for (const method of lowercased){
                if (method in this.userland) {
                    Log.error(`Detected lowercase method '${method}' in '${this.resolvedPagePath}'. Export the uppercase '${method.toUpperCase()}' method name to fix this error.`);
                }
            }
            // Print error if the module exports a default handler, they must use named
            // exports for each HTTP method.
            if ("default" in this.userland) {
                Log.error(`Detected default export in '${this.resolvedPagePath}'. Export a named export for each HTTP method instead.`);
            }
            // If there is no methods exported by this module, then return a not found
            // response.
            if (!HTTP_METHODS.some((method)=>method in this.userland)) {
                Log.error(`No HTTP methods exported in '${this.resolvedPagePath}'. Export a named export for each HTTP method.`);
            }
        }
    }
    /**
   * Resolves the handler function for the given method.
   *
   * @param method the requested method
   * @returns the handler function for the given method
   */ resolve(method) {
        // Ensure that the requested method is a valid method (to prevent RCE's).
        if (!isHTTPMethod(method)) return handleBadRequestResponse;
        // Return the handler.
        return this.methods[method];
    }
    /**
   * Executes the route handler.
   */ async execute(request, context) {
        // Get the handler function for the given method.
        const handler = this.resolve(request.method);
        // Get the context for the request.
        const requestContext = {
            req: request
        };
        requestContext.renderOpts = {
            previewProps: context.prerenderManifest.preview
        };
        // Get the context for the static generation.
        const staticGenerationContext = {
            pathname: this.definition.pathname,
            renderOpts: // If the staticGenerationContext is not provided then we default to
            // the default values.
            context.staticGenerationContext ?? {
                supportsDynamicHTML: false
            }
        };
        // Add the fetchCache option to the renderOpts.
        staticGenerationContext.renderOpts.fetchCache = this.userland.fetchCache;
        // Run the handler with the request AsyncLocalStorage to inject the helper
        // support. We set this to `unknown` because the type is not known until
        // runtime when we do a instanceof check below.
        const response = await this.actionAsyncStorage.run({
            isAppRoute: true
        }, ()=>{
            return RequestAsyncStorageWrapper.wrap(this.requestAsyncStorage, requestContext, ()=>{
                return StaticGenerationAsyncStorageWrapper.wrap(this.staticGenerationAsyncStorage, staticGenerationContext, (staticGenerationStore)=>{
                    var _getTracer_getRootSpanAttributes;
                    // Check to see if we should bail out of static generation based on
                    // having non-static methods.
                    if (this.nonStaticMethods) {
                        this.staticGenerationBailout(`non-static methods used ${this.nonStaticMethods.join(", ")}`);
                    }
                    // Update the static generation store based on the dynamic property.
                    switch(this.dynamic){
                        case "force-dynamic":
                            // The dynamic property is set to force-dynamic, so we should
                            // force the page to be dynamic.
                            staticGenerationStore.forceDynamic = true;
                            this.staticGenerationBailout(`force-dynamic`, {
                                dynamic: this.dynamic
                            });
                            break;
                        case "force-static":
                            // The dynamic property is set to force-static, so we should
                            // force the page to be static.
                            staticGenerationStore.forceStatic = true;
                            break;
                        case "error":
                            // The dynamic property is set to error, so we should throw an
                            // error if the page is being statically generated.
                            staticGenerationStore.dynamicShouldError = true;
                            break;
                        default:
                            break;
                    }
                    // If the static generation store does not have a revalidate value
                    // set, then we should set it the revalidate value from the userland
                    // module or default to false.
                    staticGenerationStore.revalidate ??= this.userland.revalidate ?? false;
                    // Wrap the request so we can add additional functionality to cases
                    // that might change it's output or affect the rendering.
                    const wrappedRequest = proxyRequest(request, {
                        dynamic: this.dynamic
                    }, {
                        headerHooks: this.headerHooks,
                        serverHooks: this.serverHooks,
                        staticGenerationBailout: this.staticGenerationBailout
                    });
                    // TODO: propagate this pathname from route matcher
                    const route = getPathnameFromAbsolutePath(this.resolvedPagePath);
                    (_getTracer_getRootSpanAttributes = getTracer().getRootSpanAttributes()) == null ? void 0 : _getTracer_getRootSpanAttributes.set("next.route", route);
                    return getTracer().trace(AppRouteRouteHandlersSpan.runHandler, {
                        spanName: `executing api route (app) ${route}`,
                        attributes: {
                            "next.route": route
                        }
                    }, async ()=>{
                        var _staticGenerationStore_tags;
                        // Patch the global fetch.
                        patchFetch({
                            serverHooks: this.serverHooks,
                            staticGenerationAsyncStorage: this.staticGenerationAsyncStorage
                        });
                        const res = await handler(wrappedRequest, {
                            params: context.params
                        });
                        context.staticGenerationContext.fetchMetrics = staticGenerationStore.fetchMetrics;
                        await Promise.all(staticGenerationStore.pendingRevalidates || []);
                        addImplicitTags(staticGenerationStore);
                        context.staticGenerationContext.fetchTags = (_staticGenerationStore_tags = staticGenerationStore.tags) == null ? void 0 : _staticGenerationStore_tags.join(",");
                        // It's possible cookies were set in the handler, so we need
                        // to merge the modified cookies and the returned response
                        // here.
                        // TODO: Move this into a helper function.
                        const requestStore = this.requestAsyncStorage.getStore();
                        if (requestStore && requestStore.mutableCookies) {
                            const modifiedCookieValues = requestStore.mutableCookies[SYMBOL_MODIFY_COOKIE_VALUES];
                            if (modifiedCookieValues.length) {
                                // Return a new response that extends the response with
                                // the modified cookies as fallbacks. `res`' cookies
                                // will still take precedence.
                                const resCookies = new ResponseCookies(HeadersAdapter.from(res.headers));
                                const returnedCookies = resCookies.getAll();
                                // Set the modified cookies as fallbacks.
                                for (const cookie of modifiedCookieValues){
                                    resCookies.set(cookie);
                                }
                                // Set the original cookies as the final values.
                                for (const cookie of returnedCookies){
                                    resCookies.set(cookie);
                                }
                                const responseHeaders = new Headers({});
                                // Set all the headers except for the cookies.
                                res.headers.forEach((value, key)=>{
                                    if (key.toLowerCase() !== "set-cookie") {
                                        responseHeaders.append(key, value);
                                    }
                                });
                                // Set the final cookies, need to append cookies one
                                // at a time otherwise it might not work in some browsers.
                                resCookies.getAll().forEach((cookie)=>{
                                    const tempCookies = new ResponseCookies(new Headers());
                                    tempCookies.set(cookie);
                                    responseHeaders.append("Set-Cookie", tempCookies.toString());
                                });
                                return new Response(res.body, {
                                    status: res.status,
                                    statusText: res.statusText,
                                    headers: responseHeaders
                                });
                            }
                        }
                        return res;
                    });
                });
            });
        });
        // If the handler did't return a valid response, then return the internal
        // error response.
        if (!(response instanceof Response)) {
            // TODO: validate the correct handling behavior, maybe log something?
            return handleInternalServerErrorResponse();
        }
        if (response.headers.has("x-middleware-rewrite")) {
            // TODO: move this error into the `NextResponse.rewrite()` function.
            // TODO-APP: re-enable support below when we can proxy these type of requests
            throw new Error("NextResponse.rewrite() was used in a app route handler, this is not currently supported. Please remove the invocation to continue.");
        // // This is a rewrite created via `NextResponse.rewrite()`. We need to send
        // // the response up so it can be handled by the backing server.
        // // If the server is running in minimal mode, we just want to forward the
        // // response (including the rewrite headers) upstream so it can perform the
        // // redirect for us, otherwise return with the special condition so this
        // // server can perform a rewrite.
        // if (!minimalMode) {
        //   return { response, condition: 'rewrite' }
        // }
        // // Relativize the url so it's relative to the base url. This is so the
        // // outgoing headers upstream can be relative.
        // const rewritePath = response.headers.get('x-middleware-rewrite')!
        // const initUrl = getRequestMeta(req, '__NEXT_INIT_URL')!
        // const { pathname } = parseUrl(relativizeURL(rewritePath, initUrl))
        // response.headers.set('x-middleware-rewrite', pathname)
        }
        if (response.headers.get("x-middleware-next") === "1") {
            // TODO: move this error into the `NextResponse.next()` function.
            throw new Error("NextResponse.next() was used in a app route handler, this is not supported. See here for more info: https://nextjs.org/docs/messages/next-response-next-in-app-route-handler");
        }
        return response;
    }
    async handle(request, context) {
        try {
            // Execute the route to get the response.
            const response = await this.execute(request, context);
            // The response was handled, return it.
            return response;
        } catch (err) {
            // Try to resolve the error to a response, else throw it again.
            const response = resolveHandlerError(err);
            if (!response) throw err;
            // The response was resolved, return it.
            return response;
        }
    }
}
export default AppRouteRouteModule;

//# sourceMappingURL=module.js.map