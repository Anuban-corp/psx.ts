(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let { EventSubscriber } = require('./event_subscriber');

class EventManager {
  constructor() {
    this.subscribers = [];
  }

  wait(emitter, type) {
    return new Promise(resolve => {
      this.subscribeOnce(emitter, type, this, (data) => {
        resolve(data);
      });
    });
  }

  subscribe(emitter, type, listener, cb) {
    if (!emitter) {
      throw new Error('EventManager::subscribe(): emitter is undefined !');
    }
    if (!type) {
      throw new Error('EventManager::subscribe(): type is undefined !');
    }
    if (!cb || typeof cb != 'function') {
      throw new Error('EventManager::subscribe(): cb is not a function !');
    }

    this.subscribers.push(new EventSubscriber(emitter, type, listener, false, cb));
  }

  subscribeOnce(emitter, type, listener, cb) {
    if (!emitter) {
      throw new Error('EventManager::subscribe(): emitter is undefined !');
    }
    if (!type) {
      throw new Error('EventManager::subscribe(): type is undefined !');
    }
    if (!cb || typeof cb != 'function') {
      throw new Error('EventManager::subscribe(): cb is not a function !');
    }

    this.subscribers.push(new EventSubscriber(emitter, type, listener, true, cb));
  }

  unsubscribe(emitter, type, listener) {
    for (let subscriber of this.subscribers) {
      if (subscriber.emitter == emitter && subscriber.type == type && subscriber.listener == listener) {
        this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
        return;
      }
    }
  }

  unsubscribeAll() {
    this.subscribers = [];
  }

  async emit(emitter, type, data) {
    let promises = [];

    for (let subscriber of this.subscribers.slice()) {
      if (subscriber.emitter == emitter && subscriber.type == type) {
        let res = subscriber.cb.call(subscriber.listener, data);
        if (res instanceof Promise) {
          promises.push(res);
        }
  
        if (subscriber.once) {
          this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
        }
      }
    }

    return Promise.all(promises);
  }
}

module.exports.eventManager = new EventManager();
},{"./event_subscriber":2}],2:[function(require,module,exports){
class EventSubscriber {
  constructor(emitter, type, listener, once, cb) {
    this.emitter = emitter;
    this.type = type;
    this.listener = listener;
    this.once = once;
    this.cb = cb;
  }
}

module.exports.EventSubscriber = EventSubscriber;
},{}],3:[function(require,module,exports){
class Utils {
  static FAIL(message) {
    let elem = document.querySelector('#APP_FAIL');
    elem.classList.add('SHOW');
    elem.textContent = message;
  }

  static BIND(fn, ctx) {
    return fn.bind(ctx);
  }
  static BIND_1(fn, ctx, a) {
    return fn.bind(ctx, a);
  }

  static BIND_2(fn, ctx, a, b) {
    return fn.bind(ctx, a, b);
  }

  static BIND_3(fn, ctx, a, b, c) {
    return fn.bind(ctx, a, b, c);
  }

  static SHUFFLE(arr) {
    let res = arr.slice();
    let tmp, cur, tp = res.length;
    if (tp) {
      while (--tp) {
        cur = Math.floor(Math.random() * (tp + 1));
        tmp = res[cur];
        res[cur] = res[tp];
        res[tp] = tmp;
      }
    }

    return res;
  }

  static RANDARRAY(min, max) {
    let arr = [];
    for (let i = min; i <= max; i++) {
      arr.push(i);
    }

    return Utils.SHUFFLE(arr);
  }

  static GET_RANDOM_INT(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static GET_RANDOM_FLOAT(min, max) {
    return (Math.random() * (max - min)) + min;
  }

  static CLAMP(a, b, c) {
    return Math.max(b, Math.min(c, a));
  }

  static DEG_TO_RAD(deg) {
    return deg * (Math.PI / 180);
  }

  static GET_TRIANGLE_ELEVATION(a, b, c, p = [0, 0]) {
    let ab = [b[0] - a[0], 0, b[2] - a[2]];
    let ca = [a[0] - c[0], 0, a[2] - c[2]];
    let ap = [p[0] - a[0], 0, p[1] - a[2]];
    let bp = [p[0] - b[0], 0, p[1] - b[2]];
    let cp = [p[0] - c[0], 0, p[1] - c[2]];

    let area = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(ab, ca));
    let wa = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(bp, cp)) / area;
    let wb = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(ap, cp)) / area;
    let wc = Utils.VEC3_LENGTH(Utils.VEC3_CROSS(ap, bp)) / area;

    let total = Utils.TO_FIXED_NUMBER(wa + wb + wc, 5);
    if (total > 1) {
      return Infinity;
    }

    // pour finir, nous déterminons la coordonnée 'y' grâce aux poids precedemment trouvés.
    // celà est possible car : wa*HA + wb*HB = 0 et wa+wb*GH + wc*GC = 0.
    let vert = a[1] + ((b[1] - a[1]) * (wb / (wa + wb)));
    let elev = vert + ((c[1] - vert) * (wc / (wa + wb + wc)));
    return Utils.TO_FIXED_NUMBER(elev, 5);
  }

  static GET_TRIANGLE_SAME_SIDES(a, b, c, p) {
    let ab = [b[0] - a[0], 0, b[2] - a[2]];
    let bc = [c[0] - b[0], 0, c[2] - b[2]];
    let ca = [a[0] - c[0], 0, a[2] - c[2]];
    let ap = [p[0] - a[0], 0, p[1] - a[2]];
    let bp = [p[0] - b[0], 0, p[1] - b[2]];
    let cp = [p[0] - c[0], 0, p[1] - c[2]];
    let crossAPAB = Utils.VEC3_CROSS(ap, ab);
    let crossBPBC = Utils.VEC3_CROSS(bp, bc);
    let crossCPCA = Utils.VEC3_CROSS(cp, ca);
    return {
      ab: Utils.TO_FIXED_NUMBER(crossAPAB[1], 5) > 0,
      bc: Utils.TO_FIXED_NUMBER(crossBPBC[1], 5) > 0,
      ca: Utils.TO_FIXED_NUMBER(crossCPCA[1], 5) > 0
    }
  }

  static POINT_IN_TRIANGLE(a, b, c, p) {
    let sides = Utils.GET_TRIANGLE_SAME_SIDES(a, b, c, p);
    return !sides.ab && !sides.bc && !sides.ca;
  }

  static LERP(a, b, t) {
    return a + (b - a) * t;
  }

  static TO_FIXED_NUMBER(num, digits, base) {
    let pow = Math.pow(base || 10, digits);
    return Math.round(num * pow) / pow;
  }

  /**************************************************************************/

  static VEC2_CREATE(x = 0, y = 0) {
    return [x, y];
  }

  static VEC2_DISTANCE(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    return Math.sqrt((x * x) + (y * y));
  }

  static VEC2_LENGTH(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
  }

  static VEC2_NORMALIZE(a) {
    let len = Utils.VEC2_LENGTH(a);
    if (len > 0) {
      let x = a[0] / len;
      let y = a[1] / len;
      return [x, y];
    }
    else {
      return [0, 0];
    }
  }

  static VEC2_DOT(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }

  static VEC2_ADD(a, b) {
    let x = a[0] + b[0];
    let y = a[1] + b[1];
    return [x, y];
  }

  static VEC2_SUBSTRACT(a, b) {
    let x = a[0] - b[0];
    let y = a[1] - b[1];
    return [x, y];
  }

  static VEC2_MULTIPLY(a, b) {
    let x = a[0] * b[0];
    let y = a[1] * b[1];
    return [x, y];
  }

  static VEC2_SCALE(a, scale) {
    let x = a[0] * scale;
    let y = a[1] * scale;
    return [x, y];
  }

  static VEC2_ANGLE_BETWEEN(a, b) {
    return Math.acos(Utils.VEC2_DOT(a, b) / (Utils.VEC2_LENGTH(a) * Utils.VEC2_LENGTH(b)));
  }

  static VEC2_ANGLE(a) {
    let angle = Math.atan2(a[1], a[0]);
    return (angle > 0) ? angle : (angle + Math.PI * 2);
  }

  static VEC2_ISEQUAL(a, b) {
    return a[0] == b[0] && a[1] == b[1];
  }

  static VEC2_PROJECTION_COS(a, b) {
    let bLength = Math.sqrt(b[0] * b[0] + b[1] * b[1]);
    let bNormalizer = (a[0] * b[0] + a[1] * b[1]) / (bLength * bLength);
    let x = b[0] * bNormalizer;
    let y = b[1] * bNormalizer;
    return [x, y];
  }

  /**************************************************************************/

  static VEC3_ZERO = [0, 0, 0];
  static VEC3_BACKWARD = [0, 0, 1];
  static VEC3_FORWARD = [0, 0, -1];
  static VEC3_LEFT = [-1, 0, 0];
  static VEC3_RIGHT = [1, 0, 0];
  static VEC3_UP = [0, 1, 0];
  static VEC3_DOWN = [0, -1, 0];

  static VEC3_CREATE(x = 0, y = 0, z = 0) {
    return [x, y, z];
  }

  static VEC3_DISTANCE(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.sqrt((x * x) + (y * y) + (z * z));
  }

  static VEC3_LENGTH(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  }

  static VEC3_NORMALIZE(a) {
    let len = Utils.VEC3_LENGTH(a);
    if (len > 0) {
      let x = a[0] / len;
      let y = a[1] / len;
      let z = a[2] / len;
      return [x, y, z];
    }
    else {
      return [0, 0, 0];
    }
  }

  static VEC3_DOT(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  static VEC3_CROSS(a, b) {
    let x = a[1] * b[2] - a[2] * b[1];
    let y = a[2] * b[0] - a[0] * b[2];
    let z = a[0] * b[1] - a[1] * b[0];
    return [x, y, z];
  }

  static VEC3_ADD(a, b) {
    let x = a[0] + b[0];
    let y = a[1] + b[1];
    let z = a[2] + b[2];
    return [x, y, z];
  }

  static VEC3_SUBSTRACT(a, b) {
    let x = a[0] - b[0];
    let y = a[1] - b[1];
    let z = a[2] - b[2];
    return [x, y, z];
  }

  static VEC3_MULTIPLY(a, b) {
    let x = a[0] * b[0];
    let y = a[1] * b[1];
    let z = a[2] * b[2];
    return [x, y, z];
  }

  static VEC3_SCALE(a, scale) {
    let x = a[0] * scale;
    let y = a[1] * scale;
    let z = a[2] * scale;
    return [x, y, z];
  }

  static VEC3_ISEQUAL(a, b) {
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
  }

  /**************************************************************************/

  static MAT3_MULTIPLY_BY_VEC3(a, v) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a10 = a[3];
    let a11 = a[4];
    let a12 = a[5];
    let a20 = a[6];
    let a21 = a[7];
    let a22 = a[8];
    let v00 = v[0];
    let v01 = v[1];
    let v02 = v[2];

    let c00 = v00 * a00 + v01 * a10 + v02 * a20;
    let c01 = v00 * a01 + v01 * a11 + v02 * a21;
    let c02 = v00 * a02 + v01 * a12 + v02 * a22;

    return [
      c00, c01, c02
    ];
  }

  static MAT3_MULTIPLY(a, b) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a10 = a[3];
    let a11 = a[4];
    let a12 = a[5];
    let a20 = a[6];
    let a21 = a[7];
    let a22 = a[8];
    let b00 = b[0];
    let b01 = b[1];
    let b02 = b[2];
    let b10 = b[3];
    let b11 = b[4];
    let b12 = b[5];
    let b20 = b[6];
    let b21 = b[7];
    let b22 = b[8];

    let c00 = b00 * a00 + b01 * a10 + b02 * a20;
    let c01 = b00 * a01 + b01 * a11 + b02 * a21;
    let c02 = b00 * a02 + b01 * a12 + b02 * a22;

    let c10 = b10 * a00 + b11 * a10 + b12 * a20;
    let c11 = b10 * a01 + b11 * a11 + b12 * a21;
    let c12 = b10 * a02 + b11 * a12 + b12 * a22;

    let c20 = b20 * a00 + b21 * a10 + b22 * a20;
    let c21 = b20 * a01 + b21 * a11 + b22 * a21;
    let c22 = b20 * a02 + b21 * a12 + b22 * a22;

    return [
      c00, c01, c02,
      c10, c11, c12,
      c20, c21, c22
    ];
  }

  static MAT3_INVERT(a) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a10 = a[3];
    let a11 = a[4];
    let a12 = a[5];
    let a20 = a[6];
    let a21 = a[7];
    let a22 = a[8];
    let b01 = a22 * a11 - a12 * a21;
    let b11 = -a22 * a10 + a12 * a20;
    let b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (!det) {
      return null;
    }

    det = 1.0 / det;

    let out = [];
    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;

    return out;
  }

  static MAT3_IDENTITY() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }

  static MAT3_SCALE(x, y) {
    return [
      x, 0, 0,
      0, y, 0,
      0, 0, 1
    ];
  }

  static MAT3_ROTATE(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      c, s, 0,
      -s, c, 0,
      0, 0, 1
    ];
  }

  static MAT3_TRANSLATE(x, y) {
    return [
      1, 0, 0,
      0, 1, 0,
      x, y, 1
    ]
  }

  static MAT3_PROJECTION(w, h) {
    return [
      2 / w, 0, 0,
      0, 2 / h, 0,
      -1, -1, 1
    ];
  }

  /**************************************************************************/

  static MAT4_MULTIPLY_BY_VEC4(a, v) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a03 = a[3];
    let a10 = a[4];
    let a11 = a[5];
    let a12 = a[6];
    let a13 = a[7];
    let a20 = a[8];
    let a21 = a[9];
    let a22 = a[10];
    let a23 = a[11];
    let a30 = a[12];
    let a31 = a[13];
    let a32 = a[14];
    let a33 = a[15];
    let v00 = v[0];
    let v01 = v[1];
    let v02 = v[2];
    let v03 = v[3];

    let c00 = v00 * a00 + v01 * a10 + v02 * a20 + v03 * a30;
    let c01 = v00 * a01 + v01 * a11 + v02 * a21 + v03 * a31;
    let c02 = v00 * a02 + v01 * a12 + v02 * a22 + v03 * a32;
    let c03 = v00 * a03 + v01 * a13 + v02 * a23 + v03 * a33;

    return [
      c00, c01, c02, c03
    ];
  }

  static MAT4_COMPUTE(...matrices) {
    for (let i = 0; i < matrices.length - 1; i++) {
      matrices[i + 1] = Utils.MAT4_MULTIPLY(matrices[i], matrices[i + 1]);
    }

    return matrices[matrices.length - 1];
  }

  static MAT4_MULTIPLY(a, b) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a03 = a[3];
    let a10 = a[4];
    let a11 = a[5];
    let a12 = a[6];
    let a13 = a[7];
    let a20 = a[8];
    let a21 = a[9];
    let a22 = a[10];
    let a23 = a[11];
    let a30 = a[12];
    let a31 = a[13];
    let a32 = a[14];
    let a33 = a[15];
    let b00 = b[0];
    let b01 = b[1];
    let b02 = b[2];
    let b03 = b[3];
    let b10 = b[4];
    let b11 = b[5];
    let b12 = b[6];
    let b13 = b[7];
    let b20 = b[8];
    let b21 = b[9];
    let b22 = b[10];
    let b23 = b[11];
    let b30 = b[12];
    let b31 = b[13];
    let b32 = b[14];
    let b33 = b[15];

    let c00 = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    let c01 = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    let c02 = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    let c03 = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

    let c10 = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    let c11 = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    let c12 = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    let c13 = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

    let c20 = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    let c21 = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    let c22 = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    let c23 = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

    let c30 = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    let c31 = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    let c32 = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    let c33 = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

    return [
      c00, c01, c02, c03,
      c10, c11, c12, c13,
      c20, c21, c22, c23,
      c30, c31, c32, c33
    ];
  }

  static MAT4_INVERT(a) {
    let a00 = a[0];
    let a01 = a[1];
    let a02 = a[2];
    let a03 = a[3];
    let a10 = a[4];
    let a11 = a[5];
    let a12 = a[6];
    let a13 = a[7];
    let a20 = a[8];
    let a21 = a[9];
    let a22 = a[10];
    let a23 = a[11];
    let a30 = a[12];
    let a31 = a[13];
    let a32 = a[14];
    let a33 = a[15];
    let b00 = a00 * a11 - a01 * a10;
    let b01 = a00 * a12 - a02 * a10;
    let b02 = a00 * a13 - a03 * a10;
    let b03 = a01 * a12 - a02 * a11;
    let b04 = a01 * a13 - a03 * a11;
    let b05 = a02 * a13 - a03 * a12;
    let b06 = a20 * a31 - a21 * a30;
    let b07 = a20 * a32 - a22 * a30;
    let b08 = a20 * a33 - a23 * a30;
    let b09 = a21 * a32 - a22 * a31;
    let b10 = a21 * a33 - a23 * a31;
    let b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
      return null;
    }

    det = 1.0 / det;

    let out = [];
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
  }

  static MAT4_IDENTITY() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_SCALE(x, y, z) {
    return [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_ROTATE_X(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_ROTATE_Y(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_ROTATE_Z(r) {
    let c = Math.cos(r);
    let s = Math.sin(r);
    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_TRANSLATE(x, y, z) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]
  }

  static MAT4_TRANSFORM(position, rotation, scale) {
    let matrix = Utils.MAT4_IDENTITY();
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_TRANSLATE(position[0], position[1], position[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_X(rotation[0]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Y(rotation[1]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Z(rotation[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_SCALE(scale[0], scale[1], scale[2]));
    return matrix;
  }

  static MAT4_ORTHOGRAPHIC(size, depth) {
    return [
      2 / size, 0, 0, 0,
      0, 2 / size, 0, 0,
      0, 0, -2 / depth, 0,
      0, 0, 0, 1
    ];
  }

  static MAT4_PERSPECTIVE(fov, ar, near, far) {
    return [
      (1 / (Math.tan(fov / 2) * ar)), 0, 0, 0,
      0, 1 / Math.tan(fov / 2), 0, 0,
      0, 0, (near + far) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0
    ];
  }

  static MAT4_LOOKAT(position, target, vertical = [0, 1, 0]) {
    let axeZ = Utils.VEC3_NORMALIZE(Utils.VEC3_SUBSTRACT(target, position));
    let axeX = Utils.VEC3_CROSS(vertical, axeZ);
    let axeY = Utils.VEC3_CROSS(axeZ, axeX);

    return [
      axeX[0], axeX[1], axeX[2], 0,
      axeY[0], axeY[1], axeY[2], 0,
      axeZ[0], axeZ[1], axeZ[2], 0,
      position[0], position[1], position[2], 1];
  }
}

module.exports.Utils = Utils;
},{}],4:[function(require,module,exports){
let { gfx3Manager } = require('./gfx3_manager');

class Gfx3Debug {
  static drawGrid(modelMatrix, extend = 3, spacing = 1) {
    let vertices = [];
    let vertexCount = 0;
    let nbCells = extend * 2;
    let gridSize = nbCells * spacing;
    let left = -gridSize * 0.5;
    let top = -gridSize * 0.5;

    for (let i = 0; i <= nbCells; i++) {
      let vLineFromX = left + (i * spacing);
      let vLineFromY = top;
      let vLineFromZ = 0;
      let vLineDestX = left + (i * spacing);
      let vLineDestY = top + gridSize;
      let vLineDestZ = 0;
      let hLineFromX = left;
      let hLineFromY = top + (i * spacing);
      let hLineFromZ = 0;
      let hLineDestX = left + gridSize;
      let hLineDestY = top + (i * spacing);
      let hLineDestZ = 0;
      vertices.push(vLineFromX, vLineFromY, vLineFromZ, 1, 1, 1);
      vertices.push(vLineDestX, vLineDestY, vLineDestZ, 1, 1, 1);
      vertices.push(hLineFromX, hLineFromY, hLineFromZ, 1, 1, 1);
      vertices.push(hLineDestX, hLineDestY, hLineDestZ, 1, 1, 1);
      vertexCount += 4;
    }

    gfx3Manager.drawDebugLineList(modelMatrix, vertexCount, vertices);
  }

  static drawGizmo(modelMatrix, size = 1) {
    let vertices = [];
    let vertexCount = 0;
    let axes = [
      [1 * size, 0, 0],
      [0, 1 * size, 0],
      [0, 0, 1 * size]
    ];

    let colors = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    for (let i = 0; i < axes.length; i++) {
      vertices.push(0, 0, 0, colors[i][0], colors[i][1], colors[i][2]);
      vertices.push(axes[i][0], axes[i][1], axes[i][2], colors[i][0], colors[i][1], colors[i][2]);
      vertexCount += 2;
    }

    gfx3Manager.drawDebugLineList(modelMatrix, vertexCount, vertices);
  }

  static drawCircle(modelMatrix, radius = 1, step = 4) {
    let vertices = [];
    let vertexCount = 0;
    let angleStep = (Math.PI * 2) / step;

    for (let i = 0; i < step; i++) {
      let x1 = Math.cos(i * angleStep) * radius;
      let y1 = Math.sin(i * angleStep) * radius;
      let z1 = 0;
      let x2 = Math.cos((i + 1) * angleStep) * radius;
      let y2 = Math.sin((i + 1) * angleStep) * radius;
      let z2 = 0;

      vertices.push(x1, y1, z1, 1, 1, 1);
      vertices.push(x2, y2, z2, 1, 1, 1);
      vertexCount += 2;
    }

    gfx3Manager.drawDebugLineList(modelMatrix, vertexCount, vertices);
  }

  static drawBoundingRect(modelMatrix, min, max) {
    let vertices = [];
    let vertexCount = 0;
    let a = [min[0], min[1], 0];
    let b = [min[0], max[1], 0];
    let c = [max[0], min[1], 0];
    let d = [max[0], max[1], 0];

    vertices.push(a[0], a[1], a[2], 1, 1, 1);
    vertices.push(b[0], b[1], b[2], 1, 1, 1);
    vertexCount += 2;
    /* -- */
    vertices.push(b[0], b[1], b[2], 1, 1, 1);
    vertices.push(d[0], d[1], d[2], 1, 1, 1);
    vertexCount += 2;
    /* -- */
    vertices.push(d[0], d[1], d[2], 1, 1, 1);
    vertices.push(c[0], c[1], c[2], 1, 1, 1);
    vertexCount += 2;
    /* -- */
    vertices.push(c[0], c[1], c[2], 1, 1, 1);
    vertices.push(a[0], a[1], a[2], 1, 1, 1);
    vertexCount += 2;

    gfx3Manager.drawDebugLineList(modelMatrix, vertexCount, vertices);
  }

  static drawSphere(modelMatrix, radius = 1, step = 4) {
    let vertices = [];
    let vertexCount = 0;
    let angleStep = (Math.PI * 0.5) / step;
    let points = [];

    for (let i = -step; i <= step; i++) {
      let r = Math.cos(i * angleStep) * radius;
      let y = Math.sin(i * angleStep) * radius;
      for (let j = 0; j <= step * 4; j++) {
        let z = Math.sin(j * angleStep) * r;
        let x = Math.cos(j * angleStep) * Math.cos(i * angleStep) * radius;
        points.push([x, y, z]);
      }
    }

    for (let i = -step; i <= step; i++) {
      for (let j = 0; j <= step * 4; j++) {
        let x = Math.cos(j * angleStep) * radius * Math.cos(i * angleStep);
        let y = Math.sin(j * angleStep) * radius;
        let z = Math.cos(j * angleStep) * radius * Math.sin(i * angleStep);
        points.push([x, y, z]);
      }
    }

    for (let i = 0; i < points.length - 1; i++) {
      vertices.push(points[i][0], points[i][1], points[i][2], 1, 1, 1);
      vertices.push(points[i + 1][0], points[i + 1][1], points[i + 1][2], 1, 1, 1);
      vertexCount += 2;
    }

    gfx3Manager.drawDebugLineList(modelMatrix, vertexCount, vertices);
  }

  static drawBoundingBox(modelMatrix, min, max) {
    let vertices = [];
    let vertexCount = 0;
    let a = [min[0], min[1], min[2]];
    let b = [max[0], min[1], min[2]];
    let c = [max[0], max[1], min[2]];
    let d = [min[0], max[1], min[2]];
    let e = [min[0], max[1], max[2]];
    let f = [max[0], max[1], max[2]];
    let g = [max[0], min[1], max[2]];
    let h = [min[0], min[1], max[2]];

    vertices.push(a[0], a[1], a[2], 1, 1, 1);
    vertices.push(b[0], b[1], b[2], 1, 1, 1);
    vertices.push(h[0], h[1], h[2], 1, 1, 1);
    vertices.push(g[0], g[1], g[2], 1, 1, 1);
    vertexCount += 4;
    /* -- */
    vertices.push(d[0], d[1], d[2], 1, 1, 1);
    vertices.push(c[0], c[1], c[2], 1, 1, 1);
    vertices.push(e[0], e[1], e[2], 1, 1, 1);
    vertices.push(f[0], f[1], f[2], 1, 1, 1);
    vertexCount += 4;
    /* -- */
    vertices.push(a[0], a[1], a[2], 1, 1, 1);
    vertices.push(d[0], d[1], d[2], 1, 1, 1);
    vertices.push(h[0], h[1], h[2], 1, 1, 1);
    vertices.push(e[0], e[1], e[2], 1, 1, 1);
    vertexCount += 4;
    /* -- */
    vertices.push(b[0], b[1], b[2], 1, 1, 1);
    vertices.push(c[0], c[1], c[2], 1, 1, 1);
    vertices.push(g[0], g[1], g[2], 1, 1, 1);
    vertices.push(f[0], f[1], f[2], 1, 1, 1);
    vertexCount += 4;
    /* -- */
    vertices.push(d[0], d[1], d[2], 1, 1, 1);
    vertices.push(e[0], e[1], e[2], 1, 1, 1);
    vertices.push(c[0], c[1], c[2], 1, 1, 1);
    vertices.push(f[0], f[1], f[2], 1, 1, 1);
    vertexCount += 4;
    /* -- */
    vertices.push(a[0], a[1], a[2], 1, 1, 1);
    vertices.push(h[0], h[1], h[2], 1, 1, 1);
    vertices.push(b[0], b[1], b[2], 1, 1, 1);
    vertices.push(g[0], g[1], g[2], 1, 1, 1);
    vertexCount += 4;

    gfx3Manager.drawDebugLineList(modelMatrix, vertexCount, vertices);
  }
}

module.exports.Gfx3Debug = Gfx3Debug;
},{"./gfx3_manager":6}],5:[function(require,module,exports){
let { Utils } = require('../core/utils');

class Gfx3Drawable {
  constructor() {
    this.position = [0.0, 0.0, 0.0];
    this.rotation = [0.0, 0.0, 0.0];
    this.scale = [1.0, 1.0, 1.0];
    this.vertices = [];
    this.vertexCount = 0;
    this.previousVertexCount = 0;
  }

  update(ts) {
    // virtual method called during update phase !
  }

  draw(viewIndex) {
    // virtual method called during draw phase !
  }

  delete() {
    this.vertexBuffer.destroy();
  }

  getPosition() {
    return this.position;
  }

  getPositionX() {
    return this.position[0];
  }

  getPositionY() {
    return this.position[1];
  }

  getPositionZ() {
    return this.position[2];
  }

  setPosition(x, y, z) {
    this.position = [x, y, z];
  }

  move(x, y, z) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
  }

  getRotation() {
    return this.rotation;
  }

  getRotationX() {
    return this.rotation[0];
  }

  getRotationY() {
    return this.rotation[1];
  }

  getRotationZ() {
    return this.rotation[2];
  }

  setRotation(x, y, z) {
    this.rotation = [x, y, z];
  }

  rotate(x, y, z) {
    this.rotation[0] += x;
    this.rotation[1] += y;
    this.rotation[2] += z;
  }

  getScale() {
    return this.scale;
  }

  getScaleX() {
    return this.scale[0];
  }

  getScaleY() {
    return this.scale[1];
  }

  getScaleZ() {
    return this.scale[2];
  }

  setScale(x, y, z) {
    this.scale = [x, y, z];
  }

  zoom(x, y, z) {
    this.scale[0] += x;
    this.scale[1] += y;
    this.scale[2] += z;
  }

  defineVertex(x, y, z, tx, ty) {
    this.vertices.push(x, y, z, tx, ty);
    this.vertexCount++;
  }

  defineVertexColor(x, y, z, r, g, b) {
    this.vertices.push(x, y, z, r, g, b);
    this.vertexCount++;
  }

  clearVertices() {
    this.vertices = [];
    this.vertexCount = 0;
  }

  commitVertices() {
    this.previousVertexCount = this.vertexCount;
  }

  getModelMatrix() {
    let matrix = Utils.MAT4_IDENTITY();
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_TRANSLATE(this.position[0], this.position[1], this.position[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Y(this.rotation[1]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_X(this.rotation[0])); // y -> x -> z
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_ROTATE_Z(this.rotation[2]));
    matrix = Utils.MAT4_MULTIPLY(matrix, Utils.MAT4_SCALE(this.scale[0], this.scale[1], this.scale[2]));
    return matrix;
  }
}

module.exports.Gfx3Drawable = Gfx3Drawable;
},{"../core/utils":3}],6:[function(require,module,exports){
let { Utils } = require('../core/utils');
let { Gfx3View } = require('./gfx3_view');
let { Gfx3Texture } = require('./gfx3_texture');
let { CREATE_MESH_SHADER_RES, CREATE_DEBUG_SHADER_RES } = require('./gfx3_shaders');

let CMD_MATRIX_BUFFER_DATA = 0;
let CMD_MATRIX_BUFFER_OFFSET = 1;
let CMD_VERTEX_BUFFER_DATA = 2;
let CMD_VERTEX_BUFFER_SIZE = 3;
let CMD_VERTEX_COUNT = 4;
let CMD_VERTEX_BUFFER_OFFSET = 5;
let CMD_TEXTURE_GROUP = 6;

class Gfx3Manager {
  constructor() {
    this.adapter = null;
    this.device = null;
    this.canvas = null;
    this.ctx = null;
    this.depthTexture = null;
    this.depthView = null;

    this.meshPipeline = null;
    this.meshVertexBuffer = null;
    this.meshMatrixBuffer = null;
    this.meshCommands = [];
    this.meshVertexCount = 0;

    this.debugPipeline = null;
    this.debugVertexBuffer = null;
    this.debugMatrixBuffer = null;
    this.debugCommands = [];
    this.debugVertexCount = 0;

    this.views = [new Gfx3View()];
    this.currentView = this.views[0];

    this.showDebug = false;
    this.vpcMatrix = Utils.MAT4_IDENTITY();
    this.defaultTexture = new Gfx3Texture();
  }

  async initialize() {
    if (!navigator.gpu) {
      Utils.FAIL('This browser does not support webgpu');
      throw new Error('Gfx3Manager::Gfx3Manager: WebGPU cannot be initialized - navigator.gpu not found');
    }

    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) {
      Utils.FAIL('This browser appears to support WebGPU but it\'s disabled');
      throw new Error('Gfx3Manager::Gfx3Manager: WebGPU cannot be initialized - Adapter not found');
    }

    this.device = await this.adapter.requestDevice();
    this.device.lost.then(() => {
      throw new Error('Gfx3Manager::Gfx3Manager: WebGPU cannot be initialized - Device has been lost');
    });

    this.canvas = document.getElementById('CANVAS_3D');
    if (!this.canvas) {
      throw new Error('Gfx3Manager::Gfx3Manager: CANVAS_3D not found');
    }

    this.ctx = this.canvas.getContext('webgpu');
    if (!this.ctx) {
      throw new Error('Gfx3Manager::Gfx3Manager: WebGPU cannot be initialized - Canvas does not support WebGPU');
    }

    this.ctx.configure({
      device: this.device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: 'opaque'
    });

    let devicePixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * devicePixelRatio;

    this.depthTexture = this.device.createTexture({
      size: [this.canvas.width, this.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    this.depthView = this.depthTexture.createView();

    this.meshPipeline = await CREATE_MESH_SHADER_RES(this.device);
    this.meshVertexBuffer = this.device.createBuffer({ size: 4, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    this.meshMatrixBuffer = this.device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

    this.debugPipeline = await CREATE_DEBUG_SHADER_RES(this.device);
    this.debugVertexBuffer = this.device.createBuffer({ size: 4, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    this.debugMatrixBuffer = this.device.createBuffer({ size: 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

    let res = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjkA43/A8AAtcBo43Eu70AAAAASUVORK5CYII=');
    let defaultImg = await res.blob();
    this.defaultTexture = this.createTextureFromBitmap(await createImageBitmap(defaultImg));

    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  beginDrawing(viewIndex) {
    let view = this.views[viewIndex];
    let viewport = view.getViewport();
    let viewportX = this.canvas.width * viewport.xFactor;
    let viewportY = this.canvas.height * viewport.yFactor;
    let viewportWidth = this.canvas.width * viewport.widthFactor;
    let viewportHeight = this.canvas.height * viewport.heightFactor;
    let viewBgColor = view.getBgColor();

    this.vpcMatrix = Utils.MAT4_IDENTITY();
    this.vpcMatrix = Utils.MAT4_MULTIPLY(this.vpcMatrix, view.getClipMatrix());
    this.vpcMatrix = Utils.MAT4_MULTIPLY(this.vpcMatrix, view.getProjectionMatrix(viewportWidth / viewportHeight));
    this.vpcMatrix = Utils.MAT4_MULTIPLY(this.vpcMatrix, view.getCameraViewMatrix());

    this.commandEncoder = this.device.createCommandEncoder();
    this.passEncoder = this.commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.ctx.getCurrentTexture().createView(),
        clearValue: { r: viewBgColor[0], g: viewBgColor[1], b: viewBgColor[2], a: viewBgColor[3] },
        loadOp: 'clear',
        storeOp: 'store'
      }],
      depthStencilAttachment: {
        view: this.depthView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store'
      }
    });

    this.passEncoder.setViewport(viewportX, viewportY, viewportWidth, viewportHeight, 0, 1);
    this.passEncoder.setScissorRect(viewportX, viewportY, viewportWidth, viewportHeight);
    this.currentView = view;
    this.meshVertexCount = 0;
    this.meshCommands = [];
    this.debugVertexCount = 0;
    this.debugCommands = [];
  }

  endDrawing() {
    // mesh shader
    // ------------------------------------------------------------------------------------
    this.passEncoder.setPipeline(this.meshPipeline);

    this.meshVertexBuffer.destroy();
    this.meshVertexBuffer = this.device.createBuffer({
      size: this.meshVertexCount * 5 * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    this.meshMatrixBuffer.destroy();
    this.meshMatrixBuffer = this.device.createBuffer({
      size: this.meshCommands.length * this.adapter.limits.minUniformBufferOffsetAlignment,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    for (let cmd of this.meshCommands) {
      let meshMatrixBinding = this.device.createBindGroup({
        layout: this.meshPipeline.getBindGroupLayout(0),
        entries: [{
          binding: 0,
          resource: {
            buffer: this.meshMatrixBuffer,
            offset: cmd[CMD_MATRIX_BUFFER_OFFSET],
            size: 16 * 4
          }
        }]
      });

      this.device.queue.writeBuffer(this.meshVertexBuffer, cmd[CMD_VERTEX_BUFFER_OFFSET], new Float32Array(cmd[CMD_VERTEX_BUFFER_DATA]));
      this.device.queue.writeBuffer(this.meshMatrixBuffer, cmd[CMD_MATRIX_BUFFER_OFFSET], new Float32Array(cmd[CMD_MATRIX_BUFFER_DATA]));
      this.passEncoder.setBindGroup(0, meshMatrixBinding);
      this.passEncoder.setBindGroup(1, cmd[CMD_TEXTURE_GROUP]);
      this.passEncoder.setVertexBuffer(0, this.meshVertexBuffer, cmd[CMD_VERTEX_BUFFER_OFFSET], cmd[CMD_VERTEX_BUFFER_SIZE]);
      this.passEncoder.draw(cmd[CMD_VERTEX_COUNT]);
    }

    // debug shader
    // ------------------------------------------------------------------------------------
    this.passEncoder.setPipeline(this.debugPipeline);

    this.debugVertexBuffer.destroy();
    this.debugVertexBuffer = this.device.createBuffer({
      size: this.debugVertexCount * 6 * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    this.debugMatrixBuffer.destroy();
    this.debugMatrixBuffer = this.device.createBuffer({
      size: this.debugCommands.length * this.adapter.limits.minUniformBufferOffsetAlignment,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    for (let cmd of this.debugCommands) {
      let debugMatrixBinding = this.device.createBindGroup({
        layout: this.debugPipeline.getBindGroupLayout(0),
        entries: [{
          binding: 0,
          resource: {
            buffer: this.debugMatrixBuffer,
            offset: cmd[CMD_MATRIX_BUFFER_OFFSET],
            size: 4 * 16
          }
        }]
      });

      this.device.queue.writeBuffer(this.debugVertexBuffer, cmd[CMD_VERTEX_BUFFER_OFFSET], new Float32Array(cmd[CMD_VERTEX_BUFFER_DATA]));
      this.device.queue.writeBuffer(this.debugMatrixBuffer, cmd[CMD_MATRIX_BUFFER_OFFSET], new Float32Array(cmd[CMD_MATRIX_BUFFER_DATA]));
      this.passEncoder.setBindGroup(0, debugMatrixBinding);
      this.passEncoder.setVertexBuffer(0, this.debugVertexBuffer, cmd[CMD_VERTEX_BUFFER_OFFSET], cmd[CMD_VERTEX_BUFFER_SIZE]);
      this.passEncoder.draw(cmd[CMD_VERTEX_COUNT]);
    }

    // submit to graphics pipeline
    // ------------------------------------------------------------------------------------
    this.passEncoder.end();
    this.device.queue.submit([this.commandEncoder.finish()]);
  }

  createTextureFromBitmap(bitmap) {
    let texture = new Gfx3Texture();

    texture.gpu = this.device.createTexture({
      size: [bitmap.width, bitmap.height],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
    });

    this.device.queue.copyExternalImageToTexture({ source: bitmap }, { texture: texture.gpu }, [bitmap.width, bitmap.height]);

    texture.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear'
    });

    texture.group = this.device.createBindGroup({
      layout: this.meshPipeline.getBindGroupLayout(1),
      entries: [{
        binding: 0,
        resource: texture.sampler
      }, {
        binding: 1,
        resource: texture.gpu.createView()
      }]
    });

    return texture;
  }

  drawMesh(modelMatrix, vertexCount, vertices, texture) {
    let cmd = [];
    cmd[CMD_MATRIX_BUFFER_DATA] = Utils.MAT4_MULTIPLY(this.vpcMatrix, modelMatrix);
    cmd[CMD_MATRIX_BUFFER_OFFSET] = this.meshCommands.length * this.adapter.limits.minUniformBufferOffsetAlignment;
    cmd[CMD_VERTEX_BUFFER_DATA] = vertices;
    cmd[CMD_VERTEX_BUFFER_OFFSET] = this.meshVertexCount * 5 * 4;
    cmd[CMD_VERTEX_BUFFER_SIZE] = vertexCount * 5 * 4;
    cmd[CMD_VERTEX_COUNT] = vertexCount;
    cmd[CMD_TEXTURE_GROUP] = texture ? texture.group : this.defaultTexture.group;
    this.meshVertexCount += vertexCount;
    this.meshCommands.push(cmd);
  }

  drawDebugLineList(modelMatrix, vertexCount, vertices) {
    if (!this.showDebug) {
      return;
    }

    let cmd = [];
    cmd[CMD_MATRIX_BUFFER_DATA] = Utils.MAT4_MULTIPLY(this.vpcMatrix, modelMatrix);
    cmd[CMD_MATRIX_BUFFER_OFFSET] = this.debugCommands.length * this.adapter.limits.minUniformBufferOffsetAlignment;
    cmd[CMD_VERTEX_BUFFER_DATA] = vertices;
    cmd[CMD_VERTEX_BUFFER_OFFSET] = this.debugVertexCount * 6 * 4;
    cmd[CMD_VERTEX_BUFFER_SIZE] = vertexCount * 6 * 4;
    cmd[CMD_VERTEX_COUNT] = vertexCount;
    this.debugVertexCount += vertexCount;
    this.debugCommands.push(cmd);
  }

  getScreenPosition(viewIndex, x, y, z) {
    let view = this.views[viewIndex];
    let viewport = view.getViewport();
    let viewportWidth = this.canvas.width * viewport.widthFactor;
    let viewportHeight = this.canvas.height * viewport.heightFactor;

    let matrix = Utils.MAT4_IDENTITY();
    matrix = Utils.MAT4_MULTIPLY(matrix, view.getClipMatrix());
    matrix = Utils.MAT4_MULTIPLY(matrix, view.getProjectionMatrix(viewportWidth / viewportHeight));
    matrix = Utils.MAT4_MULTIPLY(matrix, view.getCameraViewMatrix());

    let pos = Utils.MAT4_MULTIPLY_BY_VEC4(matrix, [x, y, z, 1]);
    return [pos[0] / pos[3], pos[1] / pos[3]];
  }

  getWidth() {
    return this.canvas.width;
  }

  getHeight() {
    return this.canvas.height;
  }

  getContext() {
    return this.ctx;
  }

  getDefaultTexture() {
    return this.defaultTexture;
  }

  getView(index) {
    return this.views[index];
  }

  getNumViews() {
    return this.views.length;
  }

  addView(view) {
    this.views.push(view);
  }

  changeView(index, view) {
    this.views[index] = view;
  }

  removeView(view) {
    this.views.splice(this.views.indexOf(view), 1);
  }

  releaseViews() {
    this.views = [];
  }

  getCurrentView() {
    return this.currentView;
  }

  setShowDebug(showDebug) {
    this.showDebug = showDebug;
  }

  handleWindowResize() {
    let devicePixelRatio = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * devicePixelRatio;

    this.depthTexture.destroy();
    this.depthTexture = this.device.createTexture({
      size: [this.canvas.width, this.canvas.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    this.depthView = this.depthTexture.createView();
  }
}

module.exports.gfx3Manager = new Gfx3Manager();
},{"../core/utils":3,"./gfx3_shaders":7,"./gfx3_texture":8,"./gfx3_view":10}],7:[function(require,module,exports){
module.exports.CREATE_MESH_SHADER_RES = async function (device) {
  let pipeline = await device.createRenderPipelineAsync({
    label: 'Basic Pipline',
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: `
        @binding(0) @group(0) var<uniform> mvpMatrix : mat4x4<f32>;

        struct VertexOutput {
          @builtin(position) Position : vec4<f32>,
          @location(0) fragUV : vec2<f32>
        };

        @vertex
        fn main(
          @location(0) position : vec4<f32>,
          @location(1) uv : vec2<f32>
        ) -> VertexOutput {
          var output : VertexOutput;
          output.Position = mvpMatrix * position;
          output.fragUV = uv;
          return output;
        }`,
      }),
      entryPoint: 'main',
      buffers: [{
        arrayStride: 5 * 4, // 3 position 2 uv,
        attributes: [{
          label: 'position',
          shaderLocation: 0,
          offset: 0,
          format: 'float32x3'
        },{
          label: 'uv',
          shaderLocation: 1,
          offset: 3 * 4,
          format: 'float32x2'
        }]
      }]
    },
    fragment: {
      module: device.createShaderModule({
        code: `
        @group(1) @binding(0) var Sampler: sampler;
        @group(1) @binding(1) var Texture: texture_2d<f32>;
      
        @fragment
        fn main(
          @location(0) fragUV: vec2<f32>
        ) -> @location(0) vec4<f32> {
          return textureSample(Texture, Sampler, fragUV);
        }`
      }),
      entryPoint: 'main',
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat(),
        blend: {
          color: {
            srcFactor: 'src-alpha',
            dstFactor: 'one-minus-src-alpha',
            operation: 'add'
          },
          alpha: {
            srcFactor: 'one',
            dstFactor: 'one-minus-src-alpha',
            operation: 'add'
          }
        }
      }]
    },
    primitive: {
      topology: 'triangle-list',
      cullMode: 'back',
      frontFace: 'ccw'
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus'
    }
  });

  return pipeline;
}

module.exports.CREATE_DEBUG_SHADER_RES = async function (device) {
  let pipeline = await device.createRenderPipelineAsync({
    label: 'Line List Debug Pipline',
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: `
        @binding(0) @group(0) var<uniform> mvpMatrix : mat4x4<f32>;

        struct VertexOutput {
          @builtin(position) Position : vec4<f32>,
          @location(0) color : vec3<f32>
        };

        @vertex
        fn main(
          @location(0) position : vec4<f32>,
          @location(1) color : vec3<f32>
        ) -> VertexOutput {
          var output : VertexOutput;
          output.Position = mvpMatrix * position;
          output.color = color;
          return output;
        }`,
      }),
      entryPoint: 'main',
      buffers: [{
        arrayStride: 6 * 4, // 3xf position + 3xf color
        attributes: [{
          label: 'position',
          shaderLocation: 0,
          offset: 0,
          format: 'float32x3'
        },{
          label: 'color',
          shaderLocation: 1,
          offset: 3 * 4,
          format: 'float32x3'
        }]
      }]
    },
    fragment: {
      module: device.createShaderModule({
        code: `
        @fragment
        fn main(
          @location(0) color: vec3<f32>
        ) -> @location(0) vec4<f32> {
          return vec4(color, 1);
        }`
      }),
      entryPoint: 'main',
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat()
      }]
    },
    primitive: {
      topology: 'line-list',
      cullMode: 'back',
      frontFace: 'ccw'
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus'
    }
  });

  return pipeline;
}
},{}],8:[function(require,module,exports){
class Gfx3Texture {
  constructor() {
    this.gpu = null;
    this.sampler = null;
    this.group = null;
  }
}

module.exports.Gfx3Texture = Gfx3Texture;
},{}],9:[function(require,module,exports){
let { gfx3Manager } = require('./gfx3_manager');

class Gfx3TextureManager {
  constructor() {
    this.textures = {};
  }

  async loadTexture(path) {
    if (this.getTexture(path) != gfx3Manager.getDefaultTexture()) {
      return this.getTexture(path);
    }

    let res = await fetch(path);
    let img = await res.blob();
    let texture = gfx3Manager.createTextureFromBitmap(await createImageBitmap(img));

    this.textures[path] = texture;
    return texture;
  }

  deleteTexture(path) {
    if (!this.textures[path]) {
      throw new Error('Gfx3TextureManager::deleteTexture(): The texture file doesn\'t exist, cannot delete !');
    }

    this.textures[path].gpu.destroy();
    this.textures[path] = null;
    delete this.textures[path];
  }

  getTexture(path) {
    return this.textures[path] ? this.textures[path] : gfx3Manager.getDefaultTexture();
  }

  releaseTextures() {
    for (let path in this.textures) {
      this.textures[path].gpu.destroy();
      this.textures[path] = null;
      delete this.textures[path];
    }
  }
}

module.exports.gfx3TextureManager = new Gfx3TextureManager();
},{"./gfx3_manager":6}],10:[function(require,module,exports){
let { Utils } = require('../core/utils');
let { Gfx3Viewport } = require('./gfx3_viewport');

let ProjectionModeEnum = {
  PERSPECTIVE: 'PERSPECTIVE',
  ORTHOGRAPHIC: 'ORTHOGRAPHIC'
};

class Gfx3View {
  constructor() {
    this.position = [0.0, 0.0, 0.0];
    this.rotation = [0.0, 0.0, 0.0];
    this.scale = [1.0, 1.0, 1.0];
    this.clipOffset = [0.0, 0.0];
    this.cameraMatrix = Utils.MAT4_IDENTITY();
    this.viewport = new Gfx3Viewport();
    this.projectionMode = ProjectionModeEnum.PERSPECTIVE;
    this.perspectiveFovy = Math.PI / 4;
    this.perspectiveNear = 2;
    this.perspectiveFar = 2000;
    this.orthographicSize = 1;
    this.orthographicDepth = 700;
    this.bgColor = [0.0, 0.0, 0.0, 1.0];
  }

  getProjectionMatrix(ar) {
    if (this.projectionMode == ProjectionModeEnum.PERSPECTIVE) {
      return Utils.MAT4_PERSPECTIVE(this.perspectiveFovy, ar, this.perspectiveNear, this.perspectiveFar);
    }
    else if (this.projectionMode == ProjectionModeEnum.ORTHOGRAPHIC) {
      return Utils.MAT4_ORTHOGRAPHIC(this.orthographicSize, this.orthographicDepth);
    }

    throw new Error('Gfx3Manager::setView(): ProjectionMode not valid !');
  }

  getScreenPosition(viewIndex, x, y, z) {
    let view = this.views[viewIndex];
    let matrix = Utils.MAT4_IDENTITY();
    matrix = Utils.MAT4_MULTIPLY(matrix, view.getClipMatrix());
    matrix = Utils.MAT4_MULTIPLY(matrix, this.getProjectionMatrix(viewIndex));
    matrix = Utils.MAT4_MULTIPLY(matrix, view.getCameraViewMatrix());
    let pos = Utils.MAT4_MULTIPLY_BY_VEC4(matrix, [x, y, z, 1]);
    return [pos[0] / pos[3], pos[1] / pos[3]];
  }

  getPosition() {
    return this.position;
  }

  getPositionX() {
    return this.position[0];
  }

  getPositionY() {
    return this.position[1];
  }

  getPositionZ() {
    return this.position[2];
  }

  setPosition(x, y, z) {
    this.position = [x, y, z];
    this.handleUpdateCameraMatrix();
  }

  move(x, y, z) {
    this.position[0] += x;
    this.position[1] += y;
    this.position[2] += z;
    this.handleUpdateCameraMatrix();
  }

  getRotation() {
    return this.rotation;
  }

  getRotationX() {
    return this.rotation[0];
  }

  getRotationY() {
    return this.rotation[1];
  }

  getRotationZ() {
    return this.rotation[2];
  }

  setRotation(x, y, z) {
    this.rotation = [x, y, z];
    this.handleUpdateCameraMatrix();
  }

  rotate(x, y, z) {
    this.rotation[0] += x;
    this.rotation[1] += y;
    this.rotation[2] += z;
    this.handleUpdateCameraMatrix();
  }

  getScale() {
    return this.scale;
  }

  getScaleX() {
    return this.scale[0];
  }

  getScaleY() {
    return this.scale[1];
  }

  getScaleZ() {
    return this.scale[2];
  }

  setScale(x, y, z) {
    this.scale = [x, y, z];
    this.handleUpdateCameraMatrix();
  }

  zoom(x, y, z) {
    this.scale[0] += x;
    this.scale[1] += y;
    this.scale[2] += z;
    this.handleUpdateCameraMatrix();
  }

  getClipOffset() {
    return this.clipOffset;
  }

  getClipOffsetX() {
    return this.clipOffset[0];
  }

  getClipOffsetY() {
    return this.clipOffset[1];
  }

  setClipOffset(x, y) {
    this.clipOffset = [x, y];
  }

  getClipMatrix() {
    return Utils.MAT4_INVERT(Utils.MAT4_TRANSLATE(this.clipOffset[0], this.clipOffset[1], 0));
  }

  getCameraMatrix() {
    return this.cameraMatrix;
  }

  setCameraMatrix(cameraMatrix) {
    this.cameraMatrix = cameraMatrix;
  }

  getCameraViewMatrix() {
    return Utils.MAT4_INVERT(this.cameraMatrix);
  }

  getViewport() {
    return this.viewport;
  }

  setViewport(viewport) {
    this.viewport = viewport;
  }

  getProjectionMode() {
    return this.projectionMode;
  }

  setProjectionMode(projectionMode) {
    this.projectionMode = projectionMode;
  }

  getPerspectiveFovy() {
    return this.perspectiveFovy;
  }

  setPerspectiveFovy(perspectiveFovy) {
    this.perspectiveFovy = perspectiveFovy;
  }

  getPerspectiveNear() {
    return this.perspectiveNear;
  }

  setPerspectiveNear(perspectiveNear) {
    this.perspectiveNear = perspectiveNear;
  }

  getPerspectiveFar() {
    return this.perspectiveFar;
  }

  setPerspectiveFar(perspectiveFar) {
    this.perspectiveFar = perspectiveFar;
  }

  getOrthographicSize() {
    return this.orthographicSize;
  }

  setOrthographicSize(orthographicSize) {
    this.orthographicSize = orthographicSize;
  }

  getOrthographicDepth() {
    return this.orthographicDepth;
  }

  setOrthographicDepth(orthographicDepth) {
    this.orthographicDepth = orthographicDepth;
  }

  getBgColor() {
    return this.bgColor;
  }

  setBgColor(r, g, b, a) {
    this.bgColor = [r, g, b, a];
  }

  handleUpdateCameraMatrix() {
    this.cameraMatrix = Utils.MAT4_IDENTITY();
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_TRANSLATE(this.position[0], this.position[1], this.position[2]));
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_ROTATE_Y(this.rotation[1]));
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_ROTATE_X(this.rotation[0])); // y -> x -> z
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_ROTATE_Z(this.rotation[2]));
    this.cameraMatrix = Utils.MAT4_MULTIPLY(this.cameraMatrix, Utils.MAT4_SCALE(this.scale[0], this.scale[1], this.scale[2]));
  }
}

module.exports.ProjectionModeEnum = ProjectionModeEnum;
module.exports.Gfx3View = Gfx3View;
},{"../core/utils":3,"./gfx3_viewport":11}],11:[function(require,module,exports){
class Gfx3Viewport {
  constructor() {
    this.xFactor = 0;
    this.yFactor = 0;
    this.widthFactor = 1;
    this.heightFactor = 1;
  }
}

module.exports.Gfx3Viewport = Gfx3Viewport;
},{}],12:[function(require,module,exports){
let { gfx3Manager } = require('../gfx3/gfx3_manager');
let { gfx3TextureManager } = require('../gfx3/gfx3_texture_manager');
let { Gfx3Drawable } = require('../gfx3/gfx3_drawable');

class Gfx3JSM extends Gfx3Drawable {
  constructor() {
    super();
    this.texture = gfx3TextureManager.getTexture('');
  }

  async loadFromFile(path) {
    let response = await fetch(path);
    let json = await response.json();

    if (!json.hasOwnProperty('Ident') || json['Ident'] != 'JSM') {
      throw new Error('Gfx3JSM::loadFromFile(): File not valid !');
    }

    this.clearVertices();

    for (let i = 0; i < json['NumVertices']; i++) {
      let vx = json['Vertices'][i * 3 + 0];
      let vy = json['Vertices'][i * 3 + 1];
      let vz = json['Vertices'][i * 3 + 2];
      let tx = json['TextureCoords'][i * 2 + 0];
      let ty = json['TextureCoords'][i * 2 + 1];
      this.defineVertex(vx, vy, vz, tx, ty);
    }

    this.commitVertices();
  }

  draw() {
    gfx3Manager.drawMesh(this.getModelMatrix(), this.vertexCount, this.vertices, this.texture);
  }

  getTexture() {
    return this.texture;
  }

  setTexture(texture) {
    this.texture = texture;
  }
}

module.exports.Gfx3JSM = Gfx3JSM;
},{"../gfx3/gfx3_drawable":5,"../gfx3/gfx3_manager":6,"../gfx3/gfx3_texture_manager":9}],13:[function(require,module,exports){
class Screen {
  constructor(app) {
    this.app = app;
    this.blocking = true;
  }

  setBlocking(blocking) {
    this.blocking = blocking;
  }

  update(ts) {
    // virtual method called during update phase !
  }

  draw() {
    // virtual method called during draw phase !
  }

  async onEnter(args) {
    // virtual method called during enter phase !
  }

  async onExit() {
    // virtual method called during exit phase !
  }

  onBringToFront() {
    // virtual method called when get the top state level !
  }

  onBringToBack() {
    // virtual method called when lost the top state level !
  }
}

module.exports.Screen = Screen;
},{}],14:[function(require,module,exports){
class ScreenManager {
  constructor() {
    this.requests = [];
    this.screens = [];
  }

  update(ts) {
    while (this.requests.length > 0) {
      let request = this.requests.pop();
      request();
    }

    for (let i = this.screens.length - 1; i >= 0; i--) {
      this.screens[i].update(ts);
      if (this.screens[i].blocking) {
        return;
      }
    }
  }

  draw() {
    for (let i = this.screens.length - 1; i >= 0; i--) {
      this.screens[i].draw();
      if (this.screens[i].blocking) {
        return;
      }
    }
  }

  requestPushScreen(newTopScreen, args = {}) {
    this.requests.push(() => {
      if (this.screens.indexOf(newTopScreen) != -1) {
        throw new Error('ScreenManager::requestPushScreen(): You try to push an existing screen to the stack !');
      }

      let topScreen = this.screens[this.screens.length - 1];
      topScreen.onBringToBack(newTopScreen);

      let promise = newTopScreen.onEnter(args);
      promise.then(() => this.screens.push(newTopScreen));
    });
  }

  requestSetScreen(newScreen, args = {}) {
    this.requests.push(() => {
      this.screens.forEach(screen => screen.onExit());
      this.screens = [];
      let promise = newScreen.onEnter(args);
      promise.then(() => this.screens.push(newScreen));
    });
  }

  requestPopScreen() {
    this.requests.push(() => {
      if (this.screens.length == 0) {
        throw new Error('ScreenManager::requestPopScreen: You try to pop an empty state stack !');
      }

      let topScreen = this.screens[this.screens.length - 1];
      topScreen.onExit();
      this.screens.pop();

      if (this.screens.length > 0) {
        let newTopScreen = this.screens[this.screens.length - 1];
        newTopScreen.onBringToFront(topScreen);
      }
    });
  }
}

module.exports.screenManager = new ScreenManager();
},{}],15:[function(require,module,exports){
let { eventManager} = require('../core/event_manager');
const { UIWidget } = require('./ui_widget');

/**
 * Singleton représentant un gestionnaire d'interface utilisateur.
 */
class UIManager {
  /**
   * Créer un gestionnaire d'interface utilisateur.
   */
  constructor() {
    this.root = null;
    this.fadeLayer = null;
    this.overLayer = null;
    this.focusedWidget = null;
    this.widgets = [];

    this.root = document.getElementById('UI_ROOT');
    if (!this.root) {
      throw new Error('UIManager::UIManager: UI_ROOT element not found !');
    }

    this.fadeLayer = document.getElementById('UI_FADELAYER');
    if (!this.fadeLayer) {
      throw new Error('UIManager::UIManager: UI_FADELAYER element not found !');
    }

    this.overLayer = document.getElementById('UI_OVERLAYER');
    if (!this.overLayer) {
      throw new Error('UIManager::UIManager: UI_OVERLAYER element not found !');
    }
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    for (let widget of this.widgets) {
      widget.update(ts);
    }
  }

  /**
   * Récupère les widgets.
   * @return {array} Le tableau des widgets.
   */
  getWidgets() {
    return this.widgets;
  }

  /**
   * Donne le focus à {widget}.
   * @param {UIWidget} widget - L'élément d'interface utilisateur.
   */
  focus(widget) {
    if (this.focusedWidget) {
      this.focusedWidget.unfocus();
    }

    widget.focus();
    this.focusedWidget = widget;
    eventManager.emit(this, 'E_FOCUSED', { widget: widget });
  }

  /**
   * Enlève le focus.
   */
  unfocus() {
    if (!this.focusedWidget) {
      return;
    }

    this.focusedWidget.unfocus();
    this.focusedWidget = null;
    eventManager.emit(this, 'E_UNFOCUSED');
  }

  /**
   * Ajoute un élément HTML au noeud racine.
   * Nota bene: Idéal pour des éléments d'affichage simple et sans logique interne.
   * @param {Node} node - Element HTML.
   * @param {string} styles - Styles CSS.
   */
  addNode(node, styles = '') {
    node.style.cssText += styles;
    this.root.appendChild(node);
  }

  /**
   * Supprime un élément HTML au noeud racine.
   * Nota bene: Idéal pour des éléments d'affichage simple et sans logique interne.
   * @param {Node} node - Element HTML.
   */
  removeNode(node) {
    this.root.removeChild(node);
  }

  /**
   * Ajoute un widget au noeud racine.
   * @param {UIWidget} widget - Element d'interface utilisateur.
   * @param {string} styles - Styles CSS.
   * @return {UIWidget} L'élément d'interface utilisateur.
   */
  addWidget(widget, styles = '') {
    widget.appendStyles(styles);
    this.root.appendChild(widget.getNode());
    this.widgets.push(widget);
    return widget;
  }

  /**
   * Supprime un widget au noeud racine.
   * @param {UIWidget} widget - Element d'interface utilisateur.
   */
  removeWidget(widget) {
    let index = this.widgets.indexOf(widget);
    if (index == -1) {
      throw new Error('UIManager::removeWidget: fail to remove widget !');
    }

    if (this.widgets[index] == this.focusedWidget) {
      this.unfocus();
    }

    this.widgets[index].delete();
    this.widgets.splice(index, 1);
    return true;
  }

  /**
   * Supprime tous les widgets.
   */
  clear() {
    this.root.innerHTML = '';
    this.focusedWidget = null;

    while (this.widgets.length > 0) {
      let widget = this.widgets.pop();
      widget.delete();
    }
  }

  /**
   * Lance une animation de fondu (invisible -> fond noir).
   * @param {number} delay - La durée à attendre avant de débuter l'animation.
   * @param {number} ms - La durée de l'animation.
   * @param {string} transitionTimingFunction - Fonction d'interpolation.
   * @param {function} cb - Fonction appelée à la fin de l'animation.
   */
  fadeIn(delay, ms, transitionTimingFunction = 'linear', cb = () => {}) {
    this.fadeLayer.style.transitionDuration = ms + 'ms';
    this.fadeLayer.style.transitionDelay = delay + 'ms';
    this.fadeLayer.style.transitionTimingFunction = transitionTimingFunction;
    this.fadeLayer.style.opacity = 1;
    setTimeout(() => { cb(); }, delay + ms);
  }

  /**
   * Lance une animation de fondu (fond noir -> invisible).
   * @param {number} delay - La durée à attendre avant de débuter l'animation.
   * @param {number} ms - La durée de l'animation.
   * @param {string} transitionTimingFunction - Fonction d'interpolation.
   * @param {function} cb - Fonction appelée à la fin de l'animation.
   */
  fadeOut(delay, ms, transitionTimingFunction = 'linear', cb = () => {}) {
    this.fadeLayer.style.transitionDuration = ms + 'ms';
    this.fadeLayer.style.transitionDelay = delay + 'ms';
    this.fadeLayer.style.transitionTimingFunction = transitionTimingFunction;
    this.fadeLayer.style.opacity = 0;
    setTimeout(() => { cb(); }, delay + ms);
  }

  /**
   * Active la sur-couche opaque.
   * @param {boolean} enable - Si vrai, la sur-couche est activée.
   */
   enableOverlayer(enable) {
    this.overLayer.style.opacity = (enable) ? '1' : '0';
  }
}

module.exports.uiManager = new UIManager();
},{"../core/event_manager":1,"./ui_widget":16}],16:[function(require,module,exports){
let { eventManager } = require('../core/event_manager');

/**
 * Classe représentant un élément d'interface utilisateur.
 */
class UIWidget {
  /**
   * Créer un élément d'interface utilisateur.
   */
  constructor(options = {}) {
    this.id = options.id ?? '';
    this.className = options.className ?? '';
    this.template = options.template ?? '';
    this.node = document.createElement('div');
    this.node.className = this.className;
    this.node.innerHTML = this.template;
    this.handleKeyDownCb = (e) => this.onKeyDown(e);

    this.node.addEventListener('animationend', () => eventManager.emit(this, 'E_ANIMATION_FINISHED'));
  }

  /**
   * Fonction de mise à jour.
   * @param {number} ts - Temps passé depuis la dernière mise à jour.
   */
  update(ts) {
    // virtual method called during update phase !
  }

  /**
   * Destructeur.
   * Nota bene: Entraine la désinscription des évènements utilisateur et détache le noeud HTML de son parent.
   */
  delete() {
    document.removeEventListener('keydown', this.handleKeyDownCb);
    this.node.remove();
    this.node = null;
  }

  /**
   * Retourne l'identifiant.
   * @return {string} L'Identifiant.
   */
  getId() {
    return this.id;
  }

  /**
   * Définit l'identifiant.
   * @param {string} id - L'Identifiant.
   */
  setId(id) {
    this.id = id;
  }

  /**
   * Retourne le noeud HTML parent.
   * @param {HTMLElement} node - Le noeud HTML.
   */
  getNode() {
    return this.node;
  }

  /**
   * Ajoute du css dans le style-inline du noeud parent.
   * @param {string} styles - Le css.
   */
  appendStyles(styles) {
    this.node.style.cssText += styles;
  }

  /**
   * Donne le focus.
   * Nota bene: Souscription aux évènements utilisateur et ajout de la classe 'u-focused'.
   */
  focus() {
    this.node.classList.add('u-focused');
    eventManager.emit(this, 'E_FOCUSED');
    document.addEventListener('keydown', this.handleKeyDownCb);
  }

  /**
   * Enlève le focus.
   * Nota bene: Désinscription aux évènements utilisateur et suppréssion de la classe 'u-focused'.
   */
  unfocus() {
    this.node.classList.remove('u-focused');
    eventManager.emit(this, 'E_UNFOCUSED');
    document.removeEventListener('keydown', this.handleKeyDownCb);
  }

  /**
   * Vérifie si le widget est focus.
   * @return {boolean} Vrai si le widget est focus.
   */
  isFocused() {
    return this.node.classList.contains('u-focused') == true;
  }

  /**
   * Rends le widget visible.
   */
  setVisible(visible) {
    if (visible) {
      this.node.classList.remove('u-hidden');
      
    }
    else {
      this.node.classList.add('u-hidden');
    }
  }

  /**
   * Vérifie si le widget est visible.
   * @return {boolean} Vrai si le widget est visible.
   */
  isVisible() {
    return this.node.classList.contains('u-hidden') == false;
  }

  setEnabled(enabled) {
    if (enabled) {
      this.node.classList.remove('u-disabled');
    }
    else {
      this.node.classList.add('u-disabled');
    }
  }

  isEnabled() {
    return this.node.classList.contains('u-disabled') === false;
  }

  setSelected(selected) {
    if (selected) {
      this.node.classList.add('u-selected');
    }
    else {
      this.node.classList.remove('u-selected');
    }
  }

  isSelected() {
    return this.node.classList.contains('u-selected');
  }

  animate(animation) {
    this.node.style.animation = animation;
  }

  onKeyDown(e) {
    // virtual method !
  }
}

module.exports.UIWidget = UIWidget;
},{"../core/event_manager":1}],17:[function(require,module,exports){
let { UIWidget } = require('../ui/ui_widget');

class UIDescriptionList extends UIWidget {
  constructor() {
    super({
      className: 'UIDescriptionList'
    });
  }

  addItem(id, label, value) {
    let tpl = document.createElement('template');
    tpl.innerHTML = `
      <span class="UIDescriptionList-item js-${id}">
        <span class="UIDescriptionList-item-label js-label">${label}</span>
        <span class="UIDescriptionList-item-value js-value">${value}</span>
      </span>`;

    this.node.appendChild(tpl.content);
  }

  removeItem(id) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::removeItem(): item not found !');
    }

    this.node.removeChild(item);
  }

  setItem(id, value) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::setItem(): item not found !');
    }

    item.querySelector('.js-value').textContent = value;
  }

  setItemVisible(id, visible) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::setItemVisible(): item not found !');
    }

    item.style.display = (visible) ? 'block' : 'none';
  }

  getItemVisible(id) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::getItemVisible(): item not found !');
    }

    return item.style.display == 'block';
  }

  getItemValue(id) {
    let item = this.node.querySelector('.js-' + id);
    if (!item) {
      throw new Error('UIDescriptionList::getItemValue(): item not found !');
    }

    return item.querySelector('.js-value').textContent;
  }

  clear() {
    this.node.innerHTML = '';
  }
}

