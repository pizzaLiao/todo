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
const _getmodulebuildinfo = require("./get-module-build-info");
const _stringifyrequest = require("../stringify-request");
const nextEdgeFunctionLoader = function nextEdgeFunctionLoader() {
    const { absolutePagePath , page , rootDir , preferredRegion  } = this.getOptions();
    const stringifiedPagePath = (0, _stringifyrequest.stringifyRequest)(this, absolutePagePath);
    const buildInfo = (0, _getmodulebuildinfo.getModuleBuildInfo)(this._module);
    buildInfo.route = {
        page: page || "/",
        absolutePagePath,
        preferredRegion
    };
    buildInfo.nextEdgeApiFunction = {
        page: page || "/"
    };
    buildInfo.rootDir = rootDir;
    return `
        import { adapter, enhanceGlobals } from 'next/dist/esm/server/web/adapter'
        import {IncrementalCache} from 'next/dist/esm/server/lib/incremental-cache'

        enhanceGlobals()

        var mod = require(${stringifiedPagePath})
        var handler = mod.middleware || mod.default;

        if (typeof handler !== 'function') {
          throw new Error('The Edge Function "pages${page}" must export a \`default\` function');
        }

        export default function (opts) {
          return adapter({
              ...opts,
              IncrementalCache,
              page: ${JSON.stringify(page)},
              handler,
          })
        }
    `;
};
const _default = nextEdgeFunctionLoader;

//# sourceMappingURL=next-edge-function-loader.js.map