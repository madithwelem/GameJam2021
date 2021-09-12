class App {
  // General Entire Application
  #_scene;
  #_canvas;
  #_engine;
  #_transition;
  #_state;
  #_cutScene;
  #_gamescene;

  #_winSfx;
  #_attackedSfx;
  #_celebrateSfx;
  #_collectSfx;
  #_loseSfx;
  #_selectSfx;
  #_shootSfx;
  #_slaySfx;

  
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
    this.#loadSoundFx(0.6);

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

    


    //this handles interactions with the start button attached to the scene
    startBtn.onPointerDownObservable.add(() => {
      //this._goToCutScene();
      const postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, camera);
      postProcess.onApply = (effect) => {
        effect.setFloat("fadeLevel", fadeLevel);
      };

      this._transition = true;
      //sounds
      console.log("GOing to cut");
      soundThemeSong.stop();
      this.#_selectSfx.play();
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
    let transition = 0;
    let canplay = false;
    let finished_anim = false;
    let anims_loaded = 0;

    //Animation
    const beginning_anim = new BABYLON.GUI.Image("Start", "../images/sprites/final.png");
    beginning_anim.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    beginning_anim.cellId = 0;
    beginning_anim.cellHeight = 480;
    beginning_anim.cellWidth = 480;
    beginning_anim.sourceWidth = 480;
    beginning_anim.sourceHeight = 480;
    cutScene.addControl(beginning_anim);
    beginning_anim.onImageLoadedObservable.add(() => {
      anims_loaded++;

    })

    //skip cutscene
    const skipBtn = BABYLON.GUI.Button.CreateSimpleButton("skip", "SKIP");
    skipBtn.fontFamily = "Viga";
    skipBtn.width = "45px";
    skipBtn.left = "-14px";
    skipBtn.height = "40px";
    skipBtn.color = "white";
    skipBtn.top = "14px";
    skipBtn.thickness = 0;
    skipBtn.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    skipBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    cutScene.addControl(skipBtn);
    

    skipBtn.onPointerDownObservable.add(() => {
      this._transition = true;
      //sounds
      this.#firstScene();
      // this.cutScene.detachControl();
      clearInterval(animTimer);
      clearInterval(anim2Timer);
      clearInterval(dialogueTimer);
      this.#_engine.displayLoadingUI();
      canplay = true;
    });


    //--PLAYING ANIMATIONS--
    let animTimer;
    let anim2Timer;
    let anim = 1; //keeps track of which animation we're playing

    this.#_cutScene.onBeforeRenderObservable.add(() => {
      if (anims_loaded == 8) {
        this.#_engine.hideLoadingUI();
        anims_loaded = 0;

        //animation sequence
        animTimer = setInterval(() => {
          switch (anim) {
            case 1:
              if (beginning_anim.cellId == 9) { //each animation could have a different number of frames
                anim++;
                beginning_anim.isVisible = false; // current animation hidden
                working_anim.isVisible = true; // show the next animation
              } else {
                beginning_anim.cellId++;
              }
              break;
            case 2:
              if (working_anim.cellId == 11) {
                anim++;
                working_anim.isVisible = false;
                dropoff_anim.isVisible = true;
              } else {
                working_anim.cellId++;
              }
              break;
            case 3:
              if (dropoff_anim.cellId == 11) {
                anim++;
                dropoff_anim.isVisible = false;
                leaving_anim.isVisible = true;
              } else {
                dropoff_anim.cellId++;
              }
              break;
            case 4:
              if (leaving_anim.cellId == 9) {
                anim++;
                leaving_anim.isVisible = false;
                watermelon_anim.isVisible = true;
              } else {
                leaving_anim.cellId++;
              }
              break;
            default:
              break;
          }
        }, 250);

        //animation sequence 2 that uses a different time interval
        anim2Timer = setInterval(() => {
          switch (anim) {
            case 5:
              if (watermelon_anim.cellId == 8) {
                anim++;
                watermelon_anim.isVisible = false;
                reading_anim.isVisible = true;
              } else {
                watermelon_anim.cellId++;
              }
              break;
            case 6:
              if (reading_anim.cellId == 11) {
                reading_anim.isVisible = false;
                finished_anim = true;
                dialogueBg.isVisible = true;
                dialogue.isVisible = true;
                next.isVisible = true;
              } else {
                reading_anim.cellId++;
              }
              break;
          }
        }, 750);
      }

      //only once all of the game assets have finished loading and you've completed the animation sequence + dialogue can you go to the game state
      if (finishedLoading && canplay) {
        canplay = false;
        this.#gameLoad();
      }
    })

    //--PROGRESS DIALOGUE--
    const next = BABYLON.GUI.Button.CreateImageOnlyButton("next", "../images/sprites/final.png");
    next.rotation = Math.PI / 2;
    next.thickness = 0;
    next.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    next.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    next.width = "64px";
    next.height = "64px";
    next.top = "-3%";
    next.left = "-12%";
    next.isVisible = false;
    cutScene.addControl(next);
    console.log("Cut Scene Indentifier ");

    next.onPointerUpObservable.add(() => {
      if (transition == 8) { //once we reach the last dialogue frame, goToGame
        this.#_cutScene.detachControl();
        this.#_engine.displayLoadingUI(); //if the game hasn't loaded yet, we'll see a loading screen
        transition = 0;
        canplay = true;
      } else if (transition < 8) { // 8 frames of dialogue
        transition++;
        dialogue.cellId++;
      }
    })

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


  #loadSoundFx(vol){
    this.#_attackedSfx = new BABYLON.Sound("startSong", "sound/attacked.mp3", this.#_scene, function () {
    }, {
        volume:vol,
    });    
    this.#_celebrateSfx = new BABYLON.Sound("startSong", "sound/celebrate.mp3", this.#_scene, function () {
    }, {
        volume:vol,
    });    
    this.#_collectSfx = new BABYLON.Sound("startSong", "sound/collect.mp3", this.#_scene, function () {
    }, {
        volume:vol,
    });    
    this.#_loseSfx = new BABYLON.Sound("startSong", "sound/lose.mp3", this.#_scene, function () {
    }, {
        volume:vol,
    });    
    this.#_selectSfx = new BABYLON.Sound("startSong", "sound/select.wav", this.#_scene, function () {
    }, {
        volume:vol,
    });    
    this.#_shootSfx = new BABYLON.Sound("startSong", "sound/shoot.mp3", this.#_scene, function () {
    }, {
        volume:vol,
    });    
    this.#_slaySfx = new BABYLON.Sound("startSong", "sound/slay.mp3", this.#_scene, function () {
    }, {
        volume:vol,
    });    
    this.#_winSfx = new BABYLON.Sound("startSong", "sound/win.mp3", this.#_scene, function () {
    }, {
        volume:vol,
    });
  }

  /*#loadCharacterAssets(scene) {
    return this.#firstSceneObj.loadCharacter().then(assets => {
      this.#_sceneone_asset = assets;
    });
  }

  async #loadSceneSound(scene){

    await this.#firstSceneObj.setSceneSoundSetup(scene);
    this.#_sceneone_sound = { ...this.#firstSceneObj.getSceneSoundSetup() };

  }*/


}
new App();