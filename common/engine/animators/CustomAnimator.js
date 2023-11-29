import { Transform } from "../core.js";

import { quat, vec3 } from "../../../lib/gl-matrix-module.js";

export class CustomAnimator {
  constructor(node, times = [], rotations = [], translations = []) {
    this.node = node;
    this.times = times;
    this.rotations = rotations;
    this.translations = translations;
    this.playing = false;
  }

  play() {
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }

  update(t, dt) {
    if (!this.playing) {
      return;
    }

    const transform = this.node.getComponentOfType(Transform);

    const minTime = this.times.get(0)[0];
    const maxTime = this.times.get(this.times.count - 1)[0];

    if (t <= minTime) {
      const translation = this.translations.get(0);
      const rotation = this.rotations.get(0);
      transform.translation = translation;
      transform.rotation = rotation;
      return;
    }

    if (t >= maxTime) {
      const translation = this.translations.get(this.translations.count - 1);
      const rotation = this.rotations.get(this.rotations.count - 1);
      transform.translation = translation;
      transform.rotation = rotation;
      return;
    }

    let indexLeft = 0;
    let indexRight = 0;

    for (let i = 0; i < this.times.count; i++) {
      if (t >= this.times.get(i)[0]) {
        indexLeft = i;
        indexRight = i + 1;
      } else {
        break;
      }
    }

    const timeLeft = this.times.get(indexLeft)[0];
    const timeRight = this.times.get(indexRight)[0];
    const timeInterpolation = (t - timeLeft) / (timeRight - timeLeft);

    const translationLeft = this.translations.get(indexLeft);
    const translationRight = this.translations.get(indexRight);
    const translationInterpolation = vec3.lerp(
      transform.translation,
      translationLeft,
      translationRight,
      timeInterpolation
    );

    const rotationLeft = this.rotations.get(indexLeft);
    const rotationRight = this.rotations.get(indexRight);
    const rotationInterpolation = quat.slerp(
      transform.rotation,
      rotationLeft,
      rotationRight,
      timeInterpolation
    );
  }
}
