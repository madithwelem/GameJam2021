class App{
  // General Entire Application
  #_scene;
  #_canvas;
  #_engine;

  //Scene - related
  #number = 0;

  constructor() {
    this.#_canvas = this.#_createCanvas(Variables.canvasProperties.id);

    // Attach to body tag
    document.body.appendChild(this.#_canvas)
    
    // initialize babylon scene and engine
    this.#_engine                 = new BABYLON.Engine(this.#_canvas, true);
    this.#_scene                  = new BABYLON.Scene(this.#_engine);

    const camera                  = new BABYLON.ArcRotateCamera(Variables.cameraProperties.name, Variables.cameraProperties.alpha, Variables.cameraProperties.beta, 2, Variables.cameraProperties.target, this.#_scene);
    
    camera.attachControl(this._canvas, true);
    
    const light1                  = new BABYLON.HemisphericLight(Variables.lightProperties.name, Variables.lightProperties.target, this._scene);
    const sphere                  = BABYLON.MeshBuilder.CreateSphere(Variables.sphereProperties.name, Variables.sphereProperties.size, this.#_scene);

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this._scene.debugLayer.isVisible()) {
          this._scene.debugLayer.hide();
        } else {
          this._scene.debugLayer.show();
      }
    }});

    // run the main render loop
    this.#_engine.runRenderLoop(() => {
        this.#_scene.render();
    });
  }

   //set up the canvas
  #_createCanvas(canvasId) {

    //create the canvas html element and attach it to the webpage
    let canvas = document.createElement("canvas");
    canvas.style.width = Variables.canvasProperties.width;
    canvas.style.height = Variables.canvasProperties.height;
    canvas.id = canvasId;
    
    return canvas;
  }


  /**
   * 
   * Responsible for application start loading UI
   * 
   */
  #_applicationStartScene () {
    this.#_engine.displayLoadingUI(); // Always display loading UI when called

    // -- Scene Setup
    this.#_scene.detachControl(); // disables user input

    const scene = new BABYLON.scene(this.#_engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // Creating and positioning free camera
    const camera = new BABYLON.FreeCamera(Variables.cameraProperties.name, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero()); //targets the camera to scene origin


    // -- Sound Setup


  }
}

new App();