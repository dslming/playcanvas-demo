function baseName(t) {
  var e = t.substring(t.lastIndexOf("/") + 1);
  return -1 != e.lastIndexOf(".") && (e = e.substring(0, e.lastIndexOf("."))),
    e
}
var Ui = pc.createScript("ui");
Ui.attributes.add("css", {
    type: "asset",
    assetType: "css"
  }),
  Ui.attributes.add("skyboxes", {
    type: "asset",
    assetType: "texture",
    array: !0
  }),
  Ui.attributes.add("buttonAudio", {
    type: "asset",
    assetType: "texture"
  }),
  Ui.attributes.add("buttonGuardians", {
    type: "asset",
    assetType: "texture"
  }),
  Ui.attributes.add("buttonJoachim", {
    type: "asset",
    assetType: "texture"
  }),
  Ui.prototype.initialize = function() {
    var t = this.app,
      e = document.createElement("style");
    e.innerHTML = this.css.resource,
      document.querySelector("head").appendChild(e);
    var a = this,
      s = new Image;
    s.src = this.buttonJoachim.getFileUrl();
    var i = document.createElement("a");
    i.classList.add("author", "ui-element"),
      i.target = "_blank",
      i.href = "https://joachimcoppens.com/",
      i.title = "Joachim Coppens",
      i.appendChild(s),
      document.body.appendChild(i),
      i.addEventListener("touchstart", (function(t) {
        t.stopPropagation()
      }));
    var n = new Image;
    n.src = this.buttonGuardians.getFileUrl();
    var o = document.createElement("a");
    o.classList.add("website", "ui-element"),
      o.target = "_blank",
      o.href = "https://www.marvel.com/movies/guardians-of-the-galaxy",
      o.title = "Guardians of the Galaxy",
      o.appendChild(n),
      document.body.appendChild(o),
      o.addEventListener("touchstart", (function(t) {
        t.stopPropagation()
      }));
    var r = new Image;
    if (r.src = this.buttonAudio.getFileUrl(),
      r.classList.add("music", "ui-element"),
      r.addEventListener("click", (function() {
        this.classList.toggle("off"),
          this.classList.contains("off") ? a.app.systems.sound.volume = 0 : a.app.systems.sound.volume = .5
      })),
      r.addEventListener("touchstart", (function(t) {
        t.stopPropagation()
      })),
      document.body.appendChild(r),
      this.skyboxes) {
      var d = document.createElement("div");
      d.classList.add("ui-buttons"),
        document.body.appendChild(d);
      this.skyboxes.forEach((function(e, a) {
        var s = e.getFileUrl(),
          i = new Image;
        i.src = s,
          i.classList.add("ui-button", "ui-element"),
          0 === a && i.classList.add("active");
        var n, o = (n = baseName(s),
          function(e) {
            d.querySelectorAll("img.active").forEach((function(t) {
                t.classList.remove("active")
              })),
              this.classList.add("active"),
              e.preventDefault(),
              e.stopPropagation(),
              t.fire("skybox", n)
          }
        );
        i.addEventListener("click", o),
          i.addEventListener("touchstart", o),
          d.appendChild(i)
      }))
    }
    var stopMousePropagation = function(t) {
      t.preventDefault(),
        t.stopPropagation()
    };
    document.querySelectorAll(".ui-element").forEach((function(t) {
      t.addEventListener("mousedown", stopMousePropagation, !1),
        t.addEventListener("mouseup", stopMousePropagation, !1)
    }))
  };
var Eyes = pc.createScript("eyes");
Eyes.prototype.update = function(e) {
  var t = .7 + .15 * Math.random() * Math.sin(Date.now() / 500) + .05 * Math.random(),
    a = this.entity.model.meshInstances[0].material;
  a.emissiveIntensity = t,
    a.update()
};
var Skybox = pc.createScript("skybox");
Skybox.attributes.add("skyboxes", {
    type: "json",
    schema: [{
      name: "cubemap",
      title: "Cubemap",
      description: "The skybox cubemap.",
      type: "asset",
      assetType: "cubemap"
    }, {
      name: "exposure",
      title: "Exposure",
      description: "The exposure for the cubemap.",
      type: "number",
      min: 0,
      max: 25,
      default: 1
    }],
    array: !0
  }),
  Skybox.prototype.initialize = function() {
    this.targetExposure = this.app.scene.exposure,
      this.app.on("skybox", this.setSkybox, this)
  },
  Skybox.prototype.setSkybox = function(e) {
    for (var s = 0; s < this.skyboxes.length; s++) {
      var t = this.skyboxes[s];
      t.cubemap.name === e && (this.app.scene.setSkybox(t.cubemap.resources),
        this.targetExposure = t.exposure)
    }
  },
  Skybox.prototype.update = function(e) {
    this.targetExposure !== this.app.scene.exposure && (this.app.scene.exposure += .1 * (this.targetExposure - this.app.scene.exposure),
      Math.abs(this.targetExposure - this.app.scene.exposure) < .1 && (this.app.scene.exposure = this.targetExposure))
  };

