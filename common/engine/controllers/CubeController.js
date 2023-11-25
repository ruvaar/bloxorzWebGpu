import { quat } from '../../../lib/gl-matrix-module.js';
import { Transform } from '../core/Transform.js';

export class CubeController {
    constructor(node, domElement, {
        pitch = 0,
        yaw = 0,
        roll = 0,
        downToTheEarth = 0.5,
        rollMovement = 0,
        pitchMovement = 0,
        facing = 0,
    } = {}) {
        this.node = node;
        this.domElement = domElement;

        this.keys = {};

        this.pitch = pitch;
        this.pitchMovement = pitchMovement;
        this.yaw = yaw;
        this.roll = roll;
        this.rollMovement = rollMovement;
        this.downToTheEarth = downToTheEarth;
        this.facing = facing;

        this.isKeyPressed = false;
        this.initHandlers();
    }

    initHandlers() {
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        const doc = this.domElement.ownerDocument;

        doc.addEventListener('keydown', this.keydownHandler);
        doc.addEventListener('keyup', this.keyupHandler);
    }

    update(t, dt) {
        const transform = this.node.getComponentOfType(Transform);
        const hr = Math.PI / 2;

        if (this.isKeyPressed) {
            const rotation = quat.create();
            if (this.facing == 0) {
                if (this.keys['KeyW']) {
                    quat.rotateX(rotation, rotation, -hr);
                    this.pitchMovement -= 0.75;
                    this.facing = 2;
                    this.downToTheEarth = 0.25;
                }
                if (this.keys['KeyS']) {
                    quat.rotateX(rotation, rotation, hr);
                    this.pitchMovement += 0.75;
                    this.facing = 2;
                    this.downToTheEarth = 0.25;
            
                }
                if (this.keys['KeyD']) {
                    quat.rotateZ(rotation, rotation, hr);
                    this.rollMovement += 0.75;
                    this.facing = 1;
                    this.downToTheEarth = 0.25;
                }
                if (this.keys['KeyA']) {
                    quat.rotateZ(rotation, rotation, -hr);
                    this.rollMovement -= 0.75;
                    this.facing = 1;
                    this.downToTheEarth = 0.25;
                }
            } else if (this.facing === 1) {
                if (this.keys['KeyW']) {
                    quat.rotateX(rotation, rotation, -hr);
                    this.pitchMovement -= 0.5;
                    this.facing = 1;
                    this.downToTheEarth = 0.25;
                }
                if (this.keys['KeyS']) {
                    quat.rotateX(rotation, rotation, hr);
                    this.pitchMovement += 0.5;
                    this.facing = 1;
                    this.downToTheEarth = 0.25;
                }
                if (this.keys['KeyD']) {
                    quat.rotateZ(rotation, rotation, hr);
                    this.rollMovement += 0.75;
                    this.facing = 0;
                    this.downToTheEarth = 0.5;
                }
                if (this.keys['KeyA']) {
                    quat.rotateZ(rotation, rotation, -hr);
                    this.rollMovement -= 0.75;
                    this.facing = 0;
                    this.downToTheEarth = 0.5;
                }
            } else if (this.facing === 2) {
                if (this.keys['KeyW']) {
                    quat.rotateX(rotation, rotation, -hr);
                    this.pitchMovement -= 0.75;
                    this.facing = 0;
                    this.downToTheEarth = 0.5;
                }
                if (this.keys['KeyS']) {
                    quat.rotateX(rotation, rotation, hr);
                    this.pitchMovement += 0.75;
                    this.facing = 0;
                    this.downToTheEarth = 0.5;
                }
                if (this.keys['KeyD']) {
                    quat.rotateZ(rotation, rotation, hr);
                    this.rollMovement += 0.5;
                    this.facing = 2;
                    this.downToTheEarth = 0.25;
                }
                if (this.keys['KeyA']) {
                    quat.rotateZ(rotation, rotation, -hr);
                    this.rollMovement -= 0.5;
                    this.facing = 2;
                    this.downToTheEarth = 0.25;
                }
            }
            
            // Combine the rotation with the existing rotation
            quat.multiply(transform.rotation, rotation, transform.rotation);
                
            // Reset the flag to prevent multiple updates for the same key press
            this.isKeyPressed = false;
        }

        transform.translation[1] = this.downToTheEarth;
        transform.translation[0] = this.rollMovement;
        transform.translation[2] = this.pitchMovement;
    }

    keydownHandler(e) {
        if (!this.isKeyPressed) {
            this.isKeyPressed = true;
            this.keys[e.code] = true;
        }
    }

    keyupHandler(e) {
        this.isKeyPressed = false;
        this.keys[e.code] = false;
    }
}