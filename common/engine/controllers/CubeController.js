import { quat } from "../../../lib/gl-matrix-module.js";
import { Transform } from "../core/Transform.js";
import { RotateAnimator } from "../animators/RotateAnimator.js";
import { CustomAnimator } from "../animators/CustomAnimator.js";
export class CubeController {
  constructor(
    node,
    domElement,
    times,
    rotations,
    translations,
    {
      pitch = 0,
      yaw = 0,
      roll = 0,
      downToTheEarth = 2.2,
      rollMovement = 0,
      pitchMovement = 0,
      x = 1,
      y = 0,
      facing = 0,
      startTime = null,
      sum = 0,
    } = {}
  ) {
    this.node = node;
    this.domElement = domElement;

    this.times = times;
    this.rotations = rotations;
    this.translations = translations;

    this.keys = {};

    this.x = x;
    this.y = y;
    this.pitch = pitch;
    this.pitchMovement = pitchMovement;
    this.yaw = yaw;
    this.roll = roll;
    this.rollMovement = rollMovement;
    this.downToTheEarth = downToTheEarth;
    this.facing = facing;
    this.startTime = startTime;
    this.sum = sum;
    this.isKeyPressed = false;
    this.initHandlers();
  }
  getFacing() {
    return this.facing;
  }

  getCoordinates() {
    return [this.x, this.y];
  }

  backToStart() {
    this.pitch = 0;
    this.yaw = 0;
    this.roll = 0;
    this.downToTheEarth = 2.2;
    this.rollMovement = 0;
    this.pitchMovement = 0;
    this.x = 1;
    this.y = 0;
    this.facing = 0;
    const transform = this.node.getComponentOfType(Transform);
    transform.translation[1] = this.downToTheEarth;
    transform.translation[0] = this.rollMovement;
    transform.translation[2] = this.pitchMovement;
  }

  initHandlers() {
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);

    const doc = this.domElement.ownerDocument;

    doc.addEventListener("keydown", this.keydownHandler);
    doc.addEventListener("keyup", this.keyupHandler);
  }

  update(t, dt) {
    const transform = this.node.getComponentOfType(Transform);
    const hr = Math.PI / 2;

    if (this.isKeyPressed) {
      const rotation = quat.create();
      if (this.facing == 0) {
        if (this.keys["KeyW"]) {
          quat.rotateX(rotation, rotation, -hr);
          this.pitchMovement -= 3;
          this.y -= 3;
          this.facing = 2;
          this.downToTheEarth = 1.2;
        }
        if (this.keys["KeyS"]) {
          quat.rotateX(rotation, rotation, hr);
          this.pitchMovement += 3;
          this.y += 3;
          this.facing = 2;
          this.downToTheEarth = 1.2;
        }
        if (this.keys["KeyD"]) {
          //quat.rotateZ(rotation, rotation, hr);
          this.rollMovement += 3;
          this.x += 3;
          this.downToTheEarth = 1.2;
          this.facing = 1;
          this.animateCube(rotation);
        }
        if (this.keys["KeyA"]) {
          quat.rotateZ(rotation, rotation, -hr);
          this.rollMovement -= 3;
          this.x -= 3;
          this.facing = 1;
          this.downToTheEarth = 1.2;
        }
      } else if (this.facing === 1) {
        if (this.keys["KeyW"]) {
          quat.rotateX(rotation, rotation, -hr);
          this.pitchMovement -= 2;
          this.y -= 2;
          this.facing = 1;
          this.downToTheEarth = 1.2;
        }
        if (this.keys["KeyS"]) {
          quat.rotateX(rotation, rotation, hr);
          this.pitchMovement += 2;
          this.y += 2;
          this.facing = 1;
          this.downToTheEarth = 1.2;
        }
        if (this.keys["KeyD"]) {
          quat.rotateZ(rotation, rotation, hr);
          this.rollMovement += 3;
          this.x += 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
        }
        if (this.keys["KeyA"]) {
          quat.rotateZ(rotation, rotation, -hr);
          this.rollMovement -= 3;
          this.x -= 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
        }
      } else if (this.facing === 2) {
        if (this.keys["KeyW"]) {
          quat.rotateX(rotation, rotation, -hr);
          this.pitchMovement -= 3;
          this.y -= 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
        }
        if (this.keys["KeyS"]) {
          quat.rotateX(rotation, rotation, hr);
          this.pitchMovement += 3;
          this.y += 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
        }
        if (this.keys["KeyD"]) {
          quat.rotateZ(rotation, rotation, hr);
          this.rollMovement += 2;
          this.x += 2;
          this.facing = 2;
          this.downToTheEarth = 1.2;
        }
        if (this.keys["KeyA"]) {
          quat.rotateZ(rotation, rotation, -hr);
          this.rollMovement -= 2;
          this.x -= 2;
          this.facing = 2;
          this.downToTheEarth = 1.2;
        }
      }

      // Combine the rotation with the existing rotation
      //quat.multiply(transform.rotation, rotation, transform.rotation);

      // Reset the flag to prevent multiple updates for the same key press
      this.isKeyPressed = false;
    }

    //transform.translation[1] = this.downToTheEarth;
    //transform.translation[0] = this.rollMovement;
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

  animateCube(rotation) {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    const animationDuration = 200;
    const fraction = elapsedTime / animationDuration;
    const transform = this.node.getComponentOfType(Transform);
    this.sum += 1;
    if (fraction < 1) {
      transform.translation[0] = this.rollMovement - (1 - fraction) * 3;
      transform.translation[1] = 2.2 - fraction;
      quat.rotateZ(rotation, rotation, -(1 / 200) * (Math.PI / 2));
      requestAnimationFrame(this.animateCube.bind(this, rotation));
    } else {
      transform.translation[0] = this.rollMovement;
      transform.translation[1] = this.downToTheEarth;
      transform.translation[2] = this.pitchMovement;
      this.startTime = null;
    }
    quat.multiply(transform.rotation, rotation, transform.rotation);
  }
}