function BrightnessContrastEffect(t) {
  pc.PostEffect.call(this, t),
    this.shader = new pc.Shader(t, {
      attributes: {
        aPosition: pc.SEMANTIC_POSITION
      },
      vshader: ["attribute vec2 aPosition;", "", "varying vec2 vUv0;", "", "void main(void)", "{", "    gl_Position = vec4(aPosition, 0.0, 1.0);", "    vUv0 = (aPosition.xy + 1.0) * 0.5;", "}"].join("\n"),
      fshader: ["precision " + t.precision + " float;", "", "uniform sampler2D uColorBuffer;", "uniform float uBrightness;", "uniform float uContrast;", "", "varying vec2 vUv0;", "", "void main() {", "    gl_FragColor = texture2D( uColorBuffer, vUv0 );", "    gl_FragColor.rgb += uBrightness;", "", "    if (uContrast > 0.0) {", "        gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - uContrast) + 0.5;", "    } else {", "        gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + uContrast) + 0.5;", "    }", "}"].join("\n")
    }),
    this.brightness = 0,
    this.contrast = 0
}
BrightnessContrastEffect.prototype = Object.create(pc.PostEffect.prototype),
  BrightnessContrastEffect.prototype.constructor = BrightnessContrastEffect,
  Object.assign(BrightnessContrastEffect.prototype, {
    render: function(t, e, s) {
      var r = this.device,
        i = r.scope;
      i.resolve("uBrightness").setValue(this.brightness),
        i.resolve("uContrast").setValue(this.contrast),
        i.resolve("uColorBuffer").setValue(t.colorBuffer),
        pc.drawFullscreenQuad(r, e, this.vertexBuffer, this.shader, s)
    }
  });
var BrightnessContrast = pc.createScript("brightnessContrast");
BrightnessContrast.attributes.add("brightness", {
    type: "number",
    default: 0,
    min: -1,
    max: 1,
    title: "Brightness"
  }),
  BrightnessContrast.attributes.add("contrast", {
    type: "number",
    default: 0,
    min: -1,
    max: 1,
    title: "Contrast"
  }),
  BrightnessContrast.prototype.initialize = function() {
    this.effect = new BrightnessContrastEffect(this.app.graphicsDevice),
      this.effect.brightness = this.brightness,
      this.effect.contrast = this.contrast,
      this.on("attr", (function(t, e) {
        this.effect[t] = e
      }), this);
    var t = this.entity.camera.postEffects;
    // t.addEffect(this.effect)
    this.on("state", (function(e) {
        e ? t.addEffect(this.effect) : t.removeEffect(this.effect)
      })),
      this.on("destroy", (function() {
        t.removeEffect(this.effect)
      }))
  };

