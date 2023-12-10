import { ResizeSystem } from "./common/engine/systems/ResizeSystem.js";
import { UpdateSystem } from "./common/engine/systems/UpdateSystem.js";

import { GLTFLoader } from "./common/engine/loaders/GLTFLoader.js";

import { LinearAnimator } from "./common/engine/animators/LinearAnimator.js";

import { TurntableController } from "./common/engine/controllers/TurntableController.js";
import { CubeController } from "./common/engine/controllers/CubeController.js";
import { vec3, quat } from "./lib/gl-matrix-module.js";

import { Camera, Model, Node, Transform } from "./common/engine/core.js";

import { Renderer } from "./Renderer.js";
import { Light } from "./Light.js";

var gameStartTime;
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    document.getElementById("start-overlay").style.display = "none";
    gameStartTime = Date.now();
  }
});

var audio = document.getElementById("backgroundMusic");
audio.volume = 0.1; // 20% volume

const canvas = document.querySelector("canvas");
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load("common/scene/neki_adv.gltf");

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);
const camera = scene.find((node) => node.getComponentOfType(Camera));
const cube = gltfLoader.loadNode("Cube");
const cubeTransform = cube.getComponentOfType(Transform);

camera.addComponent(
  new TurntableController(camera, document.body, {
    distance: 90,
    pitch: -0.4,
    yaw: 0.3,
  })
);

const cubeController = new CubeController(cube, document.body, {});
cube.addComponent(cubeController);

const light = new Node();
light.addComponent(new Transform());
light.addComponent(
  new Light({
    ambient: 1,
  })
);

scene.addChild(light);

const floorPath = [
  [0, -1],
  [10, -1],
  [10, -7],
  [22, -7],
  [22, -3],
  [26, -3],
  [26, -1],
  [30, -1],
  [30, 5],
  [24, 5],
  [24, 3],
  [22, 3],
  [22, -1],
  [16, -1],
  [16, -5],
  [12, -5],
  [12, 1],
  [14, 1],
  [14, 11],
  [18, 11],
  [18, 9],
  [22, 9],
  [22, 15],
  [20, 15],
  [20, 17],
  [14, 17],
  [14, 15],
  [12, 15],
  [12, 5],
  [8, 5],
  [8, 1],
  [0, 1],
  [0, -1],
];

const FinishPoint = [27, 2];

function isInside(point, path, facing) {
  const x = point[0];
  const y = point[1];

  if (facing == 0) {
    let inside = false;
    for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
      const xi = path[i][0];
      const yi = path[i][1];
      const xj = path[j][0];
      const yj = path[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  } else if (facing == 1) {
    const x0 = point[0] + 1;
    const y0 = point[1];

    const x1 = point[0] - 1;
    const y1 = point[1];

    return isInside([x0, y0], path, 0) && isInside([x1, y1], path, 0);
  } else if (facing == 2) {
    const x0 = point[0];
    const y0 = point[1] + 1;

    const x1 = point[0];
    const y1 = point[1] - 1;

    return isInside([x0, y0], path, 0) && isInside([x1, y1], path, 0);
  }

  return false;
}

let gameWon = false;
function winGame() {
  if (!gameWon) {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const overlay = document.createElement("div");
    overlay.classList.add("winOverlay");
    const message = document.createElement("div");
    message.textContent = `YOU WIN! Time: ${elapsedTime} seconds. Press R to restart.`;

    overlay.appendChild(message);
    var sound = document.getElementById("winGameSound");
    sound.play();
    document.body.appendChild(overlay);
    gameWon = true;
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyR") {
        cubeController.backToStart();
        gameWon = false;

        setTimeout(() => {
          cubeController.backToStart();
        }, 200);
        gameStartTime = Date.now();
        overlay.remove();
      }
    });
  }
}

let gameLose = false;
function gameLost() {
  if (!gameLose) {
    const overlay = document.createElement("div");
    overlay.classList.add("loseOverlay");
    const message = document.createElement("div");
    message.textContent = `YOU LOST! Press R to restart.`;
    var sound = document.getElementById("lostGameSound");
    sound.play();
    overlay.appendChild(message);
    setTimeout(() => {
      document.body.appendChild(overlay);
    }, 500);
    //add event listener for R key
    gameLose = true;
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyR") {
        cubeController.backToStart();
        gameLose = false;

        setTimeout(() => {
          cubeController.backToStart();
        }, 200);
        gameStartTime = Date.now();
      }
    });
  }
}

function update(t, dt) {
  const time = t % 1;
  let cubePosition = cube.getComponentOfType(Transform).translation;
  if (
    cubeController.getCoordinates()[0] == FinishPoint[0] &&
    cubeController.getCoordinates()[1] == FinishPoint[1] &&
    cubeController.getFacing() == 0
  ) {
    winGame();
  }

  if (
    !isInside(
      cubeController.getCoordinates(),
      floorPath,
      cubeController.getFacing()
    )
  ) {
    let animator = new LinearAnimator(cube, {
      startPosition: cubePosition,
      endPosition: [cubePosition[0], -10, cubePosition[2]],
      duration: 1000,
      loop: false,
    });
    cube.addComponent(animator);
    setTimeout(() => {
      animator.pause();
    }, 200);
    gameLost();
  }

  scene.traverse((node) => {
    for (const component of node.components) {
      component.update?.(t, dt);
    }
  });
}
function render() {
  renderer.render(scene, camera);
}

function resize({ displaySize: { width, height } }) {
  camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
