
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ../core/ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_pass_1 = __webpack_require__(/*! ../core/ermis-pass */ "./src/core/ermis-pass.ts");
class ErmisEffectDof extends ermis_effect_1.ErmisEffect {
    constructor(name, settings) {
        super(name, settings);
        this.passes = [];
        this.passes.push(new ErmisPassDof(`${ErmisPassDof.ID}`));
    }
    getUniforms() {
        return ErmisEffectDof.EffectUniforms;
    }
}
exports.default = ErmisEffectDof;
ErmisEffectDof.ID = "EffectDof";
ErmisEffectDof.EffectUniforms = [
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "dofMaxBlur",
        title: "Max Blur",
        description: "The amount of blurring that will occur.",
        inEditor: true,
        default: 1,
        min: 0,
        max: 3,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "dofAperture",
        title: "Aperture",
        description: "Defines the opening on the rear of the 'lens' that determines the amount of light that is allowed to travel through.",
        inEditor: true,
        default: 0.005,
        min: 0,
        max: 0.1,
        precision: 3
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "dofFocus",
        title: "Focus",
        description: "The distance from the camera of the focus point where the effect is centered on.",
        inEditor: true,
        default: 10,
        min: 0.01,
        max: 100,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "dofRange",
        title: "Range",
        description: "The area around the focus point where blurring is gradually applied on.",
        inEditor: true,
        default: 25,
        min: 0.01,
        max: 1000,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "dofAspect",
        title: "Aspect",
        description: "Determines the base of the 'lens' starting point.",
        default: 1,
        inEditor: true
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "boolean",
        name: "dofDebug",
        title: "Debug",
        description: "Ideal to find the correct focus point, white areas get blurred.",
        default: false,
        inEditor: true
    }
];
class ErmisPassDof extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        let sceneZ = `
      float depth = getScreenDepth(vUv0);
      float cFar = cameraFar / (cameraFar - cameraNear);
      float sceneZ = ( -cameraNear * cFar ) / ( depth - cFar);
    `;
        if (isGL2 === false) {
            sceneZ = `
      float sceneZ = getScreenDepth(vUv0) * cameraFar;
      `;
        }
        const shader = `
      uniform sampler2D previousEffect;

      void main() {

        vec2 aspectCorrect = vec2( 1.0, dofAspect );

        ${sceneZ}

        float factor = clamp((1.0 / dofFocus - 1.0 / sceneZ) / dofRange * 500.0, -1.0, 1.0);

        if (dofDebug == 0.0) {
          
          vec2 dofblur = vec2(factor,factor) * dofAperture;
          vec2 dofblur9 = dofblur * 0.9 * dofMaxBlur;
          vec2 dofblur7 = dofblur * 0.7 * dofMaxBlur;
          vec2 dofblur4 = dofblur * 0.4 * dofMaxBlur;
  
          vec4 col;
          col  = texture2D( previousEffect, vUv0 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.0,   0.4  ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.15,  0.37 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.29,  0.29 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.37,  0.15 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.40,  0.0  ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.37, -0.15 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.29, -0.29 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.15, -0.37 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.0,  -0.4  ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.15,  0.37 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.29,  0.29 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.37,  0.15 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.4,   0.0  ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.37, -0.15 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.29, -0.29 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.15, -0.37 ) * aspectCorrect ) * dofblur );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.15,  0.37 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.37,  0.15 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.37, -0.15 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.15, -0.37 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.15,  0.37 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.37,  0.15 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.37, -0.15 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.15, -0.37 ) * aspectCorrect ) * dofblur9 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.29,  0.29 ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.40,  0.0  ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.29, -0.29 ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.0,  -0.4  ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.29,  0.29 ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.4,   0.0  ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.29, -0.29 ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.0,   0.4  ) * aspectCorrect ) * dofblur7 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.29,  0.29 ) * aspectCorrect ) * dofblur4 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.4,   0.0  ) * aspectCorrect ) * dofblur4 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.29, -0.29 ) * aspectCorrect ) * dofblur4 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.0,  -0.4  ) * aspectCorrect ) * dofblur4 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.29,  0.29 ) * aspectCorrect ) * dofblur4 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.4,   0.0  ) * aspectCorrect ) * dofblur4 );
          col += texture2D( previousEffect, vUv0 + ( vec2( -0.29, -0.29 ) * aspectCorrect ) * dofblur4 );
          col += texture2D( previousEffect, vUv0 + ( vec2(  0.0,   0.4  ) * aspectCorrect ) * dofblur4 );

          gl_FragColor = col / 41.0;
        }else{
          if (factor < 0.0) {
            gl_FragColor = factor  * -vec4(1.0, 1.0, 1.0, 1.0);
          }else{
            gl_FragColor = vec4(factor,factor,factor,1.0);
          }          
        }
      }    
    `;
        return shader;
    }
}
ErmisPassDof.ID = "PassDof";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtZWZmZWN0LWRvZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lZmZlY3RzL2VybWlzLWVmZmVjdC1kb2YudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFLOEI7QUFDOUIsbURBQStDO0FBRS9DLE1BQXFCLGNBQWUsU0FBUSwwQkFBVztJQTRFckQsWUFBWSxJQUFZLEVBQUUsUUFBNkI7UUFDckQsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV0QixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksQ0FBQyxHQUFHLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVNLFdBQVc7UUFDaEIsT0FBTyxjQUFjLENBQUMsY0FBYyxDQUFDO0lBQ3ZDLENBQUM7O0FBckZILGlDQXNGQztBQXJGUSxpQkFBRSxHQUFXLFdBQVcsQ0FBQztBQUV6Qiw2QkFBYyxHQUFvQjtJQUN2QztRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLFFBQVE7UUFDaEIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsS0FBSyxFQUFFLFVBQVU7UUFDakIsV0FBVyxFQUFFLHlDQUF5QztRQUN0RCxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxDQUFDO1FBQ1YsR0FBRyxFQUFFLENBQUM7UUFDTixHQUFHLEVBQUUsQ0FBQztRQUNOLFNBQVMsRUFBRSxDQUFDO0tBQ2I7SUFDRDtRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLFFBQVE7UUFDaEIsSUFBSSxFQUFFLGFBQWE7UUFDbkIsS0FBSyxFQUFFLFVBQVU7UUFDakIsV0FBVyxFQUNULHNIQUFzSDtRQUN4SCxRQUFRLEVBQUUsSUFBSTtRQUNkLE9BQU8sRUFBRSxLQUFLO1FBQ2QsR0FBRyxFQUFFLENBQUM7UUFDTixHQUFHLEVBQUUsR0FBRztRQUNSLFNBQVMsRUFBRSxDQUFDO0tBQ2I7SUFDRDtRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLFFBQVE7UUFDaEIsSUFBSSxFQUFFLFVBQVU7UUFDaEIsS0FBSyxFQUFFLE9BQU87UUFDZCxXQUFXLEVBQ1Qsa0ZBQWtGO1FBQ3BGLFFBQVEsRUFBRSxJQUFJO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxHQUFHO1FBQ1IsU0FBUyxFQUFFLENBQUM7S0FDYjtJQUNEO1FBQ0UsSUFBSSxFQUFFLDhCQUFlLENBQUMsS0FBSztRQUMzQixNQUFNLEVBQUUsUUFBUTtRQUNoQixJQUFJLEVBQUUsVUFBVTtRQUNoQixLQUFLLEVBQUUsT0FBTztRQUNkLFdBQVcsRUFDVCx5RUFBeUU7UUFDM0UsUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLElBQUk7UUFDVCxTQUFTLEVBQUUsQ0FBQztLQUNiO0lBQ0Q7UUFDRSxJQUFJLEVBQUUsOEJBQWUsQ0FBQyxLQUFLO1FBQzNCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLElBQUksRUFBRSxXQUFXO1FBQ2pCLEtBQUssRUFBRSxRQUFRO1FBQ2YsV0FBVyxFQUFFLG1EQUFtRDtRQUNoRSxPQUFPLEVBQUUsQ0FBQztRQUNWLFFBQVEsRUFBRSxJQUFJO0tBQ2Y7SUFDRDtRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLEtBQUs7UUFDM0IsTUFBTSxFQUFFLFNBQVM7UUFDakIsSUFBSSxFQUFFLFVBQVU7UUFDaEIsS0FBSyxFQUFFLE9BQU87UUFDZCxXQUFXLEVBQ1QsaUVBQWlFO1FBQ25FLE9BQU8sRUFBRSxLQUFLO1FBQ2QsUUFBUSxFQUFFLElBQUk7S0FDZjtDQUNGLENBQUM7QUFjSixNQUFNLFlBQWEsU0FBUSxzQkFBUztJQUtsQyxZQUFZLElBQVk7UUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFjLElBQVMsQ0FBQztJQUU5QixLQUFLLENBQUMsS0FBYztRQUNsQixJQUFJLE1BQU0sR0FBRzs7OztLQUlaLENBQUM7UUFDRixJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7WUFDbkIsTUFBTSxHQUFHOztPQUVSLENBQUM7U0FDSDtRQUVELE1BQU0sTUFBTSxHQUFHOzs7Ozs7O1VBT1QsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBK0RYLENBQUM7UUFDRixPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDOztBQTlGTSxlQUFFLEdBQVcsU0FBUyxDQUFDIn0=