function FxaaEffect(e) {
  pc.PostEffect.call(this, e);
  var o = {
      aPosition: pc.SEMANTIC_POSITION
    },
    t = ["attribute vec2 aPosition;", "", "void main(void)", "{", "    gl_Position = vec4(aPosition, 0.0, 1.0);", "}"].join("\n"),
    a = ["precision " + e.precision + " float;", "", "uniform sampler2D uColorBuffer;", "uniform vec2 uResolution;", "", "#define FXAA_REDUCE_MIN   (1.0/128.0)", "#define FXAA_REDUCE_MUL   (1.0/8.0)", "#define FXAA_SPAN_MAX     8.0", "", "void main()", "{", "    vec3 rgbNW = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * uResolution ).xyz;", "    vec3 rgbNE = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * uResolution ).xyz;", "    vec3 rgbSW = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * uResolution ).xyz;", "    vec3 rgbSE = texture2D( uColorBuffer, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * uResolution ).xyz;", "    vec4 rgbaM  = texture2D( uColorBuffer,  gl_FragCoord.xy  * uResolution );", "    vec3 rgbM  = rgbaM.xyz;", "    float opacity  = rgbaM.w;", "", "    vec3 luma = vec3( 0.299, 0.587, 0.114 );", "", "    float lumaNW = dot( rgbNW, luma );", "    float lumaNE = dot( rgbNE, luma );", "    float lumaSW = dot( rgbSW, luma );", "    float lumaSE = dot( rgbSE, luma );", "    float lumaM  = dot( rgbM,  luma );", "    float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );", "    float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );", "", "    vec2 dir;", "    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));", "    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));", "", "    float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );", "", "    float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );", "    dir = min( vec2( FXAA_SPAN_MAX, FXAA_SPAN_MAX), max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * uResolution;", "", "    vec3 rgbA = 0.5 * (", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * ( 1.0 / 3.0 - 0.5 ) ).xyz +", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * ( 2.0 / 3.0 - 0.5 ) ).xyz );", "", "    vec3 rgbB = rgbA * 0.5 + 0.25 * (", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * -0.5 ).xyz +", "        texture2D( uColorBuffer, gl_FragCoord.xy  * uResolution + dir * 0.5 ).xyz );", "", "    float lumaB = dot( rgbB, luma );", "", "    if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) )", "    {", "        gl_FragColor = vec4( rgbA, opacity );", "    }", "    else", "    {", "        gl_FragColor = vec4( rgbB, opacity );", "    }", "}"].join("\n");
  this.fxaaShader = new pc.Shader(e, {
      attributes: o,
      vshader: t,
      fshader: a
    }),
    this.resolution = new Float32Array(2)
}
FxaaEffect.prototype = Object.create(pc.PostEffect.prototype),
  FxaaEffect.prototype.constructor = FxaaEffect,
  Object.assign(FxaaEffect.prototype, {
    render: function(e, o, t) {
      var a = this.device,
        r = a.scope;
      this.resolution[0] = 1 / e.width,
        this.resolution[1] = 1 / e.height,
        r.resolve("uResolution").setValue(this.resolution),
        r.resolve("uColorBuffer").setValue(e.colorBuffer),
        pc.drawFullscreenQuad(a, o, this.vertexBuffer, this.fxaaShader, t)
    }
  });
var Fxaa = pc.createScript("fxaa");
Fxaa.prototype.initialize = function() {
  this.effect = new FxaaEffect(this.app.graphicsDevice);
  var e = this.entity.camera.postEffects;
  // e.addEffect(this.effect)
  this.on("state", (function(o) {
      o ? e.addEffect(this.effect) : e.removeEffect(this.effect)
    })),
    this.on("destroy", (function() {
      e.removeEffect(this.effect)
    }))
};
var Orbit = pc.createScript("orbit");
Orbit.attributes.add("sensitivity", {
    type: "number",
    default: .2
  }),
  Orbit.attributes.add("easing", {
    type: "number",
    default: .2
  }),
  Orbit.prototype.initialize = function() {
    window.addEventListener("mousedown", this.onMouseDown.bind(this)),
      window.addEventListener("mousemove", this.onMouseMove.bind(this)),
      window.addEventListener("mouseup", this.onMouseUp.bind(this)),
      window.addEventListener("touchstart", this.onTouchStart.bind(this)),
      window.addEventListener("touchmove", this.onTouchMove.bind(this)),
      window.addEventListener("touchend", this.onTouchEnd.bind(this)),
      this.rotating = !1,
      this.pitch = 0,
      this.yaw = -15,
      this.pitchTarget = 0,
      this.yawTarget = -15,
      this.m = {
        x: 0,
        y: 0
      },
      this.ml = {
        x: 0,
        y: 0
      },
      this.entity.setEulerAngles(this.pitch, this.yaw, 0),
      this.rotateEnd = 0,
      this.touchInd = -1
  },
  Orbit.prototype.onMouseDown = function(t) {
    this.rotating = !0,
      this.m.x = t.clientX,
      this.m.y = t.clientY,
      this.ml.x = this.m.x,
      this.ml.y = this.m.y,
      t.preventDefault(),
      t.stopPropagation()
  },
  Orbit.prototype.onMouseMove = function(t) {
    this.m.x = t.clientX,
      this.m.y = t.clientY
  },
  Orbit.prototype.onMouseUp = function() {
    this.rotating = !1,
      this.rotateEnd = Date.now()
  },
  Orbit.prototype.onTouchStart = function(t) {
    if (this.rotating = !0,
      -1 === this.touchInd && t.touches.length) {
      var i = t.touches[0];
      this.touchInd = i.identifier,
        this.m.x = i.clientX,
        this.m.y = i.clientY,
        this.ml.x = this.m.x,
        this.ml.y = this.m.y,
        t.preventDefault(),
        t.stopPropagation()
    }
  },
  Orbit.prototype.onTouchMove = function(t) {
    for (var i = 0; i < t.changedTouches.length; i++) {
      var s = t.changedTouches[i];
      if (s.identifier === this.touchInd)
        return this.m.x = s.clientX,
          void(this.m.y = s.clientY)
    }
  },
  Orbit.prototype.onTouchEnd = function(t) {
    this.rotating = !1,
      this.ratateEnd = Date.now(),
      this.touchInd = -1
  },
  Orbit.prototype.update = function(t) {
    if (this.rotating) {
      var i = this.ml.x - this.m.x,
        s = this.ml.y - this.m.y;
      this.pitchTarget = Math.max(-25, Math.min(25, this.pitchTarget + s * this.sensitivity)),
        this.yawTarget += i * this.sensitivity,
        this.ml.x = this.m.x,
        this.ml.y = this.m.y
    } else
      Date.now() - this.rotateEnd > 1e3 && (this.yawTarget += 10 * t * Math.min(1, (Date.now() - this.rotateEnd - 1e3) / 2e3));
    Math.abs(this.pitch - this.pitchTarget) + Math.abs(this.yaw - this.yawTarget) > .1 && (this.pitch += (this.pitchTarget - this.pitch) * this.easing,
      this.yaw += (this.yawTarget - this.yaw) * this.easing,
      this.entity.setEulerAngles(this.pitch, this.yaw, 0))
  };

