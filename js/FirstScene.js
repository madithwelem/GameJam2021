class FirstScene {

  constructor(scene) {
    this.firstSceneSetUp(scene);
  }

  #addKeyEnvironmentFeatures(scene) {
    // Camera to rotate around our arc
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 20, new BABYLON.Vector3(0, 0,
      0));
    // Attach camera to scene
    camera.attachControl(scene, true);
    // Sun light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

  }

  #addSceneThemeSong(scene) {
    // Game theme sound
    const sound = new BABYLON.Sound("mysound", "sound/nightsound.wav", scene, null, {
      loop: true
    });
    setTimeout(function () { sound.play(); }, 2000); // Start after 3 seconds
  }

  #buildGround(scene) {
    // Create ground
    const groundFloor = BABYLON.MeshBuilder.CreateGround("ground", { width: 40, height: 30 }, scene);

    // Add Texture to the ground
    const groundFloorMaterial = new BABYLON.StandardMaterial("groundMat");
    groundFloorMaterial.diffuseTexture = new BABYLON.Texture("http://" + window.location.host + "/images/ground.jpg");
    groundFloor.material = groundFloorMaterial;
  }

  #buildBox(scene, width) {
    const boxMat = new BABYLON.StandardMaterial("boxMat");

    if (width == 2) {
      boxMat.diffuseTexture = new BABYLON.Texture("http://" + window.location.host + "/images/semihouse.png")
    }
    else {
      boxMat.diffuseTexture = new BABYLON.Texture("http://" + window.location.host + "/images/cubehouse.png");
    }

    //options parameter to set different images on each side
    const faceUV = [];
    if (width == 2) {
      faceUV[0] = new BABYLON.Vector4(0.6, 0.0, 1.0, 1.0); //rear face
      faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.4, 1.0); //front face
      faceUV[2] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); //right side
      faceUV[3] = new BABYLON.Vector4(0.4, 0, 0.6, 1.0); //left side
    }
    else {
      faceUV[0] = new BABYLON.Vector4(0.5, 0.0, 0.75, 1.0); //rear face
      faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.25, 1.0); //front face
      faceUV[2] = new BABYLON.Vector4(0.25, 0, 0.5, 1.0); //right side
      faceUV[3] = new BABYLON.Vector4(0.75, 0, 1.0, 1.0); //left side
    }
    // top 4 and bottom 5 not seen so not set

    /**** World Objects *****/
    const box = BABYLON.MeshBuilder.CreateBox("box", { width: width, faceUV: faceUV, wrap: true }, scene);
    box.material = boxMat;
    box.position.y = 0.5;

    return box;
  }

  #buildRoof(scene, width) {
    //texture
    const roofMat = new BABYLON.StandardMaterial("roofMat");
    roofMat.diffuseTexture = new BABYLON.Texture("http://" + window.location.host + "/images/roof.jpg");

    const roof = BABYLON.MeshBuilder.CreateCylinder("roof", { diameter: 1.3, height: 1.2, tessellation: 3 }, scene);
    roof.material = roofMat;
    roof.scaling.x = 0.75;
    roof.scaling.y = width;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;

    return roof;
  }

  #buildHouse(scene, width) {
    const box = this.#buildBox(scene, width);
    const roof = this.#buildRoof(scene, width);

    return BABYLON.Mesh.MergeMeshes([box, roof], true, false, null, false, true);
  }

  #buildAndScatterHouses(scene) {

    const side1 = 10;
    const side2 = 6;
    const small_house = this.#buildHouse(scene, 1);
    const big_house = this.#buildHouse(scene, 2);

    const places = []; //each entry is an array [house type, rotation, x, z]    
    places.push([1, -Math.PI / 16, -17.5, side1 ]);
    places.push([2, -Math.PI / 16, -15, side1 ]);
    places.push([1, -Math.PI / 16, -12.5, side1 ]);
    places.push([2, -Math.PI / 16, -10, side1 ]);
    places.push([1, -Math.PI / 16, -7.5, side1 ]);
    places.push([2, -Math.PI / 16, -5, side1 ]);
    places.push([2, -Math.PI / 16, 5, side1 ]);
    places.push([1, -Math.PI / 16, 7.5, side1 ]);
    places.push([2, -Math.PI / 16, 10, side1 ]);
    places.push([1, -Math.PI / 16, 12.5, side1 ]);
    places.push([2, -Math.PI / 16, 15, side1 ]);
    places.push([1, -Math.PI / 16, 17.5, side1 ]);
    places.push([1, -Math.PI / 16, -17.5, side2 ]);
    places.push([2, -Math.PI / 16, -15, side2 ]);
    places.push([1, -Math.PI / 16, -12.5, side2 ]);
    places.push([2, -Math.PI / 16, -10, side2 ]);
    places.push([1, -Math.PI / 16, -7.5, side2 ]);
    places.push([2, -Math.PI / 16, -5, side2 ]);
    places.push([2, -Math.PI / 16, 5, side2 ]);
    places.push([1, -Math.PI / 16, 7.5, side2 ]);
    places.push([2, -Math.PI / 16, 10, side2 ]);
    places.push([1, -Math.PI / 16, 12.5, side2 ]);
    places.push([2, -Math.PI / 16, 15, side2 ]);
    places.push([1, -Math.PI / 16, 17.5, side2 ]);
  
    //Create instances from the first two that were built 
    const houses = [];
    for (let i = 0; i < places.length; i++) {
        if (places[i][0] === 1) {
            houses[i] = small_house.createInstance("house" + i);
        }
        else {
            houses[i] = big_house.createInstance("house" + i);
        }
        //houses[i].rotation.y = places[i][1];
        houses[i].position.x = places[i][2];
        houses[i].position.z = places[i][3];
    }
  }


  firstSceneSetUp(scene) {

    this.#addKeyEnvironmentFeatures(scene);
    this.#addSceneThemeSong(scene);
    this.#buildGround(scene);
    //this.#buildHouses(scene);
    this.#buildAndScatterHouses(scene)
    

    
    
  }

  

}