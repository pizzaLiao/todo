"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    spans: null,
    webpackInvalidSpans: null,
    ProfilingPlugin: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    spans: function() {
        return spans;
    },
    webpackInvalidSpans: function() {
        return webpackInvalidSpans;
    },
    ProfilingPlugin: function() {
        return ProfilingPlugin;
    }
});
const _webpack = require("next/dist/compiled/webpack/webpack");
const pluginName = "ProfilingPlugin";
const spans = new WeakMap();
const moduleSpansByCompilation = new WeakMap();
const webpackInvalidSpans = new WeakMap();
class ProfilingPlugin {
    constructor({ runWebpackSpan  }){
        this.runWebpackSpan = runWebpackSpan;
    }
    apply(compiler) {
        this.traceTopLevelHooks(compiler);
        this.traceCompilationHooks(compiler);
        this.compiler = compiler;
    }
    traceHookPair(spanName, startHook, stopHook, { parentSpan , attrs , onStart , onStop  } = {}) {
        let span;
        startHook.tap({
            name: pluginName,
            stage: -Infinity
        }, (...params)=>{
            const name = typeof spanName === "function" ? spanName() : spanName;
            const attributes = attrs ? attrs(...params) : attrs;
            span = parentSpan ? parentSpan().traceChild(name, attributes) : this.runWebpackSpan.traceChild(name, attributes);
            if (onStart) onStart(span, ...params);
        });
        stopHook.tap({
            name: pluginName,
            stage: Infinity
        }, ()=>{
            // `stopHook` may be triggered when `startHook` has not in cases
            // where `stopHook` is used as the terminating event for more
            // than one pair of hooks.
            if (!span) {
                return;
            }
            if (onStop) onStop();
            span.stop();
        });
    }
    traceTopLevelHooks(compiler) {
        this.traceHookPair("webpack-compilation", compiler.hooks.compilation, compiler.hooks.afterCompile, {
            parentSpan: ()=>webpackInvalidSpans.get(compiler) || this.runWebpackSpan,
            attrs: ()=>({
                    name: compiler.name
                }),
            onStart: (span, compilation)=>{
                spans.set(compilation, span);
                spans.set(compiler, span);
                moduleSpansByCompilation.set(compilation, new WeakMap());
            }
        });
        if (compiler.options.mode === "development") {
            this.traceHookPair(()=>`webpack-invalidated-${compiler.name}`, compiler.hooks.invalid, compiler.hooks.done, {
                onStart: (span)=>webpackInvalidSpans.set(compiler, span),
                onStop: ()=>webpackInvalidSpans.delete(compiler),
                attrs: (fileName)=>({
                        trigger: fileName || "manual"
                    })
            });
        }
    }
    traceCompilationHooks(compiler) {
        this.traceHookPair("emit", compiler.hooks.emit, compiler.hooks.afterEmit, {
            parentSpan: ()=>webpackInvalidSpans.get(compiler) || this.runWebpackSpan
        });
        this.traceHookPair("make", compiler.hooks.make, compiler.hooks.finishMake, {
            parentSpan: ()=>webpackInvalidSpans.get(compiler) || this.runWebpackSpan
        });
        compiler.hooks.compilation.tap(pluginName, (compilation)=>{
            compilation.hooks.buildModule.tap(pluginName, (module1)=>{
                var _compilation_moduleGraph;
                const compilationSpan = spans.get(compilation);
                if (!compilationSpan) {
                    return;
                }
                const moduleType = (()=>{
                    if (!module1.userRequest) {
                        return "";
                    }
                    return module1.userRequest.split(".").pop();
                })();
                const issuerModule = compilation == null ? void 0 : (_compilation_moduleGraph = compilation.moduleGraph) == null ? void 0 : _compilation_moduleGraph.getIssuer(module1);
                let span;
                const moduleSpans = moduleSpansByCompilation.get(compilation);
                const spanName = `build-module${moduleType ? `-${moduleType}` : ""}`;
                const issuerSpan = issuerModule && (moduleSpans == null ? void 0 : moduleSpans.get(issuerModule));
                if (issuerSpan) {
                    span = issuerSpan.traceChild(spanName);
                } else {
                    span = compilationSpan.traceChild(spanName);
                }
                span.setAttribute("name", module1.userRequest);
                moduleSpans.set(module1, span);
            });
            const moduleHooks = _webpack.NormalModule.getCompilationHooks(compilation);
            // @ts-ignore TODO: remove ignore when using webpack 5 types
            moduleHooks.readResource.for(undefined).intercept({
                register (tapInfo) {
                    const fn = tapInfo.fn;
                    tapInfo.fn = (loaderContext, callback)=>{
                        const moduleSpan = loaderContext.currentTraceSpan.traceChild(`read-resource`);
                        fn(loaderContext, (err, result)=>{
                            moduleSpan.stop();
                            callback(err, result);
                        });
                    };
                    return tapInfo;
                }
            });
            moduleHooks.loader.tap(pluginName, (loaderContext, module1)=>{
                var _moduleSpansByCompilation_get;
                const moduleSpan = (_moduleSpansByCompilation_get = moduleSpansByCompilation.get(compilation)) == null ? void 0 : _moduleSpansByCompilation_get.get(module1);
                loaderContext.currentTraceSpan = moduleSpan;
            });
            compilation.hooks.succeedModule.tap(pluginName, (module1)=>{
                var _moduleSpansByCompilation_get_get, _moduleSpansByCompilation_get;
                (_moduleSpansByCompilation_get_get = (_moduleSpansByCompilation_get = moduleSpansByCompilation == null ? void 0 : moduleSpansByCompilation.get(compilation)) == null ? void 0 : _moduleSpansByCompilation_get.get(module1)) == null ? void 0 : _moduleSpansByCompilation_get_get.stop();
            });
            this.traceHookPair("webpack-compilation-seal", compilation.hooks.seal, compilation.hooks.afterSeal, {
                parentSpan: ()=>spans.get(compilation)
            });
            compilation.hooks.addEntry.tap(pluginName, (entry)=>{
                const compilationSpan = spans.get(compilation);
                if (!compilationSpan) {
                    return;
                }
                const addEntrySpan = compilationSpan.traceChild("add-entry");
                addEntrySpan.setAttribute("request", entry.request);
                spans.set(entry, addEntrySpan);
            });
            compilation.hooks.succeedEntry.tap(pluginName, (entry)=>{
                var _spans_get;
                (_spans_get = spans.get(entry)) == null ? void 0 : _spans_get.stop();
            });
            this.traceHookPair("webpack-compilation-chunk-graph", compilation.hooks.beforeChunks, compilation.hooks.afterChunks, {
                parentSpan: ()=>spans.get(compilation) || spans.get(compiler)
            });
            this.traceHookPair("webpack-compilation-optimize", compilation.hooks.optimize, compilation.hooks.reviveModules, {
                parentSpan: ()=>spans.get(compilation) || spans.get(compiler)
            });
            this.traceHookPair("webpack-compilation-optimize-modules", compilation.hooks.optimizeModules, compilation.hooks.afterOptimizeModules, {
                parentSpan: ()=>spans.get(compilation) || spans.get(compiler)
            });
            this.traceHookPair("webpack-compilation-optimize-chunks", compilation.hooks.optimizeChunks, compilation.hooks.afterOptimizeChunks, {
                parentSpan: ()=>spans.get(compilation) || spans.get(compiler)
            });
            this.traceHookPair("webpack-compilation-optimize-tree", compilation.hooks.optimizeTree, compilation.hooks.afterOptimizeTree, {
                parentSpan: ()=>spans.get(compilation) || spans.get(compiler)
            });
            this.traceHookPair("webpack-compilation-hash", compilation.hooks.beforeHash, compilation.hooks.afterHash, {
                parentSpan: ()=>spans.get(compilation) || spans.get(compiler)
            });
        });
    }
}

//# sourceMappingURL=profiling-plugin.js.map