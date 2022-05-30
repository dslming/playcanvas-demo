// import * as pc from 'playcanvas';
// import * as pc from '../engine/build/playcanvas.mjs'
import * as pc from './src/index'
import { cameraScript } from './camera/index'

function initCamera() {
  // Create a camera with an orbit camera script
  var camera = new pc.Entity();
  camera.addComponent("camera", {
    clearColor: new pc.Color(0.4, 0.45, 0.5)
  });

  camera.addComponent("script");
  camera.script.create("orbitCamera", {
    attributes: {
      inertiaFactor: 0.2 // Override default of 0 (no inertia)
    }
  });

  camera.script.create("orbitCameraInputMouse");
  camera.script.create("orbitCameraInputTouch");
  app.root.addChild(camera);
}

function skyHDR() {
  // https://github.com/cx20/gltf-test/blob/e82fccd71a0040042a35ed0c591fdad3867d1857/examples/playcanvas/index.js
  let envAsset = new pc.Asset('papermill', 'texture', {
    url: './texture/moonless_golf_1k.hdr'
  });
  envAsset.ready(() => {
    const env = envAsset.resource;

    // set the skybox
    // const skybox = pc.EnvLighting.generateSkyboxCubemap(env);
    // app.scene.skybox = skybox;
    app.scene.skyboxMip = 1;

    // generate prefiltered lighting (reflections and ambient)
    const lighting = pc.EnvLighting.generateLightingSource(env);
    setInterval(() => {
      const envAtlas = pc.EnvLighting.generateAtlas(lighting);
      app.scene.envAtlas = envAtlas;
    }, 10);
    // lighting.destroy();
  });
  app.assets.add(envAsset);
  app.assets.load(envAsset);
  // app.start();
}

function sky6() {
  // https://github.com/playcanvas/model-viewer/blob/2ad25f4fd5990b635036e398e5c79fa4f01b92e8/src/viewer.ts#L506

  const files = [
    "texture/pisa/px.png",
    "texture/pisa/nx.png",
    "texture/pisa/py.png",
    "texture/pisa/ny.png",
    "texture/pisa/pz.png",
    "texture/pisa/nz.png",
  ]
  // construct an asset for each cubemap face
  const faceAssets = files.map((file, index) => {
    const faceAsset = new pc.Asset('skybox_face' + index, 'texture', {
      url: file
    });
    app.assets.add(faceAsset);
    app.assets.load(faceAsset);
    return faceAsset;
  });

  // construct the cubemap asset
  const cubemapAsset = new pc.Asset('skybox_cubemap', 'cubemap', null, {
    textures: faceAssets.map(faceAsset => faceAsset.id)
  });
  cubemapAsset.loadFaces = true;


  cubemapAsset.on('load', () => {
    let env = cubemapAsset.resource
    // this.initSkyboxFromTexture(cubemapAsset.resource);
    // const skybox = pc.EnvLighting.generateSkyboxCubemap(env);
    // app.scene.skybox = skybox;
    app.scene.skyboxMip = 0

    // generate prefiltered lighting (reflections and ambient)
    // const lighting = pc.EnvLighting.generateLightingSource(env);
    // setInterval(() => {
    const envAtlas = pc.EnvLighting.generateAtlas(env);
    app.scene.envAtlas = envAtlas;
    app.start();
    // }, 100);///
  });
  app.assets.add(cubemapAsset);
  app.assets.load(cubemapAsset);


}

function skyDDs() {
  let cubemapAsset = new pc.Asset('helipad', 'cubemap', {
    url: './static/assets/cubemaps/helipad.dds',
  }, {
    type: pc.TEXTURETYPE_RGBM
  });

  cubemapAsset.on('load', (assets) => {
    app.scene.skyboxMip = 0
    app.scene.setSkybox(assets._resources);
    app.scene.skyboxMip = 1;
    app.scene.skyboxIntensity = 0.7;
    app.start();
  })

  app.assets.add(cubemapAsset);
  app.assets.load(cubemapAsset);
}

function createSkybox(params) {
  // sky6()
  skyHDR()
  // skyDDs()
}

// create a PlayCanvas application
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

var app = new pc.Application(canvas, {
  mouse: new pc.Mouse(document.body),
  touch: new pc.TouchDevice(document.body),
  elementInput: new pc.ElementInput(canvas),
  gamepads: new pc.GamePads(),
  keyboard: new pc.Keyboard(window),
  graphicsDeviceOptions: {
    alpha: true
  }
});
window.app = app;
// fill the available space at full resolution
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);

// ensure canvas is resized when window changes size
window.addEventListener('resize', () => app.resizeCanvas());

const Rotate = pc.createScript('rotate');
Rotate.prototype.update = function(dt) {
  this.entity.rotate(10 * dt, 20 * dt, 30 * dt);
};

// create box entity
const box = new pc.Entity('cube');
box.addComponent('model', {
  type: 'box'
});
box.addComponent('script');
box.script.create('rotate');
// app.root.addChild(box);

cameraScript(pc);
// create camera entity
// const camera = new pc.Entity('camera');
// camera.addComponent('camera', {
//   clearColor: new pc.Color(0.1, 0.1, 0.1)
// });
// app.root.addChild(camera);
// camera.setPosition(0, 0, 10);
initCamera();

// create directional light entity
const light = new pc.Entity('light');
light.addComponent('light');
app.root.addChild(light);
light.setEulerAngles(45, 0, 0);

createSkybox();
// app.start();
