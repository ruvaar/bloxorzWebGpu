import {ResizeSystem} from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem} from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import { RotateAnimator } from './common/engine/animators/RotateAnimator.js';
import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';

import { TurntableController } from './common/engine/controllers/TurntableController.js';
import { CubeController } from './common/engine/controllers/CubeController.js';
import { vec3 } from './lib/gl-matrix-module.js';

import { Camera,
         Model,    
         Node,
         Transform,    
} from './common/engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';


const canvas = document.querySelector('canvas');
const renderer =  new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/scene/neki4.gltf')

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);
const camera = scene.find(node => node.getComponentOfType(Camera));
const cube = gltfLoader.loadNode('Cube');
const cubeMap = null
const cubeTransform = cube.getComponentOfType(Transform);

camera.addComponent(new TurntableController(camera, document.body, {
    distance: 90,
    pitch: -0.4,
    yaw: 0.4,
}));

const cubeController = new CubeController(cube, document.body, {});
cube.addComponent(cubeController);



const light = new Node();
light.addComponent(new Transform());
light.addComponent(new Light({
    ambient: 0.8,

}));

scene.addChild(light)

const floorPath = [
    [0, -1],
    [10, -1],
    [10,-7],
    [22,-7],
    [22,-3],
    [26,-3],
    [26,-1],
    [30,-1],
    [30,5],
    [24,5],
    [24,3],
    [22,3],
    [22,-1],
    [16,-1],
    [16,-5],
    [12,-5],
    [12,1],
    [14,1],
    [14,11],
    [18,11],
    [18,9],
    [22,9],
    [22,15],
    [20,15],
    [20,17],
    [14,17],
    [14,15],
    [12,15],
    [12,5],
    [8,5],
    [8, 1],
    [0, 1],
    [0, -1]
]; 

const FinishPoint = [27,2]

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
          (yi > y) !== (yj > y) &&
          x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
  
        if (intersect) inside = !inside;
      }
  
      return inside;
    } else if (facing == 1) {
        const x0 = point[0] + 1;
        const y0 = point[1];

        const x1 = point[0] - 1;
        const y1 = point[1];
  
      return (
        isInside([x0, y0], path, 0) &&
        isInside([x1, y1], path, 0)
      );
    } else if (facing == 2) {
        const x0 = point[0];
        const y0 = point[1] + 1;

        const x1 = point[0];
        const y1 = point[1] - 1;

        return (
            isInside([x0, y0], path, 0) &&
            isInside([x1, y1], path, 0)
          );
    }
  
    return false;
}

let gameWon = false;
function winGame() {
    if (!gameWon) { 
        const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const overlay = document.createElement('div');
        overlay.classList.add('winOverlay');
        const message = document.createElement('div');
        message.textContent = `YOU WIN! Time: ${elapsedTime} seconds`;

        overlay.appendChild(message);

        document.body.appendChild(overlay);

        gameWon = true;
    }
}


let gameStartTime = Date.now(); 



function update(t, dt) {

    const time = t % 1;
    // console.log(cubeController.getCoordinates());
    let cubePosition = cube.getComponentOfType(Transform).translation;
    if (cubeController.getCoordinates()[0] == FinishPoint[0] && cubeController.getCoordinates()[1] == FinishPoint[1] && cubeController.getFacing() == 0){
        console.log("YOU WIN!");
        winGame();

    }

    //console.log(cubeController.getCoordinates()); 
    if (!isInside(cubeController.getCoordinates(), floorPath, cubeController.getFacing())) {
        cube.addComponent(new LinearAnimator(cube, {
            startPosition: cubePosition,
            endPosition: [cubePosition[0], -10, cubePosition[2]],
            duration: time * 10,
            loop: false,
        }));

        // Reset cube position NOT WORKING ?
        cubeTransform.translation = [0,0.25,0];
        //cubeController.backToStart(); ??
        
    }
    
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    })
}
function render() {
    renderer.render(scene,camera);
}

function resize({ displaySize: {width, height}}) {
    camera.getComponentOfType(Camera).aspect = width/ height;
}

new ResizeSystem({ canvas, resize}).start();
new UpdateSystem({ update, render}).start();