module.exports.UIDescriptionList = UIDescriptionList;
},{"../ui/ui_widget":16}],18:[function(require,module,exports){
let { gfx3Manager } = require('./lib/gfx3/gfx3_manager');
let { Gfx3Drawable } = require('./lib/gfx3/gfx3_drawable');

class Line extends Gfx3Drawable {
  constructor(options = {}) {
    super();
    this.color = options.color ?? { r: 1, g: 1, b: 1 };
    this.max = options.max ?? -1;
    this.points = [];
  }

  update(ts) {
    this.clearVertices();
    for (let i = 0; i < this.points.length - 1; i++) {
      this.defineVertexColor(...this.points[i], this.color.r, this.color.g, this.color.b);
      this.defineVertexColor(...this.points[i + 1], this.color.r, this.color.g, this.color.b);
    }

    this.commitVertices();
  }

  draw() {
    gfx3Manager.drawDebugLineList(this.getModelMatrix(), this.vertexCount, this.vertices);
  }

  addPoint(x, y, z) {
    this.points.push([x, y, z]);
    if (this.max > 0 && this.max < this.points.length) {
      this.points.shift();
    }
  }
}

module.exports.Line = Line;
},{"./lib/gfx3/gfx3_drawable":5,"./lib/gfx3/gfx3_manager":6}],19:[function(require,module,exports){
window.addEventListener('load', async () => {
  let { gfx3Manager } = require('./lib/gfx3/gfx3_manager');
  let { screenManager } = require('./lib/screen/screen_manager');
  let { MainScreen } = require('./main_screen');

  await gfx3Manager.initialize();

  let then = Date.now();
  screenManager.requestSetScreen(new MainScreen());
  run();

  function run(timeStamp = Date.now()) {
    let ts = timeStamp - then;
    then = timeStamp;

    screenManager.update(ts);

    gfx3Manager.beginDrawing(0);
    screenManager.draw();
    gfx3Manager.endDrawing();

    requestAnimationFrame(timeStamp => run(timeStamp));
  }  
});
},{"./lib/gfx3/gfx3_manager":6,"./lib/screen/screen_manager":14,"./main_screen":20}],20:[function(require,module,exports){
let { gfx3Manager } = require('./lib/gfx3/gfx3_manager');
let { uiManager } = require('./lib/ui/ui_manager');
let { Utils } = require('./lib/core/utils');
let { Screen } = require('./lib/screen/screen');
let { UIDescriptionList } = require('./lib/ui_description_list/ui_description_list');
let { Gfx3Debug } = require('./lib/gfx3/gfx3_debug');
let { Pendulum } = require('./pendulum');
let { Line } = require('./line');


class MainScreen extends Screen {
  constructor() {
    super();
    this.view = gfx3Manager.getView(0);

    // Initial conditions
    this.center = { x: 0, y: 7, z: -13 };
    this.g = 9.81;
    this.l1 = 2;
    this.l2 = 3;
    this.m1 = 30;
    this.m2 = 20;
    this.angle1 = Math.PI;
    this.angle2 = Math.PI + 0.01;
    this.vel1 = 0;
    this.vel2 = 0;
    this.acc1 = 0;
    this.acc2 = 0;

    this.pendulum1 = new Pendulum();
    this.pendulum2 = new Pendulum();
    this.line = new Line({
      color: { r: 0.43, g: 0.08, b: 0.24 },
      max: 400
    });

    this.description1 = new UIDescriptionList();
    uiManager.addWidget(this.description1, 'border: none; min-width: 120px; position: absolute; top: 0; left: 0;');

    this.description2 = new UIDescriptionList();
    uiManager.addWidget(this.description2, 'border: none; min-width: 120px; position: absolute; top: 0; right: 0;');
  }

  async onEnter() {
    gfx3Manager.setShowDebug(true);

    this.pendulum1.setPosition(this.center.x, this.center.y, this.center.z);
    this.pendulum1.setRotation(0, 0, this.angle1);
    this.pendulum1.setScale(1, this.l1 / 2, 1);

    this.pendulum2.setPosition(this.pendulum1.getExtremity());
    this.pendulum2.setRotation(0, 0, this.angle2);
    this.pendulum2.setScale(1, this.l2 / 2, 1);

    this.view.setPosition(0, 6, 0);
    this.view.setBgColor(0.42, 0.48, 0.54, 1);

    await this.pendulum1.init();
    await this.pendulum2.init();

    this.description1.addItem('acc', 'Acceleration 1', 0);
    this.description1.addItem('vel', 'Velocity 1', this.vel1);
    this.description1.addItem('angle', 'Rotation 1', this.angle1);

    this.description2.addItem('acc', 'Acceleration 2', 0);
    this.description2.addItem('vel', 'Velocity 2', this.vel2);
    this.description2.addItem('angle', 'Rotation 2', this.angle2);
  }

  update(ts) {
    /*
     Compute the acceleration using the Euler method
     https://en.wikipedia.org/wiki/Double_pendulum
     https://www.physicsandbox.com/projects/double-pendulum.html
    */
    let mu = 1 + this.m1 / this.m2;

    // Repeat the process as many times as ts is large (16.7 for a base of 60 fps)
    for (let i = 0; i < 6 * (ts / 16.7); i++) {
      this.acc1 = (this.g * (Math.sin(this.pendulum2.getRotationZ()) * Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ()) - mu * Math.sin(this.pendulum1.getRotationZ())) - (this.l2 * 200 * this.vel2 * this.vel2 + this.l1 * 200 * this.vel1 * this.vel1 * Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ())) * Math.sin(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ())) / (this.l1 * 200 * (mu - Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ()) * Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ())));
      this.acc2 = (mu * this.g * (Math.sin(this.pendulum1.getRotationZ()) * Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ()) - Math.sin(this.pendulum2.getRotationZ())) + (mu * this.l1 * 200 * this.vel1 * this.vel1 + this.l2 * 200 * this.vel2 * this.vel2 * Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ())) * Math.sin(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ())) / (this.l2 * 200 * (mu - Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ()) * Math.cos(this.pendulum1.getRotationZ() - this.pendulum2.getRotationZ())));

      this.vel1 += this.acc1 * 0.05;
      this.vel2 += this.acc2 * 0.05;

      this.pendulum1.rotate(0, 0, this.vel1 * 0.05);
      this.pendulum2.rotate(0, 0, this.vel2 * 0.05);
    }

    this.pendulum2.setPosition(...this.pendulum1.getExtremity());

    this.description1.setItem('acc', this.acc1.toFixed(3));
    this.description1.setItem('vel', this.vel1.toFixed(3));
    this.description1.setItem('angle', this.radToDegrees(this.pendulum1.getRotationZ()).toFixed(1) + ' deg');

    this.description2.setItem('acc', this.acc2.toFixed(3));
    this.description2.setItem('vel', this.vel2.toFixed(3));
    this.description2.setItem('angle', this.radToDegrees(this.pendulum2.getRotationZ()).toFixed(1) + ' deg');

    this.pendulum1.update(ts);
    this.pendulum2.update(ts);
    this.line.update(ts);
    this.description1.update(ts);
    this.description2.update(ts);

    this.line.addPoint(...this.pendulum2.getExtremity());
  }

  draw() {
    this.pendulum1.draw();
    this.pendulum2.draw();
    this.line.draw();
    Gfx3Debug.drawGrid(Utils.MAT4_ROTATE_X(Math.PI * 0.5), 30, 1);
  }

  radToDegrees(rad) {
    let m = 2 * Math.PI;
    return (((rad % m) + m) % m) * (360 / m);
  }
}

