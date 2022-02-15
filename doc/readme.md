渲染

#### three.js

多个场景,按照透明排序渲染

#### babylon.js

渲染组

#### playcanvas

1 个 scene 里 多个 layer

#### 流程
```js
app = new pc.Application(canvas, {
  elementInput: devices.elementInput,
  keyboard: devices.keyboard,
  mouse: devices.mouse,
  gamepads: devices.gamepads,
  touch: devices.touch,
  graphicsDeviceOptions: window.CONTEXT_OPTIONS,
  assetPrefix: window.ASSET_PREFIX || "",
  scriptPrefix: window.SCRIPT_PREFIX || "",
  scriptsOrder: window.SCRIPTS || []
});

app.configure(CONFIG_FILENAME, function (err) {
  // assets
  app.preload(function (err) {
    if (err) {
        console.error(err);
    }

    app.loadScene(SCENE_PATH, function (err, scene) {
        if (err) {
            console.error(err);
        }
        app.start();
    });
});
})
```


```js
loadScene() {
  // 创建实体
}
```


```js
self._app._preloadScripts(data, _loaded);
```
