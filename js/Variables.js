class Variables {
  // Camera properties/Options
  static cameraProperties  = {
    alpha       : Math.PI / 2,
    beta        : Math.PI / 2,
    radius      : 2,
    target      : BABYLON.Vector3.Zero(),
    name        : "camera"
  };
  // Light properties/Options
  static lightProperties   = {
    target      : new BABYLON.Vector3(1, 1, 0),
    name        : "light1"
  };
  // Sphere properties/Options
  static sphereProperties   = {
    name        : "sphere",
    size        : {
      diameter: 0.5
    }
  };
  static gameState          = {
    START       : 0,
    GAME        : 1,
    LOSE        : 2, 
    CUTSCENE    : 3
  };

  static canvasProperties          = {
    height      : "100%",
    width       : "100%",
    id          : "gameCanvas"
  };
}