module.exports.MainScreen = MainScreen;
},{"./lib/core/utils":3,"./lib/gfx3/gfx3_debug":4,"./lib/gfx3/gfx3_manager":6,"./lib/screen/screen":13,"./lib/ui/ui_manager":15,"./lib/ui_description_list/ui_description_list":17,"./line":18,"./pendulum":21}],21:[function(require,module,exports){
let { gfx3TextureManager } = require('./lib/gfx3/gfx3_texture_manager');
let { Gfx3JSM } = require('./lib/gfx3_jsm/gfx3_jsm');
let { Gfx3Drawable } = require("./lib/gfx3/gfx3_drawable");

class Pendulum extends Gfx3Drawable {
  constructor() {
    super();
    this.cylinder = new Gfx3JSM();
    this.ball = new Gfx3JSM();
  }

  async init() {
    await this.cylinder.loadFromFile('./assets/jsms/cylinder.jsm');
    this.cylinder.setTexture(await gfx3TextureManager.loadTexture('./assets/jsms/pendulum.jpg'));
    this.cylinder.setRotation(0, 0, this.angle);

    await this.ball.loadFromFile('./assets/jsms/sphere.jsm');
    this.ball.setTexture(await gfx3TextureManager.loadTexture('./assets/jsms/pendulum.jpg'));
  }

  update(ts) {
    this.cylinder.setRotation(...this.getRotation())
    this.cylinder.setScale(...this.getScale());
    this.cylinder.setPosition(
      this.getPositionX() + this.getShiftX(),
      this.getPositionY() + this.getShiftY(),
      this.getPositionZ()
    );

    this.ball.setPosition(
      this.getPositionX() + 2 * this.getShiftX(),
      this.getPositionY() + 2 * this.getShiftY(),
      this.getPositionZ()
    );

    this.cylinder.update(ts);
    this.ball.update(ts);
  }

  draw() {
    this.cylinder.draw();
    this.ball.draw();
  }

  getShiftX() {
    return this.getScaleY() * Math.sin(this.getRotationZ())
  }

  getShiftY() {
    return -this.getScaleY() * Math.cos(this.getRotationZ())
  }

  getExtremity() {
    return [
      this.getPositionX() + 2 * this.getShiftX(),
      this.getPositionY() + 2 * this.getShiftY(),
      this.getPositionZ()
    ];
  }
}

module.exports.Pendulum = Pendulum;

},{"./lib/gfx3/gfx3_drawable":5,"./lib/gfx3/gfx3_texture_manager":9,"./lib/gfx3_jsm/gfx3_jsm":12}]},{},[19]);