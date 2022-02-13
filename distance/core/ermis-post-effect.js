
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ./ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_common_1 = __importDefault(__webpack_require__(/*! ../utilities/ermis-common */ "./src/utilities/ermis-common.ts"));
class ErmisPostEffect {
    constructor(app, effects, script) {
        this.resolution = [0, 0];
        this.matrix = new pc.Mat4();
        this.matrixPrevious = new pc.Mat4();
        this.primitive = {
            type: pc.PRIMITIVE_TRISTRIP,
            base: 0,
            count: 4,
            indexed: false
        };
        this.app = app;
        this.effects = effects;
        this.camera = script.camera;
        this.script = script;
        this.frame = 0;
        this.extendPcPostEffect();
        this.getUniquePasses();
        this.app.graphicsDevice.on("resizecanvas", this.resizeRenderTargets, this);
        script.on("destroy", () => {
            this.app.graphicsDevice.off("resizecanvas", this.resizeRenderTargets, this);
        });
    }
    extendPcPostEffect() {
        // @ts-ignore
        pc.PostEffect.call(this, this.app.graphicsDevice);
        // --- request the creation of a depth map, only in WebGL1, in 2 we are overriding the default methods
        // @ts-ignore
        if (this.app.graphicsDevice.webgl2 === false) {
            this.needsDepthBuffer = true;
        }
    }
    instantiatePassFromID(id) {
        switch (id
        // case "PassDepth":
        //   return new ErmisPassDepth();
        ) {
        }
    }
    getUniquePasses() {
        this.passes = [];
        this.effectsUniforms = [];
        this.perEffectUniformsObj = {};
        this.renderOrders = [];
        for (const effect of this.effects) {
            // --- gather all effect uniforms first
            const uniformsList = effect.getUniforms();
            const definesList = ermis_effect_1.ErmisEffect.getDefinesFromUniforms(effect.getUniforms());
            const effectUniforms = {
                uniforms: uniformsList,
                uniformsStr: ermis_effect_1.ErmisEffect.uniformsToString(uniformsList),
                defines: definesList,
                definesStr: ermis_effect_1.ErmisEffect.definesToString(definesList)
            };
            this.perEffectUniformsObj[effect.name] = effectUniforms;
            // --- check if uniform has already been defined
            for (const uniform of effectUniforms.uniforms) {
                if (!uniform.type)
                    continue;
                if (this.effectsUniforms.find((uniformToCheck) => {
                    return uniform.name === uniformToCheck.name;
                }) === undefined) {
                    this.effectsUniforms.push(uniform);
                }
            }
            // --- collect all render passes
            let count = 0;
            for (const pass of effect.passes) {
                let passID = typeof pass === "object" ? pass.name : pass;
                // --- if pass is provided by string to instantiate, check if pass already exists. We require that only once
                if (typeof pass === "string" &&
                    this.passes.find((passToCheck) => passToCheck.name === passID) !== undefined)
                    continue;
                // --- otherwise add it to the list, and instantiate it if necessary
                let finalPass;
                if (typeof pass === "string") {
                    finalPass = this.instantiatePassFromID(passID);
                }
                else {
                    finalPass = pass;
                }
                this.passes.push(finalPass);
                // --- generate a render order
                count++;
                const rt = ErmisPostEffect.createRenderTarget(this.app, pass, count);
                pass.renderTarget = rt;
                pass.onInit(this.script, effect, this.app);
                this.renderOrders.push({
                    shader: this.createShader(effect, finalPass),
                    pass: finalPass,
                    effect: effect,
                    target: rt
                });
            }
            effect.onEnable(this.app);
        }
    }
    getShaderDefinition(perEffectUniforms, pass) {
        let vshader;
        // @ts-ignore
        const isGL2 = this.app.graphicsDevice.webgl2;
        const passVS = pass.getVS(isGL2);
        if (passVS) {
            vshader = passVS + "\n// Ermis shader;";
        }
        else {
            vshader = `attribute vec2 aPosition;
        
      // Ermis shader;

      varying vec2 vUv0;
      
      void main(void)
      {
          gl_Position = vec4(aPosition, 0.0, 1.0);
          vUv0 = (aPosition.xy + 1.0) * 0.5;
      }`;
        }
        let isES3 = false;
        let extensions = "";
        let varying = "varying vec2 vUv0;";
        if (isGL2 === true && pass.getVersionES(isGL2) === 3) {
            extensions += "#version 300 es";
            varying = "in vec2 vUv0;";
            isES3 = true;
        }
        extensions += pass.getExtensions(isGL2);
        const definition = {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: vshader,
            fshader: `${extensions}  
        precision ${this.app.graphicsDevice.precision} float;

        // Ermis shader;

        ${isGL2 ? "#define GL2\n" : ""}
        ${isES3 ? "#define ES3\n" : ""}

        ${perEffectUniforms.definesStr}

        ${perEffectUniforms.uniformsStr}

        ${varying}

        ${ermis_common_1.default.fragmentMethods}

        ${pass.getPS(isGL2)}
      `,
            useTransformFeedback: undefined
        };
        return definition;
    }
    createShader(effect, pass) {
        return new pc.Shader(this.app.graphicsDevice, this.getShaderDefinition(this.perEffectUniformsObj[effect.name], pass), undefined);
    }
    static createRenderTarget(app, pass, count) {
        pass.width = pass.width ? pass.width : app.graphicsDevice.width;
        pass.height = pass.height ? pass.height : app.graphicsDevice.height;
        const colorBuffer = new pc.Texture(app.graphicsDevice, {
            format: pc.PIXELFORMAT_R8_G8_B8_A8,
            width: pass.width,
            height: pass.height
        });
        colorBuffer.name = `${pass.name}${count}RT`;
        const rt = new pc.RenderTarget({
            colorBuffer: colorBuffer,
            //depth: true,
            samples: pass.samples
        });
        // @ts-ignore
        rt.ermisCanResize = pass.canResize;
        if (pass.canResize === true) {
            colorBuffer.minFilter = pc.FILTER_NEAREST;
            colorBuffer.magFilter = pc.FILTER_NEAREST;
            colorBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
            colorBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
        }
        return rt;
    }
    resizeRenderTargets() {
        for (const order of this.renderOrders) {
            // @ts-ignore
            this.camera.camera.postEffects._resizeOffscreenTarget(order.target);
        }
    }
    render(inputTarget, outputTarget, rect) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!inputTarget)
                return;
            const device = this.device;
            const scope = device.scope;
            // --- add common global uniforms
            scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
            // @ts-ignore
            if (this.app.graphicsDevice.webgl2 === true)
                scope.resolve("uDepthMap").setValue(this.script.depthBuffer);
            scope.resolve("cameraNear").setValue(this.camera.camera.nearClip);
            scope.resolve("cameraFar").setValue(this.camera.camera.farClip);
            scope.resolve("time").setValue(this.script.time);
            scope.resolve("delta").setValue(this.script.delta);
            scope
                .resolve("matrix_viewProjectionPrevious")
                .setValue(this.matrixPrevious.data);
            scope
                .resolve("matrix_viewProjectionInversePrevious")
                .setValue(this.matrix.data);
            const matrixValue = scope.resolve("matrix_viewProjection").getValue();
            this.matrix.set(matrixValue);
            this.matrix.invert();
            scope.resolve("matrix_viewProjectionInverse").setValue(this.matrix.data);
            this.resolution[0] = device.width;
            this.resolution[1] = device.height;
            scope.resolve("resolution").setValue(this.resolution);
            // --- put all effect uniforms to the global scope and assign values
            for (const effectUniform of this.effectsUniforms) {
                if (effectUniform.define === true || !effectUniform.type)
                    continue;
                const value = ermis_effect_1.ErmisEffect.getUniformValue(effectUniform, this.app, this.camera);
                scope.resolve(effectUniform.name).setValue(value ? value : 0);
            }
            // --- decide final output target before entering the main render loop
            let lastPassCount;
            for (let i = this.renderOrders.length - 1; i >= 0; i--) {
                if (this.renderOrders[i].pass.offscreen === false) {
                    lastPassCount = i + 1;
                    break;
                }
            }
            // --- all passes are rendering offscreen, return
            // if (!lastPassCount) {
            //   return;
            // }
            // --- render the passes
            let count = 0;
            this.frame++;
            let previousOrder;
            let currentOrder;
            for (const order of this.renderOrders) {
                count++;
                // --- keep track of the previous/current effect
                if (currentOrder && order.effect.name !== currentOrder.effect.name) {
                    if (currentOrder.effect.canChain === true) {
                        previousOrder = currentOrder;
                    }
                    // --- if this is a new effect we are rendering then we pass all passes of this effect to this effect
                    for (const pass of order.effect.passes) {
                        scope.resolve(`${pass.name}`).setValue(pass.renderTarget.colorBuffer);
                        scope
                            .resolve("mipLevel")
                            .setValue((Math.log(pass.width) / Math.log(2.0)).toFixed(1));
                    }
                }
                if (count === 1) {
                    for (const pass of order.effect.passes) {
                        scope.resolve(`${pass.name}`).setValue(pass.renderTarget.colorBuffer);
                        scope
                            .resolve("mipLevel")
                            .setValue((Math.log(pass.width) / Math.log(2.0)).toFixed(1));
                    }
                }
                currentOrder = order;
                // --- input the previous pass output to the global scope if available
                if (previousOrder) {
                    // --- get last renderable pass target
                    let lastTarget = previousOrder.target;
                    for (let i = previousOrder.effect.passes.length - 1; i >= 0; i--) {
                        const lastPass = previousOrder.effect.passes[i];
                        if (lastPass.offscreen === false) {
                            lastTarget = lastPass.renderTarget;
                            break;
                        }
                    }
                    scope.resolve("previousEffect").setValue(lastTarget.colorBuffer);
                }
                else {
                    scope.resolve("previousEffect").setValue(inputTarget.colorBuffer);
                }
                // --- decide the output target, last pass is the final
                let target = order.target;
                if (count === lastPassCount) {
                    target = outputTarget;
                }
                pc.drawFullscreenQuad(device, target, this.vertexBuffer, order.shader, rect);
                this.matrixPrevious.set(scope.resolve("matrix_viewProjection").getValue());
            }
        });
    }
    destroy() {
        for (const order of this.renderOrders) {
            order.target.destroy();
        }
    }
}
exports.default = ErmisPostEffect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtcG9zdC1lZmZlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9lcm1pcy1wb3N0LWVmZmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUE0RDtBQUc1RCw2RUFBb0Q7QUF1QnBELE1BQXFCLGVBQWU7SUEyQmxDLFlBQVksR0FBbUIsRUFBRSxPQUFzQixFQUFFLE1BQVc7UUFiNUQsZUFBVSxHQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlCLFdBQU0sR0FBWSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQyxtQkFBYyxHQUFZLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1FBSXhDLGNBQVMsR0FBUTtZQUN2QixJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQjtZQUMzQixJQUFJLEVBQUUsQ0FBQztZQUNQLEtBQUssRUFBRSxDQUFDO1lBQ1IsT0FBTyxFQUFFLEtBQUs7U0FDZixDQUFDO1FBR0EsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUxQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0UsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxHQUFHLENB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
