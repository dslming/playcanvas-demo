
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_dof_1 = __importDefault(__webpack_require__(/*! ../effects/ermis-effect-dof */ "./src/effects/ermis-effect-dof.ts"));
const ermis_effect_godrays_1 = __importDefault(__webpack_require__(/*! ../effects/ermis-effect-godrays */ "./src/effects/ermis-effect-godrays.ts"));
const ermis_effect_sao_1 = __importDefault(__webpack_require__(/*! ../effects/ermis-effect-sao */ "./src/effects/ermis-effect-sao.ts"));
const ermis_effect_filmic_1 = __importDefault(__webpack_require__(/*! ../effects/ermis-effect-filmic */ "./src/effects/ermis-effect-filmic.ts"));
const ermis_effect_motionBlur_1 = __importDefault(__webpack_require__(/*! ../effects/ermis-effect-motionBlur */ "./src/effects/ermis-effect-motionBlur.ts"));
const ermis_effect_adaptiveEye_1 = __importDefault(__webpack_require__(/*! ../effects/ermis-effect-adaptiveEye */ "./src/effects/ermis-effect-adaptiveEye.ts"));
const ermis_effect_ssr_1 = __importDefault(__webpack_require__(/*! ../effects/ermis-effect-ssr */ "./src/effects/ermis-effect-ssr.ts"));
const ermis_post_effect_1 = __importDefault(__webpack_require__(/*! ./ermis-post-effect */ "./src/core/ermis-post-effect.ts"));
class Main {
    constructor(effectSettings) {
        this.effects = [];
        this.effectSettings = effectSettings;
        // --- execute
        this.createPcScript();
    }
    createPcScript() {
        const script = pc.createScript("ermisSpecialEffects");
        script.attributes.add("EffectDof", {
            type: "boolean",
            title: "DOF",
            default: true,
            description: "Check to enable Depth of Field (DOF)."
        });
        script.attributes.add("EffectGodrays", {
            type: "boolean",
            title: "Godrays",
            default: false,
            description: "Check to enable Godrays."
        });
        script.attributes.add("EffectSAO", {
            type: "boolean",
            title: "SAO",
            default: true,
            description: "Check to enable Scalable Ambient Occlusion (SAO). If you experience artifacts/banding on vertical edges increase the your camera rear clipping plane to a higher value e.g. 0.1 or 1.0"
        });
        script.attributes.add("EffectFilmic", {
            type: "boolean",
            title: "Filmic",
            default: false,
            description: "A number of effects that simulate the function of a camera lens."
        });
        script.attributes.add("EffectMotionBlur", {
            type: "boolean",
            title: "Motion Blur",
            default: true,
            description: "Check to enable a camera based motion blur effect."
        });
        script.attributes.add("EffectAdaptiveEye", {
            type: "boolean",
            title: "Adaptive Eye",
            default: true,
            description: "Check to enable an adaptive eye exposure effect."
        });
        // script.attributes.add("EffectSSR", {
        //   type: "boolean",
        //   title: "Screen Space Reflections",
        //   default: true,
        //   description: "Check to enable screen space reflections."
        // });
        script.attributes.add("camera", {
            type: "entity",
            title: "Camera",
            description: "Set the active camera to render the post effects to. If none is provided the script will attempt to find a camera named 'Camera'."
        });
        script.attributes.add("mobilePerformance", {
            type: "boolean",
            title: "Mobile Performance",
            description: "If selected, effects not working on mobile devices will be turned off automatically when running on a non supported device."
        });
        script.attributes.add("mobileAutoDisable", {
            type: "boolean",
            title: "Mobile Disable",
            description: "If selected all effects will be turned off automatically when running on a mobile/tablet device."
        });
        // --- attach PC event handlers
        const self = this;
        script.prototype.initialize = function () {
            if (self.scriptInstance)
                return;
            this.time = 0.0;
            self.scriptInstance = this;
            self.onInitialize(this);
        };
        script.prototype.update = function (dt) {
            this.time += dt;
            this.delta = dt;
        };
        return script;
    }
    onInitialize(script) {
        this.requestDepthMap(script.app, script);
        // --- timeout to allow the settings scripts grab their initial value, without resorting to script ordering
        window.setTimeout(() => {
            // --- variables
            // --- events
            script.app.on("ermis:setActiveCamera", (camera) => {
                this.setActiveCamera(script, camera);
            });
            script.app.on("ermis:setEffect", (effectID, state) => {
                script[effectID] = state;
            });
            script.app.on("ermis:switchEffect", (effectID) => {
                script[effectID] = !script[effectID];
            });
            script.on("attr", (name, value) => {
                console.log("Ermis Special Effects, property updated: ", name, value);
                this.bootEffects(script, false);
            });
            script.on("state", (enabled) => {
                const queue = script.camera.camera.postEffects;
                if (enabled) {
                    queue.addEffect(this.postEffect);
                }
                else {
                    queue.removeEffect(this.postEffect);
                }
            });
            script.on("destroy", () => {
                const queue = script.camera.camera.postEffects;
                queue.removeEffect(this.postEffect);
            });
            // --- execute
            this.setActiveCamera(script);
            this.bootEffects(script, true);
        }, 0);
    }
    setActiveCamera(script, camera) {
        if (camera) {
            script.camera = camera;
        }
        else if (!script.camera) {
            script.camera = script.app.root.findByName("Camera");
        }
    }
    bootEffects(script, initial) {
        this.effectsSelected = [];
        // --- check the mobile auto disable switch
        let disableEffects = false;
        let performanceEffects = false;
        if (initial === true) {
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                if (script.mobilePerformance === true)
                    performanceEffects = true;
                if (script.mobileAutoDisable === true)
                    disableEffects = true;
            }
        }
        if (disableEffects === false) {
            for (const effectID of Main.effectsOrder) {
                if (script[effectID] === false)
                    continue;
                let effectInstance = this.effects.find((effectToFind) => {
                    return effectToFind.constructor.name === `ErmisEffect${effectID}`;
                });
                if (!effectInstance) {
                    const settings = this.effectSettings.find((effectSettings) => {
                        return effectSettings.effectID === effectID;
                    });
                    switch (effectID) {
                        case "EffectDof":
                            effectInstance = new ermis_effect_dof_1.default(effectID, settings);
                            break;
                        case "EffectGodrays":
                            effectInstance = new ermis_effect_godrays_1.default(effectID, settings);
                            break;
                        case "EffectSAO":
                            if (performanceEffects === false) {
                                effectInstance = new ermis_effect_sao_1.default(effectID, settings);
                            }
                            break;
                        case "EffectFilmic":
                            effectInstance = new ermis_effect_filmic_1.default(effectID, settings);
                            break;
                        case "EffectMotionBlur":
                            effectInstance = new ermis_effect_motionBlur_1.default(effectID, settings);
                            break;
                        case "EffectAdaptiveEye":
                            effectInstance = new ermis_effect_adaptiveEye_1.default(effectID, settings);
                            break;
                        case "EffectSSR":
                            if (performanceEffects === false) {
                                effectInstance = new ermis_effect_ssr_1.default(effectID, settings);
                            }
                            break;
                    }
                }
                if (effectInstance)
                    this.effectsSelected.push(effectInstance);
            }
        }
        this.createPostEffect(script.app, script);
    }
    createPostEffect(app, script) {
        const queue = script.camera.camera.postEffects;
        // const layer: any = app.scene.layers.getLayerByName("Effects");
        // layer.renderTarget = app.scene.layers.getLayerByName(
        //   "Effects"
        // ).renderTarget;
        // layer.clear = false;
        // layer._commandList = [];
        // @ts-ignore
        // queue.layer = layer;
        if (this.postEffect) {
            queue.removeEffect(this.postEffect);
            this.postEffect.destroy();
            this.postEffect = undefined;
        }
        if (this.effectsSelected.length > 0) {
            this.postEffect = new ermis_post_effect_1.default(app, this.effectsSelected, script);
            // --- call enable on all effects
            this.effectsSelected.forEach((effect) => {
                effect.onEnable(app);
            });
            queue.addEffect(this.postEffect);
        }
    }
    requestDepthMap(app, script) {
        // // @ts-ignore
        // if (app.graphicsDevice.webgl2 === false) {
        //   const depthLayer: pc.Layer = app.scene.layers.getLayerById(
        //     pc.LAYERID_DEPTH
        //   );
        //   // @ts-ignore
        //   if (app.graphicsDevice.webgl2 === true) {
        //     // @ts-ignore
        //     depthLayer.incrementCounter();
        //     script.on("enable", function() {
        //       // @ts-ignore
        //       depthLayer.incrementCounter();
        //     });
        //     script.on("disable", function() {
        //       // @ts-ignore
        //       depthLayer.decrementCounter();
        //     });
        //   }
        // }
        // --- Fix a PC bug with retrieving the depth map in WebGL1
        // @ts-ignore
        if (app.graphicsDevice.webgl2 === false) {
            var depthLayer = app.scene.layers.getLayerByName("Depth");
            var self = app;
            // prettier-ignore
            depthLayer.onPostCull = function (cameraPass) {
                // Collect all rendered mesh instances with the same render target as World has, depthWrite == true and prior to this layer to replicate blitFramebuffer on WebGL2
                // @ts-ignore
                var visibleObjects = this.instances.visibleOpaque[cameraPass];
                var visibleList = visibleObjects.list;
                var visibleLength = 0;
                var layers = self.scene.layers.layerList;
                var subLayerEnabled = self.scene.layers.subLayerEnabled;
                var isTransparent = self.scene.layers.subLayerList;
                // @ts-ignore
                var rt = self.defaultLayerWorld.renderTarget;
                // @ts-ignore
                var cam = this.cameras[cameraPass];
                var layer;
                var j;
                var layerVisibleList, layerCamId, layerVisibleListLength, drawCall, transparent;
                for (var i = 0; i < layers.length; i++) {
                    layer = layers[i];
                    if (layer === this)
                        break;
                    //if (layer.renderTarget !== rt || !layer.enabled || !subLayerEnabled[i]) continue;
                    // @ts-ignore
                    layerCamId = layer.cameras.indexOf(cam);
                    if (layerCamId < 0)
                        continue;
                    transparent = isTransparent[i];
                    // @ts-ignore
                    layerVisibleList = transparent ? layer.instances.visibleTransparent[layerCamId] : layer.instances.visibleOpaque[layerCamId];
                    layerVisibleListLength = layerVisibleList.length;
                    layerVisibleList = layerVisibleList.list;
                    for (j = 0; j < layerVisibleListLength; j++) {
                        drawCall = layerVisibleList[j];
                        if (drawCall.material && drawCall.material.depthWrite && !drawCall._noDepthDrawGl1) {
                            visibleList[visibleLength] = drawCall;
                            visibleLength++;
                        }
                    }
                }
                visibleObjects.length = visibleLength;
            };
        }
        // --- override the PC PostEffect renderTarget functions to add MSAA sampling for WebGL2
        // @ts-ignore
        if (app.graphicsDevice.webgl2 === true) {
            // @ts-ignore
            pc.PostEffectQueue.prototype._createOffscreenTarget = function (useDepth, hdr) {
                // @ts-ignore
                var rect = this.camera.rect;
                var width = Math.floor(
                // @ts-ignore
                rect.z * this.app.graphicsDevice.width * this.renderTargetScale);
                var height = Math.floor(
                // @ts-ignore
                rect.w * this.app.graphicsDevice.height * this.renderTargetScale);
                // @ts-ignore
                var device = this.app.graphicsDevice;
                var format = hdr ? device.getHdrFormat() : pc.PIXELFORMAT_R8_G8_B8_A8;
                var colorBuffer = new pc.Texture(device, {
                    format: format,
                    width: width,
                    height: height
                });
                colorBuffer.name = "posteffect";
                colorBuffer.minFilter = pc.FILTER_NEAREST;
                colorBuffer.magFilter = pc.FILTER_NEAREST;
                colorBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
                colorBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
                if (useDepth !== true) {
                    // @ts-ignore
                    return new pc.RenderTarget(this.app.graphicsDevice, colorBuffer);
                }
                else {
                    // @ts-ignore
                    var depthBuffer = new pc.Texture(this.app.graphicsDevice, {
                        format: pc.PIXELFORMAT_DEPTHSTENCIL,
                        width: width,
                        height: height
                    });
                    depthBuffer.name = "posteffect";
                    script.depthBuffer = depthBuffer;
                    depthBuffer.minFilter = pc.FILTER_NEAREST;
                    depthBuffer.magFilter = pc.FILTER_NEAREST;
                    depthBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
                    depthBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
                    return new pc.RenderTarget({
                        colorBuffer: colorBuffer,
                        depthBuffer: depthBuffer,
                        autoResolve: true,
                        samples: device.samples
                    });
                }
            };
            // @ts-ignore
            pc.PostEffectQueue.prototype._resizeOffscreenTarget = function (rt) {
                if (rt.ermisCanResize === false)
                    return false;
                // @ts-ignore
                var rect = this.camera.rect;
                var width = Math.floor(
                // @ts-ignore
                rect.z * this.app.graphicsDevice.width * this.renderTargetScale);
                var height = Math.floor(
                // @ts-ignore
                rect.w * this.app.graphicsDevice.height * this.renderTargetScale);
                // @ts-ignore
                var device = this.app.graphicsDevice;
                var format = rt.colorBuffer.format;
                rt._colorBuffer.destroy();
                var colorBuffer = new pc.Texture(device, {
                    format: format,
                    width: width,
                    height: height
                });
                colorBuffer.name = "posteffect";
                colorBuffer.minFilter = pc.FILTER_NEAREST;
                colorBuffer.magFilter = pc.FILTER_NEAREST;
                colorBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
                colorBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
                rt._colorBuffer = colorBuffer;
                if (rt.depthBuffer) {
                    rt._depthBuffer.destroy();
                    var depthBuffer = new pc.Texture(device, {
                        format: pc.PIXELFORMAT_DEPTHSTENCIL,
                        width: width,
                        height: height
                    });
                    depthBuffer.name = "posteffect";
                    depthBuffer.minFilter = pc.FILTER_NEAREST;
                    depthBuffer.magFilter = pc.FILTER_NEAREST;
                    depthBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
                    depthBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
                    rt._depthBuffer = depthBuffer;
                    script.depthBuffer = depthBuffer;
                }
                rt.destroy();
            };
        }
    }
}
exports.default = Main;
Main.effectsOrder = [
    "EffectMotionBlur",
    "EffectGodrays",
    "EffectAdaptiveEye",
    "EffectDof",
    "EffectSAO",
    "EffectFilmic"
    //"EffectSSR"
];
