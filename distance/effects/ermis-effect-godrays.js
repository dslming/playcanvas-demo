
Object.defineProperty(exports, "__esModule", { value: true });
const ermis_effect_1 = __webpack_require__(/*! ../core/ermis-effect */ "./src/core/ermis-effect.ts");
const ermis_pass_1 = __webpack_require__(/*! ../core/ermis-pass */ "./src/core/ermis-pass.ts");
class ErmisEffectGodrays extends ermis_effect_1.ErmisEffect {
    constructor(name, settings) {
        super(name, settings);
        this.passes = [];
        this.passes.push(new ErmisPassGodraysLight(ErmisPassGodraysLight.ID));
        this.passes.push(new ErmisPassGodrays(ErmisPassGodrays.ID, ErmisPassGodraysLight.ID));
    }
    getUniforms() {
        return ErmisEffectGodrays.EffectUniforms;
    }
}
exports.default = ErmisEffectGodrays;
ErmisEffectGodrays.ID = "EffectGodrays";
ErmisEffectGodrays.vec = new pc.Vec3();
ErmisEffectGodrays.resolution = [0, 0];
ErmisEffectGodrays.lightScreenPos = [0, 0, 0];
ErmisEffectGodrays.EffectUniforms = [
    {
        type: ermis_effect_1.ShaderDataTypes.vec4,
        pcType: "entity",
        name: "godLightPosition",
        inEditor: true,
        title: "Light Emitter",
        description: "Drag and drop any entity (not necessarily a light), its world position will be used to calculate the center of the effect on screen.",
        calcValue: (entity, app, camera) => {
            const lightScreenPos = ErmisEffectGodrays.lightScreenPos;
            if (!entity)
                return lightScreenPos;
            const device = app.graphicsDevice;
            const lightPos = entity.getPosition();
            const vec = ErmisEffectGodrays.vec;
            const resolution = ErmisEffectGodrays.resolution;
            resolution[0] = device.width / window.devicePixelRatio;
            resolution[1] = device.height / window.devicePixelRatio;
            camera.camera.worldToScreen(lightPos, vec);
            lightScreenPos[0] = vec.x / resolution[0];
            lightScreenPos[1] = 1.0 - vec.y / resolution[1];
            lightScreenPos[2] = vec.z > 0 ? 1.0 : 0.0;
            lightScreenPos[3] = window.devicePixelRatio;
            return lightScreenPos;
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "godQuality",
        inEditor: true,
        define: true,
        title: "Quality",
        description: "Three presets for quality are available from Low to High, better quality with the cost in performance.",
        default: 2,
        enum: [{ Low: 0 }, { Medium: 1 }, { High: 2 }],
        calcValue: (value) => {
            return value.toFixed(0);
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "godIntensity",
        inEditor: true,
        title: "Intensity",
        description: "The intensity of the light accumulated in the center of the effect.",
        default: 2.0,
        min: 0.01,
        max: 3,
        precision: 2,
        calcValue: (value) => {
            const from1 = 0.01;
            const to1 = 2.0;
            const from2 = 0.5;
            const to2 = 1.2;
            return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "godWeight",
        inEditor: true,
        title: "Weight",
        description: "Determines the outer rim of the light on the center of the effect.",
        default: 0.43,
        min: 0,
        max: 1,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "godDecay",
        inEditor: true,
        title: "Decay",
        description: "Determines how fast the rays will decay from the light source.",
        default: 0.024,
        min: 0,
        max: 0.05,
        precision: 3,
        calcValue: (value) => {
            return 1.0 - value;
        }
    },
    {
        type: ermis_effect_1.ShaderDataTypes.float,
        pcType: "number",
        name: "godExposure",
        inEditor: true,
        title: "Exposure",
        description: "A multiplier to increase exponentially the amount of light calculated.",
        default: 0.3,
        min: 0,
        max: 1,
        precision: 2
    },
    {
        type: ermis_effect_1.ShaderDataTypes.vec3,
        pcType: "rgb",
        name: "godColor",
        inEditor: true,
        title: "Color",
        description: "The color of the light source.",
        default: [0.835, 0.812, 0.318]
    }
];
class ErmisPassGodraysLight extends ermis_pass_1.ErmisPass {
    constructor(name) {
        super(name);
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        return `
    float sun( vec2 uv, vec2 p ){
        float di = distance(uv, p) * godLightPosition.w;
        return (di <= .3333 / godWeight ? sqrt(1. - di*3./ godWeight) : 0.);
    }

    float readScreenDepth(vec2 uv) {
      #ifdef GL2
        return linearizeDepth(texture2D(uDepthMap, uv).r);
      #else
        return unpackFloat(texture2D(uDepthMap, uv));
      #endif
    }          

    void main() {

      vec2 uv = vUv0.xy;

      // sun size and position
      float aspect = resolution.x / resolution.y;
      vec2 coords = uv;
      coords.x *= aspect;

      vec2 sunPos = godLightPosition.xy;
      sunPos.x *= aspect;
      float light = sun(coords, sunPos);

      // get occluders
      float depth = 1.0 - readScreenDepth(uv);
      float occluders = min(depth, 1.);

      float col = max( (light - occluders) * godIntensity, 0.);

      gl_FragColor = vec4(col * godLightPosition.z,occluders,0.0,0.0);
    }    
    `;
    }
}
ErmisPassGodraysLight.ID = "PassGodraysLight";
class ErmisPassGodrays extends ermis_pass_1.ErmisPass {
    constructor(name, inputMapName) {
        super(name);
        this.inputMapName = inputMapName;
    }
    getVS(isGL2) { }
    getPS(isGL2) {
        return `
    uniform sampler2D previousEffect;
    uniform sampler2D ${this.inputMapName};

    #define DITHER			//Dithering toggle
    #if (GODQUALITY==2)
     #define SAMPLES	64
     #define DENSITY	.97
     #define WEIGHT		.25
    #else
    #if (GODQUALITY==1)
     #define SAMPLES	32
     #define DENSITY	.95
     #define WEIGHT		.25
    #else
     #define SAMPLES	16
     #define DENSITY	.93
     #define WEIGHT		.36
    #endif
    #endif
    

    void main() {

        vec2 uv = vUv0.xy;
        vec2 coord = uv;        
        vec2 lightPos = godLightPosition.xy;
        
        float occ = texture2D(${this.inputMapName}, uv).x; //light
        float obj = texture2D(${this.inputMapName}, uv).y; //objects
        float dither = rand(uv);

        vec2 dtc = (coord - lightPos) * (1. / float(SAMPLES) * DENSITY);
        float illumdecay = 1.;
        
        for(int i=0; i<SAMPLES; i++)
        {
            coord -= dtc;
            #ifdef DITHER
              float s = texture2D(${this.inputMapName}, coord+(dtc*dither)).x;
            #else
              float s = texture2D(${this.inputMapName}, coord).x;
            #endif
            s *= illumdecay * WEIGHT;
            occ += s;
            illumdecay *= godDecay;
        }

        float rays = occ*godExposure * godLightPosition.z;

        vec4 base = texture2D( previousEffect, vUv0 );

        vec4 blend = (1.0 - (1.0 - base) * (1.0 - rays * vec4(godColor, 1.0)));
  
        gl_FragColor = blend;
        //gl_FragColor = vec4(rays,rays,rays,1.0);
    }    
    `;
        // Separate the color of the rays from the sun
        // vec3 inputColor = vec3(0., 0., 0.)+occ*EXPOSURE;
        // vec3 rays = min(godColor + inputColor, 1.0) * inputColor;
        // gl_FragColor =  texture2D( previousEffect, vUv0 ) + vec4( mix(rays, -inputColor, godColorNo), 1.0);
    }
}
ErmisPassGodrays.ID = "PassGodrays";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJtaXMtZWZmZWN0LWdvZHJheXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZWZmZWN0cy9lcm1pcy1lZmZlY3QtZ29kcmF5cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUs4QjtBQUM5QixtREFBK0M7QUFFL0MsTUFBcUIsa0JBQW1CLFNBQVEsMEJBQVc7SUFrSXpELFlBQVksSUFBWSxFQUFFLFFBQTZCO1FBQ3JELEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLElBQUksZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUNwRSxDQUFDO0lBQ0osQ0FBQztJQUVNLFdBQVc7UUFDaEIsT0FBTyxrQkFBa0IsQ0FBQyxjQUFjLENBQUM7SUFDM0MsQ0FBQzs7QUE5SUgscUNBK0lDO0FBOUlRLHFCQUFFLEdBQVcsZUFBZSxDQUFDO0FBRTdCLHNCQUFHLEdBQVksSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0IsNkJBQVUsR0FBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QixpQ0FBYyxHQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUVyQyxpQ0FBYyxHQUFvQjtJQUN2QztRQUNFLElBQUksRUFBRSw4QkFBZSxDQUFDLElBQUk7UUFDMUIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixRQUFRLEVBQUUsSUFBSTtRQUNkLEtBQUssRUFBRSxlQUFlO1FBQ3RCLFdB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
