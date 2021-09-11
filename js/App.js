class App {
  // General Entire Application
  #_scene;
  #_canvas;
  #_engine;
  #_transition;
  #_state;
  #_sound;
  #_bacKSound;

  //Scene - related
  #number = 0;

  constructor() {

    // Setup canvas
    this.#_canvas = DOMManipulaotion.createCanvas(Variables.canvasProperties.id);
    // Attach to body tag
    document.body.appendChild(this.#_canvas)

    // initialize babylon scene and engine
    this.#_engine = new BABYLON.Engine(this.#_canvas, true);
    this.#_scene = new BABYLON.Scene(this.#_engine);
    this.#_sound =  new SoundFx();

    /*const camera = new BABYLON.ArcRotateCamera(Variables.cameraProperties.name, Variables.cameraProperties.alpha, Variables.cameraProperties.beta, 2, Variables.cameraProperties.target, this.#_scene);

    camera.attachControl(this._canvas, true);

    const light1 = new BABYLON.HemisphericLight(Variables.lightProperties.name, Variables.lightProperties.target, this._scene);
    const sphere = BABYLON.MeshBuilder.CreateSphere(Variables.sphereProperties.name, Variables.sphereProperties.size, this.#_scene);
    */


    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this._scene.debugLayer.isVisible()) {
          this._scene.debugLayer.hide();
        } else {
          this._scene.debugLayer.show();
        }
      }
    });

    this.#main();
  }

  async #main() {
    await this.#gameLoad();

    // Register a render loop to repeatedly render the scene
    this.#_engine.runRenderLoop(() => {
      switch (this.#_state) {
        case Variables.gameState.START:
          this.#_scene.render();
          break;
        case Variables.gameState.CUTSCENE:
          this.#_scene.render();
          break;
        case Variables.gameState.GAME:
          this.#_scene.render();
          break;
        case Variables.gameState.LOSE:
          this.#_scene.render();
          break;
        default: break;
      }
    });

    //resize if the screen is resized/rotated
    window.addEventListener('resize', () => {
      this.#_engine.resize();
    });
  }

  /**
   * 
   * Responsible for application start loading UI
   * 
   */

  async #gameLoad() {
    this.#_engine.displayLoadingUI();

    this.#_scene.detachControl();
    let scene = new BABYLON.Scene(this._engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
    let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    //create a fullscreen ui for all of our GUI elements
    const guiMenu = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    guiMenu.idealHeight = 720; //fit our fullscreen ui to this height

    const imageRect = new BABYLON.GUI.Rectangle("gameContainer");
    imageRect.width = 1;
    imageRect.thickness = 0;
    imageRect.position = "relative";
    guiMenu.addControl(imageRect);

    const startbg = new BABYLON.GUI.Image("startbg", "/images/startBg.jpg");
    imageRect.addControl(startbg);

    const score = new BABYLON.GUI.TextBlock("score", "Score : 1000");
    score.resizeToFit = true;
    score.fontFamily = "Viga";
    score.fontSize = "64px";
    score.color = "white";
    score.resizeToFit = true;
    score.top = "14px";
    score.position = "absolute";
    score.right= "0px";
    score.width = 0.8;
    score.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    imageRect.addControl(score);


    //create a simple button
    const startBtn = BABYLON.GUI.Button.CreateSimpleButton("start", "PLAY");
    startBtn.width = 0.2;
    startBtn.height = "40px";
    startBtn.color = "white";
    startBtn.top = "-14px";
    startBtn.thickness = 0;
    startBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guiMenu.addControl(startBtn);

    //--SOUNDS--
    const start = new BABYLON.Sound("startSong", "sound/copycat(revised).mp3", scene, function () {
    }, {
        volume: 0.25,
        loop: true,
        autoplay: true
    });

    const sfx = new BABYLON.Sound("selection", "sound/vgmenuselect.wav", scene, function () {

      console.log("");

    });


    //this handles interactions with the start button attached to the scene
    startBtn.onPointerDownObservable.add(() => {
      //this._goToCutScene();
      console.log("GOing to cut");
      scene.detachControl(); //observables disabled
    });

    //--SCENE FINISHED LOADING--
    await scene.whenReadyAsync();
    this.#_engine.hideLoadingUI();
    //lastly set the current state to the start state and set the scene to the start scene
    this.#_scene.dispose();
    this.#_scene = scene;
    this.#_state = Variables.gameState.START;
  }

  #applicationCutScene(cutSceneIndentifier) {
    console.log("Cut Scene Indentifier " + cutSceneIndentifier);
  }
}

new App();