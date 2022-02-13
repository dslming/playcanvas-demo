
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ../core/ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_pass_1 = __webpack_require__(/*! ../core/ermis-pass */ "./src/core/ermis-pass.ts");
class ErmisEffectAdaptiveEye extends ermis_effect_1.ErmisEffect {
    constructor(name, settings) {
        super(name, settings);
        this.canChain = false;
        this.passes = [];
        this.passes.push(new ErmisPassLuminosity(ErmisPassLuminosity.ID));
        this.passes.push(new ErmisPassAdaptiveLuminosity(ErmisPassAdaptiveLuminosity.ID));
        this.passes.push(new ErmisPassAdaptiveLuminosityPrev(ErmisPassAdaptiveLuminosityPrev.ID));
    }
    getUniforms() {
        return ErmisEffectAdaptiveEye.EffectUniforms;
    }
}
exports.default = ErmisEffectAdaptiveEye;
ErmisEffectAdaptiveEye.ID = "EffectAdaptiveEye";
ErmisEffectAdaptiveEye.EffectUniforms = [
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "adaptionMinLuminance",
        title: "Min Luminance",
        description: "Determines the minimum luminance difference between light/dark regions to affect the target exposure.",
        inEditor: true,
        default: 0.2,
        min: 0,
        max: 1,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "adaptionTau",
        title: "Adaption Offset",
        description: "The maximum offset (plus/minus) to be added to the base scene exposure.",
        inEditor: true,
        default: 1.0,
        min: 0,
        max: 1,
        precision: 2,
        calcValue: (value) => {
            return value * 100;
        }
    }
];
class ErmisPassLuminosity extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
        this.offscreen = true;
        this.width = 256;
        this.height = 256;
        this.samples = 1;
        this.canResize = false;
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        const shader = `
          uniform sampler2D previousEffect;

          float linearToRelativeLuminance( const in vec3 color ) {
            vec3 weights = vec3( 0.2126, 0.7152, 0.0722 );
            return dot( weights, color.rgb );
          }          
    
          void main() {     

            vec4 texel = texture2D( previousEffect, vUv0 );

            float l = 1.0 - linearToRelativeLuminance( texel.rgb );
        
            gl_FragColor = vec4( l, l, l, texel.w );
          }    
        `;
        return shader;
    }
}
ErmisPassLuminosity.ID = "PassLuminosity";
class ErmisPassAdaptiveLuminosity extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
        this.offscreen = true;
        this.width = 256;
        this.height = 256;
        this.samples = 1;
        this.canResize = false;
        this.oldShaders = {};
    }
    onInit(script, effect, app) {
        if (!script.adaptiveEyeShadersInPlace) {
            script.adaptiveEyeShadersInPlace = true;
            // --- override pc tonemapping shader chunks
            this.oldShaders.tonemappingFilmicPS = pc.shaderChunks.tonemappingFilmicPS;
            pc.shaderChunks.tonemappingFilmicPS = `
  const float A =  0.15;
  const float B =  0.50;
  const float C =  0.10;
  const float D =  0.20;
  const float E =  0.02;
  const float F =  0.30;
  const float W =  11.2;
  
  uniform float exposure;
  uniform sampler2D uLuminanceMap;
  
  vec3 uncharted2Tonemap(vec3 x) {
      return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
  }
  
  vec3 toneMap(vec3 color) {
      float lum = texture2D(uLuminanceMap, vec2(0.5, 0.5)).r;
      color = uncharted2Tonemap(color * exposure * lum);
      vec3 whiteScale = 1.0 / uncharted2Tonemap(vec3(W,W,W));
      color = color * whiteScale;
  
      return color;
  }
  `;
            this.oldShaders.tonemappingLinearPS = pc.shaderChunks.tonemappingLinearPS;
            pc.shaderChunks.tonemappingLinearPS = `
  uniform float exposure;
  uniform sampler2D uLuminanceMap;
  
  vec3 toneMap(vec3 color) {
      float lum = texture2D(uLuminanceMap, vec2(0.5, 0.5)).r;
      return color * exposure * lum;
  }
  `;
            this.oldShaders.tonemappingHejlPS = pc.shaderChunks.tonemappingHejlPS;
            pc.shaderChunks.tonemappingHejlPS = `
  uniform float exposure;
  uniform sampler2D uLuminanceMap;
  
  vec3 toneMap(vec3 color) {
    float lum = texture2D(uLuminanceMap, vec2(0.5, 0.5)).r;
    color *= exposure * lum;
    const float  A = 0.22, B = 0.3, C = .1, D = 0.2, E = .01, F = 0.3;
    const float Scl = 1.25;
  
    vec3 h = max( vec3(0.0), color - vec3(0.004) );
    return (h*((Scl*A)*h+Scl*vec3(C*B,C*B,C*B))+Scl*vec3(D*E,D*E,D*E)) / (h*(A*h+vec3(B,B,B))+vec3(D*F,D*F,D*F)) - Scl*vec3(E/F,E/F,E/F);
  }
  `;
            this.oldShaders.tonemappingAcesPS = pc.shaderChunks.tonemappingAcesPS;
            pc.shaderChunks.tonemappingAcesPS = `
  uniform float exposure;
  uniform sampler2D uLuminanceMap;

  vec3 toneMap(vec3 color) {
      float tA = 2.51;
      float tB = 0.03;
      float tC = 2.43;
      float tD = 0.59;
      float tE = 0.14;
  
      float lum = texture2D(uLuminanceMap, vec2(0.5, 0.5)).r;
      vec3 x = color * exposure * lum;
      return (x*(tA*x+tB))/(x*(tC*x+tD)+tE);
  }
  `;
            this.oldShaders.tonemappingAces2PS = pc.shaderChunks.tonemappingAces2PS;
            pc.shaderChunks.tonemappingAces2PS = `
  uniform float exposure;
  uniform sampler2D uLuminanceMap;
  
  // ACES approximation by Stephen Hill
  
  // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
  const mat3 ACESInputMat = mat3(
      0.59719, 0.35458, 0.04823,
      0.07600, 0.90834, 0.01566,
      0.02840, 0.13383, 0.83777
  );
  
  // ODT_SAT => XYZ => D60_2_D65 => sRGB
  const mat3 ACESOutputMat = mat3(
       1.60475, -0.53108, -0.07367,
      -0.10208,  1.10813, -0.00605,
      -0.00327, -0.07276,  1.07602
  );
  
  vec3 RRTAndODTFit(vec3 v) {
      vec3 a = v * (v + 0.0245786) - 0.000090537;
      vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
      return a / b;
  }
  
  vec3 toneMap(vec3 color) {
      float lum = texture2D(uLuminanceMap, vec2(0.5, 0.5)).r;
      color *= exposure * exposure * lum;
      color = color * ACESInputMat;
  
      // Apply RRT and ODT
      color = RRTAndODTFit(color);
      color = color * ACESOutputMat;
  
      // Clamp to [0, 1]
      color = clamp(color, 0.0, 1.0);
  
      return color;
  }
  `;
            // --- force a app-wide recompilation of shaders using the exposure/tonemapping
            const library = app.graphicsDevice.getProgramLibrary();
            let i, len;
            for (i = 0, len = app.graphicsDevice.shaders.length; i < len; i++) {
                const shader = app.graphicsDevice.shaders[i];
                const fshader = shader.definition.fshader;
                if (fshader.indexOf("exposure") > -1 &&
                    fshader.indexOf("Ermis shader") === -1) {
                    library.removeFromCache(shader);
                }
            }
        }
        // --- add luminance map to the shader scope
        app.graphicsDevice.scope
            .resolve("uLuminanceMap")
            .setValue(effect.passes[1].renderTarget.colorBuffer);
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        const shader = `
          uniform sampler2D PassAdaptiveLuminosityPrev;
          uniform sampler2D PassLuminosity;

          void main() {

            vec4 lastLum = texture2D( PassAdaptiveLuminosityPrev, vUv0, 4.0  );
            vec4 currentLum = texture2D( PassLuminosity, vUv0, 4.0 );

            float fLastLum = lastLum.r;
            float fCurrentLum = currentLum.r;
    
            //The adaption seems to work better in extreme lighting differences
            fCurrentLum *= fCurrentLum;
    
            // Adapt the luminance using Pattanaik's technique
            float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(- delta * adaptionTau));

            gl_FragColor = vec4( vec3( max(adaptionMinLuminance, fAdaptedLum) ), 1.0 );
          }
        `;
        return shader;
    }
}
ErmisPassAdaptiveLuminosity.ID = "PassAdaptiveLuminosity";
class ErmisPassAdaptiveLuminosityPrev extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
        this.offscreen = true;
        this.width = 256;
        this.height = 256;
        this.samples = 1;
        this.canResize = false;
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        const shader = `
          uniform sampler2D PassLuminosity;

          void main() {

            gl_FragColor = texture2D( PassLuminosity, vUv0 );
          }
        `;
        return shader;
    }
}
ErmisPassAdaptiveLuminosityPrev.ID = "PassAdaptiveLuminosityPrev";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtZWZmZWN0LWFkYXB0aXZlRXllLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2VmZmVjdHMvZXJtaXMtZWZmZWN0LWFkYXB0aXZlRXllLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBSzhCO0FBQzlCLG1EQUErQztBQUUvQyxNQUFxQixzQkFBdUIsU0FBUSwwQkFBVztJQW1DN0QsWUFBWSxJQUFZLEVBQUUsUUFBNkI7UUFDckQsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV0QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUV0QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2QsSUFBSSwyQkFBMkIsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FDaEUsQ0FBQztRQUVGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLElBQUksK0JBQStCLENBQUMsK0JBQStCLENBQUMsRUFBRSxDQUFDLENBQ3hFLENBQUM7SUFDSixDQUFDO0lBRU0sV0FBVztRQUNoQixPQUFPLHNCQUFzQixDQUFDLGNBQWMsQ0FBQztJQUMvQyxDQUFDOztBQXRESCx5Q0F1REM7QUF0RFEseUJBQUUsR0FBVyxtQkFBbUIsQ0FBQztBQUVqQyxxQ0FBYyxHQUFvQjtJQUN2QztRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLFFBQVE7UUFDaEIsSUFBSSxFQUFFLHNCQUFzQjtRQUM1QixLQUFLLEVBQUUsZUFBZTtRQUN0QixXQUFXLEVBQ1QsdUdBQXVHO1FBQ3pHLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLEdBQUc7UUFDWixH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
