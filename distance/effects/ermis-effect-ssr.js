
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ../core/ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_pass_1 = __webpack_require__(/*! ../core/ermis-pass */ "./src/core/ermis-pass.ts");
class ErmisEffectSSR extends ermis_effect_1.ErmisEffect {
    constructor(name, settings) {
        super(name, settings);
        this.passes = [];
        this.passes.push(new ErmisPassSSR(ErmisPassSSR.ID));
    }
    getUniforms() {
        return ErmisEffectSSR.EffectUniforms;
    }
}
exports.default = ErmisEffectSSR;
ErmisEffectSSR.ID = "EffectSSR";
ErmisEffectSSR.EffectUniforms = [
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "ssrSamples",
        inEditor: true,
        define: true,
        title: "Samples",
        description: "The number of samples collected per pixel to calculate the total reflection. Larger values provide better quality but can have a performance hit.",
        default: 64,
        min: 1,
        max: 256,
        precision: 0,
        calcValue: (value) => {
            return value.toFixed(0);
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "ssrSmoothSteps",
        inEditor: true,
        define: true,
        title: "Smooth Steps",
        description: "The number of samples collected to smooth out the reflected value. Larger values provide better quality but can have a performance hit.",
        default: 5,
        min: 1,
        max: 30,
        precision: 0,
        calcValue: (value) => {
            return value.toFixed(0);
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "ssrThreshold",
        title: "Threshold",
        description: "Sets the reflection size.",
        inEditor: true,
        default: 1.2,
        min: 0,
        max: 3,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "ssrStrength",
        title: "Strength",
        description: "Sets the total strength of the rendered reflection.",
        inEditor: true,
        default: 1.0,
        min: 0,
        max: 5.0,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "ssrFalloff",
        title: "Falloff",
        description: "Adjusts how discrete the reflections are.",
        inEditor: true,
        default: 0.25,
        min: 0.01,
        max: 2,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "ssrStep",
        title: "Step",
        description: "Used to set the step used to iterate until the true color of a reflection pixel is found.",
        inEditor: true,
        default: 1.0,
        min: 1,
        max: 3.0,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "ssrRoughnessFactor",
        title: "RoughnessFactor",
        inEditor: true,
        default: 0.2,
        min: 0.0,
        max: 1.0,
        precision: 2
    }
];
class ErmisPassSSR extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
    }
    getVersionES(isGL2) {
        return ErmisPassSSR.ES;
    }
    getExtensions(isGL2) {
        if (isGL2 === false) {
            return "#extension GL_OES_standard_derivatives : enable";
        }
        else {
            return "";
        }
    }
    getVS(isGL2) {
        if (isGL2 === true && ErmisPassSSR.ES === 3) {
            return `#version 300 es
          in vec4 aPosition;
   
          out vec2 vUv0;
          
          void main(void){
              gl_Position = vec4(aPosition.xy, 0.0, 1.0);
              vUv0 = (aPosition.xy + 1.0) * 0.5;
          }`;
        }
        else {
            return;
        }
    }
    getPS(isGL2) {
        let uniforms = `
          uniform sampler2D previousEffect;
      `;
        let methods = "";
        const out = isGL2 === true && ErmisPassSSR.ES === 3 ? "out vec4 fragColor;" : "";
        const outputName = isGL2 === true && ErmisPassSSR.ES === 3 ? "fragColor" : "gl_FragColor";
        methods += `    
          vec3 getViewPositionFromDepth( const in vec2 screenPosition, const in float depth, const in float viewZ ) {                
              #ifdef GL2
                vec4 clipSpaceLocation;
                clipSpaceLocation.xy = screenPosition * 2.0 - 1.0;
                clipSpaceLocation.z = depth;
                clipSpaceLocation.w = 1.0;
                vec4 homogenousLocation = matrix_viewProjectionInverse * clipSpaceLocation;
                return homogenousLocation.xyz / homogenousLocation.w;
              #else                        
                float clipW = matrix_viewProjection[2][3] * viewZ + matrix_viewProjection[3][3];
                vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
                clipPosition *= clipW;
          
                return ( matrix_viewProjectionInverse * clipPosition ).xyz;
              #endif
          }
  
          vec3 getViewNormal( const in vec3 viewPosition ){
              return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );      
          }
         
        `;
        const textureMethod = isGL2 === true ? "texture" : "texture2D";
        const shader = `
        ${uniforms}
  
        ${methods}
  
        ${out}
  
        // Structs
        struct ReflectionInfo {
            vec3 color;
            vec4 coords;
        };      
        
        /**
         * According to specular, see https://en.wikipedia.org/wiki/Schlick%27s_approximation
         */
        vec3 fresnelSchlick(float cosTheta, vec3 F0){
            return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
        }    

        /**
         * Once the pixel's coordinates has been found, let's adjust (smooth) a little bit
         * by sampling multiple reflection pixels.
         */
        ReflectionInfo smoothReflectionInfo(vec3 dir, vec3 hitCoord)
        {
            ReflectionInfo info;
            info.color = vec3(0.0);
        
            vec4 projectedCoord;
            float sampledDepth;
        
            for(int i = 0; i < SSRSMOOTHSTEPS; i++)
            {
                projectedCoord = matrix_viewProjection * vec4(hitCoord, 1.0) + matrix_viewProjection[3][3];
                projectedCoord.xy /= projectedCoord.w;
                projectedCoord.xy = 0.5 * projectedCoord.xy + vec2(0.5);
        
                sampledDepth = getScreenDepth( projectedCoord.xy );
        
                float depth = sampledDepth - hitCoord.z;
        
                dir *= 0.5;
                if(depth > 0.0)
                    hitCoord -= dir;
                else
                    hitCoord += dir;
        
                info.color += ${textureMethod}(previousEffect, projectedCoord.xy).rgb;
            }
        
            projectedCoord = matrix_viewProjection * vec4(hitCoord, 1.0) + matrix_viewProjection[3][3];
            projectedCoord.xy /= projectedCoord.w;
            projectedCoord.xy = 0.5 * projectedCoord.xy + vec2(0.5);
         
            // Merge colors
            info.coords = vec4(projectedCoord.xy, sampledDepth, 1.0);
            info.color += ${textureMethod}(previousEffect, projectedCoord.xy).rgb;
            info.color /= float(SSRSMOOTHSTEPS + 1);
            return info;
        }
        
        
        /**
         * Tests the given world position (hitCoord) according to the given reflection vector (dir)
         * until it finds a collision (means that depth is enough close to say "it's the pixel to sample!").
         */
        ReflectionInfo getReflectionInfo(vec3 dir, vec3 hitCoord)
        {
            ReflectionInfo info;
            vec4 projectedCoord;
            float sampledDepth;
        
            dir *= ssrStep;
        
            for(int i = 0; i < SSRSAMPLES; i++)
            {
                hitCoord += dir;

                //https://github.com/playcanvas/engine/blob/master/src/graphics/program-lib/chunks/skybox.vert#L23

                projectedCoord = matrix_viewProjection * vec4(hitCoord, 1.0);
                projectedCoord.xyz /= projectedCoord.w;
                projectedCoord.xy = 0.5 * projectedCoord.xy + 0.5;
                
                float sampleDepth = getScreenDepth( projectedCoord.xy );
                float viewZ = getViewZ(sampleDepth, cameraNear, cameraFar);        
                sampledDepth = getViewPositionFromDepth( projectedCoord.xy, sampleDepth, viewZ ).z;

                float depth = sampledDepth - hitCoord.z;
        
                if(((depth - dir.z) < ssrThreshold) && depth <= 0.0)
                {
                    // #ifdef ENABLE_SMOOTH_REFLECTIONS
                        //return smoothReflectionInfo(dir, hitCoord);
                    // #else
                        info.color = ${textureMethod}(previousEffect, projectedCoord.xy).rgb;
                        info.coords = vec4(projectedCoord.xy, sampledDepth, 0.0);
                        return info;
                    //#endif
                }
            }
            
            info.color = ${textureMethod}(previousEffect, projectedCoord.xy).rgb;
            info.coords = vec4(projectedCoord.xy, sampledDepth, 0.0);
            return info;
        }        

        vec3 hash(vec3 a){
            a = fract(a * 0.8);
            a += dot(a, a.yxz + 19.19);
            return fract((a.xxy + a.yxx) * a.zyx);
        }        

        void main(void) {
  
          float linearDepth = getLinearScreenDepth( vUv0 );
          float depth = getScreenDepth( vUv0 );

          // Intensity
          vec3 albedo = ${textureMethod}(previousEffect, vUv0).rgb;
          float spec = 1.0;
          // float spec = ${textureMethod}(reflectivitySampler, vUv0).r;
          // if (spec == 0.0) {
          //     gl_FragColor = vec4(albedo, 1.0);
          //     return;
          // }          

          // Position
          float viewZ = getViewZ(depth, cameraNear, cameraFar);
  
          vec3 viewPosition = getViewPositionFromDepth( vUv0, depth, viewZ );
          vec3 viewNormal = getViewNormal( viewPosition );
          vec3 reflected = normalize(reflect(normalize(viewPosition), normalize(viewNormal)));
  
          //float roughness = 1.0 - texture2D(reflectivitySampler, vUV).a;
          //vec3 jitt = mix(vec3(0.0), hash(viewPosition), roughness) * ssrRoughnessFactor;
          vec3 jitt = mix(vec3(0.0), hash(viewPosition), 0.75) * ssrRoughnessFactor;
          
          //ReflectionInfo info = getReflectionInfo(jitt + reflected, viewPosition);
          ReflectionInfo info = getReflectionInfo(reflected, viewPosition); // For debug: no roughness

          vec2 dCoords = smoothstep(0.2, 0.6, abs(vec2(0.5, 0.5) - info.coords.xy));
          float screenEdgefactor = clamp(1.0 - (dCoords.x + dCoords.y), 0.0, 1.0);

          // Fresnel
          vec3 F0 = vec3(0.04);
          F0      = mix(F0, albedo, spec);
          vec3 fresnel = fresnelSchlick(max(dot(normalize(viewNormal), normalize(viewPosition)), 0.0), F0);          

          // Apply
          float reflectionMultiplier = clamp(pow(spec * ssrStrength, ssrFalloff) * screenEdgefactor * reflected.z, 0.0, 0.9);
          float albedoMultiplier = 1.0 - reflectionMultiplier;
          vec3 SSR = info.color * fresnel;          

          ${outputName} = vec4((albedo * albedoMultiplier) + (SSR * reflectionMultiplier), 1.0);
        }    
      `;
        return shader;
    }
}
ErmisPassSSR.ID = "PassSSR";
ErmisPassSSR.ES = 3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtZWZmZWN0LXNzci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZmZlY3RzL2VybWlzLWVmZmVjdC1zc3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFLOEI7QUFDOUIsbURBQStDO0FBRS9DLE1BQXFCLGNBQWUsU0FBUSwwQkFBVztJQW9HckQsWUFBWSxJQUFZLEVBQUUsUUFBNkI7UUFDckQsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV0QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sV0FBVztRQUNoQixPQUFPLGNBQWMsQ0FBQyxjQUFjLENBQUM7SUFDdkMsQ0FBQzs7QUE3R0gsaUNBOEdDO0FBN0dRLGlCQUFFLEdBQVcsV0FBVyxDQUFDO0FBRXpCLDZCQUFjLEdBQW9CO0lBQ3ZDO1FBQ0UsSUFBSSxFQUFFLDhCQUFlLENBQUMsS0FBSztRQUMzQixNQUFNLEVBQUUsUUFBUTtRQUNoQixJQUFJLEVBQUUsWUFBWTtRQUNsQixRQUFRLEVBQUUsSUFBSTtRQUNkLE1BQU0sRUFBRSxJQUFJO1FBQ1osS0FBSyxFQUFFLFNBQVM7UUFDaEIsV0FBVyxFQUNULG1KQUFtSjtRQUNySixPQUFPLEVBQUUsRUFBRTtRQUNYLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLEdBQUc7UUFDUixTQUFTLEVBQUUsQ0FBQztRQUNaLFNBQVMsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO1lBQzNCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixDQUFDO0tBQ0Y7SUFDRDtRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLFFBQVE7UUFDaEIs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
