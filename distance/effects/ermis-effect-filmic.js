
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ../core/ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_pass_1 = __webpack_require__(/*! ../core/ermis-pass */ "./src/core/ermis-pass.ts");
class ErmisEffectFilmic extends ermis_effect_1.ErmisEffect {
    constructor(name, settings) {
        super(name, settings);
        this.passes = [];
        this.passes.push(new ErmisPassFilmic(`${ErmisPassFilmic.ID}`));
    }
    getUniforms() {
        return ErmisEffectFilmic.EffectUniforms;
    }
}
exports.default = ErmisEffectFilmic;
ErmisEffectFilmic.ID = "EffectFilmic";
ErmisEffectFilmic.EffectUniforms = [
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        define: true,
        name: "filmicVignette",
        title: "Vignette",
        description: "If checked vignette will be enabled.",
        inEditor: true,
        default: true
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "filmicVignetteOffset",
        title: "Vignette Offset",
        description: "The offset from the corner that vignette will have.",
        inEditor: true,
        default: 1.2,
        min: 0,
        precision: 5
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "filmicVignetteDarkness",
        title: "Vignette Darkness",
        description: "The amount of vignette applied.",
        inEditor: true,
        default: 1,
        min: 0,
        precision: 5
    },
    {
        type: ermis_effect_1.ShaderDataTypes.vec3,
        pcType: "rgb",
        name: "filmicVignetteColor",
        inEditor: true,
        title: "Color",
        description: "The color of the vignette effect.",
        default: [0, 0, 0]
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        define: true,
        name: "filmicAberration",
        title: "Chromatic Aberration",
        description: "If checked chromatic aberration will be enabled.",
        inEditor: true,
        default: true
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "filmicAberrationAmount",
        title: "Chr. Aberration Amount",
        description: "The amount of chromatic aberration applied.",
        inEditor: true,
        default: 10,
        min: -100,
        max: 100,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        define: true,
        name: "filmicAberrationAnimated",
        title: "Chr. Aberration Animated",
        description: "If checked the chromatic aberration will be animated using a shaking tween.",
        inEditor: true,
        default: false
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        define: true,
        name: "filmicSharpen",
        title: "Sharpen",
        description: "If checked sharpen will be enabled. It can't be used together with Pixelate.",
        inEditor: true,
        default: false
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "filmicSharpenAmount",
        title: "Sharpen Amount",
        description: "The amount of sharpen applied.",
        inEditor: true,
        default: 1,
        min: 0,
        max: 10,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        define: true,
        name: "filmicGrain",
        title: "Film Grain",
        description: "If checked film grain and noise will be added.",
        inEditor: true,
        default: false
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "filmicGrainAmount",
        title: "Grain Amount",
        description: "The amount of film grain applied.",
        inEditor: true,
        default: 1.5,
        min: 0,
        max: 10,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        define: true,
        name: "filmicPixelate",
        title: "Pixelate",
        description: "If checked pixelate will be enabled. It can't be used together with Sharpen.",
        inEditor: true,
        default: false
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "filmicPixelateSize",
        title: "Pixel Size",
        description: "The size of each pixel.",
        inEditor: true,
        default: 12,
        min: 1,
        max: 64,
        precision: 0
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        define: true,
        name: "filmicGrayscale",
        title: "Grayscale",
        description: "If checked the final image will be converted to grayscale.",
        inEditor: true,
        default: false
    }
];
class ErmisPassFilmic extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        const shader = `
        uniform sampler2D previousEffect;
  
        void main() {
  
            vec4 diffuse = texture2D( previousEffect, vUv0 );
            gl_FragColor = diffuse;

            vec2 texel = 1.0 / resolution.xy;
            vec2 coords = (vUv0 - 0.5) * 2.0;
            float coordDot = dot (coords, coords);            

            #if (FILMICSHARPEN==1)

                vec4 edgeDetection = texture2D(previousEffect, vUv0 + texel * vec2(0.0, -1.0)) +
                    texture2D(previousEffect, vUv0 + texel * vec2(-1.0, 0.0)) +
                    texture2D(previousEffect, vUv0 + texel * vec2(1.0, 0.0)) +
                    texture2D(previousEffect, vUv0 + texel * vec2(0.0, 1.0)) -
                    diffuse * 4.0;
                
                gl_FragColor = max(vec4(diffuse.rgb * 1.0, diffuse.a) - (filmicSharpenAmount * vec4(edgeDetection.rgb, 0)), 0.);

            #endif

            #if (FILMICPIXELATE==1)
                vec2 pixelateDxy = filmicPixelateSize / resolution;
                vec2 pixelateCoord = pixelateDxy * floor( vUv0 / pixelateDxy );
                gl_FragColor = texture2D(previousEffect, pixelateCoord);
            #endif            

            #if (FILMICABERRATION==1)

                float aberrationAmount = 1.0;
    
                #if (FILMICABERRATIONANIMATED==1)
                    aberrationAmount = (1.0 + sin(time*6.0)) * 0.5;
                    aberrationAmount *= 1.0 + sin(time*16.0) * 0.5;
                    aberrationAmount *= 1.0 + sin(time*19.0) * 0.5;
                    aberrationAmount *= 1.0 + sin(time*27.0) * 0.5;
                    aberrationAmount = pow(aberrationAmount, 3.0);
                #endif
            
                aberrationAmount *= filmicAberrationAmount;
                
                vec2 aberrationPrecompute = aberrationAmount * coordDot * coords;
                vec2 uvR = vUv0 - texel.xy * aberrationPrecompute;
                vec2 uvB = vUv0 + texel.xy * aberrationPrecompute;

                gl_FragColor.r = texture2D(previousEffect, uvR).r;
                gl_FragColor.b = texture2D(previousEffect, uvB).b;

            #endif

            #if (FILMICGRAIN==1)
                
                float x = (vUv0.x + 4.0 ) * (vUv0.y + 4.0 ) * (time * 10.0);
                vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * filmicGrainAmount * 10.0;
                
                gl_FragColor += grain;
            #endif

            #if (FILMICVIGNETTE==1)
                vec2 vignetteUv = (vUv0 - vec2(0.5)) * vec2(filmicVignetteOffset);
                gl_FragColor = vec4(mix(gl_FragColor.rgb, vec3(1.0 - filmicVignetteDarkness) + filmicVignetteColor, dot(vignetteUv, vignetteUv)), gl_FragColor.a);
            #endif

            #if (FILMICGRAYSCALE==1)
                float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                gl_FragColor = vec4(vec3(gray), 1.0);            
            #endif
        }    
      `;
        return shader;
    }
}
ErmisPassFilmic.ID = "PassFilmic";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtZWZmZWN0LWZpbG1pYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZmZlY3RzL2VybWlzLWVmZmVjdC1maWxtaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFLOEI7QUFDOUIsbURBQStDO0FBRS9DLE1BQXFCLGlCQUFrQixTQUFRLDBCQUFXO0lBOEp4RCxZQUFZLElBQVksRUFBRSxRQUE2QjtRQUNyRCxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXRCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksZUFBZSxDQUFDLEdBQUcsZUFBZSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0sV0FBVztRQUNoQixPQUFPLGlCQUFpQixDQUFDLGNBQWMsQ0FBQztJQUMxQyxDQUFDOztBQXZLSCxvQ0F3S0M7QUF2S1Esb0JBQUUsR0FBVyxjQUFjLENBQUM7QUFFNUIsZ0NBQWMsR0FBb0I7SUFDdkM7UUFDRSxJQUFJLEVBQUUsOEJBQWUsQ0FBQyxLQUFLO1FBQzNCLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLE1BQU0sRUFBRSxJQUFJO1FBQ1osSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixLQUFLLEVBQUUsVUFBVTtRQUNqQixXQUFXLEVBQUUsc0NBQXNDO1FBQ25ELFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLElBQUk7S0FDZDtJQUNEO1FBQ0UsSUFBSSxFQUFFLDhCQUFlLENBQUMsS0FBSztRQUMzQixNQUFNLEVBQUUsUUFBUTtRQUNoQixJQUFJLEVBQUUsc0JBQXNCO1FBQzVCLEtBQUssRUFBRSxpQkFBaUI7UUFDeEIsV0FBVyxFQUFFLHFEQUFxRDtRQUNsRSxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxHQUFHO1FBQ1osR0FBRyxFQUFFLENBQUM7UUFDTixT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
