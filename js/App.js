class App {
  // General Entire Application
  #_scene;
  #_canvas;
  #_engine;
  #_transition;
  #_state;
  #_cutScene;
  #_gamescene;
 

  //Scene - related
  #number = 0;
  #_firstScene;

  constructor() {

    // Setup canvas
    this.#_canvas = DOMManipulaotion.createCanvas(Variables.canvasProperties.id);
    // Attach to body tag
    document.body.appendChild(this.#_canvas)

    // initialize babylon scene and engine
    this.#_engine = new BABYLON.Engine(this.#_canvas, true);
    this.#_scene = new BABYLON.Scene(this.#_engine);

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this.#_scene.debugLayer.isVisible()) {
          this.#_scene.debugLayer.hide();
        } else {
          this.#_scene.debugLayer.show();
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
    score.position = "fixed";
    score.left = "500px";
    score.width = 0.8;
    score.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    imageRect.addControl(score);


    //create a simple button
    const startBtn = BABYLON.GUI.Button.CreateSimpleButton("start", "PLAY");
    startBtn.width = 0.2;
    startBtn.height = "40px";
    startBtn.color = "white";
    startBtn.top = "-14px";
    startBtn.background = "red";
    startBtn.thickness = 0;
    startBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    guiMenu.addControl(startBtn);

    //set up transition effect : modified version of https://www.babylonjs-playground.com/#2FGYE8#0
    BABYLON.Effect.RegisterShader("fade",
      "precision highp float;" +
      "varying vec2 vUV;" +
      "uniform sampler2D textureSampler; " +
      "uniform float fadeLevel; " +
      "void main(void){" +
      "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
      "baseColor.a = 1.0;" +
      "gl_FragColor = baseColor;" +
      "}");

    let fadeLevel = 1.0;
    this._transition = false;
    scene.registerBeforeRender(() => {
      if (this._transition) {
        fadeLevel -= .05;
        if (fadeLevel <= 0) {
          this.#applicationCutScene();
          this._transition = false;
        }
      }
    })

    //--SOUNDS--
    const soundThemeSong = new BABYLON.Sound("startSong", "sound/copycat(revised).mp3", scene, null, {
        volume: 0.20,
        loop: true,
        autoplay: true
    });

    const soundClick = new BABYLON.Sound("selection", "sound/vgmenuselect.wav", scene, null, {volume: 0.15});


    //this handles interactions with the start button attached to the scene
    startBtn.onPointerDownObservable.add(() => {
      //this._goToCutScene();
      const postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, camera);
      postProcess.onApply = (effect) => {
        effect.setFloat("fadeLevel", fadeLevel);
      };

      this._transition = true;

      //sounds
      soundThemeSong.stop();
      soundClick.play();
      scene.detachControl(); //observables disabled
      this.#applicationCutScene();
      
    });

    //--SCENE FINISHED LOADING--
    await scene.whenReadyAsync();
    this.#_engine.hideLoadingUI();
    //lastly set the current state to the start state and set the scene to the start scene
    this.#_scene.dispose();
    this.#_scene = scene;
    this.#_state = Variables.gameState.START;

  }

  async #applicationCutScene() {
    // this.#_engine.displayLoadingUI();

    this.#_scene.detachControl();
    this.#_cutScene = new BABYLON.Scene(this.#_engine)

    let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), this.#_cutScene)
    camera.setTarget(BABYLON.Vector3.Zero());
    this.#_cutScene.clearColor = new BABYLON.Color4(0, 0, 0, 1)

    //GUI
    const cutScene = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("cutscene");

    const imageRect = new BABYLON.GUI.Rectangle("gameContainer");
    imageRect.width = 1;
    imageRect.thickness = 0;
    imageRect.position = "relative";
    cutScene.addControl(imageRect);

    const cutSceneBg = new BABYLON.GUI.Image("cutSceneBg", "/images/cutSceneBg.jpg");
    imageRect.addControl(cutSceneBg);

    const storyLine = new BABYLON.GUI.TextBlock("storyLine", "Welcome to the world of extraterrestrial,\n Back in 2009 Aliens were passing by earth and their spaceship \nmalfunctioned and they decided to land on earth to fix their \nspaceship one institution ruined it all, the government\n MNU and destroyed the base \n . aliens and men lived together and all food was \n being depleted fast. \
    The aliens started to attack the people to \n convert them to their kind they have to \nhelp everyone and eradicate the extraterrestrial life.");
    storyLine.resizeToFit = true;
    storyLine.fontFamily = "Viga";
    storyLine.fontSize = "64px";
    storyLine.color = "rgb(255,255,255, 0.5)";
    storyLine.top = "30px";
    storyLine.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    imageRect.addControl(storyLine);

    //skip cutscene
    const skipBtn = BABYLON.GUI.Button.CreateSimpleButton("skip", "SKIP");
    skipBtn.fontFamily = "Viga";
    skipBtn.width = "45px";
    skipBtn.left = "-14px";
    skipBtn.height = "60px";
    skipBtn.color = "white";
    skipBtn.top = "20px";
    skipBtn.thickness = 0;
    skipBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    skipBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    cutScene.addControl(skipBtn);
  
    skipBtn.onPointerDownObservable.add(() => {
 
      //sounds
      this.#firstScene();
      clearInterval(animTimer);
      clearInterval(anim2Timer);
      clearInterval(dialogueTimer);
      this.#_engine.displayLoadingUI();
      canplay = true;
    });

      //only once all of the game assets have finished loading and you've completed the animation sequence + dialogue can you go to the game state
    if (finishedLoading && canplay) {
      canplay = false;
      this.#firstScene();
    }
    
    await this.#_cutScene.whenReadyAsync();
    this.#_scene.dispose();
    this.#_state = Variables.gameState.CUTSCENE;
    this.#_scene = this.#_cutScene;

    //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
    var finishedLoading = false;

    console.log("final ");

  }

  async #firstScene() {

    const scene =  new BABYLON.Scene(this.#_engine);
    this.#_scene = scene;
    const firstScene = new FirstScene(scene);
    this.#_firstScene = firstScene;
  }

}
new App();