/* eslint-disable @typescript-eslint/no-use-before-define */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    __isCustomTurbopackBinary: null,
    lockfilePatchPromise: null,
    loadBindings: null,
    isWasm: null,
    transform: null,
    transformSync: null,
    minify: null,
    minifySync: null,
    parse: null,
    getBinaryMetadata: null,
    initCustomTraceSubscriber: null,
    initHeapProfiler: null,
    teardownHeapProfiler: null,
    teardownTraceSubscriber: null,
    teardownCrashReporter: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    __isCustomTurbopackBinary: function() {
        return __isCustomTurbopackBinary;
    },
    lockfilePatchPromise: function() {
        return lockfilePatchPromise;
    },
    loadBindings: function() {
        return loadBindings;
    },
    isWasm: function() {
        return isWasm;
    },
    transform: function() {
        return transform;
    },
    transformSync: function() {
        return transformSync;
    },
    minify: function() {
        return minify;
    },
    minifySync: function() {
        return minifySync;
    },
    parse: function() {
        return parse;
    },
    getBinaryMetadata: function() {
        return getBinaryMetadata;
    },
    initCustomTraceSubscriber: function() {
        return initCustomTraceSubscriber;
    },
    initHeapProfiler: function() {
        return initHeapProfiler;
    },
    teardownHeapProfiler: function() {
        return teardownHeapProfiler;
    },
    teardownTraceSubscriber: function() {
        return teardownTraceSubscriber;
    },
    teardownCrashReporter: function() {
        return teardownCrashReporter;
    }
});
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _url = require("url");
const _os = require("os");
const _triples = require("next/dist/compiled/@napi-rs/triples");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../output/log"));
const _options = require("./options");
const _swcloadfailure = require("../../telemetry/events/swc-load-failure");
const _patchincorrectlockfile = require("../../lib/patch-incorrect-lockfile");
const _downloadwasmswc = require("../../lib/download-wasm-swc");
const _child_process = require("child_process");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
var _platformArchTriples_PlatformName;
const nextVersion = "13.4.2";
const ArchName = (0, _os.arch)();
const PlatformName = (0, _os.platform)();
const triples = ((_platformArchTriples_PlatformName = _triples.platformArchTriples[PlatformName]) == null ? void 0 : _platformArchTriples_PlatformName[ArchName]) || [];
const infoLog = (...args)=>{
    if (process.env.NEXT_PRIVATE_BUILD_WORKER) {
        return;
    }
    _log.info(...args);
};
// Allow to specify an absolute path to the custom turbopack binary to load.
// If one of env variables is set, `loadNative` will try to use any turbo-* interfaces from specified
// binary instead. This will not affect existing swc's transform, or other interfaces. This is thin,
// naive interface - `loadBindings` will not validate neither path nor the binary.
//
// Note these are internal flag: there's no stability, feature guarantee.
const __INTERNAL_CUSTOM_TURBOPACK_BINARY = process.env.__INTERNAL_CUSTOM_TURBOPACK_BINARY;
const __INTERNAL_CUSTOM_TURBOPACK_BINDINGS = process.env.__INTERNAL_CUSTOM_TURBOPACK_BINDINGS;
const __isCustomTurbopackBinary = async ()=>{
    if (!!__INTERNAL_CUSTOM_TURBOPACK_BINARY && !!__INTERNAL_CUSTOM_TURBOPACK_BINDINGS) {
        throw new Error("Cannot use TURBOPACK_BINARY and TURBOPACK_BINDINGS both");
    }
    return !!__INTERNAL_CUSTOM_TURBOPACK_BINARY || !!__INTERNAL_CUSTOM_TURBOPACK_BINDINGS;
};
function checkVersionMismatch(pkgData) {
    const version = pkgData.version;
    if (version && version !== nextVersion) {
        _log.warn(`Mismatching @next/swc version, detected: ${version} while Next.js is on ${nextVersion}. Please ensure these match`);
    }
}
// These are the platforms we'll try to load wasm bindings first,
// only try to load native bindings if loading wasm binding somehow fails.
// Fallback to native binding is for migration period only,
// once we can verify loading-wasm-first won't cause visible regressions,
// we'll not include native bindings for these platform at all.
const knownDefaultWasmFallbackTriples = [
    "aarch64-linux-android",
    "x86_64-unknown-freebsd",
    "aarch64-pc-windows-msvc",
    "arm-linux-androideabi",
    "armv7-unknown-linux-gnueabihf",
    "i686-pc-windows-msvc"
];
let nativeBindings;
let wasmBindings;
let downloadWasmPromise;
let pendingBindings;
let swcTraceFlushGuard;
let swcHeapProfilerFlushGuard;
let swcCrashReporterFlushGuard;
const lockfilePatchPromise = {};
async function loadBindings() {
    if (pendingBindings) {
        return pendingBindings;
    }
    const isCustomTurbopack = await __isCustomTurbopackBinary();
    pendingBindings = new Promise(async (resolve, _reject)=>{
        if (!lockfilePatchPromise.cur) {
            // always run lockfile check once so that it gets patched
            // even if it doesn't fail to load locally
            lockfilePatchPromise.cur = (0, _patchincorrectlockfile.patchIncorrectLockfile)(process.cwd()).catch(console.error);
        }
        let attempts = [];
        const shouldLoadWasmFallbackFirst = triples.some((triple)=>{
            return !!(triple == null ? void 0 : triple.raw) && knownDefaultWasmFallbackTriples.includes(triple.raw);
        });
        if (shouldLoadWasmFallbackFirst) {
            const fallbackBindings = await tryLoadWasmWithFallback(attempts, isCustomTurbopack);
            if (fallbackBindings) {
                return resolve(fallbackBindings);
            }
        }
        try {
            return resolve(loadNative(isCustomTurbopack));
        } catch (a) {
            attempts = attempts.concat(a);
        }
        // For these platforms we already tried to load wasm and failed, skip reattempt
        if (!shouldLoadWasmFallbackFirst) {
            const fallbackBindings = await tryLoadWasmWithFallback(attempts, isCustomTurbopack);
            if (fallbackBindings) {
                return resolve(fallbackBindings);
            }
        }
        logLoadFailure(attempts, true);
    });
    return pendingBindings;
}
async function tryLoadWasmWithFallback(attempts, isCustomTurbopack) {
    try {
        let bindings = await loadWasm("", isCustomTurbopack);
        // @ts-expect-error TODO: this event has a wrong type.
        (0, _swcloadfailure.eventSwcLoadFailure)({
            wasm: "enabled"
        });
        return bindings;
    } catch (a) {
        attempts = attempts.concat(a);
    }
    try {
        // if not installed already download wasm package on-demand
        // we download to a custom directory instead of to node_modules
        // as node_module import attempts are cached and can't be re-attempted
        // x-ref: https://github.com/nodejs/modules/issues/307
        const wasmDirectory = _path.default.join(_path.default.dirname(require.resolve("next/package.json")), "wasm");
        if (!downloadWasmPromise) {
            downloadWasmPromise = (0, _downloadwasmswc.downloadWasmSwc)(nextVersion, wasmDirectory);
        }
        await downloadWasmPromise;
        let bindings = await loadWasm((0, _url.pathToFileURL)(wasmDirectory).href, isCustomTurbopack);
        // @ts-expect-error TODO: this event has a wrong type.
        (0, _swcloadfailure.eventSwcLoadFailure)({
            wasm: "fallback"
        });
        // still log native load attempts so user is
        // aware it failed and should be fixed
        for (const attempt of attempts){
            _log.warn(attempt);
        }
        return bindings;
    } catch (a) {
        attempts = attempts.concat(a);
    }
}
function loadBindingsSync() {
    let attempts = [];
    try {
        return loadNative();
    } catch (a) {
        attempts = attempts.concat(a);
    }
    // we can leverage the wasm bindings if they are already
    // loaded
    if (wasmBindings) {
        return wasmBindings;
    }
    logLoadFailure(attempts);
}
let loggingLoadFailure = false;
function logLoadFailure(attempts, triedWasm = false) {
    // make sure we only emit the event and log the failure once
    if (loggingLoadFailure) return;
    loggingLoadFailure = true;
    for (let attempt of attempts){
        _log.warn(attempt);
    }
    // @ts-expect-error TODO: this event has a wrong type.
    (0, _swcloadfailure.eventSwcLoadFailure)({
        wasm: triedWasm ? "failed" : undefined
    }).then(()=>lockfilePatchPromise.cur || Promise.resolve()).finally(()=>{
        _log.error(`Failed to load SWC binary for ${PlatformName}/${ArchName}, see more info here: https://nextjs.org/docs/messages/failed-loading-swc`);
        process.exit(1);
    });
}
async function loadWasm(importPath = "", isCustomTurbopack) {
    if (wasmBindings) {
        return wasmBindings;
    }
    let attempts = [];
    for (let pkg of [
        "@next/swc-wasm-nodejs",
        "@next/swc-wasm-web"
    ]){
        try {
            let pkgPath = pkg;
            if (importPath) {
                // the import path must be exact when not in node_modules
                pkgPath = _path.default.join(importPath, pkg, "wasm.js");
            }
            let bindings = await import(pkgPath);
            if (pkg === "@next/swc-wasm-web") {
                bindings = await bindings.default();
            }
            infoLog("Using wasm build of next-swc");
            // Note wasm binary does not support async intefaces yet, all async
            // interface coereces to sync interfaces.
            wasmBindings = {
                isWasm: true,
                transform (src, options) {
                    // TODO: we can remove fallback to sync interface once new stable version of next-swc gets published (current v12.2)
                    return (bindings == null ? void 0 : bindings.transform) ? bindings.transform(src.toString(), options) : Promise.resolve(bindings.transformSync(src.toString(), options));
                },
                transformSync (src, options) {
                    return bindings.transformSync(src.toString(), options);
                },
                minify (src, options) {
                    return (bindings == null ? void 0 : bindings.minify) ? bindings.minify(src.toString(), options) : Promise.resolve(bindings.minifySync(src.toString(), options));
                },
                minifySync (src, options) {
                    return bindings.minifySync(src.toString(), options);
                },
                parse (src, options) {
                    return (bindings == null ? void 0 : bindings.parse) ? bindings.parse(src.toString(), options) : Promise.resolve(bindings.parseSync(src.toString(), options));
                },
                parseSync (src, options) {
                    const astStr = bindings.parseSync(src.toString(), options);
                    return astStr;
                },
                getTargetTriple () {
                    return undefined;
                },
                turbo: {
                    startDev: (options)=>{
                        if (!isCustomTurbopack) {
                            _log.error("Wasm binding does not support --turbo yet");
                            return;
                        } else if (!!__INTERNAL_CUSTOM_TURBOPACK_BINDINGS) {
                            _log.warn("Trying to load custom turbopack bindings. Note this is internal testing purpose only, actual wasm fallback cannot load this bindings");
                            _log.warn(`Loading custom turbopack bindings from ${__INTERNAL_CUSTOM_TURBOPACK_BINDINGS}`);
                            const devOptions = {
                                ...options,
                                noOpen: options.noOpen ?? true
                            };
                            require(__INTERNAL_CUSTOM_TURBOPACK_BINDINGS).startTurboDev(toBuffer(devOptions));
                        }
                    },
                    startTrace: ()=>{
                        _log.error("Wasm binding does not support trace yet");
                    },
                    entrypoints: {
                        stream: (turboTasks, rootDir, applicationDir, pageExtensions, callbackFn)=>{
                            return bindings.streamEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions, callbackFn);
                        },
                        get: (turboTasks, rootDir, applicationDir, pageExtensions)=>{
                            return bindings.getEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions);
                        }
                    }
                },
                mdx: {
                    compile: (src, options)=>bindings.mdxCompile(src, options),
                    compileSync: (src, options)=>bindings.mdxCompileSync(src, options)
                }
            };
            return wasmBindings;
        } catch (e) {
            // Only log attempts for loading wasm when loading as fallback
            if (importPath) {
                if ((e == null ? void 0 : e.code) === "ERR_MODULE_NOT_FOUND") {
                    attempts.push(`Attempted to load ${pkg}, but it was not installed`);
                } else {
                    attempts.push(`Attempted to load ${pkg}, but an error occurred: ${e.message ?? e}`);
                }
            }
        }
    }
    throw attempts;
}
function loadNative(isCustomTurbopack = false) {
    if (nativeBindings) {
        return nativeBindings;
    }
    let bindings;
    let attempts = [];
    for (const triple of triples){
        try {
            bindings = require(`@next/swc/native/next-swc.${triple.platformArchABI}.node`);
            infoLog("Using locally built binary of @next/swc");
            break;
        } catch (e) {}
    }
    if (!bindings) {
        for (const triple of triples){
            let pkg = `@next/swc-${triple.platformArchABI}`;
            try {
                bindings = require(pkg);
                checkVersionMismatch(require(`${pkg}/package.json`));
                break;
            } catch (e) {
                if ((e == null ? void 0 : e.code) === "MODULE_NOT_FOUND") {
                    attempts.push(`Attempted to load ${pkg}, but it was not installed`);
                } else {
                    attempts.push(`Attempted to load ${pkg}, but an error occurred: ${e.message ?? e}`);
                }
            }
        }
    }
    if (bindings) {
        // Initialize crash reporter, as earliest as possible from any point of import.
        // The first-time import to next-swc is not predicatble in the import tree of next.js, which makes
        // we can't rely on explicit manual initialization as similar to trace reporter.
        if (!swcCrashReporterFlushGuard) {
        // Crash reports in next-swc should be treated in the same way we treat telemetry to opt out.
        /* TODO: temporarily disable initialization while confirming logistics.
      let telemetry = new Telemetry({ distDir: process.cwd() })
      if (telemetry.isEnabled) {
        swcCrashReporterFlushGuard = bindings.initCrashReporter?.()
      }*/ }
        nativeBindings = {
            isWasm: false,
            transform (src, options) {
                var _options_jsc;
                const isModule = typeof src !== undefined && typeof src !== "string" && !Buffer.isBuffer(src);
                options = options || {};
                if (options == null ? void 0 : (_options_jsc = options.jsc) == null ? void 0 : _options_jsc.parser) {
                    options.jsc.parser.syntax = options.jsc.parser.syntax ?? "ecmascript";
                }
                return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
            },
            transformSync (src, options) {
                var _options_jsc;
                if (typeof src === undefined) {
                    throw new Error("transformSync doesn't implement reading the file from filesystem");
                } else if (Buffer.isBuffer(src)) {
                    throw new Error("transformSync doesn't implement taking the source code as Buffer");
                }
                const isModule = typeof src !== "string";
                options = options || {};
                if (options == null ? void 0 : (_options_jsc = options.jsc) == null ? void 0 : _options_jsc.parser) {
                    options.jsc.parser.syntax = options.jsc.parser.syntax ?? "ecmascript";
                }
                return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
            },
            minify (src, options) {
                return bindings.minify(toBuffer(src), toBuffer(options ?? {}));
            },
            minifySync (src, options) {
                return bindings.minifySync(toBuffer(src), toBuffer(options ?? {}));
            },
            parse (src, options) {
                return bindings.parse(src, toBuffer(options ?? {}));
            },
            getTargetTriple: bindings.getTargetTriple,
            initCustomTraceSubscriber: bindings.initCustomTraceSubscriber,
            teardownTraceSubscriber: bindings.teardownTraceSubscriber,
            initHeapProfiler: bindings.initHeapProfiler,
            teardownHeapProfiler: bindings.teardownHeapProfiler,
            teardownCrashReporter: bindings.teardownCrashReporter,
            turbo: {
                startDev: (options)=>{
                    initHeapProfiler();
                    const devOptions = {
                        ...options,
                        noOpen: options.noOpen ?? true
                    };
                    if (!isCustomTurbopack) {
                        bindings.startTurboDev(toBuffer(devOptions));
                    } else if (!!__INTERNAL_CUSTOM_TURBOPACK_BINARY) {
                        console.warn(`Loading custom turbopack binary from ${__INTERNAL_CUSTOM_TURBOPACK_BINARY}`);
                        return new Promise((resolve, reject)=>{
                            const args = [];
                            Object.entries(devOptions).forEach(([key, value])=>{
                                let cli_key = `--${key.replace(/[A-Z]/g, (m)=>"-" + m.toLowerCase())}`;
                                if (key === "dir") {
                                    args.push(value);
                                } else if (typeof value === "boolean" && value === true) {
                                    args.push(cli_key);
                                } else if (typeof value !== "boolean" && !!value) {
                                    args.push(cli_key, value);
                                }
                            });
                            console.warn(`Running turbopack with args: [${args.join(" ")}]`);
                            let child = (0, _child_process.spawn)(__INTERNAL_CUSTOM_TURBOPACK_BINARY, args, {
                                stdio: "pipe"
                            });
                            child.on("message", (message)=>{
                                require("console").log(message);
                            });
                            child.stdout.on("data", (data)=>{
                                require("console").log(data.toString());
                            });
                            child.stderr.on("data", (data)=>{
                                require("console").log(data.toString());
                            });
                            child.on("close", (code)=>{
                                if (code !== 0) {
                                    reject({
                                        command: `${__INTERNAL_CUSTOM_TURBOPACK_BINARY} ${args.join(" ")}`
                                    });
                                    return;
                                }
                                resolve(0);
                            });
                            process.on("beforeExit", ()=>{
                                if (child) {
                                    console.log("Killing turbopack process");
                                    child.kill();
                                    child = null;
                                }
                            });
                        });
                    } else if (!!__INTERNAL_CUSTOM_TURBOPACK_BINDINGS) {
                        console.warn(`Loading custom turbopack bindings from ${__INTERNAL_CUSTOM_TURBOPACK_BINDINGS}`);
                        console.warn(`Running turbopack with args: `, devOptions);
                        require(__INTERNAL_CUSTOM_TURBOPACK_BINDINGS).startTurboDev(toBuffer(devOptions));
                    }
                },
                nextBuild: (options)=>{
                    initHeapProfiler();
                    const ret = bindings.nextBuild(options);
                    return ret;
                },
                startTrace: (options = {}, turboTasks)=>{
                    initHeapProfiler();
                    const ret = bindings.runTurboTracing(toBuffer({
                        exact: true,
                        ...options
                    }), turboTasks);
                    return ret;
                },
                createTurboTasks: (memoryLimit)=>bindings.createTurboTasks(memoryLimit),
                entrypoints: {
                    stream: (turboTasks, rootDir, applicationDir, pageExtensions)=>{
                        return bindings.streamEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions);
                    },
                    get: (turboTasks, rootDir, applicationDir, pageExtensions)=>{
                        return bindings.getEntrypoints(turboTasks, rootDir, applicationDir, pageExtensions);
                    }
                }
            },
            mdx: {
                compile: (src, options)=>bindings.mdxCompile(src, toBuffer(options ?? {})),
                compileSync: (src, options)=>bindings.mdxCompileSync(src, toBuffer(options ?? {}))
            }
        };
        return nativeBindings;
    }
    throw attempts;
}
function toBuffer(t) {
    return Buffer.from(JSON.stringify(t));
}
async function isWasm() {
    let bindings = await loadBindings();
    return bindings.isWasm;
}
async function transform(src, options) {
    let bindings = await loadBindings();
    return bindings.transform(src, options);
}
function transformSync(src, options) {
    let bindings = loadBindingsSync();
    return bindings.transformSync(src, options);
}
async function minify(src, options) {
    let bindings = await loadBindings();
    return bindings.minify(src, options);
}
function minifySync(src, options) {
    let bindings = loadBindingsSync();
    return bindings.minifySync(src, options);
}
async function parse(src, options) {
    let bindings = await loadBindings();
    let parserOptions = (0, _options.getParserOptions)(options);
    return bindings.parse(src, parserOptions).then((astStr)=>JSON.parse(astStr));
}
function getBinaryMetadata() {
    let bindings;
    try {
        bindings = loadNative();
    } catch (e) {
    // Suppress exceptions, this fn allows to fail to load native bindings
    }
    return {
        target: bindings == null ? void 0 : bindings.getTargetTriple == null ? void 0 : bindings.getTargetTriple()
    };
}
const initCustomTraceSubscriber = (traceFileName)=>{
    if (!swcTraceFlushGuard) {
        // Wasm binary doesn't support trace emission
        let bindings = loadNative();
        swcTraceFlushGuard = bindings.initCustomTraceSubscriber(traceFileName);
    }
};
const initHeapProfiler = ()=>{
    try {
        if (!swcHeapProfilerFlushGuard) {
            let bindings = loadNative();
            swcHeapProfilerFlushGuard = bindings.initHeapProfiler();
        }
    } catch (_) {
    // Suppress exceptions, this fn allows to fail to load native bindings
    }
};
const teardownHeapProfiler = (()=>{
    let flushed = false;
    return ()=>{
        if (!flushed) {
            flushed = true;
            try {
                let bindings = loadNative();
                if (swcHeapProfilerFlushGuard) {
                    bindings.teardownHeapProfiler(swcHeapProfilerFlushGuard);
                }
            } catch (e) {
            // Suppress exceptions, this fn allows to fail to load native bindings
            }
        }
    };
})();
const teardownTraceSubscriber = (()=>{
    let flushed = false;
    return ()=>{
        if (!flushed) {
            flushed = true;
            try {
                let bindings = loadNative();
                if (swcTraceFlushGuard) {
                    bindings.teardownTraceSubscriber(swcTraceFlushGuard);
                }
            } catch (e) {
            // Suppress exceptions, this fn allows to fail to load native bindings
            }
        }
    };
})();
const teardownCrashReporter = (()=>{
    let flushed = false;
    return ()=>{
        if (!flushed) {
            flushed = true;
            try {
                let bindings = loadNative();
                if (swcCrashReporterFlushGuard) {
                    bindings.teardownCrashReporter(swcCrashReporterFlushGuard);
                }
            } catch (e) {
            // Suppress exceptions, this fn allows to fail to load native bindings
            }
        }
    };
})();

//# sourceMappingURL=index.js.map