function VignetteAberrationEffect(e) {
  pc.PostEffect.call(this, e);
  var t = {
      aPosition: pc.SEMANTIC_POSITION
    },
    r = ["attribute vec2 aPosition;", "", "varying vec2 vUv0;", "", "void main(void)", "{", "    gl_Position = vec4(aPosition, 0.0, 1.0);", "    vUv0 = (aPosition.xy + 1.0) * 0.5;", "}"].join("\n"),
    i = ["precision " + e.precision + " float;", "", "uniform sampler2D uColorBuffer;", "uniform float uDarkness;", "uniform float uOffset;", "uniform float uAberration;", "", "varying vec2 vUv0;", "", "void main() {", "    vec2 uv = (vUv0 - vec2(0.5)) * vec2(uOffset);", "    float f = dot(uv, uv);", "    vec4 texelA = texture2D(uColorBuffer, vUv0 - (uv * f * uAberration / 100.0));", "    vec4 texelB = texture2D(uColorBuffer, vUv0 + (uv * f * uAberration / 100.0));", "    gl_FragColor = vec4(mix(vec3(texelA.r, texelB.gb), vec3(1.0 - uDarkness), f), texelA.a);", "}"].join("\n");
  this.vignetteShader = new pc.Shader(e, {
      attributes: t,
      vshader: r,
      fshader: i
    }),
    this.offset = 1,
    this.darkness = 1
}
VignetteAberrationEffect.prototype = Object.create(pc.PostEffect.prototype),
  VignetteAberrationEffect.prototype.constructor = VignetteAberrationEffect,
  Object.assign(VignetteAberrationEffect.prototype, {
    render: function(e, t, r) {
      var i = this.device,
        f = i.scope;
      e.colorBuffer.minFilter = pc.FILTER_LINEAR,
        e.colorBuffer.magFilter = pc.FILTER_LINEAR,
        f.resolve("uColorBuffer").setValue(e.colorBuffer),
        f.resolve("uOffset").setValue(this.offset),
        f.resolve("uDarkness").setValue(this.darkness),
        f.resolve("uAberration").setValue(this.aberration),
        pc.drawFullscreenQuad(i, t, this.vertexBuffer, this.vignetteShader, r)
    }
  });
var VignetteAberration = pc.createScript("vignetteAberration");
VignetteAberration.attributes.add("offset", {
    type: "number",
    default: 1,
    min: 0,
    title: "Offset"
  }),
  VignetteAberration.attributes.add("darkness", {
    type: "number",
    default: 1,
    title: "Darkness"
  }),
  VignetteAberration.attributes.add("aberration", {
    type: "number",
    default: .5,
    title: "Aberration"
  }),
  VignetteAberration.prototype.initialize = function() {
    this.effect = new VignetteAberrationEffect(this.app.graphicsDevice),
      this.effect.offset = this.offset,
      this.effect.darkness = this.darkness,
      this.effect.aberration = this.aberration,
      this.on("attr", (function(e, t) {
        this.effect[e] = t
      }), this);
    var e = this.entity.camera.postEffects;
    // e.addEffect(this.effect)
    this.on("state", (function(t) {
        t ? e.addEffect(this.effect) : e.removeEffect(this.effect)
      })),
      this.on("destroy", (function() {
        e.removeEffect(this.effect)
      }))
  };
