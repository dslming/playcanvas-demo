
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ../core/ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_pass_1 = __webpack_require__(/*! ../core/ermis-pass */ "./src/core/ermis-pass.ts");
class ErmisEffectSAO extends ermis_effect_1.ErmisEffect {
    constructor(name, settings) {
        super(name, settings);
        this.passes = [];
        this.passes.push(new ErmisPassSAO(ErmisPassSAO.ID));
        this.passes.push(new ErmisPassSAOBlur(ErmisPassSAOBlur.ID));
    }
    getUniforms() {
        return ErmisEffectSAO.EffectUniforms;
    }
}
exports.default = ErmisEffectSAO;
ErmisEffectSAO.ID = "EffectSAO";
ErmisEffectSAO.EffectUniforms = [
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoFar",
        title: "Far",
        description: "A ratio of how fast from the camera the effect fades out, larger values render the effect in greater view distances but in lower quality due to smaller precision.",
        inEditor: true,
        default: 1.0,
        min: 0,
        max: 2,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoSamples",
        inEditor: true,
        define: true,
        title: "Samples",
        description: "The number of samples collected per pixel to calculate the total occlusion. Larger values provide better quality but can have a performance hit.",
        default: 12,
        min: 1,
        max: 32,
        precision: 0,
        calcValue: (value) => {
            return value.toFixed(0);
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoIntensity",
        title: "Intensity",
        description: "Determines how dark the calculated occlusion is rendered.",
        inEditor: true,
        default: 1.5,
        min: 0,
        max: 3,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoScale",
        title: "Scale",
        description: "Determines how far from the world position of the pixel occlusion sample points will be collected.",
        inEditor: true,
        default: 0.5,
        min: 0,
        max: 1,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoBias",
        title: "Bias",
        description: "A ratio that discards any sample point that falls in that range used to decrease artifacts on edges. The value should be visually estimated depending on the rendered models.",
        inEditor: true,
        default: 0.25,
        min: 0.01,
        max: 2,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoKernelRadius",
        title: "Kernel Radius",
        description: "Determines the radius of the occlusion effect around a pixel.",
        inEditor: true,
        default: 25,
        min: 1,
        max: 150,
        precision: 0
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoRangeThreshold",
        title: "Range Threshold",
        inEditor: false,
        default: 0.0015,
        min: 0.0,
        max: 0.01,
        precision: 4
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoRangeFalloff",
        title: "Range Falloff",
        inEditor: false,
        default: 0.01,
        min: 0.0,
        max: 0.1,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "saoBlurRadius",
        title: "Blur Radius",
        description: "Blurs within the given radius the collected occlusion points to render a final smooth shadow.",
        inEditor: true,
        default: 0.75,
        min: 0.01,
        max: 2,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        name: "saoDebug",
        title: "Debug",
        description: "Ideal to check how the effect is rendered and adjust the parameters.",
        default: false,
        inEditor: true
    }
];
class ErmisPassSAO extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
    }
    getVersionES(isGL2) {
        return ErmisPassSAO.ES;
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
        if (isGL2 === true && ErmisPassSAO.ES === 3) {
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
        #define NUM_RINGS 7
    `;
        let methods = "";
        const out = isGL2 === true && ErmisPassSAO.ES === 3 ? "out vec4 fragColor;" : "";
        const outputName = isGL2 === true && ErmisPassSAO.ES === 3 ? "fragColor" : "gl_FragColor";
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
    
        float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {
          vec3 viewDelta = sampleViewPosition - centerViewPosition;
          float viewDistance = length( viewDelta ) * saoScale;

          return max(0.0, (dot(centerViewNormal, viewDelta) ) / viewDistance - saoBias) / (1.0 + pow2( viewDistance ) );
        }

        const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( SAOSAMPLES );
        const float INV_SAOSAMPLES = 1.0 / float( SAOSAMPLES );

        float getAmbientOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in float depth ) {

            float angle = rand( vUv0 ) * PI2;
            vec2 radius = vec2( saoKernelRadius * INV_SAOSAMPLES ) / resolution;
            vec2 radiusStep = radius;
            
            float occlusionSum = 0.0;
            float weightSum = 0.0;

            vec2 proximityCutoff = vec2(saoRangeThreshold, min(saoRangeThreshold + saoRangeFalloff, 1.0 - 1e-6));
            
            for( int i = 0; i < SAOSAMPLES; i ++ ) {
                vec2 sampleUv = vUv0 + vec2( cos( angle ), sin( angle ) ) * radius;
                radius += radiusStep;
                angle += ANGLE_STEP;

                float sampleDepth = getScreenDepth( sampleUv );
                if( sampleDepth >= ( 1.0 - EPSILON ) ) {
                  continue;
                }

                float proximity = abs(depth - sampleDepth);

                float sampleViewZ = getViewZ( sampleDepth, cameraNear, cameraFar );
                vec3 sampleViewPosition = getViewPositionFromDepth( sampleUv, sampleDepth, sampleViewZ );                
                float falloff = 1.0 - smoothstep(proximityCutoff.x, proximityCutoff.y, proximity);                  

                occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition ) * falloff;
                weightSum += 1.0;                  
            }

            if( weightSum == 0.0 ) return 0.0;
            return occlusionSum * ( saoIntensity / weightSum );
        }       
      `;
        const shader = `
      ${uniforms}

      ${methods}

      ${out}

      void main(void) {

        float linearDepth = getLinearScreenDepth( vUv0 );
        float depth = getScreenDepth( vUv0 );

        float ambientOcclusion = 1.0;
        
        if( linearDepth < saoFar ){      
          float viewZ = getViewZ(depth, cameraNear, cameraFar);
  
          vec3 viewPosition = getViewPositionFromDepth( vUv0, depth, viewZ );
          vec3 viewNormal = getViewNormal( viewPosition );

          ambientOcclusion -= getAmbientOcclusion( viewPosition, viewNormal, depth );
        }

        ${outputName} = vec4( vec3(ambientOcclusion), 1.0);
      }    
    `;
        return shader;
    }
}
ErmisPassSAO.ID = "PassSAO";
ErmisPassSAO.ES = 3;
class ErmisPassSAOBlur extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        let uniforms = `
        uniform sampler2D previousEffect;
        uniform sampler2D PassDepth;
        uniform sampler2D PassSAO;

        #define EDGE_SHARPNESS 1.0
    `;
        let methods = `            
        float blurAO(vec2 screenSpaceOrigin) {

          float sum = texture2D(PassSAO, screenSpaceOrigin).x;
          float originDepth = getLinearScreenDepth(screenSpaceOrigin);

          float totalWeight = 1.0;
          sum *= totalWeight;

          for (int x = -4; x <= 4; x++) {
              for (int y = -4; y <= 4; y++) {
                  if (x != 0 || y != 0) {
                      vec2 samplePosition = screenSpaceOrigin +
                      vec2(float(x), float(y)) * vec2(1.0/resolution.x, 1.0/resolution.y) * saoBlurRadius;
                      float ao = texture2D(PassSAO, samplePosition).x;
                      float sampleDepth = getLinearScreenDepth( samplePosition );
                      int kx = 4 - (x < 0 ? -x : x);
                      int ky = 4 - (y < 0 ? -y : y);
                      float weight = 0.3 + (abs(float(x * y)) / (25.0 * 25.0));
                      weight *= max(0.0, 1.0 - (EDGE_SHARPNESS * 2000.0) * abs(sampleDepth - originDepth));
                      sum += ao * weight;
                      totalWeight += weight;
                  }
              }
          }
          const float epsilon = 0.0001;
          return sum / (totalWeight + epsilon);
        }    
    `;
        const shader = `
      ${uniforms}

      ${methods}
      
      void main() {

        float occlusion = blurAO(vUv0);

        vec4 diffuse = texture2D( previousEffect, vUv0 );        

        if (saoDebug == 0.0) {
          gl_FragColor = vec4(diffuse.xyz * occlusion, 1.0);
        }else{
          gl_FragColor = vec4(vec3(occlusion), 1.0);
        }
      }    
    `;
        return shader;
    }
}
ErmisPassSAOBlur.ID = "PassSAOBlur";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtZWZmZWN0LXNhby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZmZlY3RzL2VybWlzLWVmZmVjdC1zYW8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFLOEI7QUFDOUIsbURBQStDO0FBRS9DLE1BQXFCLGNBQWUsU0FBUSwwQkFBVztJQW9JckQsWUFBWSxJQUFZLEVBQUUsUUFBNkI7UUFDckQsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV0QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVNLFdBQVc7UUFDaEIsT0FBTyxjQUFjLENBQUMsY0FBYyxDQUFDO0lBQ3ZDLENBQUM7O0FBOUlILGlDQStJQztBQTlJUSxpQkFBRSxHQUFXLFdBQVcsQ0FBQztBQUV6Qiw2QkFBYyxHQUFvQjtJQUN2QztRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLFFBQVE7UUFDaEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxLQUFLLEVBQUUsS0FBSztRQUNaLFdBQVcsRUFDVCxvS0FBb0s7UUFDdEssUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsR0FBRztRQUNaLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLENBQUM7UUFDTixTQUFTLEVBQUUsQ0FBQztLQUNiO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsOEJBQWUsQ0FBQyxLQUFLO1FBQzNCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLElBQUksRUFBRSxZQUFZO1FBQ2xCLFFBQVEsRUFB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
