// import * as pc from 'playcanvas';
// import * as pc from '../engine/build/playcanvas.mjs'
import * as pc from './src/index'

function createSkybox(params) {
  // Required to make skybox work in Newgrounds
  // See: https://forum.playcanvas.com/t/avoid-loading-cubemap-as-dds-file/21214
  // const app = app;
  const textures = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map(name => app.assets.find(name + '.png'));
  // this.textures = textures;
  // window.skyboxScript = this;

  const cubemapAsset = new pc.Asset('skybox_cubemap', 'cubemap', null, {
    textures: textures.map(function(faceAsset) {
      return faceAsset.id;
    })
  });
  cubemapAsset.loadFaces = true;
  cubemapAsset.on('load', function() {
    this.initSkyboxFromTexture(cubemapAsset.resource);
  }.bind(this));
  app.assets.add(cubemapAsset);
  app.assets.load(cubemapAsset);
}

// create a PlayCanvas application
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const app = new pc.Application(canvas);

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
app.root.addChild(box);

// create camera entity
const camera = new pc.Entity('camera');
camera.addComponent('camera', {
  clearColor: new pc.Color(0.1, 0.1, 0.1)
});
app.root.addChild(camera);
camera.setPosition(0, 0, 3);

// create directional light entity
const light = new pc.Entity('light');
light.addComponent('light');
app.root.addChild(light);
light.setEulerAngles(45, 0, 0);

createSkybox();
app.start();
