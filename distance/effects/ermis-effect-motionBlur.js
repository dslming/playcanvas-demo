
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ../core/ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_pass_1 = __webpack_require__(/*! ../core/ermis-pass */ "./src/core/ermis-pass.ts");
class ErmisEffectMotionBlur extends ermis_effect_1.ErmisEffect {
    constructor(name, settings) {
        super(name, settings);
        this.passes = [];
        this.passes.push(new ErmisPassMotionBlur(ErmisPassMotionBlur.ID));
    }
    getUniforms() {
        return ErmisEffectMotionBlur.EffectUniforms;
    }
}
exports.default = ErmisEffectMotionBlur;
ErmisEffectMotionBlur.ID = "EffectMotionBlur";
ErmisEffectMotionBlur.EffectUniforms = [
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "motionBlurSamples",
        inEditor: true,
        define: true,
        title: "Samples",
        description: "The number of samples collected per pixel to calculate the total motion blur. Larger values provide better quality but can have a performance hit.",
        default: 32,
        min: 8,
        max: 128,
        precision: 0,
        calcValue: (value) => {
            return value.toFixed(0);
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "motionBlurStrength",
        title: "Strength",
        description: "Determines how intense the calculated motion blurring is.",
        inEditor: true,
        default: 2.0,
        min: 0,
        max: 20,
        precision: 3,
        calcValue: (value) => {
            return value * 0.01;
        }
    }
];
class ErmisPassMotionBlur extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        const shader = `
        uniform sampler2D previousEffect;
  
        void main() {

            float depth = getScreenDepth( vUv0 );
            float linearDepth = getLinearScreenDepth( vUv0 );

            vec4 result = texture2D(previousEffect, vUv0);

            if( linearDepth < 1.0 ){
                float viewZ = getViewZ(linearDepth, cameraNear, cameraFar);
            
                vec2 currentPos = getViewPosition( vUv0, linearDepth, viewZ, matrix_viewProjection, matrix_viewProjectionInverse ).xy;
                vec2 previousPos = getViewPosition( vUv0, linearDepth, viewZ, matrix_viewProjectionPrevious, matrix_viewProjectionInversePrevious ).xy;
    
                // Use this frame's position and last frame's to compute the pixel velocity.  
                vec2 velocity = 0.01 * motionBlurStrength * ( currentPos - previousPos ) * .5;
    
                // Calculate the blurring based using the velocity as an offset
                vec2 texelSize = 1.0 / resolution;
                float speed = length(velocity / texelSize);      

                int samplesCount = int(clamp(speed, 1.0, float(MOTIONBLURSAMPLES)));
    
                velocity = normalize(velocity) * texelSize;
                float hlim = float(-samplesCount) * 0.5 + 0.5;
    
                for( int i = 1; i < MOTIONBLURSAMPLES; ++i ) {
                    
                    if (i >= samplesCount) break;
    
                    vec2 offset = vUv0 + velocity * (hlim + float(i));
                    result += texture2D(previousEffect, offset);
                }
    
                gl_FragColor = result / float(samplesCount);
                
            }else{

                gl_FragColor = result;
            }
        }    
      `;
        return shader;
    }
}
ErmisPassMotionBlur.ID = "PassMotionBlur";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtZWZmZWN0LW1vdGlvbkJsdXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZWZmZWN0cy9lcm1pcy1lZmZlY3QtbW90aW9uQmx1ci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUs4QjtBQUM5QixtREFBK0M7QUFFL0MsTUFBcUIscUJBQXNCLFNBQVEsMEJBQVc7SUFzQzVELFlBQVksSUFBWSxFQUFFLFFBQTZCO1FBQ3JELEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTSxXQUFXO1FBQ2hCLE9BQU8scUJBQXFCLENBQUMsY0FBYyxDQUFDO0lBQzlDLENBQUM7O0FBL0NILHdDQWdEQztBQS9DUSx3QkFBRSxHQUFXLGtCQUFrQixDQUFDO0FBRWhDLG9DQUFjLEdBQW9CO0lBQ3ZDO1FBQ0UsSUFBSSxFQUFFLDhCQUFlLENBQUMsS0FBSztRQUMzQixNQUFNLEVBQUUsUUFBUTtRQUNoQixJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsTUFBTSxFQUFFLElBQUk7UUFDWixLQUFLLEVBQUUsU0FBUztRQUNoQixXQUFXLEVBQ1Qsb0pBQW9KO1FBQ3RKLE9BQU8sRUFBRSxFQUFFO1FBQ1gsR0FBRyxFQUFFLENBQUM7UUFDTixHQUFHLEVBQUUsR0FBRztRQUNSLFNBQVMsRUFBRSxDQUFDO1FBQ1osU0FBUyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7WUFDM0IsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLENBQUM7S0FDRjtJQUNEO1FBQ0UsSUFBSSxFQUFFLDhCQUFlLENBQUMsS0FBSztRQUMzQixNQUFNLEVBQUUsUUFBUTtRQUNoQixJQUFJLEVBQUUsb0JBQW9CO1FBQzFCLEtBQUssRUFBRSxVQUFVO1FBQ2pCLFdBQVcsRUFBRSwyREFBMkQ7UUFDeEUsUUFBUSxFQUFFLElBQUk7UUFDZCxPQUFPLEVBQUUsR0FBRztRQUNaLEdBQUcsRUFBRSxDQUFDO1FBQ04sR0FBRyxFQUFFLEVBQUU7UUFDUCxTQUFTLEVBQUUsQ0FBQztRQUNaLFNBQVMsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO1lBQzNCLE9BQU8sS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO0tBQ0Y7Q0FDRixDQUFDO0FBY0osTUFBTSxtQkFBb0IsU0FBUSxzQkFBUztJQUt6QyxZQUFZLElBQVk7UUFDdEIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFjLElBQVMsQ0FBQztJQUU5QixLQUFLLENBQUMsS0FBYztRQUNsQixNQUFNLE1BQU0sR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTJDWixDQUFDO1FBQ0osT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQzs7QUF4RE0sc0JBQUUsR0FBVyxnQkFBZ0IsQ0FBQyJ9
