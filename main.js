import {ResizeSystem} from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem} from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import { RotateAnimator } from './common/engine/animators/RotateAnimator.js';
import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';

import { TurntableController } from './common/engine/controllers/TurntableController.js';
import { CubeController } from './common/engine/controllers/CubeController.js';

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
await gltfLoader.load('common/scene/scene.gltf')

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);
const camera = scene.find(node => node.getComponentOfType(Camera));
const cube = gltfLoader.loadNode('Cube');

camera.addComponent(new TurntableController(camera, document.body, {
    distance: 20,
    pitch: -0.3,
}));

cube.addComponent(new CubeController(cube, document.body, {
}));



const light = new Node();
light.addComponent(new Transform());
light.addComponent(new Light({
    ambient: 0.8,

}));
//light.addComponent(new LinearAnimator(light, {
//    startPosition: [3,3,3],
//    endPosition: [-3,3,-3],
//    duration: 1,
//    loop: true,
//}))
scene.addChild(light)

function update(t, dt) {
    const time = t % 1;
    //falling off 
    //    const cubePosition = cube.getComponentOfType(Transform).translation;
//    if (cubePosition[0] >= 3  ||
//        cubePosition[0] <= -3 ||
//        cubePosition[2] >= 3  ||
//        cubePosition[2] <= -3   ) {
//            console.log(cubePosition);
//            vec3.lerp(cubePosition, startPosition, endPosition, EasingFunctions.bounceEaseOut(time));
//        }
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