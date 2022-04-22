// import * as pc from 'playcanvas';
// import * as pc from '../engine/build/playcanvas.mjs'
import * as pc from './src/index'

function skyHDR() {
  // https://github.com/cx20/gltf-test/blob/e82fccd71a0040042a35ed0c591fdad3867d1857/examples/playcanvas/index.js
  let envAsset = new pc.Asset('papermill', 'texture', {
    url: './texture/moonless_golf_1k.hdr'
  });
  envAsset.ready(() => {
    const env = envAsset.resource;

    // set the skybox
    const skybox = pc.EnvLighting.generateSkyboxCubemap(env);
    app.scene.skybox = skybox;
    app.scene.skyboxMip = 2

    // generate prefiltered lighting (reflections and ambient)
    const lighting = pc.EnvLighting.generateLightingSource(env);
    const envAtlas = pc.EnvLighting.generateAtlas(lighting);
    app.scene.envAtlas = envAtlas;
    lighting.destroy();
  });
  app.assets.add(envAsset);
  app.assets.load(envAsset);
}

function sky6() {
  // https://github.com/playcanvas/model-viewer/blob/2ad25f4fd5990b635036e398e5c79fa4f01b92e8/src/viewer.ts#L506

  const files = [
    "texture/cube/TEXTURE_CUBE_MAP_POSITIVE_X.png",
    "texture/cube/TEXTURE_CUBE_MAP_NEGATIVE_X.png",
    "texture/cube/TEXTURE_CUBE_MAP_POSITIVE_Y.png",
    "texture/cube/TEXTURE_CUBE_MAP_NEGATIVE_Y.png",
    "texture/cube/TEXTURE_CUBE_MAP_POSITIVE_Z.png",
    "texture/cube/TEXTURE_CUBE_MAP_NEGATIVE_Z.png",
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
    // set the skybox
    const skybox = pc.EnvLighting.generateSkyboxCubemap(env);
    app.scene.skybox = skybox;
    app.scene.skyboxMip = 2

    // generate prefiltered lighting (reflections and ambient)
    // const lighting = pc.EnvLighting.generateLightingSource(env);
    // const envAtlas = pc.EnvLighting.generateAtlas(lighting);
    // app.scene.envAtlas = envAtlas;
  });
  app.assets.add(cubemapAsset);
  app.assets.load(cubemapAsset);

}

function createSkybox(params) {
  sky6()
  // skyHDR()
}

// create a PlayCanvas application
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const app = new pc.Application(canvas);
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

// create camera entity
const camera = new pc.Entity('camera');
camera.addComponent('camera', {
  clearColor: new pc.Color(0.1, 0.1, 0.1)
});
app.root.addChild(camera);
camera.setPosition(0, 0, 10);

// create directional light entity
const light = new pc.Entity('light');
light.addComponent('light');
app.root.addChild(light);
light.setEulerAngles(45, 0, 0);

createSkybox();
app.start();