var SAMPLE_COUNT = 15,
  flip = "vec2(1.0,1.0)-";

function computeGaussian(e, t) {
  return 1 / Math.sqrt(2 * Math.PI * t) * Math.exp(-e * e / (2 * t * t))
}

function calculateBlurValues(e, t, s, r, o) {
  e[0] = computeGaussian(0, o),
    t[0] = 0,
    t[1] = 0;
  var a, i, u = e[0];
  for (a = 0,
    i = Math.floor(SAMPLE_COUNT / 2); a < i; a++) {
    var l = computeGaussian(a + 1, o);
    e[2 * a] = l,
      e[2 * a + 1] = l,
      u += 2 * l;
    var h = 2 * a + 1.5;
    t[4 * a] = s * h,
      t[4 * a + 1] = r * h,
      t[4 * a + 2] = -s * h,
      t[4 * a + 3] = -r * h
  }
  for (a = 0,
    i = e.length; a < i; a++)
    e[a] /= u
}

function BloomMaskedEffect(e) {
  pc.PostEffect.call(this, e);
  var t = {
      aPosition: pc.SEMANTIC_POSITION
    },
    s = ["attribute vec2 aPosition;", "", "varying vec2 vUv0;", "", "void main(void)", "{", "    gl_Position = vec4(aPosition, 0.0, 1.0);", "    vUv0 = (aPosition + 1.0) * 0.5;", "}"].join("\n"),
    r = ["precision " + e.precision + " float;", "", "varying vec2 vUv0;", "", "uniform sampler2D uBaseTexture;", "uniform float uBloomThreshold;", "", "void main(void)", "{", "    vec4 color = texture2D(uBaseTexture, vUv0);", "", "    gl_FragColor = clamp((color - uBloomThreshold) / (1.0 - uBloomThreshold), 0.0, 1.0);", "}"].join("\n"),
    o = ["precision " + e.precision + " float;", "", "#define SAMPLE_COUNT " + SAMPLE_COUNT, "", "varying vec2 vUv0;", "", "uniform float uMaskMix;", "uniform sampler2D uBloomTexture;", "uniform vec2 uBlurOffsets[SAMPLE_COUNT];", "uniform float uBlurWeights[SAMPLE_COUNT];", "uniform sampler2D uMaskTexture;", "", "void main(void)", "{", "    vec4 color = vec4(0.0);", "    float maskFactor = texture2D(uMaskTexture, " + flip + "vUv0).r;", "    maskFactor = mix(1.0, maskFactor, uMaskMix);", "    for (int i = 0; i < SAMPLE_COUNT; i++)", "    {", "        color += texture2D(uBloomTexture, vUv0 + uBlurOffsets[i] * maskFactor) * uBlurWeights[i];", "    }", "", "    gl_FragColor = color;", "}"].join("\n"),
    a = ["precision " + e.precision + " float;", "", "varying vec2 vUv0;", "", "uniform float uBloomIntensity;", "uniform sampler2D uBaseTexture;", "uniform sampler2D uBloomTexture;", "uniform sampler2D uMaskTexture;", "", "void main(void)", "{", "    vec4 bloom = texture2D(uBloomTexture, " + flip + "vUv0) * uBloomIntensity;", "    vec4 base = texture2D(uBaseTexture, vUv0);", "    vec4 mask = texture2D(uMaskTexture, vUv0);", "    bloom *= mask;", "", "    base *= (1.0 - clamp(bloom, 0.0, 1.0));", "", "    gl_FragColor = base + bloom;", "}"].join("\n");
  this.extractShader = new pc.Shader(e, {
      attributes: t,
      vshader: s,
      fshader: r
    }),
    this.blurShader = new pc.Shader(e, {
      attributes: t,
      vshader: s,
      fshader: o
    }),
    this.combineShader = new pc.Shader(e, {
      attributes: t,
      vshader: s,
      fshader: a
    });
  var i = e.width,
    u = e.height;
  this.targets = [];
  for (var l = 0; l < 2; l++) {
    var h = new pc.Texture(e, {
      format: pc.PIXELFORMAT_R8_G8_B8,
      width: (i >> 1) / 2,
      height: (u >> 1) / 2
    });
    h.minFilter = pc.FILTER_LINEAR,
      h.magFilter = pc.FILTER_LINEAR,
      h.addressU = pc.ADDRESS_CLAMP_TO_EDGE,
      h.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    var f = new pc.RenderTarget(e, h, {
      depth: !1
    });
    this.targets.push(f)
  }
  this.bloomThreshold = .25,
    this.blurAmount = 4,
    this.bloomIntensity = 1.25,
    this.maskTexture = null,
    this.maskMix = .5,
    this.sampleWeights = new Float32Array(SAMPLE_COUNT),
    this.sampleOffsets = new Float32Array(2 * SAMPLE_COUNT)
}
BloomMaskedEffect.prototype = Object.create(pc.PostEffect.prototype),
  BloomMaskedEffect.prototype.constructor = BloomMaskedEffect,
  Object.assign(BloomMaskedEffect.prototype, {
    render: function(e, t, s) {
      var r = this.device,
        o = r.scope;
      o.resolve("uBloomThreshold").setValue(this.bloomThreshold),
        o.resolve("uBaseTexture").setValue(e.colorBuffer),
        pc.drawFullscreenQuad(r, this.targets[0], this.vertexBuffer, this.extractShader),
        calculateBlurValues(this.sampleWeights, this.sampleOffsets, 1 / this.targets[1].width, 0, this.blurAmount),
        o.resolve("uBlurWeights[0]").setValue(this.sampleWeights),
        o.resolve("uBlurOffsets[0]").setValue(this.sampleOffsets),
        o.resolve("uBloomTexture").setValue(this.targets[0].colorBuffer),
        o.resolve("uMaskMix").setValue(this.maskMix),
        o.resolve("uMaskTexture").setValue(this.maskTexture),
        pc.drawFullscreenQuad(r, this.targets[1], this.vertexBuffer, this.blurShader),
        calculateBlurValues(this.sampleWeights, this.sampleOffsets, 0, 1 / this.targets[0].height, this.blurAmount),
        o.resolve("uBlurWeights[0]").setValue(this.sampleWeights),
        o.resolve("uBlurOffsets[0]").setValue(this.sampleOffsets),
        o.resolve("uMaskMix").setValue(this.maskMix),
        o.resolve("uMaskTexture").setValue(this.maskTexture),
        o.resolve("uBloomTexture").setValue(this.targets[1].colorBuffer),
        pc.drawFullscreenQuad(r, this.targets[0], this.vertexBuffer, this.blurShader),
        o.resolve("uBloomIntensity").setValue(this.bloomIntensity),
        o.resolve("uMaskMix").setValue(this.maskMix),
        o.resolve("uMaskTexture").setValue(this.maskTexture),
        o.resolve("uBloomTexture").setValue(this.targets[0].colorBuffer),
        pc.drawFullscreenQuad(r, t, this.vertexBuffer, this.combineShader, s)
    }
  });
