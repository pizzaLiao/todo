"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _getmodulebuildinfo = require("../get-module-build-info");
const _stringifyrequest = require("../../stringify-request");
const EdgeAppRouteLoader = async function() {
    const { page , absolutePagePath , preferredRegion , appDirLoader: appDirLoaderBase64 = ""  } = this.getOptions();
    const appDirLoader = Buffer.from(appDirLoaderBase64, "base64").toString();
    // Ensure we only run this loader for as a module.
    if (!this._module) throw new Error("This loader is only usable as a module");
    const buildInfo = (0, _getmodulebuildinfo.getModuleBuildInfo)(this._module);
    buildInfo.nextEdgeSSR = {
        isServerComponent: false,
        page: page,
        isAppDir: true
    };
    buildInfo.route = {
        page,
        absolutePagePath,
        preferredRegion
    };
    const stringifiedPagePath = (0, _stringifyrequest.stringifyRequest)(this, absolutePagePath);
    const modulePath = `${appDirLoader}${stringifiedPagePath.substring(1, stringifiedPagePath.length - 1)}?__edge_ssr_entry__`;
    return `
    import { EdgeRouteModuleWrapper } from 'next/dist/esm/server/web/edge-route-module-wrapper'
    import * as module from ${JSON.stringify(modulePath)}

    export const ComponentMod = module

    export default EdgeRouteModuleWrapper.wrap(module.routeModule)`;
};
const _default = EdgeAppRouteLoader;

//# sourceMappingURL=index.js.map