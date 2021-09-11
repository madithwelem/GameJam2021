class DOMManipulaotion {
  // Setup canvas
  static createCanvas(canvasId) {

    //create the canvas html element and attach it to the webpage
    let canvas = document.createElement("canvas");
    canvas.style.width = Variables.canvasProperties.width;
    canvas.style.height = Variables.canvasProperties.height;
    canvas.id = canvasId;
    
    return canvas;
  }
}