var BloomMasked = pc.createScript("bloomMasked");
BloomMasked.attributes.add("bloomIntensity", {
    type: "number",
    default: 1,
    min: 0,
    title: "Intensity"
  }),
  BloomMasked.attributes.add("bloomThreshold", {
    type: "number",
    default: .25,
    min: 0,
    max: 1,
    title: "Threshold"
  }),
  BloomMasked.attributes.add("blurAmount", {
    type: "number",
    default: 4,
    min: 1,
    title: "Blur amount"
  }),
  BloomMasked.attributes.add("maskTexture", {
    type: "asset",
    assetType: "texture",
    title: "Mask Texture"
  }),
  BloomMasked.attributes.add("maskMix", {
    type: "number",
    default: .5,
    title: "Mask Mix"
  }),
  BloomMasked.prototype.initialize = function() {
    this.effect = new BloomMaskedEffect(this.app.graphicsDevice),
      this.effect.bloomThreshold = this.bloomThreshold,
      this.effect.blurAmount = this.blurAmount,
      this.effect.bloomIntensity = this.bloomIntensity,
      this.effect.maskTexture = this.maskTexture.resource,
      this.effect.maskMix = this.maskMix;
    var e = this.entity.camera.postEffects;
    // e.addEffect(this.effect)
    this.on("attr", (function(e, t) {
        this.effect[e] = "maskTexture" === e ? t.resource : t
      }), this),
      this.on("state", (function(t) {
        t ? e.addEffect(this.effect) : e.removeEffect(this.effect)
      })),
      this.on("destroy", (function() {
        e.removeEffect(this.effect)
      }))
  };
