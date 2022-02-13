
Object.defineProperty(exports, "__esModule", { value: true });
class ErmisCommon {
    constructor() {
    }
}
exports.default = ErmisCommon;
ErmisCommon.fragmentMethods = `
  
    #define PI 3.14159265359
    #define PI2 6.28318530718      
    #define EPSILON 1e-6

    uniform sampler2D uDepthMap;

    uniform float cameraNear;
    uniform float cameraFar;
    uniform float time;
    uniform float delta;

    uniform mat4 matrix_projection;
    uniform mat4 matrix_viewProjection;
    uniform mat4 matrix_viewProjectionPrevious;
    uniform mat4 matrix_viewProjectionInverse;
    uniform mat4 matrix_viewProjectionInversePrevious;
    uniform vec2 resolution;
    uniform float mipLevel;

    #ifndef SCREENSIZE
    #define SCREENSIZE
    uniform vec4 uScreenSize;
    #endif
    
    #ifndef VIEWMATRIX
    #define VIEWMATRIX
    uniform mat4 matrix_view;
    #endif
    
    #ifndef CAMERAPLANES
    #define CAMERAPLANES
    uniform vec4 camera_params; // 1 / camera_far,      camera_far,     (1 - f / n) / 2,        (1 + f / n) / 2
    #endif

    float pow2( float x ) { return x*x; }

    highp float rand( vec2 uv ) {
        const highp float a = 12.9898, b = 78.233, c = 43758.5453;
        highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
        return fract(sin(sn) * c);
    }
    
    #ifdef GL2
        float linearizeDepth(float z) {
            z = z * 2.0 - 1.0;
            return 1.0 / (camera_params.z * z + camera_params.w);
        }
    #else
        #ifndef UNPACKFLOAT
        #define UNPACKFLOAT
        float unpackFloat(vec4 rgbaDepth) {
            const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
            return dot(rgbaDepth, bitShift);
        }
        #endif
    #endif
    
    // Retrieves rendered linear camera depth by UV
    float getLinearScreenDepth(vec2 uv) {
      #ifdef GL2
          #ifdef ES3
              return linearizeDepth(texture(uDepthMap, uv).r) * camera_params.y * 0.01;
          #else
              return linearizeDepth(texture2D(uDepthMap, uv).r) * camera_params.y * 0.01;
          #endif          
      #else
          return unpackFloat(texture2D(uDepthMap, uv)) * camera_params.y * 0.01;
      #endif
    }   
    
    float getScreenDepth(vec2 uv) {
      #ifdef GL2
          #ifdef ES3
              return texture(uDepthMap, uv).r;
          #else
              return texture2D(uDepthMap, uv).r;
          #endif  
      #else
        return unpackFloat(texture2D(uDepthMap, uv));
      #endif
    }      
    
    float getViewZ( const in float depth, const in float near, const in float far ) {
        return ( near * far ) / ( ( far - near ) * depth - far );
    }   
    
    vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ, const in mat4 projection, const in mat4 projectionInverse ) {    
        float clipW = projection[2][3] * viewZ + projection[3][3];
        vec4 clipPosition = vec4( ( vec3( screenPosition * 2.0 - 1.0, depth ) - 0.5 ) * 2.0, 1.0 );
        clipPosition *= clipW;
    
        return ( projectionInverse * clipPosition ).xyz;
    }       
  `;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9lcm1pcy1jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFxQixXQUFXO0lBa0c5QjtJQUFlLENBQUM7O0FBbEdsQiw4QkFtR0M7QUFsR1EsMkJBQWUsR0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0ErRmhDLENBQUMifQ==
