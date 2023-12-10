import { quat, vec3, vec4 } from "../../../lib/gl-matrix-module.js";
import { Transform } from "../core/Transform.js";

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
      animationComplete = true,
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
    this.animationComplete = animationComplete;
  }
  getFacing() {
    return this.facing;
  }

  getCoordinates() {
    return [this.x, this.y];
  }

  backToStart() {
    const loseOverlay = document.querySelector(".loseOverlay");
    if (loseOverlay) {
      loseOverlay.remove();
    }
    this.pitch = 0;
    this.yaw = 0;
    this.roll = 0;
    this.downToTheEarth = 2.2;
    this.rollMovement = 0;
    this.pitchMovement = 0;
    this.x = 1;
    this.y = 0;
    this.facing = 0;
    this.startTime = null;
    const transform = this.node.getComponentOfType(Transform);
    transform.translation[0] = this.rollMovement;
    transform.translation[1] = this.downToTheEarth;
    transform.translation[2] = this.pitchMovement;
    transform.rotation = [0, 0, 0, 1];
  }

  initHandlers() {
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);

    const doc = this.domElement.ownerDocument;

    doc.addEventListener("keydown", this.keydownHandler);
    doc.addEventListener("keyup", this.keyupHandler);
  }

  update(t, dt) {
    this.t = t;

    if (this.isKeyPressed && this.animationComplete) {
      if (this.facing == 0) {
        if (this.keys["KeyW"]) {
          this.pitchMovement -= 3;
          this.y -= 3;
          this.facing = 2;
          this.downToTheEarth = 1.2;
          this.animateCubeFacing0(1, 0, 1);
        }
        if (this.keys["KeyS"]) {
          this.pitchMovement += 3;
          this.y += 3;
          this.facing = 2;
          this.downToTheEarth = 1.2;
          this.animateCubeFacing0(-1, 0, 1);
        }
        if (this.keys["KeyD"]) {
          this.rollMovement += 3;
          this.x += 3;
          this.downToTheEarth = 1.2;
          this.facing = 1;
          this.animateCubeFacing0(-1, 1, 0);
        }
        if (this.keys["KeyA"]) {
          this.rollMovement -= 3;
          this.x -= 3;
          this.facing = 1;
          this.downToTheEarth = 1.2;
          this.animateCubeFacing0(1, 1, 0);
        }
      } else if (this.facing === 1) {
        if (this.keys["KeyW"]) {
          this.pitchMovement -= 2;
          this.y -= 2;
          this.facing = 1;
          this.downToTheEarth = 1.2;
          this.animateCubeFacing1(-1, 0, 1);
        }
        if (this.keys["KeyS"]) {
          this.pitchMovement += 2;
          this.y += 2;
          this.facing = 1;
          this.downToTheEarth = 1.2;
          this.animateCubeFacing1(1, 0, 1);
        }
        if (this.keys["KeyD"]) {
          this.rollMovement += 3;
          this.x += 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
          this.animateCubeFacing1(-1, 1, 0);
        }
        if (this.keys["KeyA"]) {
          this.rollMovement -= 3;
          this.x -= 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
          this.animateCubeFacing1(1, 1, 0);
        }
      } else if (this.facing === 2) {
        if (this.keys["KeyW"]) {
          this.pitchMovement -= 3;
          this.y -= 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
          this.animateCubeFacing2(1, 0, 1);
        }
        if (this.keys["KeyS"]) {
          this.pitchMovement += 3;
          this.y += 3;
          this.facing = 0;
          this.downToTheEarth = 2.2;
          this.animateCubeFacing2(-1, 0, 1);
        }
        if (this.keys["KeyD"]) {
          this.rollMovement += 2;
          this.x += 2;
          this.facing = 2;
          this.downToTheEarth = 1.2;
          this.animateCubeFacing2(-1, 1, 0);
        }
        if (this.keys["KeyA"]) {
          this.rollMovement -= 2;
          this.x -= 2;
          this.facing = 2;
          this.downToTheEarth = 1.2;
          this.animateCubeFacing2(1, 1, 0);
        }
      }
      this.isKeyPressed = false;
    }
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

  animateCubeFacing0(sign, leftright, updown) {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.animationComplete = false;
    }
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    const animationDuration = 160;
    const fraction = elapsedTime / animationDuration;
    const transform = this.node.getComponentOfType(Transform);
    if (fraction < 1) {
      const fractionInvert = 1 - fraction;

      transform.translation[0] =
        leftright == 1
          ? this.rollMovement + sign * fractionInvert * 3
          : transform.translation[0];

      transform.translation[1] =
        fraction > 0.2 ? 2.2 - fraction : transform.translation[1];

      transform.translation[2] =
        updown == 1
          ? this.pitchMovement + sign * 3 * fractionInvert
          : transform.translation[2];

      const xRot = [1, 0, 0, fraction * sign];
      const zRot = [0, 0, 1, fraction * -sign];
      transform.rotation = leftright == 1 ? zRot : xRot;
      quat.normalize(transform.rotation, transform.rotation);

      requestAnimationFrame(
        this.animateCubeFacing0.bind(this, sign, leftright, updown)
      );
    } else {
      transform.translation[0] = this.rollMovement;
      transform.translation[1] = this.downToTheEarth;
      transform.translation[2] = this.pitchMovement;
      const xRot = [1, 0, 0, sign];
      const zRot = [0, 0, 1, -sign];
      transform.rotation = leftright == 1 ? zRot : xRot;
      quat.normalize(transform.rotation, transform.rotation);
      this.startTime = null;
      this.animationComplete = true;
      this.playSoundEffect();
    }
  }

  animateCubeFacing1(sign, leftright, updown) {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.animationComplete = false;
    }
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    const animationDuration = 160;
    const fraction = elapsedTime / animationDuration;
    const transform = this.node.getComponentOfType(Transform);
    if (fraction < 1) {
      transform.translation[0] =
        leftright == 1
          ? this.rollMovement + 3 * sign - sign * fraction * 3
          : transform.translation[0];

      transform.translation[1] = leftright == 1 ? 1.2 + fraction * 1 : 1.2;

      transform.translation[2] =
        updown == 1
          ? this.pitchMovement - sign * (1 - fraction) * 2
          : transform.translation[2];

      const zRot = [0, 0, 1, (1 - fraction) * sign];
      const xRot = [1, 0, 0, (1 - fraction) * sign];
      const zxRot = quat.create();
      quat.multiply(zxRot, xRot, [0, 0, 1, 1]);
      transform.rotation = leftright == 1 ? zRot : zxRot;
      quat.normalize(transform.rotation, transform.rotation);
      requestAnimationFrame(
        this.animateCubeFacing1.bind(this, sign, leftright, updown)
      );
    } else {
      transform.translation[0] = this.rollMovement;
      transform.translation[1] = this.downToTheEarth;
      transform.translation[2] = this.pitchMovement;

      const zRot = [0, 0, 0, 1];
      const xRot = [1, 0, 0, 0];
      const zxRot = quat.create();
      quat.multiply(zxRot, xRot, [0, 0, 1, 1]);
      transform.rotation = leftright == 1 ? zRot : zxRot;
      quat.normalize(transform.rotation, transform.rotation);
      this.startTime = null;
      this.animationComplete = true;
      this.playSoundEffect();
    }
  }

  animateCubeFacing2(sign, leftright, updown) {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.animationComplete = false;
    }
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    const animationDuration = 160;
    const fraction = elapsedTime / animationDuration;
    const transform = this.node.getComponentOfType(Transform);
    if (fraction < 1) {
      transform.translation[0] =
        leftright == 1
          ? this.rollMovement + sign * (1 - fraction) * 2
          : transform.translation[0];

      transform.translation[1] = updown == 1 ? 1.2 + fraction * 1 : 1.2;

      transform.translation[2] =
        updown == 1
          ? this.pitchMovement + sign * 3 * (1 - fraction)
          : transform.translation[2];

      const xRot = [1, 0, 0, -sign * (1 - fraction)];
      const zRot = [0, 0, 1, sign * (1 - fraction)];
      const xzRot = quat.create();
      quat.multiply(xzRot, zRot, [1, 0, 0, 1]);
      transform.rotation = updown == 1 ? xRot : xzRot;
      quat.normalize(transform.rotation, transform.rotation);
      requestAnimationFrame(
        this.animateCubeFacing2.bind(this, sign, leftright, updown)
      );
    } else {
      transform.translation[0] = this.rollMovement;
      transform.translation[1] = this.downToTheEarth;
      transform.translation[2] = this.pitchMovement;

      const xRot = [1, 0, 0, 1];
      const zRot = [0, 0, 1, 1];
      const xzRot = quat.create();
      quat.multiply(xzRot, zRot, xRot);
      transform.rotation = updown == 1 ? [0, 0, 0, 1] : xzRot;

      quat.normalize(transform.rotation, transform.rotation);
      this.startTime = null;
      this.animationComplete = true;
      this.playSoundEffect();
    }
  }
  playSoundEffect() {
    var sound = document.getElementById("blockFall");
    sound.play();
  }
}
