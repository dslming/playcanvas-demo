
Object.defineProperty(exports, "__esModule", { value: true });
var ShaderDataTypes;
(function (ShaderDataTypes) {
    ShaderDataTypes["float"] = "float";
    ShaderDataTypes["vec2"] = "vec2";
    ShaderDataTypes["vec3"] = "vec3";
    ShaderDataTypes["vec4"] = "vec4";
    ShaderDataTypes["sampler2D"] = "sampler2D";
})(ShaderDataTypes = exports.ShaderDataTypes || (exports.ShaderDataTypes = {}));
class ErmisEffect {
    constructor(name, settings) {
        this.name = name;
        this.settings = settings;
        this.canChain = true;
        this.passes = [];
    }
    onEnable(app) { }
    onDisable(app) { }
    static getUniformValue(effectUniform, app, camera) {
        const value = effectUniform.value !== undefined
            ? effectUniform.value
            : effectUniform.default;
        if (effectUniform.calcValue !== undefined) {
            return effectUniform.calcValue(value, app, camera);
        }
        else {
            return value !== undefined ? value : undefined;
        }
    }
    static getDefinesFromUniforms(effectUniforms) {
        return effectUniforms.filter((uniform) => {
            return uniform.define === true;
        });
    }
    static uniformsToString(effectUniforms) {
        let str = "";
        for (const effectUniform of effectUniforms) {
            if (!effectUniform.type)
                continue;
            const type = "uniform";
            str += `${type} ${effectUniform.type} ${effectUniform.name};\n`;
        }
        return str;
    }
    static definesToString(effectDefines) {
        let str = "";
        for (const effectDefine of effectDefines) {
            const type = "#define";
            const value = ErmisEffect.getUniformValue(effectDefine);
            str += `${type} ${effectDefine.name.toUpperCase()} ${value}\n`;
        }
        return str;
    }
}
exports.ErmisEffect = ErmisEffect;
class ErmisEffectSettings {
    constructor(effectID, effectUniforms) {
        this.effectID = effectID;
        this.effectUniforms = effectUniforms;
        // --- execute
        this.createPcScript();
    }
    createPcScript() {
        const script = pc.createScript(`ermis${this.effectID}Settings`);
        // --- dynamically create editor attributes based on effect uniforms
        for (const effectUniform of this.effectUniforms) {
            if (effectUniform.inEditor === false)
                continue;
            const def = {
                type: effectUniform.pcType,
                title: effectUniform.title,
                default: effectUniform.default,
                description: effectUniform.description,
                min: effectUniform.min,
                max: effectUniform.max,
                precision: effectUniform.precision
            };
            if (effectUniform.enum)
                def.enum = effectUniform.enum;
            if (effectUniform.define) {
                if (!def.description)
                    def.description = "";
                def.description +=
                    " This property requires reloading the effect to render the new value.";
            }
            if (def.description) {
                def.description = def.description.trim();
            }
            script.attributes.add(effectUniform.name, def);
        }
        // --- attach PC event handlers
        const self = this;
        script.prototype.initialize = function () {
            if (self.scriptInstance)
                return;
            self.scriptInstance = this;
            self.onInitialize(this);
        };
    }
    onInitialize(script) {
        // --- events
        script.on("attr", (name, value) => {
            this.updateUniformValues(script, name);
        });
        // --- execute
        this.updateUniformValues(script);
    }
    normalizeUniformValue(value, effectUniform) {
        switch (effectUniform.pcType) {
            case "boolean":
                return value === true ? 1 : 0;
            case "rgb":
                return [value.r, value.g, value.b];
            default:
                return value;
        }
    }
    updateUniformValues(script, uniformNameUpdated) {
        for (const effectUniform of this.effectUniforms) {
            if (uniformNameUpdated && effectUniform.name !== uniformNameUpdated)
                continue;
            effectUniform.value =
                script[effectUniform.name] !== undefined
                    ? this.normalizeUniformValue(script[effectUniform.name], effectUniform)
                    : effectUniform.default;
        }
    }
}
exports.ErmisEffectSettings = ErmisEffectSettings;
