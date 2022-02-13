import { math } from '../math/math.js';
import { Vec3 } from '../math/vec3.js';

import { DISTANCE_EXPONENTIAL, DISTANCE_INVERSE, DISTANCE_LINEAR } from '../audio/constants.js';
import { hasAudioContext } from '../audio/capabilities.js';

import { SoundInstance } from './instance.js';

/** @typedef {import('./sound.js').Sound} Sound */
/** @typedef {import('./manager.js').SoundManager} SoundManager */

// default maxDistance, same as Web Audio API
const MAX_DISTANCE = 10000;

/**
 * A SoundInstance3d plays a {@link Sound} in 3D.
 *
 * @augments SoundInstance
 */
class SoundInstance3d extends SoundInstance {
    /**
     * @type {Vec3}
     * @private
     */
    _position = new Vec3();

    /**
     * @type {Vec3}
     * @private
     */
    _velocity = new Vec3();

    /**
     * Create a new SoundInstance3d instance.
     *
     * @param {SoundManager} manager - The sound manager.
     * @param {Sound} sound - The sound to play.
     * @param {object} options - Options for the instance.
     * @param {number} [options.volume=1] - The playback volume, between 0 and 1.
     * @param {number} [options.pitch=1] - The relative pitch, default of 1, plays at normal pitch.
     * @param {boolean} [options.loop=false] - Whether the sound should loop when it reaches the
     * end or not.
     * @param {number} [options.startTime=0] - The time from which the playback will start. Default
     * is 0 to start at the beginning.
     * @param {number} [options.duration=null] - The total time after the startTime when playback
     * will stop or restart if loop is true.
     * @param {Vec3} [options.position=null] - The position of the sound in 3D space.
     * @param {Vec3} [options.velocity=null] - The velocity of the sound.
     * @param {string} [options.distanceModel=DISTANCE_LINEAR] - Determines which algorithm to use
     * to reduce the volume of the audio as it moves away from the listener. Can be:
     *
     * - {@link DISTANCE_LINEAR}
     * - {@link DISTANCE_INVERSE}
     * - {@link DISTANCE_EXPONENTIAL}
     *
     * Default is {@link DISTANCE_LINEAR}.
     * @param {number} [options.refDistance=1] - The reference distance for reducing volume as the
     * sound source moves further from the listener.
     * @param {number} [options.maxDistance=10000] - The maximum distance from the listener at which
     * audio falloff stops. Note the volume of the audio is not 0 after this distance, but just
     * doesn't fall off anymore.
     * @param {number} [options.rollOffFactor=1] - The factor used in the falloff equation.
     */
    constructor(manager, sound, options = {}) {
        super(manager, sound, options);

        if (options.position)
            this.position = options.position;

        if (options.velocity)
            this.velocity = options.velocity;

        this.maxDistance = options.maxDistance !== undefined ? Number(options.maxDistance) : MAX_DISTANCE;
        this.refDistance = options.refDistance !== undefined ? Number(options.refDistance) : 1;
        this.rollOffFactor = options.rollOffFactor !== undefined ? Number(options.rollOffFactor) : 1;
        this.distanceModel = options.distanceModel !== undefined ? options.distanceModel : DISTANCE_LINEAR;
    }

    /**
     * Allocate Web Audio resources for this instance.
     *
     * @private
     */
    _initializeNodes() {
        this.gain = this._manager.context.createGain();
        this.panner = this._manager.context.createPanner();
        this.panner.connect(this.gain);
        this._inputNode = this.panner;
        this._connectorNode = this.gain;
        this._connectorNode.connect(this._manager.context.destination);
    }

    /**
     * The position of the sound in 3D space.
     *
     * @type {Vec3}
     */
    set position(value) {
        this._position.copy(value);
        this.panner.positionX.value = value.x;
        this.panner.positionY.value = value.y;
        this.panner.positionZ.value = value.z;
    }

    get position() {
        return this._position;
    }

    /**
     * The velocity of the sound.
     *
     * @type {Vec3}
     */
    set velocity(velocity) {
        this._velocity.copy(velocity);
        this.panner.setVelocity(velocity.x, velocity.y, velocity.z);
    }

    get velocity() {
        return this._velocity;
    }

    /**
     * The maximum distance from the listener at which audio falloff stops. Note the volume of the
     * audio is not 0 after this distance, but just doesn't fall off anymore.
     *
     * @type {number}
     */
    set maxDistance(value) {
        this.panner.maxDistance = value;
    }

    get maxDistance() {
        return this.panner.maxDistance;
    }

    /**
     * The reference distance for reducing volume as the sound source moves further from the
     * listener.
     *
     * @type {number}
     */
    set refDistance(value) {
        this.panner.refDistance = value;
    }

    get refDistance() {
        return this.panner.refDistance;
    }

    /**
     * The factor used in the falloff equation.
     *
     * @type {number}
     */
    set rollOffFactor(value) {
        this.panner.rolloffFactor = value;
    }

    get rollOffFactor() {
        return this.panner.rolloffFactor;
    }

    /**
     * Determines which algorithm to use to reduce the volume of the audio as it moves away from
     * the listener. Can be:
     *
     * - {@link DISTANCE_LINEAR}
     * - {@link DISTANCE_INVERSE}
     * - {@link DISTANCE_EXPONENTIAL}
     *
     * Default is {@link DISTANCE_LINEAR}.
     *
     * @type {string}
     */
    set distanceModel(value) {
        this.panner.distanceModel = value;
    }

    get distanceModel() {
        return this.panner.distanceModel;
    }
}

if (!hasAudioContext()) {
    // temp vector storage
    let offset = new Vec3();

    // Fall off function which should be the same as the one in the Web Audio API
    // Taken from https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel
    const fallOff = function (posOne, posTwo, refDistance, maxDistance, rollOffFactor, distanceModel) {
        offset = offset.sub2(posOne, posTwo);
        const distance = offset.length();

        if (distance < refDistance) {
            return 1;
        } else if (distance > maxDistance) {
            return 0;
        }

        let result = 0;
        if (distanceModel === DISTANCE_LINEAR) {
            result = 1 - rollOffFactor * (distance - refDistance) / (maxDistance - refDistance);
        } else if (distanceModel === DISTANCE_INVERSE) {
            result = refDistance / (refDistance + rollOffFactor * (distance - refDistance));
        } else if (distanceModel === DISTANCE_EXPONENTIAL) {
            result = Math.pow(distance / refDistance, -rollOffFactor);
        }
        return math.clamp(result, 0, 1);
    };

    Object.defineProperty(SoundInstance3d.prototype, 'position', {
        get: function () {
            return this._position;
        },
        set: function (position) {
            this._position.copy(position);

            if (this.source) {
                const listener = this._manager.listener;

                const lpos = listener.getPosition();

                const factor = fallOff(lpos, this._position, this.refDistance, this.maxDistance, this.rollOffFactor, this.distanceModel);

                const v = this.volume;

                this.source.volume = v * factor * this._manager.volume;
            }
        }
    });

    Object.defineProperty(SoundInstance3d.prototype, 'velocity', {
        get: function () {
            return this._velocity;
        },
        set: function (velocity) {
            this._velocity.copy(velocity);
        }
    });

    Object.defineProperty(SoundInstance3d.prototype, 'maxDistance', {
        get: function () {
            return this._maxDistance;
        },
        set: function (value) {
            this._maxDistance = value;
        }
    });

    Object.defineProperty(SoundInstance3d.prototype, 'refDistance', {
        get: function () {
            return this._refDistance;
        },
        set: function (value) {
            this._refDistance = value;
        }
    });

    Object.defineProperty(SoundInstance3d.prototype, 'rollOffFactor', {
        get: function () {
            return this._rollOffFactor;
        },
        set: function (value) {
            this._rollOffFactor = value;
        }
    });

    Object.defineProperty(SoundInstance3d.prototype, 'distanceModel', {
        get: function () {
            return this._distanceModel;
        },
        set: function (value) {
            this._distanceModel = value;
        }
    });
}

export { SoundInstance3d };