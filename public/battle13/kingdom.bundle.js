var Jt = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2
}, un = {
  ROTATE: 0,
  PAN: 1,
  DOLLY_PAN: 2,
  DOLLY_ROTATE: 3
};
var Vr = 1e3, En = 1001, Hr = 1002, en = 1003, fo = 1004, po = 1005, Tn = 1006, mo = 1007, Yr = 1008, $n = 1009, _o = 1010, go = 1011, vo = 1012, Mo = 1013, qr = 1014, jr = 1015, Kr = 1016, xo = 1017, So = 1018, yo = 1020, Eo = 35902, To = 35899, bo = 1021, Ao = 1022, pi = 1023, Ma = 1026, xa = 1027, wo = 1028, Ro = 1029, Co = 1030, Po = 1031, Do = 1033, Lo = 33776, Uo = 33777, Io = 33778, No = 33779, Oo = 35840, Fo = 35841, Bo = 35842, zo = 35843, Vo = 36196, Ho = 37492, Go = 37496, ko = 37808, Wo = 37809, Xo = 37810, Yo = 37811, qo = 37812, jo = 37813, Ko = 37814, Zo = 37815, Jo = 37816, $o = 37817, Qo = 37818, el = 37819, tl = 37820, nl = 37821, il = 36492, rl = 36494, sl = 36495, al = 36283, ol = 36284, ll = 36285, cl = 36286, Ji = 2300, Gr = 2301, ar = 2302, ds = 2400, fs = 2401, ps = 2402, hl = 3200, ul = 3201;
var Dt = "srgb", mi = "srgb-linear", $i = "linear", Qi = "srgb", or = 7680;
var Sa = 35044;
var Qn = 2e3;
var An = class {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
  }
  hasEventListener(e, t) {
    const n = this._listeners;
    return n === void 0 ? !1 : n[e] !== void 0 && n[e].indexOf(t) !== -1;
  }
  removeEventListener(e, t) {
    const n = this._listeners;
    if (n === void 0) return;
    const i = n[e];
    if (i !== void 0) {
      const r = i.indexOf(t);
      r !== -1 && i.splice(r, 1);
    }
  }
  dispatchEvent(e) {
    const t = this._listeners;
    if (t === void 0) return;
    const n = t[e.type];
    if (n !== void 0) {
      e.target = this;
      const i = n.slice(0);
      for (let r = 0, s = i.length; r < s; r++) i[r].call(this, e);
      e.target = null;
    }
  }
}, vt = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "0a",
  "0b",
  "0c",
  "0d",
  "0e",
  "0f",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "1a",
  "1b",
  "1c",
  "1d",
  "1e",
  "1f",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "2a",
  "2b",
  "2c",
  "2d",
  "2e",
  "2f",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "3a",
  "3b",
  "3c",
  "3d",
  "3e",
  "3f",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "4a",
  "4b",
  "4c",
  "4d",
  "4e",
  "4f",
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "5a",
  "5b",
  "5c",
  "5d",
  "5e",
  "5f",
  "60",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "6a",
  "6b",
  "6c",
  "6d",
  "6e",
  "6f",
  "70",
  "71",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "78",
  "79",
  "7a",
  "7b",
  "7c",
  "7d",
  "7e",
  "7f",
  "80",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
  "8a",
  "8b",
  "8c",
  "8d",
  "8e",
  "8f",
  "90",
  "91",
  "92",
  "93",
  "94",
  "95",
  "96",
  "97",
  "98",
  "99",
  "9a",
  "9b",
  "9c",
  "9d",
  "9e",
  "9f",
  "a0",
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
  "a7",
  "a8",
  "a9",
  "aa",
  "ab",
  "ac",
  "ad",
  "ae",
  "af",
  "b0",
  "b1",
  "b2",
  "b3",
  "b4",
  "b5",
  "b6",
  "b7",
  "b8",
  "b9",
  "ba",
  "bb",
  "bc",
  "bd",
  "be",
  "bf",
  "c0",
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
  "ca",
  "cb",
  "cc",
  "cd",
  "ce",
  "cf",
  "d0",
  "d1",
  "d2",
  "d3",
  "d4",
  "d5",
  "d6",
  "d7",
  "d8",
  "d9",
  "da",
  "db",
  "dc",
  "dd",
  "de",
  "df",
  "e0",
  "e1",
  "e2",
  "e3",
  "e4",
  "e5",
  "e6",
  "e7",
  "e8",
  "e9",
  "ea",
  "eb",
  "ec",
  "ed",
  "ee",
  "ef",
  "f0",
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "f9",
  "fa",
  "fb",
  "fc",
  "fd",
  "fe",
  "ff"
], ms = 1234567, di = Math.PI / 180, _i = 180 / Math.PI;
function $t() {
  const e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0, i = Math.random() * 4294967295 | 0;
  return (vt[e & 255] + vt[e >> 8 & 255] + vt[e >> 16 & 255] + vt[e >> 24 & 255] + "-" + vt[t & 255] + vt[t >> 8 & 255] + "-" + vt[t >> 16 & 15 | 64] + vt[t >> 24 & 255] + "-" + vt[n & 63 | 128] + vt[n >> 8 & 255] + "-" + vt[n >> 16 & 255] + vt[n >> 24 & 255] + vt[i & 255] + vt[i >> 8 & 255] + vt[i >> 16 & 255] + vt[i >> 24 & 255]).toLowerCase();
}
function Oe(e, t, n) {
  return Math.max(t, Math.min(n, e));
}
function Zr(e, t) {
  return (e % t + t) % t;
}
function dl(e, t, n, i, r) {
  return i + (e - t) * (r - i) / (n - t);
}
function fl(e, t, n) {
  return e !== t ? (n - e) / (t - e) : 0;
}
function fi(e, t, n) {
  return (1 - n) * e + n * t;
}
function pl(e, t, n, i) {
  return fi(e, t, 1 - Math.exp(-n * i));
}
function ml(e, t = 1) {
  return t - Math.abs(Zr(e, t * 2) - t);
}
function _l(e, t, n) {
  return e <= t ? 0 : e >= n ? 1 : (e = (e - t) / (n - t), e * e * (3 - 2 * e));
}
function gl(e, t, n) {
  return e <= t ? 0 : e >= n ? 1 : (e = (e - t) / (n - t), e * e * e * (e * (e * 6 - 15) + 10));
}
function vl(e, t) {
  return e + Math.floor(Math.random() * (t - e + 1));
}
function Ml(e, t) {
  return e + Math.random() * (t - e);
}
function xl(e) {
  return e * (0.5 - Math.random());
}
function Sl(e) {
  e !== void 0 && (ms = e);
  let t = ms += 1831565813;
  return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function yl(e) {
  return e * di;
}
function El(e) {
  return e * _i;
}
function Tl(e) {
  return (e & e - 1) === 0 && e !== 0;
}
function bl(e) {
  return Math.pow(2, Math.ceil(Math.log(e) / Math.LN2));
}
function Al(e) {
  return Math.pow(2, Math.floor(Math.log(e) / Math.LN2));
}
function wl(e, t, n, i, r) {
  const s = Math.cos, a = Math.sin, o = s(n / 2), l = a(n / 2), c = s((t + i) / 2), h = a((t + i) / 2), u = s((t - i) / 2), d = a((t - i) / 2), p = s((i - t) / 2), M = a((i - t) / 2);
  switch (r) {
    case "XYX":
      e.set(o * h, l * u, l * d, o * c);
      break;
    case "YZY":
      e.set(l * d, o * h, l * u, o * c);
      break;
    case "ZXZ":
      e.set(l * u, l * d, o * h, o * c);
      break;
    case "XZX":
      e.set(o * h, l * M, l * p, o * c);
      break;
    case "YXY":
      e.set(l * p, o * h, l * M, o * c);
      break;
    case "ZYZ":
      e.set(l * M, l * p, o * h, o * c);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + r);
  }
}
function zt(e, t) {
  switch (t.constructor) {
    case Float32Array:
      return e;
    case Uint32Array:
      return e / 4294967295;
    case Uint16Array:
      return e / 65535;
    case Uint8Array:
      return e / 255;
    case Int32Array:
      return Math.max(e / 2147483647, -1);
    case Int16Array:
      return Math.max(e / 32767, -1);
    case Int8Array:
      return Math.max(e / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function Xe(e, t) {
  switch (t.constructor) {
    case Float32Array:
      return e;
    case Uint32Array:
      return Math.round(e * 4294967295);
    case Uint16Array:
      return Math.round(e * 65535);
    case Uint8Array:
      return Math.round(e * 255);
    case Int32Array:
      return Math.round(e * 2147483647);
    case Int16Array:
      return Math.round(e * 32767);
    case Int8Array:
      return Math.round(e * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
var Rl = {
  DEG2RAD: di,
  RAD2DEG: _i,
  generateUUID: $t,
  clamp: Oe,
  euclideanModulo: Zr,
  mapLinear: dl,
  inverseLerp: fl,
  lerp: fi,
  damp: pl,
  pingpong: ml,
  smoothstep: _l,
  smootherstep: gl,
  randInt: vl,
  randFloat: Ml,
  randFloatSpread: xl,
  seededRandom: Sl,
  degToRad: yl,
  radToDeg: El,
  isPowerOfTwo: Tl,
  ceilPowerOfTwo: bl,
  floorPowerOfTwo: Al,
  setQuaternionFromProperEuler: wl,
  normalize: Xe,
  denormalize: zt
}, Te = class ya {
  constructor(t = 0, n = 0) {
    ya.prototype.isVector2 = !0, this.x = t, this.y = n;
  }
  get width() {
    return this.x;
  }
  set width(t) {
    this.x = t;
  }
  get height() {
    return this.y;
  }
  set height(t) {
    this.y = t;
  }
  set(t, n) {
    return this.x = t, this.y = n, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setComponent(t, n) {
    switch (t) {
      case 0:
        this.x = n;
        break;
      case 1:
        this.y = n;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this;
  }
  addVectors(t, n) {
    return this.x = t.x + n.x, this.y = t.y + n.y, this;
  }
  addScaledVector(t, n) {
    return this.x += t.x * n, this.y += t.y * n, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this;
  }
  subVectors(t, n) {
    return this.x = t.x - n.x, this.y = t.y - n.y, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  applyMatrix3(t) {
    const n = this.x, i = this.y, r = t.elements;
    return this.x = r[0] * n + r[3] * i + r[6], this.y = r[1] * n + r[4] * i + r[7], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
  }
  clamp(t, n) {
    return this.x = Oe(this.x, t.x, n.x), this.y = Oe(this.y, t.y, n.y), this;
  }
  clampScalar(t, n) {
    return this.x = Oe(this.x, t, n), this.y = Oe(this.y, t, n), this;
  }
  clampLength(t, n) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Oe(i, t, n));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y;
  }
  cross(t) {
    return this.x * t.y - this.y * t.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(t) {
    const n = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (n === 0) return Math.PI / 2;
    const i = this.dot(t) / n;
    return Math.acos(Oe(i, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const n = this.x - t.x, i = this.y - t.y;
    return n * n + i * i;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, n) {
    return this.x += (t.x - this.x) * n, this.y += (t.y - this.y) * n, this;
  }
  lerpVectors(t, n, i) {
    return this.x = t.x + (n.x - t.x) * i, this.y = t.y + (n.y - t.y) * i, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y;
  }
  fromArray(t, n = 0) {
    return this.x = t[n], this.y = t[n + 1], this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this.x, t[n + 1] = this.y, t;
  }
  fromBufferAttribute(t, n) {
    return this.x = t.getX(n), this.y = t.getY(n), this;
  }
  rotateAround(t, n) {
    const i = Math.cos(n), r = Math.sin(n), s = this.x - t.x, a = this.y - t.y;
    return this.x = s * i - a * r + t.x, this.y = s * r + a * i + t.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}, tn = class {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = i;
  }
  static slerpFlat(e, t, n, i, r, s, a) {
    let o = n[i + 0], l = n[i + 1], c = n[i + 2], h = n[i + 3];
    const u = r[s + 0], d = r[s + 1], p = r[s + 2], M = r[s + 3];
    if (a === 0) {
      e[t + 0] = o, e[t + 1] = l, e[t + 2] = c, e[t + 3] = h;
      return;
    }
    if (a === 1) {
      e[t + 0] = u, e[t + 1] = d, e[t + 2] = p, e[t + 3] = M;
      return;
    }
    if (h !== M || o !== u || l !== d || c !== p) {
      let _ = 1 - a;
      const m = o * u + l * d + c * p + h * M, f = m >= 0 ? 1 : -1, b = 1 - m * m;
      if (b > Number.EPSILON) {
        const E = Math.sqrt(b), D = Math.atan2(E, m * f);
        _ = Math.sin(_ * D) / E, a = Math.sin(a * D) / E;
      }
      const x = a * f;
      if (o = o * _ + u * x, l = l * _ + d * x, c = c * _ + p * x, h = h * _ + M * x, _ === 1 - a) {
        const E = 1 / Math.sqrt(o * o + l * l + c * c + h * h);
        o *= E, l *= E, c *= E, h *= E;
      }
    }
    e[t] = o, e[t + 1] = l, e[t + 2] = c, e[t + 3] = h;
  }
  static multiplyQuaternionsFlat(e, t, n, i, r, s) {
    const a = n[i], o = n[i + 1], l = n[i + 2], c = n[i + 3], h = r[s], u = r[s + 1], d = r[s + 2], p = r[s + 3];
    return e[t] = a * p + c * h + o * d - l * u, e[t + 1] = o * p + c * u + l * h - a * d, e[t + 2] = l * p + c * d + a * u - o * h, e[t + 3] = c * p - a * h - o * u - l * d, e;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  set(e, t, n, i) {
    return this._x = e, this._y = t, this._z = n, this._w = i, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  setFromEuler(e, t = !0) {
    const n = e._x, i = e._y, r = e._z, s = e._order, a = Math.cos, o = Math.sin, l = a(n / 2), c = a(i / 2), h = a(r / 2), u = o(n / 2), d = o(i / 2), p = o(r / 2);
    switch (s) {
      case "XYZ":
        this._x = u * c * h + l * d * p, this._y = l * d * h - u * c * p, this._z = l * c * p + u * d * h, this._w = l * c * h - u * d * p;
        break;
      case "YXZ":
        this._x = u * c * h + l * d * p, this._y = l * d * h - u * c * p, this._z = l * c * p - u * d * h, this._w = l * c * h + u * d * p;
        break;
      case "ZXY":
        this._x = u * c * h - l * d * p, this._y = l * d * h + u * c * p, this._z = l * c * p + u * d * h, this._w = l * c * h - u * d * p;
        break;
      case "ZYX":
        this._x = u * c * h - l * d * p, this._y = l * d * h + u * c * p, this._z = l * c * p - u * d * h, this._w = l * c * h + u * d * p;
        break;
      case "YZX":
        this._x = u * c * h + l * d * p, this._y = l * d * h + u * c * p, this._z = l * c * p - u * d * h, this._w = l * c * h - u * d * p;
        break;
      case "XZY":
        this._x = u * c * h - l * d * p, this._y = l * d * h - u * c * p, this._z = l * c * p + u * d * h, this._w = l * c * h + u * d * p;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + s);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, t) {
    const n = t / 2, i = Math.sin(n);
    return this._x = e.x * i, this._y = e.y * i, this._z = e.z * i, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e) {
    const t = e.elements, n = t[0], i = t[4], r = t[8], s = t[1], a = t[5], o = t[9], l = t[2], c = t[6], h = t[10], u = n + a + h;
    if (u > 0) {
      const d = 0.5 / Math.sqrt(u + 1);
      this._w = 0.25 / d, this._x = (c - o) * d, this._y = (r - l) * d, this._z = (s - i) * d;
    } else if (n > a && n > h) {
      const d = 2 * Math.sqrt(1 + n - a - h);
      this._w = (c - o) / d, this._x = 0.25 * d, this._y = (i + s) / d, this._z = (r + l) / d;
    } else if (a > h) {
      const d = 2 * Math.sqrt(1 + a - n - h);
      this._w = (r - l) / d, this._x = (i + s) / d, this._y = 0.25 * d, this._z = (o + c) / d;
    } else {
      const d = 2 * Math.sqrt(1 + h - n - a);
      this._w = (s - i) / d, this._x = (r + l) / d, this._y = (o + c) / d, this._z = 0.25 * d;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < 1e-8 ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(Oe(this.dot(e), -1, 1)));
  }
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0) return this;
    const i = Math.min(1, t / n);
    return this.slerp(e, i), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, t) {
    const n = e._x, i = e._y, r = e._z, s = e._w, a = t._x, o = t._y, l = t._z, c = t._w;
    return this._x = n * c + s * a + i * l - r * o, this._y = i * c + s * o + r * a - n * l, this._z = r * c + s * l + n * o - i * a, this._w = s * c - n * a - i * o - r * l, this._onChangeCallback(), this;
  }
  slerp(e, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(e);
    const n = this._x, i = this._y, r = this._z, s = this._w;
    let a = s * e._w + n * e._x + i * e._y + r * e._z;
    if (a < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, a = -a) : this.copy(e), a >= 1)
      return this._w = s, this._x = n, this._y = i, this._z = r, this;
    const o = 1 - a * a;
    if (o <= Number.EPSILON) {
      const d = 1 - t;
      return this._w = d * s + t * this._w, this._x = d * n + t * this._x, this._y = d * i + t * this._y, this._z = d * r + t * this._z, this.normalize(), this;
    }
    const l = Math.sqrt(o), c = Math.atan2(l, a), h = Math.sin((1 - t) * c) / l, u = Math.sin(t * c) / l;
    return this._w = s * h + this._w * u, this._x = n * h + this._x * u, this._y = i * h + this._y * u, this._z = r * h + this._z * u, this._onChangeCallback(), this;
  }
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n);
  }
  random() {
    const e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), i = Math.sqrt(1 - n), r = Math.sqrt(n);
    return this.set(i * Math.sin(e), i * Math.cos(e), r * Math.sin(t), r * Math.cos(t));
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
  }
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}, U = class Ea {
  constructor(t = 0, n = 0, i = 0) {
    Ea.prototype.isVector3 = !0, this.x = t, this.y = n, this.z = i;
  }
  set(t, n, i) {
    return i === void 0 && (i = this.z), this.x = t, this.y = n, this.z = i, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setComponent(t, n) {
    switch (t) {
      case 0:
        this.x = n;
        break;
      case 1:
        this.y = n;
        break;
      case 2:
        this.z = n;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this;
  }
  addVectors(t, n) {
    return this.x = t.x + n.x, this.y = t.y + n.y, this.z = t.z + n.z, this;
  }
  addScaledVector(t, n) {
    return this.x += t.x * n, this.y += t.y * n, this.z += t.z * n, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this;
  }
  subVectors(t, n) {
    return this.x = t.x - n.x, this.y = t.y - n.y, this.z = t.z - n.z, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this;
  }
  multiplyVectors(t, n) {
    return this.x = t.x * n.x, this.y = t.y * n.y, this.z = t.z * n.z, this;
  }
  applyEuler(t) {
    return this.applyQuaternion(_s.setFromEuler(t));
  }
  applyAxisAngle(t, n) {
    return this.applyQuaternion(_s.setFromAxisAngle(t, n));
  }
  applyMatrix3(t) {
    const n = this.x, i = this.y, r = this.z, s = t.elements;
    return this.x = s[0] * n + s[3] * i + s[6] * r, this.y = s[1] * n + s[4] * i + s[7] * r, this.z = s[2] * n + s[5] * i + s[8] * r, this;
  }
  applyNormalMatrix(t) {
    return this.applyMatrix3(t).normalize();
  }
  applyMatrix4(t) {
    const n = this.x, i = this.y, r = this.z, s = t.elements, a = 1 / (s[3] * n + s[7] * i + s[11] * r + s[15]);
    return this.x = (s[0] * n + s[4] * i + s[8] * r + s[12]) * a, this.y = (s[1] * n + s[5] * i + s[9] * r + s[13]) * a, this.z = (s[2] * n + s[6] * i + s[10] * r + s[14]) * a, this;
  }
  applyQuaternion(t) {
    const n = this.x, i = this.y, r = this.z, s = t.x, a = t.y, o = t.z, l = t.w, c = 2 * (a * r - o * i), h = 2 * (o * n - s * r), u = 2 * (s * i - a * n);
    return this.x = n + l * c + a * u - o * h, this.y = i + l * h + o * c - s * u, this.z = r + l * u + s * h - a * c, this;
  }
  project(t) {
    return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
  }
  unproject(t) {
    return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
  }
  transformDirection(t) {
    const n = this.x, i = this.y, r = this.z, s = t.elements;
    return this.x = s[0] * n + s[4] * i + s[8] * r, this.y = s[1] * n + s[5] * i + s[9] * r, this.z = s[2] * n + s[6] * i + s[10] * r, this.normalize();
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this;
  }
  clamp(t, n) {
    return this.x = Oe(this.x, t.x, n.x), this.y = Oe(this.y, t.y, n.y), this.z = Oe(this.z, t.z, n.z), this;
  }
  clampScalar(t, n) {
    return this.x = Oe(this.x, t, n), this.y = Oe(this.y, t, n), this.z = Oe(this.z, t, n), this;
  }
  clampLength(t, n) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Oe(i, t, n));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, n) {
    return this.x += (t.x - this.x) * n, this.y += (t.y - this.y) * n, this.z += (t.z - this.z) * n, this;
  }
  lerpVectors(t, n, i) {
    return this.x = t.x + (n.x - t.x) * i, this.y = t.y + (n.y - t.y) * i, this.z = t.z + (n.z - t.z) * i, this;
  }
  cross(t) {
    return this.crossVectors(this, t);
  }
  crossVectors(t, n) {
    const i = t.x, r = t.y, s = t.z, a = n.x, o = n.y, l = n.z;
    return this.x = r * l - s * o, this.y = s * a - i * l, this.z = i * o - r * a, this;
  }
  projectOnVector(t) {
    const n = t.lengthSq();
    if (n === 0) return this.set(0, 0, 0);
    const i = t.dot(this) / n;
    return this.copy(t).multiplyScalar(i);
  }
  projectOnPlane(t) {
    return lr.copy(this).projectOnVector(t), this.sub(lr);
  }
  reflect(t) {
    return this.sub(lr.copy(t).multiplyScalar(2 * this.dot(t)));
  }
  angleTo(t) {
    const n = Math.sqrt(this.lengthSq() * t.lengthSq());
    if (n === 0) return Math.PI / 2;
    const i = this.dot(t) / n;
    return Math.acos(Oe(i, -1, 1));
  }
  distanceTo(t) {
    return Math.sqrt(this.distanceToSquared(t));
  }
  distanceToSquared(t) {
    const n = this.x - t.x, i = this.y - t.y, r = this.z - t.z;
    return n * n + i * i + r * r;
  }
  manhattanDistanceTo(t) {
    return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
  }
  setFromSpherical(t) {
    return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
  }
  setFromSphericalCoords(t, n, i) {
    const r = Math.sin(n) * t;
    return this.x = r * Math.sin(i), this.y = Math.cos(n) * t, this.z = r * Math.cos(i), this;
  }
  setFromCylindrical(t) {
    return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
  }
  setFromCylindricalCoords(t, n, i) {
    return this.x = t * Math.sin(n), this.y = i, this.z = t * Math.cos(n), this;
  }
  setFromMatrixPosition(t) {
    const n = t.elements;
    return this.x = n[12], this.y = n[13], this.z = n[14], this;
  }
  setFromMatrixScale(t) {
    const n = this.setFromMatrixColumn(t, 0).length(), i = this.setFromMatrixColumn(t, 1).length(), r = this.setFromMatrixColumn(t, 2).length();
    return this.x = n, this.y = i, this.z = r, this;
  }
  setFromMatrixColumn(t, n) {
    return this.fromArray(t.elements, n * 4);
  }
  setFromMatrix3Column(t, n) {
    return this.fromArray(t.elements, n * 3);
  }
  setFromEuler(t) {
    return this.x = t._x, this.y = t._y, this.z = t._z, this;
  }
  setFromColor(t) {
    return this.x = t.r, this.y = t.g, this.z = t.b, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z;
  }
  fromArray(t, n = 0) {
    return this.x = t[n], this.y = t[n + 1], this.z = t[n + 2], this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this.x, t[n + 1] = this.y, t[n + 2] = this.z, t;
  }
  fromBufferAttribute(t, n) {
    return this.x = t.getX(n), this.y = t.getY(n), this.z = t.getZ(n), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const t = Math.random() * Math.PI * 2, n = Math.random() * 2 - 1, i = Math.sqrt(1 - n * n);
    return this.x = i * Math.cos(t), this.y = n, this.z = i * Math.sin(t), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}, lr = /* @__PURE__ */ new U(), _s = /* @__PURE__ */ new tn(), Ne = class Ta {
  constructor(t, n, i, r, s, a, o, l, c) {
    Ta.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, n, i, r, s, a, o, l, c);
  }
  set(t, n, i, r, s, a, o, l, c) {
    const h = this.elements;
    return h[0] = t, h[1] = r, h[2] = o, h[3] = n, h[4] = s, h[5] = l, h[6] = i, h[7] = a, h[8] = c, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
  }
  copy(t) {
    const n = this.elements, i = t.elements;
    return n[0] = i[0], n[1] = i[1], n[2] = i[2], n[3] = i[3], n[4] = i[4], n[5] = i[5], n[6] = i[6], n[7] = i[7], n[8] = i[8], this;
  }
  extractBasis(t, n, i) {
    return t.setFromMatrix3Column(this, 0), n.setFromMatrix3Column(this, 1), i.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(t) {
    const n = t.elements;
    return this.set(n[0], n[4], n[8], n[1], n[5], n[9], n[2], n[6], n[10]), this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, n) {
    const i = t.elements, r = n.elements, s = this.elements, a = i[0], o = i[3], l = i[6], c = i[1], h = i[4], u = i[7], d = i[2], p = i[5], M = i[8], _ = r[0], m = r[3], f = r[6], b = r[1], x = r[4], E = r[7], D = r[2], A = r[5], P = r[8];
    return s[0] = a * _ + o * b + l * D, s[3] = a * m + o * x + l * A, s[6] = a * f + o * E + l * P, s[1] = c * _ + h * b + u * D, s[4] = c * m + h * x + u * A, s[7] = c * f + h * E + u * P, s[2] = d * _ + p * b + M * D, s[5] = d * m + p * x + M * A, s[8] = d * f + p * E + M * P, this;
  }
  multiplyScalar(t) {
    const n = this.elements;
    return n[0] *= t, n[3] *= t, n[6] *= t, n[1] *= t, n[4] *= t, n[7] *= t, n[2] *= t, n[5] *= t, n[8] *= t, this;
  }
  determinant() {
    const t = this.elements, n = t[0], i = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8];
    return n * a * h - n * o * c - i * s * h + i * o * l + r * s * c - r * a * l;
  }
  invert() {
    const t = this.elements, n = t[0], i = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], u = h * a - o * c, d = o * l - h * s, p = c * s - a * l, M = n * u + i * d + r * p;
    if (M === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const _ = 1 / M;
    return t[0] = u * _, t[1] = (r * c - h * i) * _, t[2] = (o * i - r * a) * _, t[3] = d * _, t[4] = (h * n - r * l) * _, t[5] = (r * s - o * n) * _, t[6] = p * _, t[7] = (i * l - c * n) * _, t[8] = (a * n - i * s) * _, this;
  }
  transpose() {
    let t;
    const n = this.elements;
    return t = n[1], n[1] = n[3], n[3] = t, t = n[2], n[2] = n[6], n[6] = t, t = n[5], n[5] = n[7], n[7] = t, this;
  }
  getNormalMatrix(t) {
    return this.setFromMatrix4(t).invert().transpose();
  }
  transposeIntoArray(t) {
    const n = this.elements;
    return t[0] = n[0], t[1] = n[3], t[2] = n[6], t[3] = n[1], t[4] = n[4], t[5] = n[7], t[6] = n[2], t[7] = n[5], t[8] = n[8], this;
  }
  setUvTransform(t, n, i, r, s, a, o) {
    const l = Math.cos(s), c = Math.sin(s);
    return this.set(i * l, i * c, -i * (l * a + c * o) + a + t, -r * c, r * l, -r * (-c * a + l * o) + o + n, 0, 0, 1), this;
  }
  scale(t, n) {
    return this.premultiply(cr.makeScale(t, n)), this;
  }
  rotate(t) {
    return this.premultiply(cr.makeRotation(-t)), this;
  }
  translate(t, n) {
    return this.premultiply(cr.makeTranslation(t, n)), this;
  }
  makeTranslation(t, n) {
    return t.isVector2 ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1) : this.set(1, 0, t, 0, 1, n, 0, 0, 1), this;
  }
  makeRotation(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(n, -i, 0, i, n, 0, 0, 0, 1), this;
  }
  makeScale(t, n) {
    return this.set(t, 0, 0, 0, n, 0, 0, 0, 1), this;
  }
  equals(t) {
    const n = this.elements, i = t.elements;
    for (let r = 0; r < 9; r++) if (n[r] !== i[r]) return !1;
    return !0;
  }
  fromArray(t, n = 0) {
    for (let i = 0; i < 9; i++) this.elements[i] = t[i + n];
    return this;
  }
  toArray(t = [], n = 0) {
    const i = this.elements;
    return t[n] = i[0], t[n + 1] = i[1], t[n + 2] = i[2], t[n + 3] = i[3], t[n + 4] = i[4], t[n + 5] = i[5], t[n + 6] = i[6], t[n + 7] = i[7], t[n + 8] = i[8], t;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}, cr = /* @__PURE__ */ new Ne();
function ba(e) {
  for (let t = e.length - 1; t >= 0; --t) if (e[t] >= 65535) return !0;
  return !1;
}
function er(e) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", e);
}
function Cl() {
  const e = er("canvas");
  return e.style.display = "block", e;
}
var gs = {};
function gi(e) {
  e in gs || (gs[e] = !0, console.warn(e));
}
function Pl(e, t, n) {
  return new Promise(function(i, r) {
    function s() {
      switch (e.clientWaitSync(t, e.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case e.WAIT_FAILED:
          r();
          break;
        case e.TIMEOUT_EXPIRED:
          setTimeout(s, n);
          break;
        default:
          i();
      }
    }
    setTimeout(s, n);
  });
}
var vs = /* @__PURE__ */ new Ne().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322), Ms = /* @__PURE__ */ new Ne().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
function Dl() {
  const e = {
    enabled: !0,
    workingColorSpace: mi,
    spaces: {},
    convert: function(r, s, a) {
      return this.enabled === !1 || s === a || !s || !a || (this.spaces[s].transfer === "srgb" && (r.r = Qt(r.r), r.g = Qt(r.g), r.b = Qt(r.b)), this.spaces[s].primaries !== this.spaces[a].primaries && (r.applyMatrix3(this.spaces[s].toXYZ), r.applyMatrix3(this.spaces[a].fromXYZ)), this.spaces[a].transfer === "srgb" && (r.r = Jn(r.r), r.g = Jn(r.g), r.b = Jn(r.b))), r;
    },
    workingToColorSpace: function(r, s) {
      return this.convert(r, this.workingColorSpace, s);
    },
    colorSpaceToWorking: function(r, s) {
      return this.convert(r, s, this.workingColorSpace);
    },
    getPrimaries: function(r) {
      return this.spaces[r].primaries;
    },
    getTransfer: function(r) {
      return r === "" ? $i : this.spaces[r].transfer;
    },
    getToneMappingMode: function(r) {
      return this.spaces[r].outputColorSpaceConfig.toneMappingMode || "standard";
    },
    getLuminanceCoefficients: function(r, s = this.workingColorSpace) {
      return r.fromArray(this.spaces[s].luminanceCoefficients);
    },
    define: function(r) {
      Object.assign(this.spaces, r);
    },
    _getMatrix: function(r, s, a) {
      return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(r) {
      return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(r = this.workingColorSpace) {
      return this.spaces[r].workingColorSpaceConfig.unpackColorSpace;
    },
    fromWorkingColorSpace: function(r, s) {
      return gi("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."), e.workingToColorSpace(r, s);
    },
    toWorkingColorSpace: function(r, s) {
      return gi("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."), e.colorSpaceToWorking(r, s);
    }
  }, t = [
    0.64,
    0.33,
    0.3,
    0.6,
    0.15,
    0.06
  ], n = [
    0.2126,
    0.7152,
    0.0722
  ], i = [0.3127, 0.329];
  return e.define({
    [mi]: {
      primaries: t,
      whitePoint: i,
      transfer: $i,
      toXYZ: vs,
      fromXYZ: Ms,
      luminanceCoefficients: n,
      workingColorSpaceConfig: { unpackColorSpace: Dt },
      outputColorSpaceConfig: { drawingBufferColorSpace: Dt }
    },
    [Dt]: {
      primaries: t,
      whitePoint: i,
      transfer: Qi,
      toXYZ: vs,
      fromXYZ: Ms,
      luminanceCoefficients: n,
      outputColorSpaceConfig: { drawingBufferColorSpace: Dt }
    }
  }), e;
}
var ke = /* @__PURE__ */ Dl();
function Qt(e) {
  return e < 0.04045 ? e * 0.0773993808 : Math.pow(e * 0.9478672986 + 0.0521327014, 2.4);
}
function Jn(e) {
  return e < 31308e-7 ? e * 12.92 : 1.055 * Math.pow(e, 0.41666) - 0.055;
}
var Rn, Ll = class {
  static getDataURL(e, t = "image/png") {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u") return e.src;
    let n;
    if (e instanceof HTMLCanvasElement) n = e;
    else {
      Rn === void 0 && (Rn = er("canvas")), Rn.width = e.width, Rn.height = e.height;
      const i = Rn.getContext("2d");
      e instanceof ImageData ? i.putImageData(e, 0, 0) : i.drawImage(e, 0, 0, e.width, e.height), n = Rn;
    }
    return n.toDataURL(t);
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = er("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height), r = i.data;
      for (let s = 0; s < r.length; s++) r[s] = Qt(r[s] / 255) * 255;
      return n.putImageData(i, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++) t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(Qt(t[n] / 255) * 255) : t[n] = Qt(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}, Ul = 0, Jr = class {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Ul++ }), this.uuid = $t(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  getSize(e) {
    const t = this.data;
    return typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement ? e.set(t.videoWidth, t.videoHeight, 0) : t instanceof VideoFrame ? e.set(t.displayHeight, t.displayWidth, 0) : t !== null ? e.set(t.width, t.height, t.depth || 0) : e.set(0, 0, 0), e;
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, i = this.data;
    if (i !== null) {
      let r;
      if (Array.isArray(i)) {
        r = [];
        for (let s = 0, a = i.length; s < a; s++) i[s].isDataTexture ? r.push(hr(i[s].image)) : r.push(hr(i[s]));
      } else r = hr(i);
      n.url = r;
    }
    return t || (e.images[this.uuid] = n), n;
  }
};
function hr(e) {
  return typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap ? Ll.getDataURL(e) : e.data ? {
    data: Array.from(e.data),
    width: e.width,
    height: e.height,
    type: e.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
var Il = 0, ur = /* @__PURE__ */ new U(), Vt = class ji extends An {
  constructor(t = ji.DEFAULT_IMAGE, n = ji.DEFAULT_MAPPING, i = En, r = En, s = Tn, a = Yr, o = pi, l = $n, c = ji.DEFAULT_ANISOTROPY, h = "") {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Il++ }), this.uuid = $t(), this.name = "", this.source = new Jr(t), this.mipmaps = [], this.mapping = n, this.channel = 0, this.wrapS = i, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new Te(0, 0), this.repeat = new Te(1, 1), this.center = new Te(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Ne(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(t && t.depth && t.depth > 1), this.pmremVersion = 0;
  }
  get width() {
    return this.source.getSize(ur).x;
  }
  get height() {
    return this.source.getSize(ur).y;
  }
  get depth() {
    return this.source.getSize(ur).z;
  }
  get image() {
    return this.source.data;
  }
  set image(t = null) {
    this.source.data = t;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  addUpdateRange(t, n) {
    this.updateRanges.push({
      start: t,
      count: n
    });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.renderTarget = t.renderTarget, this.isRenderTargetTexture = t.isRenderTargetTexture, this.isArrayTexture = t.isArrayTexture, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = !0, this;
  }
  setValues(t) {
    for (const n in t) {
      const i = t[n];
      if (i === void 0) {
        console.warn(`THREE.Texture.setValues(): parameter '${n}' has value of undefined.`);
        continue;
      }
      const r = this[n];
      if (r === void 0) {
        console.warn(`THREE.Texture.setValues(): property '${n}' does not exist.`);
        continue;
      }
      r && i && r.isVector2 && i.isVector2 || r && i && r.isVector3 && i.isVector3 || r && i && r.isMatrix3 && i.isMatrix3 ? r.copy(i) : this[n] = i;
    }
  }
  toJSON(t) {
    const n = t === void 0 || typeof t == "string";
    if (!n && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
    const i = {
      metadata: {
        version: 4.7,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(t).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (i.userData = this.userData), n || (t.textures[this.uuid] = i), i;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(t) {
    if (this.mapping !== 300) return t;
    if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
      case Vr:
        t.x = t.x - Math.floor(t.x);
        break;
      case En:
        t.x = t.x < 0 ? 0 : 1;
        break;
      case Hr:
        Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
        break;
    }
    if (t.y < 0 || t.y > 1) switch (this.wrapT) {
      case Vr:
        t.y = t.y - Math.floor(t.y);
        break;
      case En:
        t.y = t.y < 0 ? 0 : 1;
        break;
      case Hr:
        Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
        break;
    }
    return this.flipY && (t.y = 1 - t.y), t;
  }
  set needsUpdate(t) {
    t === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(t) {
    t === !0 && this.pmremVersion++;
  }
};
Vt.DEFAULT_IMAGE = null;
Vt.DEFAULT_MAPPING = 300;
Vt.DEFAULT_ANISOTROPY = 1;
var lt = class Aa {
  constructor(t = 0, n = 0, i = 0, r = 1) {
    Aa.prototype.isVector4 = !0, this.x = t, this.y = n, this.z = i, this.w = r;
  }
  get width() {
    return this.z;
  }
  set width(t) {
    this.z = t;
  }
  get height() {
    return this.w;
  }
  set height(t) {
    this.w = t;
  }
  set(t, n, i, r) {
    return this.x = t, this.y = n, this.z = i, this.w = r, this;
  }
  setScalar(t) {
    return this.x = t, this.y = t, this.z = t, this.w = t, this;
  }
  setX(t) {
    return this.x = t, this;
  }
  setY(t) {
    return this.y = t, this;
  }
  setZ(t) {
    return this.z = t, this;
  }
  setW(t) {
    return this.w = t, this;
  }
  setComponent(t, n) {
    switch (t) {
      case 0:
        this.x = n;
        break;
      case 1:
        this.y = n;
        break;
      case 2:
        this.z = n;
        break;
      case 3:
        this.w = n;
        break;
      default:
        throw new Error("index is out of range: " + t);
    }
    return this;
  }
  getComponent(t) {
    switch (t) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + t);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(t) {
    return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this;
  }
  add(t) {
    return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
  }
  addScalar(t) {
    return this.x += t, this.y += t, this.z += t, this.w += t, this;
  }
  addVectors(t, n) {
    return this.x = t.x + n.x, this.y = t.y + n.y, this.z = t.z + n.z, this.w = t.w + n.w, this;
  }
  addScaledVector(t, n) {
    return this.x += t.x * n, this.y += t.y * n, this.z += t.z * n, this.w += t.w * n, this;
  }
  sub(t) {
    return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
  }
  subScalar(t) {
    return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
  }
  subVectors(t, n) {
    return this.x = t.x - n.x, this.y = t.y - n.y, this.z = t.z - n.z, this.w = t.w - n.w, this;
  }
  multiply(t) {
    return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
  }
  multiplyScalar(t) {
    return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
  }
  applyMatrix4(t) {
    const n = this.x, i = this.y, r = this.z, s = this.w, a = t.elements;
    return this.x = a[0] * n + a[4] * i + a[8] * r + a[12] * s, this.y = a[1] * n + a[5] * i + a[9] * r + a[13] * s, this.z = a[2] * n + a[6] * i + a[10] * r + a[14] * s, this.w = a[3] * n + a[7] * i + a[11] * r + a[15] * s, this;
  }
  divide(t) {
    return this.x /= t.x, this.y /= t.y, this.z /= t.z, this.w /= t.w, this;
  }
  divideScalar(t) {
    return this.multiplyScalar(1 / t);
  }
  setAxisAngleFromQuaternion(t) {
    this.w = 2 * Math.acos(t.w);
    const n = Math.sqrt(1 - t.w * t.w);
    return n < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / n, this.y = t.y / n, this.z = t.z / n), this;
  }
  setAxisAngleFromRotationMatrix(t) {
    let n, i, r, s;
    const l = t.elements, c = l[0], h = l[4], u = l[8], d = l[1], p = l[5], M = l[9], _ = l[2], m = l[6], f = l[10];
    if (Math.abs(h - d) < 0.01 && Math.abs(u - _) < 0.01 && Math.abs(M - m) < 0.01) {
      if (Math.abs(h + d) < 0.1 && Math.abs(u + _) < 0.1 && Math.abs(M + m) < 0.1 && Math.abs(c + p + f - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      n = Math.PI;
      const x = (c + 1) / 2, E = (p + 1) / 2, D = (f + 1) / 2, A = (h + d) / 4, P = (u + _) / 4, N = (M + m) / 4;
      return x > E && x > D ? x < 0.01 ? (i = 0, r = 0.707106781, s = 0.707106781) : (i = Math.sqrt(x), r = A / i, s = P / i) : E > D ? E < 0.01 ? (i = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(E), i = A / r, s = N / r) : D < 0.01 ? (i = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(D), i = P / s, r = N / s), this.set(i, r, s, n), this;
    }
    let b = Math.sqrt((m - M) * (m - M) + (u - _) * (u - _) + (d - h) * (d - h));
    return Math.abs(b) < 1e-3 && (b = 1), this.x = (m - M) / b, this.y = (u - _) / b, this.z = (d - h) / b, this.w = Math.acos((c + p + f - 1) / 2), this;
  }
  setFromMatrixPosition(t) {
    const n = t.elements;
    return this.x = n[12], this.y = n[13], this.z = n[14], this.w = n[15], this;
  }
  min(t) {
    return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this;
  }
  max(t) {
    return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this;
  }
  clamp(t, n) {
    return this.x = Oe(this.x, t.x, n.x), this.y = Oe(this.y, t.y, n.y), this.z = Oe(this.z, t.z, n.z), this.w = Oe(this.w, t.w, n.w), this;
  }
  clampScalar(t, n) {
    return this.x = Oe(this.x, t, n), this.y = Oe(this.y, t, n), this.z = Oe(this.z, t, n), this.w = Oe(this.w, t, n), this;
  }
  clampLength(t, n) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Oe(i, t, n));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(t) {
    return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(t) {
    return this.normalize().multiplyScalar(t);
  }
  lerp(t, n) {
    return this.x += (t.x - this.x) * n, this.y += (t.y - this.y) * n, this.z += (t.z - this.z) * n, this.w += (t.w - this.w) * n, this;
  }
  lerpVectors(t, n, i) {
    return this.x = t.x + (n.x - t.x) * i, this.y = t.y + (n.y - t.y) * i, this.z = t.z + (n.z - t.z) * i, this.w = t.w + (n.w - t.w) * i, this;
  }
  equals(t) {
    return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
  }
  fromArray(t, n = 0) {
    return this.x = t[n], this.y = t[n + 1], this.z = t[n + 2], this.w = t[n + 3], this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this.x, t[n + 1] = this.y, t[n + 2] = this.z, t[n + 3] = this.w, t;
  }
  fromBufferAttribute(t, n) {
    return this.x = t.getX(n), this.y = t.getY(n), this.z = t.getZ(n), this.w = t.getW(n), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}, Nl = class extends An {
  constructor(e = 1, t = 1, n = {}) {
    super(), n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: Tn,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1
    }, n), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = n.depth, this.scissor = new lt(0, 0, e, t), this.scissorTest = !1, this.viewport = new lt(0, 0, e, t);
    const i = new Vt({
      width: e,
      height: t,
      depth: n.depth
    });
    this.textures = [];
    const r = n.count;
    for (let s = 0; s < r; s++)
      this.textures[s] = i.clone(), this.textures[s].isRenderTargetTexture = !0, this.textures[s].renderTarget = this;
    this._setTextureOptions(n), this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = n.depthTexture, this.samples = n.samples, this.multiview = n.multiview;
  }
  _setTextureOptions(e = {}) {
    const t = {
      minFilter: Tn,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null
    };
    e.mapping !== void 0 && (t.mapping = e.mapping), e.wrapS !== void 0 && (t.wrapS = e.wrapS), e.wrapT !== void 0 && (t.wrapT = e.wrapT), e.wrapR !== void 0 && (t.wrapR = e.wrapR), e.magFilter !== void 0 && (t.magFilter = e.magFilter), e.minFilter !== void 0 && (t.minFilter = e.minFilter), e.format !== void 0 && (t.format = e.format), e.type !== void 0 && (t.type = e.type), e.anisotropy !== void 0 && (t.anisotropy = e.anisotropy), e.colorSpace !== void 0 && (t.colorSpace = e.colorSpace), e.flipY !== void 0 && (t.flipY = e.flipY), e.generateMipmaps !== void 0 && (t.generateMipmaps = e.generateMipmaps), e.internalFormat !== void 0 && (t.internalFormat = e.internalFormat);
    for (let n = 0; n < this.textures.length; n++) this.textures[n].setValues(t);
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  set depthTexture(e) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), e !== null && (e.renderTarget = this), this._depthTexture = e;
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      this.width = e, this.height = t, this.depth = n;
      for (let i = 0, r = this.textures.length; i < r; i++)
        this.textures[i].image.width = e, this.textures[i].image.height = t, this.textures[i].image.depth = n, this.textures[i].isArrayTexture = this.textures[i].image.depth > 1;
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let t = 0, n = e.textures.length; t < n; t++) {
      this.textures[t] = e.textures[t].clone(), this.textures[t].isRenderTargetTexture = !0, this.textures[t].renderTarget = this;
      const i = Object.assign({}, e.textures[t].image);
      this.textures[t].source = new Jr(i);
    }
    return this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}, bn = class extends Nl {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}, wa = class extends Vt {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = {
      data: e,
      width: t,
      height: n,
      depth: i
    }, this.magFilter = en, this.minFilter = en, this.wrapR = En, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}, Ol = class extends Vt {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = !0, this.image = {
      data: e,
      width: t,
      height: n,
      depth: i
    }, this.magFilter = en, this.minFilter = en, this.wrapR = En, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}, vi = class {
  constructor(e = new U(1 / 0, 1 / 0, 1 / 0), t = new U(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(Ot.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(Ot.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = Ot.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0) for (let s = 0, a = r.count; s < a; s++)
        e.isMesh === !0 ? e.getVertexPosition(s, Ot) : Ot.fromBufferAttribute(r, s), Ot.applyMatrix4(e.matrixWorld), this.expandByPoint(Ot);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Ei.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Ei.copy(n.boundingBox)), Ei.applyMatrix4(e.matrixWorld), this.union(Ei);
    }
    const i = e.children;
    for (let r = 0, s = i.length; r < s; r++) this.expandByObject(i[r], t);
    return this;
  }
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  getParameter(e, t) {
    return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z));
  }
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, Ot), Ot.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty()) return !1;
    this.getCenter(ri), Ti.subVectors(this.max, ri), Cn.subVectors(e.a, ri), Pn.subVectors(e.b, ri), Dn.subVectors(e.c, ri), rn.subVectors(Pn, Cn), sn.subVectors(Dn, Pn), mn.subVectors(Cn, Dn);
    let t = [
      0,
      -rn.z,
      rn.y,
      0,
      -sn.z,
      sn.y,
      0,
      -mn.z,
      mn.y,
      rn.z,
      0,
      -rn.x,
      sn.z,
      0,
      -sn.x,
      mn.z,
      0,
      -mn.x,
      -rn.y,
      rn.x,
      0,
      -sn.y,
      sn.x,
      0,
      -mn.y,
      mn.x,
      0
    ];
    return !dr(t, Cn, Pn, Dn, Ti) || (t = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], !dr(t, Cn, Pn, Dn, Ti)) ? !1 : (bi.crossVectors(rn, sn), t = [
      bi.x,
      bi.y,
      bi.z
    ], dr(t, Cn, Pn, Dn, Ti));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, Ot).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Ot).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Yt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Yt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Yt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Yt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Yt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Yt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Yt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Yt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Yt), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
  toJSON() {
    return {
      min: this.min.toArray(),
      max: this.max.toArray()
    };
  }
  fromJSON(e) {
    return this.min.fromArray(e.min), this.max.fromArray(e.max), this;
  }
}, Yt = [
  /* @__PURE__ */ new U(),
  /* @__PURE__ */ new U(),
  /* @__PURE__ */ new U(),
  /* @__PURE__ */ new U(),
  /* @__PURE__ */ new U(),
  /* @__PURE__ */ new U(),
  /* @__PURE__ */ new U(),
  /* @__PURE__ */ new U()
], Ot = /* @__PURE__ */ new U(), Ei = /* @__PURE__ */ new vi(), Cn = /* @__PURE__ */ new U(), Pn = /* @__PURE__ */ new U(), Dn = /* @__PURE__ */ new U(), rn = /* @__PURE__ */ new U(), sn = /* @__PURE__ */ new U(), mn = /* @__PURE__ */ new U(), ri = /* @__PURE__ */ new U(), Ti = /* @__PURE__ */ new U(), bi = /* @__PURE__ */ new U(), _n = /* @__PURE__ */ new U();
function dr(e, t, n, i, r) {
  for (let s = 0, a = e.length - 3; s <= a; s += 3) {
    _n.fromArray(e, s);
    const o = r.x * Math.abs(_n.x) + r.y * Math.abs(_n.y) + r.z * Math.abs(_n.z), l = t.dot(_n), c = n.dot(_n), h = i.dot(_n);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o) return !1;
  }
  return !0;
}
var Fl = /* @__PURE__ */ new vi(), si = /* @__PURE__ */ new U(), fr = /* @__PURE__ */ new U(), $r = class {
  constructor(e = new U(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Fl.setFromPoints(e).getCenter(n);
    let i = 0;
    for (let r = 0, s = e.length; r < s; r++) i = Math.max(i, n.distanceToSquared(e[r]));
    return this.radius = Math.sqrt(i), this;
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty())
      return this.center.copy(e), this.radius = 0, this;
    si.subVectors(e, this.center);
    const t = si.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(si, i / n), this.radius += i;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (fr.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(si.copy(e.center).add(fr)), this.expandByPoint(si.copy(e.center).sub(fr))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    return {
      radius: this.radius,
      center: this.center.toArray()
    };
  }
  fromJSON(e) {
    return this.radius = e.radius, this.center.fromArray(e.center), this;
  }
}, qt = /* @__PURE__ */ new U(), pr = /* @__PURE__ */ new U(), Ai = /* @__PURE__ */ new U(), an = /* @__PURE__ */ new U(), mr = /* @__PURE__ */ new U(), wi = /* @__PURE__ */ new U(), _r = /* @__PURE__ */ new U(), Qr = class {
  constructor(e = new U(), t = new U(0, 0, -1)) {
    this.origin = e, this.direction = t;
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, qt)), this;
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const t = qt.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (qt.copy(this.origin).addScaledVector(this.direction, t), qt.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, i) {
    pr.copy(e).add(t).multiplyScalar(0.5), Ai.copy(t).sub(e).normalize(), an.copy(this.origin).sub(pr);
    const r = e.distanceTo(t) * 0.5, s = -this.direction.dot(Ai), a = an.dot(this.direction), o = -an.dot(Ai), l = an.lengthSq(), c = Math.abs(1 - s * s);
    let h, u, d, p;
    if (c > 0)
      if (h = s * o - a, u = s * a - o, p = r * c, h >= 0) if (u >= -p) if (u <= p) {
        const M = 1 / c;
        h *= M, u *= M, d = h * (h + s * u + 2 * a) + u * (s * h + u + 2 * o) + l;
      } else
        u = r, h = Math.max(0, -(s * u + a)), d = -h * h + u * (u + 2 * o) + l;
      else
        u = -r, h = Math.max(0, -(s * u + a)), d = -h * h + u * (u + 2 * o) + l;
      else u <= -p ? (h = Math.max(0, -(-s * r + a)), u = h > 0 ? -r : Math.min(Math.max(-r, -o), r), d = -h * h + u * (u + 2 * o) + l) : u <= p ? (h = 0, u = Math.min(Math.max(-r, -o), r), d = u * (u + 2 * o) + l) : (h = Math.max(0, -(s * r + a)), u = h > 0 ? r : Math.min(Math.max(-r, -o), r), d = -h * h + u * (u + 2 * o) + l);
    else
      u = s > 0 ? -r : r, h = Math.max(0, -(s * u + a)), d = -h * h + u * (u + 2 * o) + l;
    return n && n.copy(this.origin).addScaledVector(this.direction, h), i && i.copy(pr).addScaledVector(Ai, u), d;
  }
  intersectSphere(e, t) {
    qt.subVectors(e.center, this.origin);
    const n = qt.dot(this.direction), i = qt.dot(qt) - n * n, r = e.radius * e.radius;
    if (i > r) return null;
    const s = Math.sqrt(r - i), a = n - s, o = n + s;
    return o < 0 ? null : a < 0 ? this.at(o, t) : this.at(a, t);
  }
  intersectsSphere(e) {
    return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0)
      return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null;
  }
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t);
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  intersectBox(e, t) {
    let n, i, r, s, a, o;
    const l = 1 / this.direction.x, c = 1 / this.direction.y, h = 1 / this.direction.z, u = this.origin;
    return l >= 0 ? (n = (e.min.x - u.x) * l, i = (e.max.x - u.x) * l) : (n = (e.max.x - u.x) * l, i = (e.min.x - u.x) * l), c >= 0 ? (r = (e.min.y - u.y) * c, s = (e.max.y - u.y) * c) : (r = (e.max.y - u.y) * c, s = (e.min.y - u.y) * c), n > s || r > i || ((r > n || isNaN(n)) && (n = r), (s < i || isNaN(i)) && (i = s), h >= 0 ? (a = (e.min.z - u.z) * h, o = (e.max.z - u.z) * h) : (a = (e.max.z - u.z) * h, o = (e.min.z - u.z) * h), n > o || a > i) || ((a > n || n !== n) && (n = a), (o < i || i !== i) && (i = o), i < 0) ? null : this.at(n >= 0 ? n : i, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, qt) !== null;
  }
  intersectTriangle(e, t, n, i, r) {
    mr.subVectors(t, e), wi.subVectors(n, e), _r.crossVectors(mr, wi);
    let s = this.direction.dot(_r), a;
    if (s > 0) {
      if (i) return null;
      a = 1;
    } else if (s < 0)
      a = -1, s = -s;
    else return null;
    an.subVectors(this.origin, e);
    const o = a * this.direction.dot(wi.crossVectors(an, wi));
    if (o < 0) return null;
    const l = a * this.direction.dot(mr.cross(an));
    if (l < 0 || o + l > s) return null;
    const c = -a * an.dot(_r);
    return c < 0 ? null : this.at(c / s, r);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, st = class kr {
  constructor(t, n, i, r, s, a, o, l, c, h, u, d, p, M, _, m) {
    kr.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], t !== void 0 && this.set(t, n, i, r, s, a, o, l, c, h, u, d, p, M, _, m);
  }
  set(t, n, i, r, s, a, o, l, c, h, u, d, p, M, _, m) {
    const f = this.elements;
    return f[0] = t, f[4] = n, f[8] = i, f[12] = r, f[1] = s, f[5] = a, f[9] = o, f[13] = l, f[2] = c, f[6] = h, f[10] = u, f[14] = d, f[3] = p, f[7] = M, f[11] = _, f[15] = m, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  clone() {
    return new kr().fromArray(this.elements);
  }
  copy(t) {
    const n = this.elements, i = t.elements;
    return n[0] = i[0], n[1] = i[1], n[2] = i[2], n[3] = i[3], n[4] = i[4], n[5] = i[5], n[6] = i[6], n[7] = i[7], n[8] = i[8], n[9] = i[9], n[10] = i[10], n[11] = i[11], n[12] = i[12], n[13] = i[13], n[14] = i[14], n[15] = i[15], this;
  }
  copyPosition(t) {
    const n = this.elements, i = t.elements;
    return n[12] = i[12], n[13] = i[13], n[14] = i[14], this;
  }
  setFromMatrix3(t) {
    const n = t.elements;
    return this.set(n[0], n[3], n[6], 0, n[1], n[4], n[7], 0, n[2], n[5], n[8], 0, 0, 0, 0, 1), this;
  }
  extractBasis(t, n, i) {
    return t.setFromMatrixColumn(this, 0), n.setFromMatrixColumn(this, 1), i.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(t, n, i) {
    return this.set(t.x, n.x, i.x, 0, t.y, n.y, i.y, 0, t.z, n.z, i.z, 0, 0, 0, 0, 1), this;
  }
  extractRotation(t) {
    const n = this.elements, i = t.elements, r = 1 / Ln.setFromMatrixColumn(t, 0).length(), s = 1 / Ln.setFromMatrixColumn(t, 1).length(), a = 1 / Ln.setFromMatrixColumn(t, 2).length();
    return n[0] = i[0] * r, n[1] = i[1] * r, n[2] = i[2] * r, n[3] = 0, n[4] = i[4] * s, n[5] = i[5] * s, n[6] = i[6] * s, n[7] = 0, n[8] = i[8] * a, n[9] = i[9] * a, n[10] = i[10] * a, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, this;
  }
  makeRotationFromEuler(t) {
    const n = this.elements, i = t.x, r = t.y, s = t.z, a = Math.cos(i), o = Math.sin(i), l = Math.cos(r), c = Math.sin(r), h = Math.cos(s), u = Math.sin(s);
    if (t.order === "XYZ") {
      const d = a * h, p = a * u, M = o * h, _ = o * u;
      n[0] = l * h, n[4] = -l * u, n[8] = c, n[1] = p + M * c, n[5] = d - _ * c, n[9] = -o * l, n[2] = _ - d * c, n[6] = M + p * c, n[10] = a * l;
    } else if (t.order === "YXZ") {
      const d = l * h, p = l * u, M = c * h, _ = c * u;
      n[0] = d + _ * o, n[4] = M * o - p, n[8] = a * c, n[1] = a * u, n[5] = a * h, n[9] = -o, n[2] = p * o - M, n[6] = _ + d * o, n[10] = a * l;
    } else if (t.order === "ZXY") {
      const d = l * h, p = l * u, M = c * h, _ = c * u;
      n[0] = d - _ * o, n[4] = -a * u, n[8] = M + p * o, n[1] = p + M * o, n[5] = a * h, n[9] = _ - d * o, n[2] = -a * c, n[6] = o, n[10] = a * l;
    } else if (t.order === "ZYX") {
      const d = a * h, p = a * u, M = o * h, _ = o * u;
      n[0] = l * h, n[4] = M * c - p, n[8] = d * c + _, n[1] = l * u, n[5] = _ * c + d, n[9] = p * c - M, n[2] = -c, n[6] = o * l, n[10] = a * l;
    } else if (t.order === "YZX") {
      const d = a * l, p = a * c, M = o * l, _ = o * c;
      n[0] = l * h, n[4] = _ - d * u, n[8] = M * u + p, n[1] = u, n[5] = a * h, n[9] = -o * h, n[2] = -c * h, n[6] = p * u + M, n[10] = d - _ * u;
    } else if (t.order === "XZY") {
      const d = a * l, p = a * c, M = o * l, _ = o * c;
      n[0] = l * h, n[4] = -u, n[8] = c * h, n[1] = d * u + _, n[5] = a * h, n[9] = p * u - M, n[2] = M * u - p, n[6] = o * h, n[10] = _ * u + d;
    }
    return n[3] = 0, n[7] = 0, n[11] = 0, n[12] = 0, n[13] = 0, n[14] = 0, n[15] = 1, this;
  }
  makeRotationFromQuaternion(t) {
    return this.compose(Bl, t, zl);
  }
  lookAt(t, n, i) {
    const r = this.elements;
    return At.subVectors(t, n), At.lengthSq() === 0 && (At.z = 1), At.normalize(), on.crossVectors(i, At), on.lengthSq() === 0 && (Math.abs(i.z) === 1 ? At.x += 1e-4 : At.z += 1e-4, At.normalize(), on.crossVectors(i, At)), on.normalize(), Ri.crossVectors(At, on), r[0] = on.x, r[4] = Ri.x, r[8] = At.x, r[1] = on.y, r[5] = Ri.y, r[9] = At.y, r[2] = on.z, r[6] = Ri.z, r[10] = At.z, this;
  }
  multiply(t) {
    return this.multiplyMatrices(this, t);
  }
  premultiply(t) {
    return this.multiplyMatrices(t, this);
  }
  multiplyMatrices(t, n) {
    const i = t.elements, r = n.elements, s = this.elements, a = i[0], o = i[4], l = i[8], c = i[12], h = i[1], u = i[5], d = i[9], p = i[13], M = i[2], _ = i[6], m = i[10], f = i[14], b = i[3], x = i[7], E = i[11], D = i[15], A = r[0], P = r[4], N = r[8], y = r[12], S = r[1], w = r[5], F = r[9], H = r[13], V = r[2], j = r[6], k = r[10], J = r[14], W = r[3], ee = r[7], he = r[11], Le = r[15];
    return s[0] = a * A + o * S + l * V + c * W, s[4] = a * P + o * w + l * j + c * ee, s[8] = a * N + o * F + l * k + c * he, s[12] = a * y + o * H + l * J + c * Le, s[1] = h * A + u * S + d * V + p * W, s[5] = h * P + u * w + d * j + p * ee, s[9] = h * N + u * F + d * k + p * he, s[13] = h * y + u * H + d * J + p * Le, s[2] = M * A + _ * S + m * V + f * W, s[6] = M * P + _ * w + m * j + f * ee, s[10] = M * N + _ * F + m * k + f * he, s[14] = M * y + _ * H + m * J + f * Le, s[3] = b * A + x * S + E * V + D * W, s[7] = b * P + x * w + E * j + D * ee, s[11] = b * N + x * F + E * k + D * he, s[15] = b * y + x * H + E * J + D * Le, this;
  }
  multiplyScalar(t) {
    const n = this.elements;
    return n[0] *= t, n[4] *= t, n[8] *= t, n[12] *= t, n[1] *= t, n[5] *= t, n[9] *= t, n[13] *= t, n[2] *= t, n[6] *= t, n[10] *= t, n[14] *= t, n[3] *= t, n[7] *= t, n[11] *= t, n[15] *= t, this;
  }
  determinant() {
    const t = this.elements, n = t[0], i = t[4], r = t[8], s = t[12], a = t[1], o = t[5], l = t[9], c = t[13], h = t[2], u = t[6], d = t[10], p = t[14], M = t[3], _ = t[7], m = t[11], f = t[15];
    return M * (+s * l * u - r * c * u - s * o * d + i * c * d + r * o * p - i * l * p) + _ * (+n * l * p - n * c * d + s * a * d - r * a * p + r * c * h - s * l * h) + m * (+n * c * u - n * o * p - s * a * u + i * a * p + s * o * h - i * c * h) + f * (-r * o * h - n * l * u + n * o * d + r * a * u - i * a * d + i * l * h);
  }
  transpose() {
    const t = this.elements;
    let n;
    return n = t[1], t[1] = t[4], t[4] = n, n = t[2], t[2] = t[8], t[8] = n, n = t[6], t[6] = t[9], t[9] = n, n = t[3], t[3] = t[12], t[12] = n, n = t[7], t[7] = t[13], t[13] = n, n = t[11], t[11] = t[14], t[14] = n, this;
  }
  setPosition(t, n, i) {
    const r = this.elements;
    return t.isVector3 ? (r[12] = t.x, r[13] = t.y, r[14] = t.z) : (r[12] = t, r[13] = n, r[14] = i), this;
  }
  invert() {
    const t = this.elements, n = t[0], i = t[1], r = t[2], s = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], u = t[9], d = t[10], p = t[11], M = t[12], _ = t[13], m = t[14], f = t[15], b = u * m * c - _ * d * c + _ * l * p - o * m * p - u * l * f + o * d * f, x = M * d * c - h * m * c - M * l * p + a * m * p + h * l * f - a * d * f, E = h * _ * c - M * u * c + M * o * p - a * _ * p - h * o * f + a * u * f, D = M * u * l - h * _ * l - M * o * d + a * _ * d + h * o * m - a * u * m, A = n * b + i * x + r * E + s * D;
    if (A === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const P = 1 / A;
    return t[0] = b * P, t[1] = (_ * d * s - u * m * s - _ * r * p + i * m * p + u * r * f - i * d * f) * P, t[2] = (o * m * s - _ * l * s + _ * r * c - i * m * c - o * r * f + i * l * f) * P, t[3] = (u * l * s - o * d * s - u * r * c + i * d * c + o * r * p - i * l * p) * P, t[4] = x * P, t[5] = (h * m * s - M * d * s + M * r * p - n * m * p - h * r * f + n * d * f) * P, t[6] = (M * l * s - a * m * s - M * r * c + n * m * c + a * r * f - n * l * f) * P, t[7] = (a * d * s - h * l * s + h * r * c - n * d * c - a * r * p + n * l * p) * P, t[8] = E * P, t[9] = (M * u * s - h * _ * s - M * i * p + n * _ * p + h * i * f - n * u * f) * P, t[10] = (a * _ * s - M * o * s + M * i * c - n * _ * c - a * i * f + n * o * f) * P, t[11] = (h * o * s - a * u * s - h * i * c + n * u * c + a * i * p - n * o * p) * P, t[12] = D * P, t[13] = (h * _ * r - M * u * r + M * i * d - n * _ * d - h * i * m + n * u * m) * P, t[14] = (M * o * r - a * _ * r - M * i * l + n * _ * l + a * i * m - n * o * m) * P, t[15] = (a * u * r - h * o * r + h * i * l - n * u * l - a * i * d + n * o * d) * P, this;
  }
  scale(t) {
    const n = this.elements, i = t.x, r = t.y, s = t.z;
    return n[0] *= i, n[4] *= r, n[8] *= s, n[1] *= i, n[5] *= r, n[9] *= s, n[2] *= i, n[6] *= r, n[10] *= s, n[3] *= i, n[7] *= r, n[11] *= s, this;
  }
  getMaxScaleOnAxis() {
    const t = this.elements, n = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], i = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], r = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
    return Math.sqrt(Math.max(n, i, r));
  }
  makeTranslation(t, n, i) {
    return t.isVector3 ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1) : this.set(1, 0, 0, t, 0, 1, 0, n, 0, 0, 1, i, 0, 0, 0, 1), this;
  }
  makeRotationX(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(1, 0, 0, 0, 0, n, -i, 0, 0, i, n, 0, 0, 0, 0, 1), this;
  }
  makeRotationY(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(n, 0, i, 0, 0, 1, 0, 0, -i, 0, n, 0, 0, 0, 0, 1), this;
  }
  makeRotationZ(t) {
    const n = Math.cos(t), i = Math.sin(t);
    return this.set(n, -i, 0, 0, i, n, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  makeRotationAxis(t, n) {
    const i = Math.cos(n), r = Math.sin(n), s = 1 - i, a = t.x, o = t.y, l = t.z, c = s * a, h = s * o;
    return this.set(c * a + i, c * o - r * l, c * l + r * o, 0, c * o + r * l, h * o + i, h * l - r * a, 0, c * l - r * o, h * l + r * a, s * l * l + i, 0, 0, 0, 0, 1), this;
  }
  makeScale(t, n, i) {
    return this.set(t, 0, 0, 0, 0, n, 0, 0, 0, 0, i, 0, 0, 0, 0, 1), this;
  }
  makeShear(t, n, i, r, s, a) {
    return this.set(1, i, s, 0, t, 1, a, 0, n, r, 1, 0, 0, 0, 0, 1), this;
  }
  compose(t, n, i) {
    const r = this.elements, s = n._x, a = n._y, o = n._z, l = n._w, c = s + s, h = a + a, u = o + o, d = s * c, p = s * h, M = s * u, _ = a * h, m = a * u, f = o * u, b = l * c, x = l * h, E = l * u, D = i.x, A = i.y, P = i.z;
    return r[0] = (1 - (_ + f)) * D, r[1] = (p + E) * D, r[2] = (M - x) * D, r[3] = 0, r[4] = (p - E) * A, r[5] = (1 - (d + f)) * A, r[6] = (m + b) * A, r[7] = 0, r[8] = (M + x) * P, r[9] = (m - b) * P, r[10] = (1 - (d + _)) * P, r[11] = 0, r[12] = t.x, r[13] = t.y, r[14] = t.z, r[15] = 1, this;
  }
  decompose(t, n, i) {
    const r = this.elements;
    let s = Ln.set(r[0], r[1], r[2]).length();
    const a = Ln.set(r[4], r[5], r[6]).length(), o = Ln.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), t.x = r[12], t.y = r[13], t.z = r[14], Ft.copy(this);
    const l = 1 / s, c = 1 / a, h = 1 / o;
    return Ft.elements[0] *= l, Ft.elements[1] *= l, Ft.elements[2] *= l, Ft.elements[4] *= c, Ft.elements[5] *= c, Ft.elements[6] *= c, Ft.elements[8] *= h, Ft.elements[9] *= h, Ft.elements[10] *= h, n.setFromRotationMatrix(Ft), i.x = s, i.y = a, i.z = o, this;
  }
  makePerspective(t, n, i, r, s, a, o = Qn, l = !1) {
    const c = this.elements, h = 2 * s / (n - t), u = 2 * s / (i - r), d = (n + t) / (n - t), p = (i + r) / (i - r);
    let M, _;
    if (l)
      M = s / (a - s), _ = a * s / (a - s);
    else if (o === 2e3)
      M = -(a + s) / (a - s), _ = -2 * a * s / (a - s);
    else if (o === 2001)
      M = -a / (a - s), _ = -a * s / (a - s);
    else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = d, c[12] = 0, c[1] = 0, c[5] = u, c[9] = p, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = M, c[14] = _, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
  }
  makeOrthographic(t, n, i, r, s, a, o = Qn, l = !1) {
    const c = this.elements, h = 2 / (n - t), u = 2 / (i - r), d = -(n + t) / (n - t), p = -(i + r) / (i - r);
    let M, _;
    if (l)
      M = 1 / (a - s), _ = a / (a - s);
    else if (o === 2e3)
      M = -2 / (a - s), _ = -(a + s) / (a - s);
    else if (o === 2001)
      M = -1 / (a - s), _ = -s / (a - s);
    else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = h, c[4] = 0, c[8] = 0, c[12] = d, c[1] = 0, c[5] = u, c[9] = 0, c[13] = p, c[2] = 0, c[6] = 0, c[10] = M, c[14] = _, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
  }
  equals(t) {
    const n = this.elements, i = t.elements;
    for (let r = 0; r < 16; r++) if (n[r] !== i[r]) return !1;
    return !0;
  }
  fromArray(t, n = 0) {
    for (let i = 0; i < 16; i++) this.elements[i] = t[i + n];
    return this;
  }
  toArray(t = [], n = 0) {
    const i = this.elements;
    return t[n] = i[0], t[n + 1] = i[1], t[n + 2] = i[2], t[n + 3] = i[3], t[n + 4] = i[4], t[n + 5] = i[5], t[n + 6] = i[6], t[n + 7] = i[7], t[n + 8] = i[8], t[n + 9] = i[9], t[n + 10] = i[10], t[n + 11] = i[11], t[n + 12] = i[12], t[n + 13] = i[13], t[n + 14] = i[14], t[n + 15] = i[15], t;
  }
}, Ln = /* @__PURE__ */ new U(), Ft = /* @__PURE__ */ new st(), Bl = /* @__PURE__ */ new U(0, 0, 0), zl = /* @__PURE__ */ new U(1, 1, 1), on = /* @__PURE__ */ new U(), Ri = /* @__PURE__ */ new U(), At = /* @__PURE__ */ new U(), xs = /* @__PURE__ */ new st(), Ss = /* @__PURE__ */ new tn(), nn = class Ra {
  constructor(t = 0, n = 0, i = 0, r = Ra.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = t, this._y = n, this._z = i, this._order = r;
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this._x = t, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this._y = t, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(t) {
    this._z = t, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(t) {
    this._order = t, this._onChangeCallback();
  }
  set(t, n, i, r = this._order) {
    return this._x = t, this._y = n, this._z = i, this._order = r, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(t) {
    return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(t, n = this._order, i = !0) {
    const r = t.elements, s = r[0], a = r[4], o = r[8], l = r[1], c = r[5], h = r[9], u = r[2], d = r[6], p = r[10];
    switch (n) {
      case "XYZ":
        this._y = Math.asin(Oe(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(d, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Oe(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Oe(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-u, p), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-Oe(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(d, p), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(Oe(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, s)) : (this._x = 0, this._y = Math.atan2(o, p));
        break;
      case "XZY":
        this._z = Math.asin(-Oe(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-h, p), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + n);
    }
    return this._order = n, i === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(t, n, i) {
    return xs.makeRotationFromQuaternion(t), this.setFromRotationMatrix(xs, n, i);
  }
  setFromVector3(t, n = this._order) {
    return this.set(t.x, t.y, t.z, n);
  }
  reorder(t) {
    return Ss.setFromEuler(this), this.setFromQuaternion(Ss, t);
  }
  equals(t) {
    return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
  }
  fromArray(t) {
    return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this;
  }
  toArray(t = [], n = 0) {
    return t[n] = this._x, t[n + 1] = this._y, t[n + 2] = this._z, t[n + 3] = this._order, t;
  }
  _onChange(t) {
    return this._onChangeCallback = t, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
};
nn.DEFAULT_ORDER = "XYZ";
var es = class {
  constructor() {
    this.mask = 1;
  }
  set(e) {
    this.mask = (1 << e | 0) >>> 0;
  }
  enable(e) {
    this.mask |= 1 << e | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(e) {
    this.mask ^= 1 << e | 0;
  }
  disable(e) {
    this.mask &= ~(1 << e | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0;
  }
}, Vl = 0, ys = /* @__PURE__ */ new U(), Un = /* @__PURE__ */ new tn(), jt = /* @__PURE__ */ new st(), Ci = /* @__PURE__ */ new U(), ai = /* @__PURE__ */ new U(), Hl = /* @__PURE__ */ new U(), Gl = /* @__PURE__ */ new tn(), Es = /* @__PURE__ */ new U(1, 0, 0), Ts = /* @__PURE__ */ new U(0, 1, 0), bs = /* @__PURE__ */ new U(0, 0, 1), As = { type: "added" }, kl = { type: "removed" }, In = {
  type: "childadded",
  child: null
}, gr = {
  type: "childremoved",
  child: null
}, Tt = class Ki extends An {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Vl++ }), this.uuid = $t(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Ki.DEFAULT_UP.clone();
    const t = new U(), n = new nn(), i = new tn(), r = new U(1, 1, 1);
    function s() {
      i.setFromEuler(n, !1);
    }
    function a() {
      n.setFromQuaternion(i, void 0, !1);
    }
    n._onChange(s), i._onChange(a), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: i
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: r
      },
      modelViewMatrix: { value: new st() },
      normalMatrix: { value: new Ne() }
    }), this.matrix = new st(), this.matrixWorld = new st(), this.matrixAutoUpdate = Ki.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Ki.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new es(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.customDepthMaterial = void 0, this.customDistanceMaterial = void 0, this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(t) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(t) {
    return this.quaternion.premultiply(t), this;
  }
  setRotationFromAxisAngle(t, n) {
    this.quaternion.setFromAxisAngle(t, n);
  }
  setRotationFromEuler(t) {
    this.quaternion.setFromEuler(t, !0);
  }
  setRotationFromMatrix(t) {
    this.quaternion.setFromRotationMatrix(t);
  }
  setRotationFromQuaternion(t) {
    this.quaternion.copy(t);
  }
  rotateOnAxis(t, n) {
    return Un.setFromAxisAngle(t, n), this.quaternion.multiply(Un), this;
  }
  rotateOnWorldAxis(t, n) {
    return Un.setFromAxisAngle(t, n), this.quaternion.premultiply(Un), this;
  }
  rotateX(t) {
    return this.rotateOnAxis(Es, t);
  }
  rotateY(t) {
    return this.rotateOnAxis(Ts, t);
  }
  rotateZ(t) {
    return this.rotateOnAxis(bs, t);
  }
  translateOnAxis(t, n) {
    return ys.copy(t).applyQuaternion(this.quaternion), this.position.add(ys.multiplyScalar(n)), this;
  }
  translateX(t) {
    return this.translateOnAxis(Es, t);
  }
  translateY(t) {
    return this.translateOnAxis(Ts, t);
  }
  translateZ(t) {
    return this.translateOnAxis(bs, t);
  }
  localToWorld(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(t) {
    return this.updateWorldMatrix(!0, !1), t.applyMatrix4(jt.copy(this.matrixWorld).invert());
  }
  lookAt(t, n, i) {
    t.isVector3 ? Ci.copy(t) : Ci.set(t, n, i);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), ai.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? jt.lookAt(ai, Ci, this.up) : jt.lookAt(Ci, ai, this.up), this.quaternion.setFromRotationMatrix(jt), r && (jt.extractRotation(r.matrixWorld), Un.setFromRotationMatrix(jt), this.quaternion.premultiply(Un.invert()));
  }
  add(t) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++) this.add(arguments[n]);
      return this;
    }
    return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(As), In.child = t, this.dispatchEvent(In), In.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
  }
  remove(t) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) this.remove(arguments[i]);
      return this;
    }
    const n = this.children.indexOf(t);
    return n !== -1 && (t.parent = null, this.children.splice(n, 1), t.dispatchEvent(kl), gr.child = t, this.dispatchEvent(gr), gr.child = null), this;
  }
  removeFromParent() {
    const t = this.parent;
    return t !== null && t.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(t) {
    return this.updateWorldMatrix(!0, !1), jt.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(!0, !1), jt.multiply(t.parent.matrixWorld)), t.applyMatrix4(jt), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(!1, !0), t.dispatchEvent(As), In.child = t, this.dispatchEvent(In), In.child = null, this;
  }
  getObjectById(t) {
    return this.getObjectByProperty("id", t);
  }
  getObjectByName(t) {
    return this.getObjectByProperty("name", t);
  }
  getObjectByProperty(t, n) {
    if (this[t] === n) return this;
    for (let i = 0, r = this.children.length; i < r; i++) {
      const s = this.children[i].getObjectByProperty(t, n);
      if (s !== void 0) return s;
    }
  }
  getObjectsByProperty(t, n, i = []) {
    this[t] === n && i.push(this);
    const r = this.children;
    for (let s = 0, a = r.length; s < a; s++) r[s].getObjectsByProperty(t, n, i);
    return i;
  }
  getWorldPosition(t) {
    return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ai, t, Hl), t;
  }
  getWorldScale(t) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(ai, Gl, t), t;
  }
  getWorldDirection(t) {
    this.updateWorldMatrix(!0, !1);
    const n = this.matrixWorld.elements;
    return t.set(n[8], n[9], n[10]).normalize();
  }
  raycast() {
  }
  traverse(t) {
    t(this);
    const n = this.children;
    for (let i = 0, r = n.length; i < r; i++) n[i].traverse(t);
  }
  traverseVisible(t) {
    if (this.visible === !1) return;
    t(this);
    const n = this.children;
    for (let i = 0, r = n.length; i < r; i++) n[i].traverseVisible(t);
  }
  traverseAncestors(t) {
    const n = this.parent;
    n !== null && (t(n), n.traverseAncestors(t));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(t) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, t = !0);
    const n = this.children;
    for (let i = 0, r = n.length; i < r; i++) n[i].updateMatrixWorld(t);
  }
  updateWorldMatrix(t, n) {
    const i = this.parent;
    if (t === !0 && i !== null && i.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), n === !0) {
      const r = this.children;
      for (let s = 0, a = r.length; s < a; s++) r[s].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(t) {
    const n = t === void 0 || typeof t == "string", i = {};
    n && (t = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, i.metadata = {
      version: 4.7,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const r = {};
    r.uuid = this.uuid, r.type = this.type, this.name !== "" && (r.name = this.name), this.castShadow === !0 && (r.castShadow = !0), this.receiveShadow === !0 && (r.receiveShadow = !0), this.visible === !1 && (r.visible = !1), this.frustumCulled === !1 && (r.frustumCulled = !1), this.renderOrder !== 0 && (r.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.geometryInfo = this._geometryInfo.map((o) => ({
      ...o,
      boundingBox: o.boundingBox ? o.boundingBox.toJSON() : void 0,
      boundingSphere: o.boundingSphere ? o.boundingSphere.toJSON() : void 0
    })), r.instanceInfo = this._instanceInfo.map((o) => ({ ...o })), r.availableInstanceIds = this._availableInstanceIds.slice(), r.availableGeometryIds = this._availableGeometryIds.slice(), r.nextIndexStart = this._nextIndexStart, r.nextVertexStart = this._nextVertexStart, r.geometryCount = this._geometryCount, r.maxInstanceCount = this._maxInstanceCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.matricesTexture = this._matricesTexture.toJSON(t), r.indirectTexture = this._indirectTexture.toJSON(t), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (r.boundingSphere = this.boundingSphere.toJSON()), this.boundingBox !== null && (r.boundingBox = this.boundingBox.toJSON()));
    function s(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(t)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(t).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      r.geometry = s(t.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l)) for (let c = 0, h = l.length; c < h; c++) {
          const u = l[c];
          s(t.shapes, u);
        }
        else s(t.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(t.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
      const o = [];
      for (let l = 0, c = this.material.length; l < c; l++) o.push(s(t.materials, this.material[l]));
      r.material = o;
    } else r.material = s(t.materials, this.material);
    if (this.children.length > 0) {
      r.children = [];
      for (let o = 0; o < this.children.length; o++) r.children.push(this.children[o].toJSON(t).object);
    }
    if (this.animations.length > 0) {
      r.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        r.animations.push(s(t.animations, l));
      }
    }
    if (n) {
      const o = a(t.geometries), l = a(t.materials), c = a(t.textures), h = a(t.images), u = a(t.shapes), d = a(t.skeletons), p = a(t.animations), M = a(t.nodes);
      o.length > 0 && (i.geometries = o), l.length > 0 && (i.materials = l), c.length > 0 && (i.textures = c), h.length > 0 && (i.images = h), u.length > 0 && (i.shapes = u), d.length > 0 && (i.skeletons = d), p.length > 0 && (i.animations = p), M.length > 0 && (i.nodes = M);
    }
    return i.object = r, i;
    function a(o) {
      const l = [];
      for (const c in o) {
        const h = o[c];
        delete h.metadata, l.push(h);
      }
      return l;
    }
  }
  clone(t) {
    return new this.constructor().copy(this, t);
  }
  copy(t, n = !0) {
    if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), n === !0) for (let i = 0; i < t.children.length; i++) {
      const r = t.children[i];
      this.add(r.clone());
    }
    return this;
  }
};
Tt.DEFAULT_UP = /* @__PURE__ */ new U(0, 1, 0);
Tt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
Tt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
var Bt = /* @__PURE__ */ new U(), Kt = /* @__PURE__ */ new U(), vr = /* @__PURE__ */ new U(), Zt = /* @__PURE__ */ new U(), Nn = /* @__PURE__ */ new U(), On = /* @__PURE__ */ new U(), ws = /* @__PURE__ */ new U(), Mr = /* @__PURE__ */ new U(), xr = /* @__PURE__ */ new U(), Sr = /* @__PURE__ */ new U(), yr = /* @__PURE__ */ new lt(), Er = /* @__PURE__ */ new lt(), Tr = /* @__PURE__ */ new lt(), Xn = class Yn {
  constructor(t = new U(), n = new U(), i = new U()) {
    this.a = t, this.b = n, this.c = i;
  }
  static getNormal(t, n, i, r) {
    r.subVectors(i, n), Bt.subVectors(t, n), r.cross(Bt);
    const s = r.lengthSq();
    return s > 0 ? r.multiplyScalar(1 / Math.sqrt(s)) : r.set(0, 0, 0);
  }
  static getBarycoord(t, n, i, r, s) {
    Bt.subVectors(r, n), Kt.subVectors(i, n), vr.subVectors(t, n);
    const a = Bt.dot(Bt), o = Bt.dot(Kt), l = Bt.dot(vr), c = Kt.dot(Kt), h = Kt.dot(vr), u = a * c - o * o;
    if (u === 0)
      return s.set(0, 0, 0), null;
    const d = 1 / u, p = (c * l - o * h) * d, M = (a * h - o * l) * d;
    return s.set(1 - p - M, M, p);
  }
  static containsPoint(t, n, i, r) {
    return this.getBarycoord(t, n, i, r, Zt) === null ? !1 : Zt.x >= 0 && Zt.y >= 0 && Zt.x + Zt.y <= 1;
  }
  static getInterpolation(t, n, i, r, s, a, o, l) {
    return this.getBarycoord(t, n, i, r, Zt) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, Zt.x), l.addScaledVector(a, Zt.y), l.addScaledVector(o, Zt.z), l);
  }
  static getInterpolatedAttribute(t, n, i, r, s, a) {
    return yr.setScalar(0), Er.setScalar(0), Tr.setScalar(0), yr.fromBufferAttribute(t, n), Er.fromBufferAttribute(t, i), Tr.fromBufferAttribute(t, r), a.setScalar(0), a.addScaledVector(yr, s.x), a.addScaledVector(Er, s.y), a.addScaledVector(Tr, s.z), a;
  }
  static isFrontFacing(t, n, i, r) {
    return Bt.subVectors(i, n), Kt.subVectors(t, n), Bt.cross(Kt).dot(r) < 0;
  }
  set(t, n, i) {
    return this.a.copy(t), this.b.copy(n), this.c.copy(i), this;
  }
  setFromPointsAndIndices(t, n, i, r) {
    return this.a.copy(t[n]), this.b.copy(t[i]), this.c.copy(t[r]), this;
  }
  setFromAttributeAndIndices(t, n, i, r) {
    return this.a.fromBufferAttribute(t, n), this.b.fromBufferAttribute(t, i), this.c.fromBufferAttribute(t, r), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
  }
  getArea() {
    return Bt.subVectors(this.c, this.b), Kt.subVectors(this.a, this.b), Bt.cross(Kt).length() * 0.5;
  }
  getMidpoint(t) {
    return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(t) {
    return Yn.getNormal(this.a, this.b, this.c, t);
  }
  getPlane(t) {
    return t.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(t, n) {
    return Yn.getBarycoord(t, this.a, this.b, this.c, n);
  }
  getInterpolation(t, n, i, r, s) {
    return Yn.getInterpolation(t, this.a, this.b, this.c, n, i, r, s);
  }
  containsPoint(t) {
    return Yn.containsPoint(t, this.a, this.b, this.c);
  }
  isFrontFacing(t) {
    return Yn.isFrontFacing(this.a, this.b, this.c, t);
  }
  intersectsBox(t) {
    return t.intersectsTriangle(this);
  }
  closestPointToPoint(t, n) {
    const i = this.a, r = this.b, s = this.c;
    let a, o;
    Nn.subVectors(r, i), On.subVectors(s, i), Mr.subVectors(t, i);
    const l = Nn.dot(Mr), c = On.dot(Mr);
    if (l <= 0 && c <= 0) return n.copy(i);
    xr.subVectors(t, r);
    const h = Nn.dot(xr), u = On.dot(xr);
    if (h >= 0 && u <= h) return n.copy(r);
    const d = l * u - h * c;
    if (d <= 0 && l >= 0 && h <= 0)
      return a = l / (l - h), n.copy(i).addScaledVector(Nn, a);
    Sr.subVectors(t, s);
    const p = Nn.dot(Sr), M = On.dot(Sr);
    if (M >= 0 && p <= M) return n.copy(s);
    const _ = p * c - l * M;
    if (_ <= 0 && c >= 0 && M <= 0)
      return o = c / (c - M), n.copy(i).addScaledVector(On, o);
    const m = h * M - p * u;
    if (m <= 0 && u - h >= 0 && p - M >= 0)
      return ws.subVectors(s, r), o = (u - h) / (u - h + (p - M)), n.copy(r).addScaledVector(ws, o);
    const f = 1 / (m + _ + d);
    return a = _ * f, o = d * f, n.copy(i).addScaledVector(Nn, a).addScaledVector(On, o);
  }
  equals(t) {
    return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
  }
}, Ca = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, ln = {
  h: 0,
  s: 0,
  l: 0
}, Pi = {
  h: 0,
  s: 0,
  l: 0
};
function br(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * 6 * (2 / 3 - n) : e;
}
var Be = class {
  constructor(e, t, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
  }
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const i = e;
      i && i.isColor ? this.copy(i) : typeof i == "number" ? this.setHex(i) : typeof i == "string" && this.setStyle(i);
    } else this.setRGB(e, t, n);
    return this;
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  setHex(e, t = Dt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, ke.colorSpaceToWorking(this, t), this;
  }
  setRGB(e, t, n, i = ke.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, ke.colorSpaceToWorking(this, i), this;
  }
  setHSL(e, t, n, i = ke.workingColorSpace) {
    if (e = Zr(e, 1), t = Oe(t, 0, 1), n = Oe(n, 0, 1), t === 0) this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + t) : n + t - n * t, s = 2 * n - r;
      this.r = br(s, r, e + 1 / 3), this.g = br(s, r, e), this.b = br(s, r, e - 1 / 3);
    }
    return ke.colorSpaceToWorking(this, i), this;
  }
  setStyle(e, t = Dt) {
    function n(r) {
      r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let i;
    if (i = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let r;
      const s = i[1], a = i[2];
      switch (s) {
        case "rgb":
        case "rgba":
          if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, t);
          if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setRGB(Math.min(100, parseInt(r[1], 10)) / 100, Math.min(100, parseInt(r[2], 10)) / 100, Math.min(100, parseInt(r[3], 10)) / 100, t);
          break;
        case "hsl":
        case "hsla":
          if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))
            return n(r[4]), this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, t);
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (i = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const r = i[1], s = r.length;
      if (s === 3) return this.setRGB(parseInt(r.charAt(0), 16) / 15, parseInt(r.charAt(1), 16) / 15, parseInt(r.charAt(2), 16) / 15, t);
      if (s === 6) return this.setHex(parseInt(r, 16), t);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0) return this.setColorName(e, t);
    return this;
  }
  setColorName(e, t = Dt) {
    const n = Ca[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = Qt(e.r), this.g = Qt(e.g), this.b = Qt(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = Jn(e.r), this.g = Jn(e.g), this.b = Jn(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = Dt) {
    return ke.workingToColorSpace(Mt.copy(this), e), Math.round(Oe(Mt.r * 255, 0, 255)) * 65536 + Math.round(Oe(Mt.g * 255, 0, 255)) * 256 + Math.round(Oe(Mt.b * 255, 0, 255));
  }
  getHexString(e = Dt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = ke.workingColorSpace) {
    ke.workingToColorSpace(Mt.copy(this), t);
    const n = Mt.r, i = Mt.g, r = Mt.b, s = Math.max(n, i, r), a = Math.min(n, i, r);
    let o, l;
    const c = (a + s) / 2;
    if (a === s)
      o = 0, l = 0;
    else {
      const h = s - a;
      switch (l = c <= 0.5 ? h / (s + a) : h / (2 - s - a), s) {
        case n:
          o = (i - r) / h + (i < r ? 6 : 0);
          break;
        case i:
          o = (r - n) / h + 2;
          break;
        case r:
          o = (n - i) / h + 4;
          break;
      }
      o /= 6;
    }
    return e.h = o, e.s = l, e.l = c, e;
  }
  getRGB(e, t = ke.workingColorSpace) {
    return ke.workingToColorSpace(Mt.copy(this), t), e.r = Mt.r, e.g = Mt.g, e.b = Mt.b, e;
  }
  getStyle(e = Dt) {
    ke.workingToColorSpace(Mt.copy(this), e);
    const t = Mt.r, n = Mt.g, i = Mt.b;
    return e !== "srgb" ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(ln), this.setHSL(ln.h + e, ln.s + t, ln.l + n);
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
  }
  lerpColors(e, t, n) {
    return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
  }
  lerpHSL(e, t) {
    this.getHSL(ln), e.getHSL(Pi);
    const n = fi(ln.h, Pi.h, t), i = fi(ln.s, Pi.s, t), r = fi(ln.l, Pi.l, t);
    return this.setHSL(n, i, r), this;
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  applyMatrix3(e) {
    const t = this.r, n = this.g, i = this.b, r = e.elements;
    return this.r = r[0] * t + r[3] * n + r[6] * i, this.g = r[1] * t + r[4] * n + r[7] * i, this.b = r[2] * t + r[5] * n + r[8] * i, this;
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
  }
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}, Mt = /* @__PURE__ */ new Be();
Be.NAMES = Ca;
var Wl = 0, ti = class extends An {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Wl++ }), this.uuid = $t(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Be(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = or, this.stencilZFail = or, this.stencilZPass = or, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.allowOverride = !0, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
  }
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const i = this[t];
        if (i === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        i && i.isColor ? i.set(n) : i && i.isVector3 && n && n.isVector3 ? i.copy(n) : this[t] = n;
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const n = { metadata: {
      version: 4.7,
      type: "Material",
      generator: "Material.toJSON"
    } };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.sheenColorMap && this.sheenColorMap.isTexture && (n.sheenColorMap = this.sheenColorMap.toJSON(e).uuid), this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture && (n.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(e).uuid), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== 1 && (n.blending = this.blending), this.side !== 0 && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== 204 && (n.blendSrc = this.blendSrc), this.blendDst !== 205 && (n.blendDst = this.blendDst), this.blendEquation !== 100 && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== 3 && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== 519 && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== 7680 && (n.stencilFail = this.stencilFail), this.stencilZFail !== 7680 && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== 7680 && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function i(r) {
      const s = [];
      for (const a in r) {
        const o = r[a];
        delete o.metadata, s.push(o);
      }
      return s;
    }
    if (t) {
      const r = i(e.textures), s = i(e.images);
      r.length > 0 && (n.textures = r), s.length > 0 && (n.images = s);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const i = t.length;
      n = new Array(i);
      for (let r = 0; r !== i; ++r) n[r] = t[r].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
}, ts = class extends ti {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Be(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new nn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}, ot = /* @__PURE__ */ new U(), Di = /* @__PURE__ */ new Te(), Xl = 0, Ut = class {
  constructor(e, t, n = !1) {
    if (Array.isArray(e)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", { value: Xl++ }), this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = Sa, this.updateRanges = [], this.gpuType = jr, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({
      start: e,
      count: t
    });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  copyAt(e, t, n) {
    e *= this.itemSize, n *= t.itemSize;
    for (let i = 0, r = this.itemSize; i < r; i++) this.array[e + i] = t.array[n + i];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2) for (let t = 0, n = this.count; t < n; t++)
      Di.fromBufferAttribute(this, t), Di.applyMatrix3(e), this.setXY(t, Di.x, Di.y);
    else if (this.itemSize === 3) for (let t = 0, n = this.count; t < n; t++)
      ot.fromBufferAttribute(this, t), ot.applyMatrix3(e), this.setXYZ(t, ot.x, ot.y, ot.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ot.fromBufferAttribute(this, t), ot.applyMatrix4(e), this.setXYZ(t, ot.x, ot.y, ot.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ot.fromBufferAttribute(this, t), ot.applyNormalMatrix(e), this.setXYZ(t, ot.x, ot.y, ot.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ot.fromBufferAttribute(this, t), ot.transformDirection(e), this.setXYZ(t, ot.x, ot.y, ot.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = zt(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = Xe(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = zt(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = Xe(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = zt(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = Xe(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = zt(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = Xe(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = zt(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = Xe(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = Xe(t, this.array), n = Xe(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = Xe(t, this.array), n = Xe(n, this.array), i = Xe(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e *= this.itemSize, this.normalized && (t = Xe(t, this.array), n = Xe(n, this.array), i = Xe(i, this.array), r = Xe(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== 35044 && (e.usage = this.usage), e;
  }
}, Pa = class extends Ut {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}, Da = class extends Ut {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}, ht = class extends Ut {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}, Yl = 0, Pt = /* @__PURE__ */ new st(), Ar = /* @__PURE__ */ new Tt(), Fn = /* @__PURE__ */ new U(), wt = /* @__PURE__ */ new vi(), oi = /* @__PURE__ */ new vi(), pt = /* @__PURE__ */ new U(), Ht = class La extends An {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Yl++ }), this.uuid = $t(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
      start: 0,
      count: 1 / 0
    }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(t) {
    return Array.isArray(t) ? this.index = new (ba(t) ? Da : Pa)(t, 1) : this.index = t, this;
  }
  setIndirect(t) {
    return this.indirect = t, this;
  }
  getIndirect() {
    return this.indirect;
  }
  getAttribute(t) {
    return this.attributes[t];
  }
  setAttribute(t, n) {
    return this.attributes[t] = n, this;
  }
  deleteAttribute(t) {
    return delete this.attributes[t], this;
  }
  hasAttribute(t) {
    return this.attributes[t] !== void 0;
  }
  addGroup(t, n, i = 0) {
    this.groups.push({
      start: t,
      count: n,
      materialIndex: i
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(t, n) {
    this.drawRange.start = t, this.drawRange.count = n;
  }
  applyMatrix4(t) {
    const n = this.attributes.position;
    n !== void 0 && (n.applyMatrix4(t), n.needsUpdate = !0);
    const i = this.attributes.normal;
    if (i !== void 0) {
      const s = new Ne().getNormalMatrix(t);
      i.applyNormalMatrix(s), i.needsUpdate = !0;
    }
    const r = this.attributes.tangent;
    return r !== void 0 && (r.transformDirection(t), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(t) {
    return Pt.makeRotationFromQuaternion(t), this.applyMatrix4(Pt), this;
  }
  rotateX(t) {
    return Pt.makeRotationX(t), this.applyMatrix4(Pt), this;
  }
  rotateY(t) {
    return Pt.makeRotationY(t), this.applyMatrix4(Pt), this;
  }
  rotateZ(t) {
    return Pt.makeRotationZ(t), this.applyMatrix4(Pt), this;
  }
  translate(t, n, i) {
    return Pt.makeTranslation(t, n, i), this.applyMatrix4(Pt), this;
  }
  scale(t, n, i) {
    return Pt.makeScale(t, n, i), this.applyMatrix4(Pt), this;
  }
  lookAt(t) {
    return Ar.lookAt(t), Ar.updateMatrix(), this.applyMatrix4(Ar.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Fn).negate(), this.translate(Fn.x, Fn.y, Fn.z), this;
  }
  setFromPoints(t) {
    const n = this.getAttribute("position");
    if (n === void 0) {
      const i = [];
      for (let r = 0, s = t.length; r < s; r++) {
        const a = t[r];
        i.push(a.x, a.y, a.z || 0);
      }
      this.setAttribute("position", new ht(i, 3));
    } else {
      const i = Math.min(t.length, n.count);
      for (let r = 0; r < i; r++) {
        const s = t[r];
        n.setXYZ(r, s.x, s.y, s.z || 0);
      }
      t.length > n.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), n.needsUpdate = !0;
    }
    return this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new vi());
    const t = this.attributes.position, n = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new U(-1 / 0, -1 / 0, -1 / 0), new U(1 / 0, 1 / 0, 1 / 0));
      return;
    }
    if (t !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(t), n) for (let i = 0, r = n.length; i < r; i++) {
        const s = n[i];
        wt.setFromBufferAttribute(s), this.morphTargetsRelative ? (pt.addVectors(this.boundingBox.min, wt.min), this.boundingBox.expandByPoint(pt), pt.addVectors(this.boundingBox.max, wt.max), this.boundingBox.expandByPoint(pt)) : (this.boundingBox.expandByPoint(wt.min), this.boundingBox.expandByPoint(wt.max));
      }
    } else this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new $r());
    const t = this.attributes.position, n = this.morphAttributes.position;
    if (t && t.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new U(), 1 / 0);
      return;
    }
    if (t) {
      const i = this.boundingSphere.center;
      if (wt.setFromBufferAttribute(t), n) for (let s = 0, a = n.length; s < a; s++) {
        const o = n[s];
        oi.setFromBufferAttribute(o), this.morphTargetsRelative ? (pt.addVectors(wt.min, oi.min), wt.expandByPoint(pt), pt.addVectors(wt.max, oi.max), wt.expandByPoint(pt)) : (wt.expandByPoint(oi.min), wt.expandByPoint(oi.max));
      }
      wt.getCenter(i);
      let r = 0;
      for (let s = 0, a = t.count; s < a; s++)
        pt.fromBufferAttribute(t, s), r = Math.max(r, i.distanceToSquared(pt));
      if (n) for (let s = 0, a = n.length; s < a; s++) {
        const o = n[s], l = this.morphTargetsRelative;
        for (let c = 0, h = o.count; c < h; c++)
          pt.fromBufferAttribute(o, c), l && (Fn.fromBufferAttribute(t, c), pt.add(Fn)), r = Math.max(r, i.distanceToSquared(pt));
      }
      this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const t = this.index, n = this.attributes;
    if (t === null || n.position === void 0 || n.normal === void 0 || n.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const i = n.position, r = n.normal, s = n.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Ut(new Float32Array(4 * i.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let N = 0; N < i.count; N++)
      o[N] = new U(), l[N] = new U();
    const c = new U(), h = new U(), u = new U(), d = new Te(), p = new Te(), M = new Te(), _ = new U(), m = new U();
    function f(N, y, S) {
      c.fromBufferAttribute(i, N), h.fromBufferAttribute(i, y), u.fromBufferAttribute(i, S), d.fromBufferAttribute(s, N), p.fromBufferAttribute(s, y), M.fromBufferAttribute(s, S), h.sub(c), u.sub(c), p.sub(d), M.sub(d);
      const w = 1 / (p.x * M.y - M.x * p.y);
      isFinite(w) && (_.copy(h).multiplyScalar(M.y).addScaledVector(u, -p.y).multiplyScalar(w), m.copy(u).multiplyScalar(p.x).addScaledVector(h, -M.x).multiplyScalar(w), o[N].add(_), o[y].add(_), o[S].add(_), l[N].add(m), l[y].add(m), l[S].add(m));
    }
    let b = this.groups;
    b.length === 0 && (b = [{
      start: 0,
      count: t.count
    }]);
    for (let N = 0, y = b.length; N < y; ++N) {
      const S = b[N], w = S.start, F = S.count;
      for (let H = w, V = w + F; H < V; H += 3) f(t.getX(H + 0), t.getX(H + 1), t.getX(H + 2));
    }
    const x = new U(), E = new U(), D = new U(), A = new U();
    function P(N) {
      D.fromBufferAttribute(r, N), A.copy(D);
      const y = o[N];
      x.copy(y), x.sub(D.multiplyScalar(D.dot(y))).normalize(), E.crossVectors(A, y);
      const S = E.dot(l[N]) < 0 ? -1 : 1;
      a.setXYZW(N, x.x, x.y, x.z, S);
    }
    for (let N = 0, y = b.length; N < y; ++N) {
      const S = b[N], w = S.start, F = S.count;
      for (let H = w, V = w + F; H < V; H += 3)
        P(t.getX(H + 0)), P(t.getX(H + 1)), P(t.getX(H + 2));
    }
  }
  computeVertexNormals() {
    const t = this.index, n = this.getAttribute("position");
    if (n !== void 0) {
      let i = this.getAttribute("normal");
      if (i === void 0)
        i = new Ut(new Float32Array(n.count * 3), 3), this.setAttribute("normal", i);
      else for (let d = 0, p = i.count; d < p; d++) i.setXYZ(d, 0, 0, 0);
      const r = new U(), s = new U(), a = new U(), o = new U(), l = new U(), c = new U(), h = new U(), u = new U();
      if (t) for (let d = 0, p = t.count; d < p; d += 3) {
        const M = t.getX(d + 0), _ = t.getX(d + 1), m = t.getX(d + 2);
        r.fromBufferAttribute(n, M), s.fromBufferAttribute(n, _), a.fromBufferAttribute(n, m), h.subVectors(a, s), u.subVectors(r, s), h.cross(u), o.fromBufferAttribute(i, M), l.fromBufferAttribute(i, _), c.fromBufferAttribute(i, m), o.add(h), l.add(h), c.add(h), i.setXYZ(M, o.x, o.y, o.z), i.setXYZ(_, l.x, l.y, l.z), i.setXYZ(m, c.x, c.y, c.z);
      }
      else for (let d = 0, p = n.count; d < p; d += 3)
        r.fromBufferAttribute(n, d + 0), s.fromBufferAttribute(n, d + 1), a.fromBufferAttribute(n, d + 2), h.subVectors(a, s), u.subVectors(r, s), h.cross(u), i.setXYZ(d + 0, h.x, h.y, h.z), i.setXYZ(d + 1, h.x, h.y, h.z), i.setXYZ(d + 2, h.x, h.y, h.z);
      this.normalizeNormals(), i.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const t = this.attributes.normal;
    for (let n = 0, i = t.count; n < i; n++)
      pt.fromBufferAttribute(t, n), pt.normalize(), t.setXYZ(n, pt.x, pt.y, pt.z);
  }
  toNonIndexed() {
    function t(o, l) {
      const c = o.array, h = o.itemSize, u = o.normalized, d = new c.constructor(l.length * h);
      let p = 0, M = 0;
      for (let _ = 0, m = l.length; _ < m; _++) {
        o.isInterleavedBufferAttribute ? p = l[_] * o.data.stride + o.offset : p = l[_] * h;
        for (let f = 0; f < h; f++) d[M++] = c[p++];
      }
      return new Ut(d, h, u);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const n = new La(), i = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], c = t(l, i);
      n.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], c = s[o];
      for (let h = 0, u = c.length; h < u; h++) {
        const d = c[h], p = t(d, i);
        l.push(p);
      }
      n.morphAttributes[o] = l;
    }
    n.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      n.addGroup(c.start, c.count, c.materialIndex);
    }
    return n;
  }
  toJSON() {
    const t = { metadata: {
      version: 4.7,
      type: "BufferGeometry",
      generator: "BufferGeometry.toJSON"
    } };
    if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l) l[c] !== void 0 && (t[c] = l[c]);
      return t;
    }
    t.data = { attributes: {} };
    const n = this.index;
    n !== null && (t.data.index = {
      type: n.array.constructor.name,
      array: Array.prototype.slice.call(n.array)
    });
    const i = this.attributes;
    for (const l in i) {
      const c = i[l];
      t.data.attributes[l] = c.toJSON(t.data);
    }
    const r = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let u = 0, d = c.length; u < d; u++) {
        const p = c[u];
        h.push(p.toJSON(t.data));
      }
      h.length > 0 && (r[l] = h, s = !0);
    }
    s && (t.data.morphAttributes = r, t.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (t.data.boundingSphere = o.toJSON()), t;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(t) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const n = {};
    this.name = t.name;
    const i = t.index;
    i !== null && this.setIndex(i.clone());
    const r = t.attributes;
    for (const c in r) {
      const h = r[c];
      this.setAttribute(c, h.clone(n));
    }
    const s = t.morphAttributes;
    for (const c in s) {
      const h = [], u = s[c];
      for (let d = 0, p = u.length; d < p; d++) h.push(u[d].clone(n));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = t.morphTargetsRelative;
    const a = t.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const u = a[c];
      this.addGroup(u.start, u.count, u.materialIndex);
    }
    const o = t.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = t.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}, Rs = /* @__PURE__ */ new st(), gn = /* @__PURE__ */ new Qr(), Li = /* @__PURE__ */ new $r(), Cs = /* @__PURE__ */ new U(), Ui = /* @__PURE__ */ new U(), Ii = /* @__PURE__ */ new U(), Ni = /* @__PURE__ */ new U(), wr = /* @__PURE__ */ new U(), Oi = /* @__PURE__ */ new U(), Ps = /* @__PURE__ */ new U(), Fi = /* @__PURE__ */ new U(), xt = class extends Tt {
  constructor(e = new Ht(), t = new ts()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  updateMorphTargets() {
    const e = this.geometry.morphAttributes, t = Object.keys(e);
    if (t.length > 0) {
      const n = e[t[0]];
      if (n !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let i = 0, r = n.length; i < r; i++) {
          const s = n[i].name || String(i);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[s] = i;
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const n = this.geometry, i = n.attributes.position, r = n.morphAttributes.position, s = n.morphTargetsRelative;
    t.fromBufferAttribute(i, e);
    const a = this.morphTargetInfluences;
    if (r && a) {
      Oi.set(0, 0, 0);
      for (let o = 0, l = r.length; o < l; o++) {
        const c = a[o], h = r[o];
        c !== 0 && (wr.fromBufferAttribute(h, e), s ? Oi.addScaledVector(wr, c) : Oi.addScaledVector(wr.sub(t), c));
      }
      t.add(Oi);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Li.copy(n.boundingSphere), Li.applyMatrix4(r), gn.copy(e.ray).recast(e.near), !(Li.containsPoint(gn.origin) === !1 && (gn.intersectSphere(Li, Cs) === null || gn.origin.distanceToSquared(Cs) > (e.far - e.near) ** 2)) && (Rs.copy(r).invert(), gn.copy(e.ray).applyMatrix4(Rs), !(n.boundingBox !== null && gn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, gn)));
  }
  _computeIntersections(e, t, n) {
    let i;
    const r = this.geometry, s = this.material, a = r.index, o = r.attributes.position, l = r.attributes.uv, c = r.attributes.uv1, h = r.attributes.normal, u = r.groups, d = r.drawRange;
    if (a !== null) if (Array.isArray(s)) for (let p = 0, M = u.length; p < M; p++) {
      const _ = u[p], m = s[_.materialIndex], f = Math.max(_.start, d.start), b = Math.min(a.count, Math.min(_.start + _.count, d.start + d.count));
      for (let x = f, E = b; x < E; x += 3) {
        const D = a.getX(x), A = a.getX(x + 1), P = a.getX(x + 2);
        i = Bi(this, m, e, n, l, c, h, D, A, P), i && (i.faceIndex = Math.floor(x / 3), i.face.materialIndex = _.materialIndex, t.push(i));
      }
    }
    else {
      const p = Math.max(0, d.start), M = Math.min(a.count, d.start + d.count);
      for (let _ = p, m = M; _ < m; _ += 3) {
        const f = a.getX(_), b = a.getX(_ + 1), x = a.getX(_ + 2);
        i = Bi(this, s, e, n, l, c, h, f, b, x), i && (i.faceIndex = Math.floor(_ / 3), t.push(i));
      }
    }
    else if (o !== void 0) if (Array.isArray(s)) for (let p = 0, M = u.length; p < M; p++) {
      const _ = u[p], m = s[_.materialIndex], f = Math.max(_.start, d.start), b = Math.min(o.count, Math.min(_.start + _.count, d.start + d.count));
      for (let x = f, E = b; x < E; x += 3) {
        const D = x, A = x + 1, P = x + 2;
        i = Bi(this, m, e, n, l, c, h, D, A, P), i && (i.faceIndex = Math.floor(x / 3), i.face.materialIndex = _.materialIndex, t.push(i));
      }
    }
    else {
      const p = Math.max(0, d.start), M = Math.min(o.count, d.start + d.count);
      for (let _ = p, m = M; _ < m; _ += 3) {
        const f = _, b = _ + 1, x = _ + 2;
        i = Bi(this, s, e, n, l, c, h, f, b, x), i && (i.faceIndex = Math.floor(_ / 3), t.push(i));
      }
    }
  }
};
function ql(e, t, n, i, r, s, a, o) {
  let l;
  if (t.side === 1 ? l = i.intersectTriangle(a, s, r, !0, o) : l = i.intersectTriangle(r, s, a, t.side === 0, o), l === null) return null;
  Fi.copy(o), Fi.applyMatrix4(e.matrixWorld);
  const c = n.ray.origin.distanceTo(Fi);
  return c < n.near || c > n.far ? null : {
    distance: c,
    point: Fi.clone(),
    object: e
  };
}
function Bi(e, t, n, i, r, s, a, o, l, c) {
  e.getVertexPosition(o, Ui), e.getVertexPosition(l, Ii), e.getVertexPosition(c, Ni);
  const h = ql(e, t, n, i, Ui, Ii, Ni, Ps);
  if (h) {
    const u = new U();
    Xn.getBarycoord(Ps, Ui, Ii, Ni, u), r && (h.uv = Xn.getInterpolatedAttribute(r, o, l, c, u, new Te())), s && (h.uv1 = Xn.getInterpolatedAttribute(s, o, l, c, u, new Te())), a && (h.normal = Xn.getInterpolatedAttribute(a, o, l, c, u, new U()), h.normal.dot(i.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = {
      a: o,
      b: l,
      c,
      normal: new U(),
      materialIndex: 0
    };
    Xn.getNormal(Ui, Ii, Ni, d.normal), h.face = d, h.barycoord = u;
  }
  return h;
}
var tr = class Ua extends Ht {
  constructor(t = 1, n = 1, i = 1, r = 1, s = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: t,
      height: n,
      depth: i,
      widthSegments: r,
      heightSegments: s,
      depthSegments: a
    };
    const o = this;
    r = Math.floor(r), s = Math.floor(s), a = Math.floor(a);
    const l = [], c = [], h = [], u = [];
    let d = 0, p = 0;
    M("z", "y", "x", -1, -1, i, n, t, a, s, 0), M("z", "y", "x", 1, -1, i, n, -t, a, s, 1), M("x", "z", "y", 1, 1, t, i, n, r, a, 2), M("x", "z", "y", 1, -1, t, i, -n, r, a, 3), M("x", "y", "z", 1, -1, t, n, i, r, s, 4), M("x", "y", "z", -1, -1, t, n, -i, r, s, 5), this.setIndex(l), this.setAttribute("position", new ht(c, 3)), this.setAttribute("normal", new ht(h, 3)), this.setAttribute("uv", new ht(u, 2));
    function M(_, m, f, b, x, E, D, A, P, N, y) {
      const S = E / P, w = D / N, F = E / 2, H = D / 2, V = A / 2, j = P + 1, k = N + 1;
      let J = 0, W = 0;
      const ee = new U();
      for (let he = 0; he < k; he++) {
        const Le = he * w - H;
        for (let Fe = 0; Fe < j; Fe++)
          ee[_] = (Fe * S - F) * b, ee[m] = Le * x, ee[f] = V, c.push(ee.x, ee.y, ee.z), ee[_] = 0, ee[m] = 0, ee[f] = A > 0 ? 1 : -1, h.push(ee.x, ee.y, ee.z), u.push(Fe / P), u.push(1 - he / N), J += 1;
      }
      for (let he = 0; he < N; he++) for (let Le = 0; Le < P; Le++) {
        const Fe = d + Le + j * he, nt = d + Le + j * (he + 1), We = d + (Le + 1) + j * (he + 1), X = d + (Le + 1) + j * he;
        l.push(Fe, nt, X), l.push(nt, We, X), W += 6;
      }
      o.addGroup(p, W, y), p += W, d += J;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Ua(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
  }
};
function ei(e) {
  const t = {};
  for (const n in e) {
    t[n] = {};
    for (const i in e[n]) {
      const r = e[n][i];
      r && (r.isColor || r.isMatrix3 || r.isMatrix4 || r.isVector2 || r.isVector3 || r.isVector4 || r.isTexture || r.isQuaternion) ? r.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[n][i] = null) : t[n][i] = r.clone() : Array.isArray(r) ? t[n][i] = r.slice() : t[n][i] = r;
    }
  }
  return t;
}
function yt(e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const i = ei(e[n]);
    for (const r in i) t[r] = i[r];
  }
  return t;
}
function jl(e) {
  const t = [];
  for (let n = 0; n < e.length; n++) t.push(e[n].clone());
  return t;
}
function Ia(e) {
  const t = e.getRenderTarget();
  return t === null ? e.outputColorSpace : t.isXRRenderTarget === !0 ? t.texture.colorSpace : ke.workingColorSpace;
}
var Kl = {
  clone: ei,
  merge: yt
}, Zl = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Jl = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`, dn = class extends ti {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Zl, this.fragmentShader = Jl, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      multiDraw: !1
    }, this.defaultAttributeValues = {
      color: [
        1,
        1,
        1
      ],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = ei(e.uniforms), this.uniformsGroups = jl(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const i in this.uniforms) {
      const r = this.uniforms[i].value;
      r && r.isTexture ? t.uniforms[i] = {
        type: "t",
        value: r.toJSON(e).uuid
      } : r && r.isColor ? t.uniforms[i] = {
        type: "c",
        value: r.getHex()
      } : r && r.isVector2 ? t.uniforms[i] = {
        type: "v2",
        value: r.toArray()
      } : r && r.isVector3 ? t.uniforms[i] = {
        type: "v3",
        value: r.toArray()
      } : r && r.isVector4 ? t.uniforms[i] = {
        type: "v4",
        value: r.toArray()
      } : r && r.isMatrix3 ? t.uniforms[i] = {
        type: "m3",
        value: r.toArray()
      } : r && r.isMatrix4 ? t.uniforms[i] = {
        type: "m4",
        value: r.toArray()
      } : t.uniforms[i] = { value: r };
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const n = {};
    for (const i in this.extensions) this.extensions[i] === !0 && (n[i] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t;
  }
}, Na = class extends Tt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new st(), this.projectionMatrix = new st(), this.projectionMatrixInverse = new st(), this.coordinateSystem = Qn, this._reversedDepth = !1;
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, cn = /* @__PURE__ */ new U(), Ds = /* @__PURE__ */ new Te(), Ls = /* @__PURE__ */ new Te(), Lt = class extends Na {
  constructor(e = 50, t = 1, n = 0.1, i = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  setFocalLength(e) {
    const t = 0.5 * this.getFilmHeight() / e;
    this.fov = _i * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  getFocalLength() {
    const e = Math.tan(di * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return _i * 2 * Math.atan(Math.tan(di * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  getViewBounds(e, t, n) {
    cn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(cn.x, cn.y).multiplyScalar(-e / cn.z), cn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(cn.x, cn.y).multiplyScalar(-e / cn.z);
  }
  getViewSize(e, t) {
    return this.getViewBounds(e, Ds, Ls), t.subVectors(Ls, Ds);
  }
  setViewOffset(e, t, n, i, r, s) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = s, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(di * 0.5 * this.fov) / this.zoom, n = 2 * t, i = this.aspect * n, r = -0.5 * i;
    const s = this.view;
    if (this.view !== null && this.view.enabled) {
      const o = s.fullWidth, l = s.fullHeight;
      r += s.offsetX * i / o, t -= s.offsetY * n / l, i *= s.width / o, n *= s.height / l;
    }
    const a = this.filmOffset;
    a !== 0 && (r += e * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + i, t, t - n, e, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
  }
}, Bn = -90, zn = 1, $l = class extends Tt {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new Lt(Bn, zn, e, t);
    i.layers = this.layers, this.add(i);
    const r = new Lt(Bn, zn, e, t);
    r.layers = this.layers, this.add(r);
    const s = new Lt(Bn, zn, e, t);
    s.layers = this.layers, this.add(s);
    const a = new Lt(Bn, zn, e, t);
    a.layers = this.layers, this.add(a);
    const o = new Lt(Bn, zn, e, t);
    o.layers = this.layers, this.add(o);
    const l = new Lt(Bn, zn, e, t);
    l.layers = this.layers, this.add(l);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [n, i, r, s, a, o] = t;
    for (const l of t) this.remove(l);
    if (e === 2e3)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), s.up.set(0, 0, 1), s.lookAt(0, -1, 0), a.up.set(0, 1, 0), a.lookAt(0, 0, 1), o.up.set(0, 1, 0), o.lookAt(0, 0, -1);
    else if (e === 2001)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), s.up.set(0, 0, -1), s.lookAt(0, -1, 0), a.up.set(0, -1, 0), a.lookAt(0, 0, 1), o.up.set(0, -1, 0), o.lookAt(0, 0, -1);
    else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const l of t)
      this.add(l), l.updateMatrixWorld();
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: i } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [r, s, a, o, l, c] = this.children, h = e.getRenderTarget(), u = e.getActiveCubeFace(), d = e.getActiveMipmapLevel(), p = e.xr.enabled;
    e.xr.enabled = !1;
    const M = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, i), e.render(t, r), e.setRenderTarget(n, 1, i), e.render(t, s), e.setRenderTarget(n, 2, i), e.render(t, a), e.setRenderTarget(n, 3, i), e.render(t, o), e.setRenderTarget(n, 4, i), e.render(t, l), n.texture.generateMipmaps = M, e.setRenderTarget(n, 5, i), e.render(t, c), e.setRenderTarget(h, u, d), e.xr.enabled = p, n.texture.needsPMREMUpdate = !0;
  }
}, Oa = class extends Vt {
  constructor(e = [], t = 301, n, i, r, s, a, o, l, c) {
    super(e, t, n, i, r, s, a, o, l, c), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}, Ql = class extends bn {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = {
      width: e,
      height: e,
      depth: 1
    }, i = [
      n,
      n,
      n,
      n,
      n,
      n
    ];
    this.texture = new Oa(i), this._setTextureOptions(t), this.texture.isRenderTargetTexture = !0;
  }
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const n = {
      uniforms: { tEquirect: { value: null } },
      vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
      fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
    }, i = new tr(5, 5, 5), r = new dn({
      name: "CubemapFromEquirect",
      uniforms: ei(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: 1,
      blending: 0
    });
    r.uniforms.tEquirect.value = t;
    const s = new xt(i, r), a = t.minFilter;
    return t.minFilter === 1008 && (t.minFilter = Tn), new $l(1, 10, this).update(e, s), t.minFilter = a, s.geometry.dispose(), s.material.dispose(), this;
  }
  clear(e, t = !0, n = !0, i = !0) {
    const r = e.getRenderTarget();
    for (let s = 0; s < 6; s++)
      e.setRenderTarget(this, s), e.clear(t, n, i);
    e.setRenderTarget(r);
  }
}, Kn = class extends Tt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}, ec = { type: "move" }, Rr = class {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Kn(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Kn(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new U(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new U()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Kn(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new U(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new U()), this._grip;
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t) for (const n of e.hand.values()) this._getHandJoint(t, n);
    }
    return this.dispatchEvent({
      type: "connected",
      data: e
    }), this;
  }
  disconnect(e) {
    return this.dispatchEvent({
      type: "disconnected",
      data: e
    }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(e, t, n) {
    let i = null, r = null, s = null;
    const a = this._targetRay, o = this._grip, l = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (l && e.hand) {
        s = !0;
        for (const M of e.hand.values()) {
          const _ = t.getJointPose(M, n), m = this._getHandJoint(l, M);
          _ !== null && (m.matrix.fromArray(_.transform.matrix), m.matrix.decompose(m.position, m.rotation, m.scale), m.matrixWorldNeedsUpdate = !0, m.jointRadius = _.radius), m.visible = _ !== null;
        }
        const c = l.joints["index-finger-tip"], h = l.joints["thumb-tip"], u = c.position.distanceTo(h.position), d = 0.02, p = 5e-3;
        l.inputState.pinching && u > d + p ? (l.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !l.inputState.pinching && u <= d - p && (l.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else o !== null && e.gripSpace && (r = t.getPose(e.gripSpace, n), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1));
      a !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (a.matrix.fromArray(i.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), a.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(i.linearVelocity)) : a.hasLinearVelocity = !1, i.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(i.angularVelocity)) : a.hasAngularVelocity = !1, this.dispatchEvent(ec)));
    }
    return a !== null && (a.visible = i !== null), o !== null && (o.visible = r !== null), l !== null && (l.visible = s !== null), this;
  }
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new Kn();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}, tc = class Fa {
  constructor(t, n = 1, i = 1e3) {
    this.isFog = !0, this.name = "", this.color = new Be(t), this.near = n, this.far = i;
  }
  clone() {
    return new Fa(this.color, this.near, this.far);
  }
  toJSON() {
    return {
      type: "Fog",
      name: this.name,
      color: this.color.getHex(),
      near: this.near,
      far: this.far
    };
  }
}, nc = class extends Tt {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new nn(), this.environmentIntensity = 1, this.environmentRotation = new nn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}, ic = class {
  constructor(e, t) {
    this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = Sa, this.updateRanges = [], this.version = 0, this.uuid = $t();
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({
      start: e,
      count: t
    });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this;
  }
  copyAt(e, t, n) {
    e *= this.stride, n *= t.stride;
    for (let i = 0, r = this.stride; i < r; i++) this.array[e + i] = t.array[n + i];
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  clone(e) {
    e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = $t()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const t = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(t, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  toJSON(e) {
    return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = $t()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}, St = /* @__PURE__ */ new U(), Us = class Ba {
  constructor(t, n, i, r = !1) {
    this.isInterleavedBufferAttribute = !0, this.name = "", this.data = t, this.itemSize = n, this.offset = i, this.normalized = r;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(t) {
    this.data.needsUpdate = t;
  }
  applyMatrix4(t) {
    for (let n = 0, i = this.data.count; n < i; n++)
      St.fromBufferAttribute(this, n), St.applyMatrix4(t), this.setXYZ(n, St.x, St.y, St.z);
    return this;
  }
  applyNormalMatrix(t) {
    for (let n = 0, i = this.count; n < i; n++)
      St.fromBufferAttribute(this, n), St.applyNormalMatrix(t), this.setXYZ(n, St.x, St.y, St.z);
    return this;
  }
  transformDirection(t) {
    for (let n = 0, i = this.count; n < i; n++)
      St.fromBufferAttribute(this, n), St.transformDirection(t), this.setXYZ(n, St.x, St.y, St.z);
    return this;
  }
  getComponent(t, n) {
    let i = this.array[t * this.data.stride + this.offset + n];
    return this.normalized && (i = zt(i, this.array)), i;
  }
  setComponent(t, n, i) {
    return this.normalized && (i = Xe(i, this.array)), this.data.array[t * this.data.stride + this.offset + n] = i, this;
  }
  setX(t, n) {
    return this.normalized && (n = Xe(n, this.array)), this.data.array[t * this.data.stride + this.offset] = n, this;
  }
  setY(t, n) {
    return this.normalized && (n = Xe(n, this.array)), this.data.array[t * this.data.stride + this.offset + 1] = n, this;
  }
  setZ(t, n) {
    return this.normalized && (n = Xe(n, this.array)), this.data.array[t * this.data.stride + this.offset + 2] = n, this;
  }
  setW(t, n) {
    return this.normalized && (n = Xe(n, this.array)), this.data.array[t * this.data.stride + this.offset + 3] = n, this;
  }
  getX(t) {
    let n = this.data.array[t * this.data.stride + this.offset];
    return this.normalized && (n = zt(n, this.array)), n;
  }
  getY(t) {
    let n = this.data.array[t * this.data.stride + this.offset + 1];
    return this.normalized && (n = zt(n, this.array)), n;
  }
  getZ(t) {
    let n = this.data.array[t * this.data.stride + this.offset + 2];
    return this.normalized && (n = zt(n, this.array)), n;
  }
  getW(t) {
    let n = this.data.array[t * this.data.stride + this.offset + 3];
    return this.normalized && (n = zt(n, this.array)), n;
  }
  setXY(t, n, i) {
    return t = t * this.data.stride + this.offset, this.normalized && (n = Xe(n, this.array), i = Xe(i, this.array)), this.data.array[t + 0] = n, this.data.array[t + 1] = i, this;
  }
  setXYZ(t, n, i, r) {
    return t = t * this.data.stride + this.offset, this.normalized && (n = Xe(n, this.array), i = Xe(i, this.array), r = Xe(r, this.array)), this.data.array[t + 0] = n, this.data.array[t + 1] = i, this.data.array[t + 2] = r, this;
  }
  setXYZW(t, n, i, r, s) {
    return t = t * this.data.stride + this.offset, this.normalized && (n = Xe(n, this.array), i = Xe(i, this.array), r = Xe(r, this.array), s = Xe(s, this.array)), this.data.array[t + 0] = n, this.data.array[t + 1] = i, this.data.array[t + 2] = r, this.data.array[t + 3] = s, this;
  }
  clone(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const n = [];
      for (let i = 0; i < this.count; i++) {
        const r = i * this.data.stride + this.offset;
        for (let s = 0; s < this.itemSize; s++) n.push(this.data.array[r + s]);
      }
      return new Ut(new this.array.constructor(n), this.itemSize, this.normalized);
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), new Ba(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
  }
  toJSON(t) {
    if (t === void 0) {
      console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      const n = [];
      for (let i = 0; i < this.count; i++) {
        const r = i * this.data.stride + this.offset;
        for (let s = 0; s < this.itemSize; s++) n.push(this.data.array[r + s]);
      }
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: n,
        normalized: this.normalized
      };
    } else
      return t.interleavedBuffers === void 0 && (t.interleavedBuffers = {}), t.interleavedBuffers[this.data.uuid] === void 0 && (t.interleavedBuffers[this.data.uuid] = this.data.toJSON(t)), {
        isInterleavedBufferAttribute: !0,
        itemSize: this.itemSize,
        data: this.data.uuid,
        offset: this.offset,
        normalized: this.normalized
      };
  }
}, za = class extends ti {
  constructor(e) {
    super(), this.isSpriteMaterial = !0, this.type = "SpriteMaterial", this.color = new Be(16777215), this.map = null, this.alphaMap = null, this.rotation = 0, this.sizeAttenuation = !0, this.transparent = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.rotation = e.rotation, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
  }
}, Vn, li = /* @__PURE__ */ new U(), Hn = /* @__PURE__ */ new U(), Gn = /* @__PURE__ */ new U(), kn = /* @__PURE__ */ new Te(), ci = /* @__PURE__ */ new Te(), Va = /* @__PURE__ */ new st(), zi = /* @__PURE__ */ new U(), hi = /* @__PURE__ */ new U(), Vi = /* @__PURE__ */ new U(), Is = /* @__PURE__ */ new Te(), Cr = /* @__PURE__ */ new Te(), Ns = /* @__PURE__ */ new Te(), rc = class extends Tt {
  constructor(e = new za()) {
    if (super(), this.isSprite = !0, this.type = "Sprite", Vn === void 0) {
      Vn = new Ht();
      const t = new ic(new Float32Array([
        -0.5,
        -0.5,
        0,
        0,
        0,
        0.5,
        -0.5,
        0,
        1,
        0,
        0.5,
        0.5,
        0,
        1,
        1,
        -0.5,
        0.5,
        0,
        0,
        1
      ]), 5);
      Vn.setIndex([
        0,
        1,
        2,
        0,
        2,
        3
      ]), Vn.setAttribute("position", new Us(t, 3, 0, !1)), Vn.setAttribute("uv", new Us(t, 2, 3, !1));
    }
    this.geometry = Vn, this.material = e, this.center = new Te(0.5, 0.5), this.count = 1;
  }
  raycast(e, t) {
    e.camera === null && console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'), Hn.setFromMatrixScale(this.matrixWorld), Va.copy(e.camera.matrixWorld), this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse, this.matrixWorld), Gn.setFromMatrixPosition(this.modelViewMatrix), e.camera.isPerspectiveCamera && this.material.sizeAttenuation === !1 && Hn.multiplyScalar(-Gn.z);
    const n = this.material.rotation;
    let i, r;
    n !== 0 && (r = Math.cos(n), i = Math.sin(n));
    const s = this.center;
    Hi(zi.set(-0.5, -0.5, 0), Gn, s, Hn, i, r), Hi(hi.set(0.5, -0.5, 0), Gn, s, Hn, i, r), Hi(Vi.set(0.5, 0.5, 0), Gn, s, Hn, i, r), Is.set(0, 0), Cr.set(1, 0), Ns.set(1, 1);
    let a = e.ray.intersectTriangle(zi, hi, Vi, !1, li);
    if (a === null && (Hi(hi.set(-0.5, 0.5, 0), Gn, s, Hn, i, r), Cr.set(0, 1), a = e.ray.intersectTriangle(zi, Vi, hi, !1, li), a === null))
      return;
    const o = e.ray.origin.distanceTo(li);
    o < e.near || o > e.far || t.push({
      distance: o,
      point: li.clone(),
      uv: Xn.getInterpolation(li, zi, hi, Vi, Is, Cr, Ns, new Te()),
      face: null,
      object: this
    });
  }
  copy(e, t) {
    return super.copy(e, t), e.center !== void 0 && this.center.copy(e.center), this.material = e.material, this;
  }
};
function Hi(e, t, n, i, r, s) {
  kn.subVectors(e, n).addScalar(0.5).multiply(i), r !== void 0 ? (ci.x = s * kn.x - r * kn.y, ci.y = r * kn.x + s * kn.y) : ci.copy(kn), e.copy(t), e.x += ci.x, e.y += ci.y, e.applyMatrix4(Va);
}
var Pr = /* @__PURE__ */ new U(), sc = /* @__PURE__ */ new U(), ac = /* @__PURE__ */ new Ne(), hn = class {
  constructor(e = new U(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t;
  }
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this;
  }
  setComponents(e, t, n, i) {
    return this.normal.set(e, t, n), this.constant = i, this;
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
  }
  setFromCoplanarPoints(e, t, n) {
    const i = Pr.subVectors(n, t).cross(sc.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(i, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, t) {
    const n = e.delta(Pr), i = this.normal.dot(n);
    if (i === 0)
      return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const r = -(e.start.dot(this.normal) + this.constant) / i;
    return r < 0 || r > 1 ? null : t.copy(e.start).addScaledVector(n, r);
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
    return t < 0 && n > 0 || n < 0 && t > 0;
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, t) {
    const n = t || ac.getNormalMatrix(e), i = this.coplanarPoint(Pr).applyMatrix4(e), r = this.normal.applyMatrix3(n).normalize();
    return this.constant = -i.dot(r), this;
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, vn = /* @__PURE__ */ new $r(), oc = /* @__PURE__ */ new Te(0.5, 0.5), Gi = /* @__PURE__ */ new U(), ns = class {
  constructor(e = new hn(), t = new hn(), n = new hn(), i = new hn(), r = new hn(), s = new hn()) {
    this.planes = [
      e,
      t,
      n,
      i,
      r,
      s
    ];
  }
  set(e, t, n, i, r, s) {
    const a = this.planes;
    return a[0].copy(e), a[1].copy(t), a[2].copy(n), a[3].copy(i), a[4].copy(r), a[5].copy(s), this;
  }
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
    return this;
  }
  setFromProjectionMatrix(e, t = Qn, n = !1) {
    const i = this.planes, r = e.elements, s = r[0], a = r[1], o = r[2], l = r[3], c = r[4], h = r[5], u = r[6], d = r[7], p = r[8], M = r[9], _ = r[10], m = r[11], f = r[12], b = r[13], x = r[14], E = r[15];
    if (i[0].setComponents(l - s, d - c, m - p, E - f).normalize(), i[1].setComponents(l + s, d + c, m + p, E + f).normalize(), i[2].setComponents(l + a, d + h, m + M, E + b).normalize(), i[3].setComponents(l - a, d - h, m - M, E - b).normalize(), n)
      i[4].setComponents(o, u, _, x).normalize(), i[5].setComponents(l - o, d - u, m - _, E - x).normalize();
    else if (i[4].setComponents(l - o, d - u, m - _, E - x).normalize(), t === 2e3) i[5].setComponents(l + o, d + u, m + _, E + x).normalize();
    else if (t === 2001) i[5].setComponents(o, u, _, x).normalize();
    else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), vn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), vn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(vn);
  }
  intersectsSprite(e) {
    return vn.center.set(0, 0, 0), vn.radius = 0.7071067811865476 + oc.distanceTo(e.center), vn.applyMatrix4(e.matrixWorld), this.intersectsSphere(vn);
  }
  intersectsSphere(e) {
    const t = this.planes, n = e.center, i = -e.radius;
    for (let r = 0; r < 6; r++) if (t[r].distanceToPoint(n) < i) return !1;
    return !0;
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const i = t[n];
      if (Gi.x = i.normal.x > 0 ? e.max.x : e.min.x, Gi.y = i.normal.y > 0 ? e.max.y : e.min.y, Gi.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(Gi) < 0) return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) if (t[n].distanceToPoint(e) < 0) return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, lc = class extends Vt {
  constructor(e, t, n, i, r, s, a, o, l) {
    super(e, t, n, i, r, s, a, o, l), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}, Ha = class extends Vt {
  constructor(e, t, n = qr, i, r, s, a = en, o = en, l, c = Ma, h = 1) {
    if (c !== 1026 && c !== 1027) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    super({
      width: e,
      height: t,
      depth: h
    }, i, r, s, a, o, c, n, l), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.source = new Jr(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}, Ga = class extends Vt {
  constructor(e = null) {
    super(), this.sourceTexture = e, this.isExternalTexture = !0;
  }
  copy(e) {
    return super.copy(e), this.sourceTexture = e.sourceTexture, this;
  }
}, qn = class ka extends Ht {
  constructor(t = 1, n = 1, i = 1, r = 32, s = 1, a = !1, o = 0, l = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = {
      radiusTop: t,
      radiusBottom: n,
      height: i,
      radialSegments: r,
      heightSegments: s,
      openEnded: a,
      thetaStart: o,
      thetaLength: l
    };
    const c = this;
    r = Math.floor(r), s = Math.floor(s);
    const h = [], u = [], d = [], p = [];
    let M = 0;
    const _ = [], m = i / 2;
    let f = 0;
    b(), a === !1 && (t > 0 && x(!0), n > 0 && x(!1)), this.setIndex(h), this.setAttribute("position", new ht(u, 3)), this.setAttribute("normal", new ht(d, 3)), this.setAttribute("uv", new ht(p, 2));
    function b() {
      const E = new U(), D = new U();
      let A = 0;
      const P = (n - t) / i;
      for (let N = 0; N <= s; N++) {
        const y = [], S = N / s, w = S * (n - t) + t;
        for (let F = 0; F <= r; F++) {
          const H = F / r, V = H * l + o, j = Math.sin(V), k = Math.cos(V);
          D.x = w * j, D.y = -S * i + m, D.z = w * k, u.push(D.x, D.y, D.z), E.set(j, P, k).normalize(), d.push(E.x, E.y, E.z), p.push(H, 1 - S), y.push(M++);
        }
        _.push(y);
      }
      for (let N = 0; N < r; N++) for (let y = 0; y < s; y++) {
        const S = _[y][N], w = _[y + 1][N], F = _[y + 1][N + 1], H = _[y][N + 1];
        (t > 0 || y !== 0) && (h.push(S, w, H), A += 3), (n > 0 || y !== s - 1) && (h.push(w, F, H), A += 3);
      }
      c.addGroup(f, A, 0), f += A;
    }
    function x(E) {
      const D = M, A = new Te(), P = new U();
      let N = 0;
      const y = E === !0 ? t : n, S = E === !0 ? 1 : -1;
      for (let F = 1; F <= r; F++)
        u.push(0, m * S, 0), d.push(0, S, 0), p.push(0.5, 0.5), M++;
      const w = M;
      for (let F = 0; F <= r; F++) {
        const H = F / r * l + o, V = Math.cos(H), j = Math.sin(H);
        P.x = y * j, P.y = m * S, P.z = y * V, u.push(P.x, P.y, P.z), d.push(0, S, 0), A.x = V * 0.5 + 0.5, A.y = j * 0.5 * S + 0.5, p.push(A.x, A.y), M++;
      }
      for (let F = 0; F < r; F++) {
        const H = D + F, V = w + F;
        E === !0 ? h.push(V, V + 1, H) : h.push(V + 1, V, H), N += 3;
      }
      c.addGroup(f, N, E === !0 ? 1 : 2), f += N;
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new ka(t.radiusTop, t.radiusBottom, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
  }
}, Os = class Wa extends qn {
  constructor(t = 1, n = 1, i = 32, r = 1, s = !1, a = 0, o = Math.PI * 2) {
    super(0, t, n, i, r, s, a, o), this.type = "ConeGeometry", this.parameters = {
      radius: t,
      height: n,
      radialSegments: i,
      heightSegments: r,
      openEnded: s,
      thetaStart: a,
      thetaLength: o
    };
  }
  static fromJSON(t) {
    return new Wa(t.radius, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
  }
}, cc = class Xa extends Ht {
  constructor(t = [], n = [], i = 1, r = 0) {
    super(), this.type = "PolyhedronGeometry", this.parameters = {
      vertices: t,
      indices: n,
      radius: i,
      detail: r
    };
    const s = [], a = [];
    o(r), c(i), h(), this.setAttribute("position", new ht(s, 3)), this.setAttribute("normal", new ht(s.slice(), 3)), this.setAttribute("uv", new ht(a, 2)), r === 0 ? this.computeVertexNormals() : this.normalizeNormals();
    function o(b) {
      const x = new U(), E = new U(), D = new U();
      for (let A = 0; A < n.length; A += 3)
        p(n[A + 0], x), p(n[A + 1], E), p(n[A + 2], D), l(x, E, D, b);
    }
    function l(b, x, E, D) {
      const A = D + 1, P = [];
      for (let N = 0; N <= A; N++) {
        P[N] = [];
        const y = b.clone().lerp(E, N / A), S = x.clone().lerp(E, N / A), w = A - N;
        for (let F = 0; F <= w; F++) F === 0 && N === A ? P[N][F] = y : P[N][F] = y.clone().lerp(S, F / w);
      }
      for (let N = 0; N < A; N++) for (let y = 0; y < 2 * (A - N) - 1; y++) {
        const S = Math.floor(y / 2);
        y % 2 === 0 ? (d(P[N][S + 1]), d(P[N + 1][S]), d(P[N][S])) : (d(P[N][S + 1]), d(P[N + 1][S + 1]), d(P[N + 1][S]));
      }
    }
    function c(b) {
      const x = new U();
      for (let E = 0; E < s.length; E += 3)
        x.x = s[E + 0], x.y = s[E + 1], x.z = s[E + 2], x.normalize().multiplyScalar(b), s[E + 0] = x.x, s[E + 1] = x.y, s[E + 2] = x.z;
    }
    function h() {
      const b = new U();
      for (let x = 0; x < s.length; x += 3) {
        b.x = s[x + 0], b.y = s[x + 1], b.z = s[x + 2];
        const E = m(b) / 2 / Math.PI + 0.5, D = f(b) / Math.PI + 0.5;
        a.push(E, 1 - D);
      }
      M(), u();
    }
    function u() {
      for (let b = 0; b < a.length; b += 6) {
        const x = a[b + 0], E = a[b + 2], D = a[b + 4];
        Math.max(x, E, D) > 0.9 && Math.min(x, E, D) < 0.1 && (x < 0.2 && (a[b + 0] += 1), E < 0.2 && (a[b + 2] += 1), D < 0.2 && (a[b + 4] += 1));
      }
    }
    function d(b) {
      s.push(b.x, b.y, b.z);
    }
    function p(b, x) {
      const E = b * 3;
      x.x = t[E + 0], x.y = t[E + 1], x.z = t[E + 2];
    }
    function M() {
      const b = new U(), x = new U(), E = new U(), D = new U(), A = new Te(), P = new Te(), N = new Te();
      for (let y = 0, S = 0; y < s.length; y += 9, S += 6) {
        b.set(s[y + 0], s[y + 1], s[y + 2]), x.set(s[y + 3], s[y + 4], s[y + 5]), E.set(s[y + 6], s[y + 7], s[y + 8]), A.set(a[S + 0], a[S + 1]), P.set(a[S + 2], a[S + 3]), N.set(a[S + 4], a[S + 5]), D.copy(b).add(x).add(E).divideScalar(3);
        const w = m(D);
        _(A, S + 0, b, w), _(P, S + 2, x, w), _(N, S + 4, E, w);
      }
    }
    function _(b, x, E, D) {
      D < 0 && b.x === 1 && (a[x] = b.x - 1), E.x === 0 && E.z === 0 && (a[x] = D / 2 / Math.PI + 0.5);
    }
    function m(b) {
      return Math.atan2(b.z, -b.x);
    }
    function f(b) {
      return Math.atan2(-b.y, Math.sqrt(b.x * b.x + b.z * b.z));
    }
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Xa(t.vertices, t.indices, t.radius, t.details);
  }
}, hc = class Ya extends cc {
  constructor(t = 1, n = 0) {
    const i = (1 + Math.sqrt(5)) / 2, r = 1 / i, s = [
      -1,
      -1,
      -1,
      -1,
      -1,
      1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      1,
      -1,
      -1,
      1,
      -1,
      1,
      1,
      1,
      -1,
      1,
      1,
      1,
      0,
      -r,
      -i,
      0,
      -r,
      i,
      0,
      r,
      -i,
      0,
      r,
      i,
      -r,
      -i,
      0,
      -r,
      i,
      0,
      r,
      -i,
      0,
      r,
      i,
      0,
      -i,
      0,
      -r,
      i,
      0,
      -r,
      -i,
      0,
      r,
      i,
      0,
      r
    ];
    super(s, [
      3,
      11,
      7,
      3,
      7,
      15,
      3,
      15,
      13,
      7,
      19,
      17,
      7,
      17,
      6,
      7,
      6,
      15,
      17,
      4,
      8,
      17,
      8,
      10,
      17,
      10,
      6,
      8,
      0,
      16,
      8,
      16,
      2,
      8,
      2,
      10,
      0,
      12,
      1,
      0,
      1,
      18,
      0,
      18,
      16,
      6,
      10,
      2,
      6,
      2,
      13,
      6,
      13,
      15,
      2,
      16,
      18,
      2,
      18,
      3,
      2,
      3,
      13,
      18,
      1,
      9,
      18,
      9,
      11,
      18,
      11,
      3,
      4,
      14,
      12,
      4,
      12,
      0,
      4,
      0,
      8,
      11,
      9,
      5,
      11,
      5,
      19,
      11,
      19,
      7,
      19,
      5,
      14,
      19,
      14,
      4,
      19,
      4,
      17,
      1,
      12,
      14,
      1,
      14,
      5,
      1,
      5,
      9
    ], t, n), this.type = "DodecahedronGeometry", this.parameters = {
      radius: t,
      detail: n
    };
  }
  static fromJSON(t) {
    return new Ya(t.radius, t.detail);
  }
}, qa = class ja extends Ht {
  constructor(t = 1, n = 1, i = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: t,
      height: n,
      widthSegments: i,
      heightSegments: r
    };
    const s = t / 2, a = n / 2, o = Math.floor(i), l = Math.floor(r), c = o + 1, h = l + 1, u = t / o, d = n / l, p = [], M = [], _ = [], m = [];
    for (let f = 0; f < h; f++) {
      const b = f * d - a;
      for (let x = 0; x < c; x++) {
        const E = x * u - s;
        M.push(E, -b, 0), _.push(0, 0, 1), m.push(x / o), m.push(1 - f / l);
      }
    }
    for (let f = 0; f < l; f++) for (let b = 0; b < o; b++) {
      const x = b + c * f, E = b + c * (f + 1), D = b + 1 + c * (f + 1), A = b + 1 + c * f;
      p.push(x, E, A), p.push(E, D, A);
    }
    this.setIndex(p), this.setAttribute("position", new ht(M, 3)), this.setAttribute("normal", new ht(_, 3)), this.setAttribute("uv", new ht(m, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new ja(t.width, t.height, t.widthSegments, t.heightSegments);
  }
}, Fs = class Ka extends Ht {
  constructor(t = 1, n = 32, i = 16, r = 0, s = Math.PI * 2, a = 0, o = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = {
      radius: t,
      widthSegments: n,
      heightSegments: i,
      phiStart: r,
      phiLength: s,
      thetaStart: a,
      thetaLength: o
    }, n = Math.max(3, Math.floor(n)), i = Math.max(2, Math.floor(i));
    const l = Math.min(a + o, Math.PI);
    let c = 0;
    const h = [], u = new U(), d = new U(), p = [], M = [], _ = [], m = [];
    for (let f = 0; f <= i; f++) {
      const b = [], x = f / i;
      let E = 0;
      f === 0 && a === 0 ? E = 0.5 / n : f === i && l === Math.PI && (E = -0.5 / n);
      for (let D = 0; D <= n; D++) {
        const A = D / n;
        u.x = -t * Math.cos(r + A * s) * Math.sin(a + x * o), u.y = t * Math.cos(a + x * o), u.z = t * Math.sin(r + A * s) * Math.sin(a + x * o), M.push(u.x, u.y, u.z), d.copy(u).normalize(), _.push(d.x, d.y, d.z), m.push(A + E, 1 - x), b.push(c++);
      }
      h.push(b);
    }
    for (let f = 0; f < i; f++) for (let b = 0; b < n; b++) {
      const x = h[f][b + 1], E = h[f][b], D = h[f + 1][b], A = h[f + 1][b + 1];
      (f !== 0 || a > 0) && p.push(x, E, A), (f !== i - 1 || l < Math.PI) && p.push(E, D, A);
    }
    this.setIndex(p), this.setAttribute("position", new ht(M, 3)), this.setAttribute("normal", new ht(_, 3)), this.setAttribute("uv", new ht(m, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Ka(t.radius, t.widthSegments, t.heightSegments, t.phiStart, t.phiLength, t.thetaStart, t.thetaLength);
  }
}, uc = class Za extends Ht {
  constructor(t = 1, n = 0.4, i = 12, r = 48, s = Math.PI * 2) {
    super(), this.type = "TorusGeometry", this.parameters = {
      radius: t,
      tube: n,
      radialSegments: i,
      tubularSegments: r,
      arc: s
    }, i = Math.floor(i), r = Math.floor(r);
    const a = [], o = [], l = [], c = [], h = new U(), u = new U(), d = new U();
    for (let p = 0; p <= i; p++) for (let M = 0; M <= r; M++) {
      const _ = M / r * s, m = p / i * Math.PI * 2;
      u.x = (t + n * Math.cos(m)) * Math.cos(_), u.y = (t + n * Math.cos(m)) * Math.sin(_), u.z = n * Math.sin(m), o.push(u.x, u.y, u.z), h.x = t * Math.cos(_), h.y = t * Math.sin(_), d.subVectors(u, h).normalize(), l.push(d.x, d.y, d.z), c.push(M / r), c.push(p / i);
    }
    for (let p = 1; p <= i; p++) for (let M = 1; M <= r; M++) {
      const _ = (r + 1) * p + M - 1, m = (r + 1) * (p - 1) + M - 1, f = (r + 1) * (p - 1) + M, b = (r + 1) * p + M;
      a.push(_, m, b), a.push(m, f, b);
    }
    this.setIndex(a), this.setAttribute("position", new ht(o, 3)), this.setAttribute("normal", new ht(l, 3)), this.setAttribute("uv", new ht(c, 2));
  }
  copy(t) {
    return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
  }
  static fromJSON(t) {
    return new Za(t.radius, t.tube, t.radialSegments, t.tubularSegments, t.arc);
  }
}, Bs = class extends ti {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.type = "MeshStandardMaterial", this.defines = { STANDARD: "" }, this.color = new Be(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Be(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new Te(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new nn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}, dc = class extends ti {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = hl, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}, fc = class extends ti {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
};
function ki(e, t) {
  return !e || e.constructor === t ? e : typeof t.BYTES_PER_ELEMENT == "number" ? new t(e) : Array.prototype.slice.call(e);
}
function pc(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
var nr = class {
  constructor(e, t, n, i) {
    this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = i !== void 0 ? i : new t.constructor(n), this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
  }
  evaluate(e) {
    const t = this.parameterPositions;
    let n = this._cachedIndex, i = t[n], r = t[n - 1];
    n: {
      e: {
        let s;
        t: {
          i: if (!(e < i)) {
            for (let a = n + 2; ; ) {
              if (i === void 0) {
                if (e < r) break i;
                return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
              }
              if (n === a) break;
              if (r = i, i = t[++n], e < i) break e;
            }
            s = t.length;
            break t;
          }
          if (!(e >= r)) {
            const a = t[1];
            e < a && (n = 2, r = a);
            for (let o = n - 2; ; ) {
              if (r === void 0)
                return this._cachedIndex = 0, this.copySampleValue_(0);
              if (n === o) break;
              if (i = r, r = t[--n - 1], e >= r) break e;
            }
            s = n, n = 0;
            break t;
          }
          break n;
        }
        for (; n < s; ) {
          const a = n + s >>> 1;
          e < t[a] ? s = a : n = a + 1;
        }
        if (i = t[n], r = t[n - 1], r === void 0)
          return this._cachedIndex = 0, this.copySampleValue_(0);
        if (i === void 0)
          return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
      }
      this._cachedIndex = n, this.intervalChanged_(n, r, i);
    }
    return this.interpolate_(n, r, e, i);
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_;
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, n = this.sampleValues, i = this.valueSize, r = e * i;
    for (let s = 0; s !== i; ++s) t[s] = n[r + s];
    return t;
  }
  interpolate_() {
    throw new Error("call to abstract method");
  }
  intervalChanged_() {
  }
}, mc = class extends nr {
  constructor(e, t, n, i) {
    super(e, t, n, i), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
      endingStart: ds,
      endingEnd: ds
    };
  }
  intervalChanged_(e, t, n) {
    const i = this.parameterPositions;
    let r = e - 2, s = e + 1, a = i[r], o = i[s];
    if (a === void 0) switch (this.getSettings_().endingStart) {
      case fs:
        r = e, a = 2 * t - n;
        break;
      case ps:
        r = i.length - 2, a = t + i[r] - i[r + 1];
        break;
      default:
        r = e, a = n;
    }
    if (o === void 0) switch (this.getSettings_().endingEnd) {
      case fs:
        s = e, o = 2 * n - t;
        break;
      case ps:
        s = 1, o = n + i[1] - i[0];
        break;
      default:
        s = e - 1, o = t;
    }
    const l = (n - t) * 0.5, c = this.valueSize;
    this._weightPrev = l / (t - a), this._weightNext = l / (o - n), this._offsetPrev = r * c, this._offsetNext = s * c;
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = e * a, l = o - a, c = this._offsetPrev, h = this._offsetNext, u = this._weightPrev, d = this._weightNext, p = (n - t) / (i - t), M = p * p, _ = M * p, m = -u * _ + 2 * u * M - u * p, f = (1 + u) * _ + (-1.5 - 2 * u) * M + (-0.5 + u) * p + 1, b = (-1 - d) * _ + (1.5 + d) * M + 0.5 * p, x = d * _ - d * M;
    for (let E = 0; E !== a; ++E) r[E] = m * s[c + E] + f * s[l + E] + b * s[o + E] + x * s[h + E];
    return r;
  }
}, _c = class extends nr {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = e * a, l = o - a, c = (n - t) / (i - t), h = 1 - c;
    for (let u = 0; u !== a; ++u) r[u] = s[l + u] * h + s[o + u] * c;
    return r;
  }
}, gc = class extends nr {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1);
  }
}, Xt = class {
  constructor(e, t, n, i) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = ki(t, this.TimeBufferType), this.values = ki(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation);
  }
  static toJSON(e) {
    const t = e.constructor;
    let n;
    if (t.toJSON !== this.toJSON) n = t.toJSON(e);
    else {
      n = {
        name: e.name,
        times: ki(e.times, Array),
        values: ki(e.values, Array)
      };
      const i = e.getInterpolation();
      i !== e.DefaultInterpolation && (n.interpolation = i);
    }
    return n.type = e.ValueTypeName, n;
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new gc(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodLinear(e) {
    return new _c(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodSmooth(e) {
    return new mc(this.times, this.values, this.getValueSize(), e);
  }
  setInterpolation(e) {
    let t;
    switch (e) {
      case Ji:
        t = this.InterpolantFactoryMethodDiscrete;
        break;
      case Gr:
        t = this.InterpolantFactoryMethodLinear;
        break;
      case ar:
        t = this.InterpolantFactoryMethodSmooth;
        break;
    }
    if (t === void 0) {
      const n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === void 0) if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
      else throw new Error(n);
      return console.warn("THREE.KeyframeTrack:", n), this;
    }
    return this.createInterpolant = t, this;
  }
  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return Ji;
      case this.InterpolantFactoryMethodLinear:
        return Gr;
      case this.InterpolantFactoryMethodSmooth:
        return ar;
    }
  }
  getValueSize() {
    return this.values.length / this.times.length;
  }
  shift(e) {
    if (e !== 0) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n) t[n] += e;
    }
    return this;
  }
  scale(e) {
    if (e !== 1) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n) t[n] *= e;
    }
    return this;
  }
  trim(e, t) {
    const n = this.times, i = n.length;
    let r = 0, s = i - 1;
    for (; r !== i && n[r] < e; ) ++r;
    for (; s !== -1 && n[s] > t; ) --s;
    if (++s, r !== 0 || s !== i) {
      r >= s && (s = Math.max(s, 1), r = s - 1);
      const a = this.getValueSize();
      this.times = n.slice(r, s), this.values = this.values.slice(r * a, s * a);
    }
    return this;
  }
  validate() {
    let e = !0;
    const t = this.getValueSize();
    t - Math.floor(t) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), e = !1);
    const n = this.times, i = this.values, r = n.length;
    r === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), e = !1);
    let s = null;
    for (let a = 0; a !== r; a++) {
      const o = n[a];
      if (typeof o == "number" && isNaN(o)) {
        console.error("THREE.KeyframeTrack: Time is not a valid number.", this, a, o), e = !1;
        break;
      }
      if (s !== null && s > o) {
        console.error("THREE.KeyframeTrack: Out of order keys.", this, a, o, s), e = !1;
        break;
      }
      s = o;
    }
    if (i !== void 0 && pc(i))
      for (let a = 0, o = i.length; a !== o; ++a) {
        const l = i[a];
        if (isNaN(l)) {
          console.error("THREE.KeyframeTrack: Value is not a valid number.", this, a, l), e = !1;
          break;
        }
      }
    return e;
  }
  optimize() {
    const e = this.times.slice(), t = this.values.slice(), n = this.getValueSize(), i = this.getInterpolation() === ar, r = e.length - 1;
    let s = 1;
    for (let a = 1; a < r; ++a) {
      let o = !1;
      const l = e[a];
      if (l !== e[a + 1] && (a !== 1 || l !== e[0])) if (i)
        o = !0;
      else {
        const c = a * n, h = c - n, u = c + n;
        for (let d = 0; d !== n; ++d) {
          const p = t[c + d];
          if (p !== t[h + d] || p !== t[u + d]) {
            o = !0;
            break;
          }
        }
      }
      if (o) {
        if (a !== s) {
          e[s] = e[a];
          const c = a * n, h = s * n;
          for (let u = 0; u !== n; ++u) t[h + u] = t[c + u];
        }
        ++s;
      }
    }
    if (r > 0) {
      e[s] = e[r];
      for (let a = r * n, o = s * n, l = 0; l !== n; ++l) t[o + l] = t[a + l];
      ++s;
    }
    return s !== e.length ? (this.times = e.slice(0, s), this.values = t.slice(0, s * n)) : (this.times = e, this.values = t), this;
  }
  clone() {
    const e = this.times.slice(), t = this.values.slice(), n = this.constructor, i = new n(this.name, e, t);
    return i.createInterpolant = this.createInterpolant, i;
  }
};
Xt.prototype.ValueTypeName = "";
Xt.prototype.TimeBufferType = Float32Array;
Xt.prototype.ValueBufferType = Float32Array;
Xt.prototype.DefaultInterpolation = Gr;
var Mi = class extends Xt {
  constructor(e, t, n) {
    super(e, t, n);
  }
};
Mi.prototype.ValueTypeName = "bool";
Mi.prototype.ValueBufferType = Array;
Mi.prototype.DefaultInterpolation = Ji;
Mi.prototype.InterpolantFactoryMethodLinear = void 0;
Mi.prototype.InterpolantFactoryMethodSmooth = void 0;
var vc = class extends Xt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
};
vc.prototype.ValueTypeName = "color";
var Mc = class extends Xt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
};
Mc.prototype.ValueTypeName = "number";
var xc = class extends nr {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = (n - t) / (i - t);
    let l = e * a;
    for (let c = l + a; l !== c; l += 4) tn.slerpFlat(r, 0, s, l - a, s, l, o);
    return r;
  }
}, Ja = class extends Xt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  InterpolantFactoryMethodLinear(e) {
    return new xc(this.times, this.values, this.getValueSize(), e);
  }
};
Ja.prototype.ValueTypeName = "quaternion";
Ja.prototype.InterpolantFactoryMethodSmooth = void 0;
var xi = class extends Xt {
  constructor(e, t, n) {
    super(e, t, n);
  }
};
xi.prototype.ValueTypeName = "string";
xi.prototype.ValueBufferType = Array;
xi.prototype.DefaultInterpolation = Ji;
xi.prototype.InterpolantFactoryMethodLinear = void 0;
xi.prototype.InterpolantFactoryMethodSmooth = void 0;
var Sc = class extends Xt {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
};
Sc.prototype.ValueTypeName = "vector";
var yc = class {
  constructor(e, t, n) {
    const i = this;
    let r = !1, s = 0, a = 0, o;
    const l = [];
    this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this.abortController = new AbortController(), this.itemStart = function(c) {
      a++, r === !1 && i.onStart !== void 0 && i.onStart(c, s, a), r = !0;
    }, this.itemEnd = function(c) {
      s++, i.onProgress !== void 0 && i.onProgress(c, s, a), s === a && (r = !1, i.onLoad !== void 0 && i.onLoad());
    }, this.itemError = function(c) {
      i.onError !== void 0 && i.onError(c);
    }, this.resolveURL = function(c) {
      return o ? o(c) : c;
    }, this.setURLModifier = function(c) {
      return o = c, this;
    }, this.addHandler = function(c, h) {
      return l.push(c, h), this;
    }, this.removeHandler = function(c) {
      const h = l.indexOf(c);
      return h !== -1 && l.splice(h, 2), this;
    }, this.getHandler = function(c) {
      for (let h = 0, u = l.length; h < u; h += 2) {
        const d = l[h], p = l[h + 1];
        if (d.global && (d.lastIndex = 0), d.test(c)) return p;
      }
      return null;
    }, this.abort = function() {
      return this.abortController.abort(), this.abortController = new AbortController(), this;
    };
  }
}, Ec = /* @__PURE__ */ new yc(), Tc = class {
  constructor(e) {
    this.manager = e !== void 0 ? e : Ec, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
  }
  load() {
  }
  loadAsync(e, t) {
    const n = this;
    return new Promise(function(i, r) {
      n.load(e, i, t, r);
    });
  }
  parse() {
  }
  setCrossOrigin(e) {
    return this.crossOrigin = e, this;
  }
  setWithCredentials(e) {
    return this.withCredentials = e, this;
  }
  setPath(e) {
    return this.path = e, this;
  }
  setResourcePath(e) {
    return this.resourcePath = e, this;
  }
  setRequestHeader(e) {
    return this.requestHeader = e, this;
  }
  abort() {
    return this;
  }
};
Tc.DEFAULT_MATERIAL_NAME = "__DEFAULT";
var $a = class extends Tt {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Be(e), this.intensity = t;
  }
  dispose() {
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (t.object.target = this.target.uuid), t;
  }
}, bc = class extends $a {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(Tt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Be(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}, Dr = /* @__PURE__ */ new st(), zs = /* @__PURE__ */ new U(), Vs = /* @__PURE__ */ new U(), Ac = class {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Te(512, 512), this.mapType = $n, this.map = null, this.mapPass = null, this.matrix = new st(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new ns(), this._frameExtents = new Te(1, 1), this._viewportCount = 1, this._viewports = [new lt(0, 0, 1, 1)];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const t = this.camera, n = this.matrix;
    zs.setFromMatrixPosition(e.matrixWorld), t.position.copy(zs), Vs.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Vs), t.updateMatrixWorld(), Dr.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Dr, t.coordinateSystem, t.reversedDepth), t.reversedDepth ? n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1) : n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), n.multiply(Dr);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
}, Qa = class extends Na {
  constructor(e = -1, t = 1, n = 1, i = -1, r = 0.1, s = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = i, this.near = r, this.far = s, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  setViewOffset(e, t, n, i, r, s) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = s, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, i = (this.top + this.bottom) / 2;
    let r = n - e, s = n + e, a = i + t, o = i - t;
    if (this.view !== null && this.view.enabled) {
      const l = (this.right - this.left) / this.view.fullWidth / this.zoom, c = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += l * this.view.offsetX, s = r + l * this.view.width, a -= c * this.view.offsetY, o = a - c * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(r, s, a, o, this.near, this.far, this.coordinateSystem, this.reversedDepth), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}, wc = class extends Ac {
  constructor() {
    super(new Qa(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}, Hs = class extends $a {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(Tt.DEFAULT_UP), this.updateMatrix(), this.target = new Tt(), this.shadow = new wc();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}, Rc = class extends Lt {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.isMultiViewCamera = !1, this.cameras = e;
  }
}, is = "\\[\\]\\.:\\/", Cc = new RegExp("[" + is + "]", "g"), rs = "[^" + is + "]", Pc = "[^" + is.replace("\\.", "") + "]", Dc = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", rs), Lc = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", Pc), Uc = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", rs), Ic = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", rs), Nc = new RegExp("^" + Dc + Lc + Uc + Ic + "$"), Oc = [
  "material",
  "materials",
  "bones",
  "map"
], Fc = class {
  constructor(e, t, n) {
    const i = n || it.parseTrackName(t);
    this._targetGroup = e, this._bindings = e.subscribe_(t, i);
  }
  getValue(e, t) {
    this.bind();
    const n = this._targetGroup.nCachedObjects_, i = this._bindings[n];
    i !== void 0 && i.getValue(e, t);
  }
  setValue(e, t) {
    const n = this._bindings;
    for (let i = this._targetGroup.nCachedObjects_, r = n.length; i !== r; ++i) n[i].setValue(e, t);
  }
  bind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].bind();
  }
  unbind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t) e[t].unbind();
  }
}, it = class jn {
  constructor(t, n, i) {
    this.path = n, this.parsedPath = i || jn.parseTrackName(n), this.node = jn.findNode(t, this.parsedPath.nodeName), this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(t, n, i) {
    return t && t.isAnimationObjectGroup ? new jn.Composite(t, n, i) : new jn(t, n, i);
  }
  static sanitizeNodeName(t) {
    return t.replace(/\s/g, "_").replace(Cc, "");
  }
  static parseTrackName(t) {
    const n = Nc.exec(t);
    if (n === null) throw new Error("PropertyBinding: Cannot parse trackName: " + t);
    const i = {
      nodeName: n[2],
      objectName: n[3],
      objectIndex: n[4],
      propertyName: n[5],
      propertyIndex: n[6]
    }, r = i.nodeName && i.nodeName.lastIndexOf(".");
    if (r !== void 0 && r !== -1) {
      const s = i.nodeName.substring(r + 1);
      Oc.indexOf(s) !== -1 && (i.nodeName = i.nodeName.substring(0, r), i.objectName = s);
    }
    if (i.propertyName === null || i.propertyName.length === 0) throw new Error("PropertyBinding: can not parse propertyName from trackName: " + t);
    return i;
  }
  static findNode(t, n) {
    if (n === void 0 || n === "" || n === "." || n === -1 || n === t.name || n === t.uuid) return t;
    if (t.skeleton) {
      const i = t.skeleton.getBoneByName(n);
      if (i !== void 0) return i;
    }
    if (t.children) {
      const i = function(s) {
        for (let a = 0; a < s.length; a++) {
          const o = s[a];
          if (o.name === n || o.uuid === n) return o;
          const l = i(o.children);
          if (l) return l;
        }
        return null;
      }, r = i(t.children);
      if (r) return r;
    }
    return null;
  }
  _getValue_unavailable() {
  }
  _setValue_unavailable() {
  }
  _getValue_direct(t, n) {
    t[n] = this.targetObject[this.propertyName];
  }
  _getValue_array(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) t[n++] = i[r];
  }
  _getValue_arrayElement(t, n) {
    t[n] = this.resolvedProperty[this.propertyIndex];
  }
  _getValue_toArray(t, n) {
    this.resolvedProperty.toArray(t, n);
  }
  _setValue_direct(t, n) {
    this.targetObject[this.propertyName] = t[n];
  }
  _setValue_direct_setNeedsUpdate(t, n) {
    this.targetObject[this.propertyName] = t[n], this.targetObject.needsUpdate = !0;
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(t, n) {
    this.targetObject[this.propertyName] = t[n], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_array(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) i[r] = t[n++];
  }
  _setValue_array_setNeedsUpdate(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) i[r] = t[n++];
    this.targetObject.needsUpdate = !0;
  }
  _setValue_array_setMatrixWorldNeedsUpdate(t, n) {
    const i = this.resolvedProperty;
    for (let r = 0, s = i.length; r !== s; ++r) i[r] = t[n++];
    this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_arrayElement(t, n) {
    this.resolvedProperty[this.propertyIndex] = t[n];
  }
  _setValue_arrayElement_setNeedsUpdate(t, n) {
    this.resolvedProperty[this.propertyIndex] = t[n], this.targetObject.needsUpdate = !0;
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(t, n) {
    this.resolvedProperty[this.propertyIndex] = t[n], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _setValue_fromArray(t, n) {
    this.resolvedProperty.fromArray(t, n);
  }
  _setValue_fromArray_setNeedsUpdate(t, n) {
    this.resolvedProperty.fromArray(t, n), this.targetObject.needsUpdate = !0;
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(t, n) {
    this.resolvedProperty.fromArray(t, n), this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _getValue_unbound(t, n) {
    this.bind(), this.getValue(t, n);
  }
  _setValue_unbound(t, n) {
    this.bind(), this.setValue(t, n);
  }
  bind() {
    let t = this.node;
    const n = this.parsedPath, i = n.objectName, r = n.propertyName;
    let s = n.propertyIndex;
    if (t || (t = jn.findNode(this.rootNode, n.nodeName), this.node = t), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !t) {
      console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
      return;
    }
    if (i) {
      let c = n.objectIndex;
      switch (i) {
        case "materials":
          if (!t.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.materials) {
            console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
            return;
          }
          t = t.material.materials;
          break;
        case "bones":
          if (!t.skeleton) {
            console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
            return;
          }
          t = t.skeleton.bones;
          for (let h = 0; h < t.length; h++) if (t[h].name === c) {
            c = h;
            break;
          }
          break;
        case "map":
          if ("map" in t) {
            t = t.map;
            break;
          }
          if (!t.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!t.material.map) {
            console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
            return;
          }
          t = t.material.map;
          break;
        default:
          if (t[i] === void 0) {
            console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
            return;
          }
          t = t[i];
      }
      if (c !== void 0) {
        if (t[c] === void 0) {
          console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
          return;
        }
        t = t[c];
      }
    }
    const a = t[r];
    if (a === void 0) {
      const c = n.nodeName;
      console.error("THREE.PropertyBinding: Trying to update property for track: " + c + "." + r + " but it wasn't found.", t);
      return;
    }
    let o = this.Versioning.None;
    this.targetObject = t, t.isMaterial === !0 ? o = this.Versioning.NeedsUpdate : t.isObject3D === !0 && (o = this.Versioning.MatrixWorldNeedsUpdate);
    let l = this.BindingType.Direct;
    if (s !== void 0) {
      if (r === "morphTargetInfluences") {
        if (!t.geometry) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
          return;
        }
        if (!t.geometry.morphAttributes) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
          return;
        }
        t.morphTargetDictionary[s] !== void 0 && (s = t.morphTargetDictionary[s]);
      }
      l = this.BindingType.ArrayElement, this.resolvedProperty = a, this.propertyIndex = s;
    } else a.fromArray !== void 0 && a.toArray !== void 0 ? (l = this.BindingType.HasFromToArray, this.resolvedProperty = a) : Array.isArray(a) ? (l = this.BindingType.EntireArray, this.resolvedProperty = a) : this.propertyName = r;
    this.getValue = this.GetterByBindingType[l], this.setValue = this.SetterByBindingTypeAndVersioning[l][o];
  }
  unbind() {
    this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
};
it.Composite = Fc;
it.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
it.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
it.prototype.GetterByBindingType = [
  it.prototype._getValue_direct,
  it.prototype._getValue_array,
  it.prototype._getValue_arrayElement,
  it.prototype._getValue_toArray
];
it.prototype.SetterByBindingTypeAndVersioning = [
  [
    it.prototype._setValue_direct,
    it.prototype._setValue_direct_setNeedsUpdate,
    it.prototype._setValue_direct_setMatrixWorldNeedsUpdate
  ],
  [
    it.prototype._setValue_array,
    it.prototype._setValue_array_setNeedsUpdate,
    it.prototype._setValue_array_setMatrixWorldNeedsUpdate
  ],
  [
    it.prototype._setValue_arrayElement,
    it.prototype._setValue_arrayElement_setNeedsUpdate,
    it.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
  ],
  [
    it.prototype._setValue_fromArray,
    it.prototype._setValue_fromArray_setNeedsUpdate,
    it.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
  ]
];
var Gs = /* @__PURE__ */ new st(), Bc = class {
  constructor(e, t, n = 0, i = 1 / 0) {
    this.ray = new Qr(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new es(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  set(e, t) {
    this.ray.set(e, t);
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type);
  }
  setFromXRController(e) {
    return Gs.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Gs), this;
  }
  intersectObject(e, t = !0, n = []) {
    return Wr(e, this, n, t), n.sort(ks), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let i = 0, r = e.length; i < r; i++) Wr(e[i], this, n, t);
    return n.sort(ks), n;
  }
};
function ks(e, t) {
  return e.distance - t.distance;
}
function Wr(e, t, n, i) {
  let r = !0;
  if (e.layers.test(t.layers) && e.raycast(t, n) === !1 && (r = !1), r === !0 && i === !0) {
    const s = e.children;
    for (let a = 0, o = s.length; a < o; a++) Wr(s[a], t, n, !0);
  }
}
var Ws = class {
  constructor(e = 1, t = 0, n = 0) {
    this.radius = e, this.phi = t, this.theta = n;
  }
  set(e, t, n) {
    return this.radius = e, this.phi = t, this.theta = n, this;
  }
  copy(e) {
    return this.radius = e.radius, this.phi = e.phi, this.theta = e.theta, this;
  }
  makeSafe() {
    return this.phi = Oe(this.phi, 1e-6, Math.PI - 1e-6), this;
  }
  setFromVector3(e) {
    return this.setFromCartesianCoords(e.x, e.y, e.z);
  }
  setFromCartesianCoords(e, t, n) {
    return this.radius = Math.sqrt(e * e + t * t + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(e, n), this.phi = Math.acos(Oe(t / this.radius, -1, 1))), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}, zc = class extends An {
  constructor(e, t = null) {
    super(), this.object = e, this.domElement = t, this.enabled = !0, this.state = -1, this.keys = {}, this.mouseButtons = {
      LEFT: null,
      MIDDLE: null,
      RIGHT: null
    }, this.touches = {
      ONE: null,
      TWO: null
    };
  }
  connect(e) {
    if (e === void 0) {
      console.warn("THREE.Controls: connect() now requires an element.");
      return;
    }
    this.domElement !== null && this.disconnect(), this.domElement = e;
  }
  disconnect() {
  }
  dispose() {
  }
  update() {
  }
};
function Xs(e, t, n, i) {
  const r = Vc(i);
  switch (n) {
    case bo:
      return e * t;
    case wo:
      return e * t / r.components * r.byteLength;
    case Ro:
      return e * t / r.components * r.byteLength;
    case Co:
      return e * t * 2 / r.components * r.byteLength;
    case Po:
      return e * t * 2 / r.components * r.byteLength;
    case Ao:
      return e * t * 3 / r.components * r.byteLength;
    case pi:
      return e * t * 4 / r.components * r.byteLength;
    case Do:
      return e * t * 4 / r.components * r.byteLength;
    case Lo:
    case Uo:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Io:
    case No:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Fo:
    case zo:
      return Math.max(e, 16) * Math.max(t, 8) / 4;
    case Oo:
    case Bo:
      return Math.max(e, 8) * Math.max(t, 8) / 2;
    case Vo:
    case Ho:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 8;
    case Go:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case ko:
      return Math.floor((e + 3) / 4) * Math.floor((t + 3) / 4) * 16;
    case Wo:
      return Math.floor((e + 4) / 5) * Math.floor((t + 3) / 4) * 16;
    case Xo:
      return Math.floor((e + 4) / 5) * Math.floor((t + 4) / 5) * 16;
    case Yo:
      return Math.floor((e + 5) / 6) * Math.floor((t + 4) / 5) * 16;
    case qo:
      return Math.floor((e + 5) / 6) * Math.floor((t + 5) / 6) * 16;
    case jo:
      return Math.floor((e + 7) / 8) * Math.floor((t + 4) / 5) * 16;
    case Ko:
      return Math.floor((e + 7) / 8) * Math.floor((t + 5) / 6) * 16;
    case Zo:
      return Math.floor((e + 7) / 8) * Math.floor((t + 7) / 8) * 16;
    case Jo:
      return Math.floor((e + 9) / 10) * Math.floor((t + 4) / 5) * 16;
    case $o:
      return Math.floor((e + 9) / 10) * Math.floor((t + 5) / 6) * 16;
    case Qo:
      return Math.floor((e + 9) / 10) * Math.floor((t + 7) / 8) * 16;
    case el:
      return Math.floor((e + 9) / 10) * Math.floor((t + 9) / 10) * 16;
    case tl:
      return Math.floor((e + 11) / 12) * Math.floor((t + 9) / 10) * 16;
    case nl:
      return Math.floor((e + 11) / 12) * Math.floor((t + 11) / 12) * 16;
    case il:
    case rl:
    case sl:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
    case al:
    case ol:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 8;
    case ll:
    case cl:
      return Math.ceil(e / 4) * Math.ceil(t / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${n} format.`);
}
function Vc(e) {
  switch (e) {
    case $n:
    case _o:
      return {
        byteLength: 1,
        components: 1
      };
    case vo:
    case go:
    case Kr:
      return {
        byteLength: 2,
        components: 1
      };
    case xo:
    case So:
      return {
        byteLength: 2,
        components: 4
      };
    case qr:
    case Mo:
    case jr:
      return {
        byteLength: 4,
        components: 1
      };
    case Eo:
    case To:
      return {
        byteLength: 4,
        components: 3
      };
  }
  throw new Error(`Unknown texture type ${e}.`);
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "180" } }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "180");
function eo() {
  let e = null, t = !1, n = null, i = null;
  function r(s, a) {
    n(s, a), i = e.requestAnimationFrame(r);
  }
  return {
    start: function() {
      t !== !0 && n !== null && (i = e.requestAnimationFrame(r), t = !0);
    },
    stop: function() {
      e.cancelAnimationFrame(i), t = !1;
    },
    setAnimationLoop: function(s) {
      n = s;
    },
    setContext: function(s) {
      e = s;
    }
  };
}
function Hc(e) {
  const t = /* @__PURE__ */ new WeakMap();
  function n(o, l) {
    const c = o.array, h = o.usage, u = c.byteLength, d = e.createBuffer();
    e.bindBuffer(l, d), e.bufferData(l, c, h), o.onUploadCallback();
    let p;
    if (c instanceof Float32Array) p = e.FLOAT;
    else if (typeof Float16Array < "u" && c instanceof Float16Array) p = e.HALF_FLOAT;
    else if (c instanceof Uint16Array) o.isFloat16BufferAttribute ? p = e.HALF_FLOAT : p = e.UNSIGNED_SHORT;
    else if (c instanceof Int16Array) p = e.SHORT;
    else if (c instanceof Uint32Array) p = e.UNSIGNED_INT;
    else if (c instanceof Int32Array) p = e.INT;
    else if (c instanceof Int8Array) p = e.BYTE;
    else if (c instanceof Uint8Array) p = e.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray) p = e.UNSIGNED_BYTE;
    else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: d,
      type: p,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: u
    };
  }
  function i(o, l, c) {
    const h = l.array, u = l.updateRanges;
    if (e.bindBuffer(c, o), u.length === 0) e.bufferSubData(c, 0, h);
    else {
      u.sort((p, M) => p.start - M.start);
      let d = 0;
      for (let p = 1; p < u.length; p++) {
        const M = u[d], _ = u[p];
        _.start <= M.start + M.count + 1 ? M.count = Math.max(M.count, _.start + _.count - M.start) : (++d, u[d] = _);
      }
      u.length = d + 1;
      for (let p = 0, M = u.length; p < M; p++) {
        const _ = u[p];
        e.bufferSubData(c, _.start * h.BYTES_PER_ELEMENT, h, _.start, _.count);
      }
      l.clearUpdateRanges();
    }
    l.onUploadCallback();
  }
  function r(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), t.get(o);
  }
  function s(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = t.get(o);
    l && (e.deleteBuffer(l.buffer), t.delete(o));
  }
  function a(o, l) {
    if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
      const h = t.get(o);
      (!h || h.version < o.version) && t.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return;
    }
    const c = t.get(o);
    if (c === void 0) t.set(o, n(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength) throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      i(c.buffer, o, l), c.version = o.version;
    }
  }
  return {
    get: r,
    remove: s,
    update: a
  };
}
var Ue = {
  alphahash_fragment: `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,
  alphahash_pars_fragment: `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,
  alphamap_fragment: `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,
  alphamap_pars_fragment: `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  alphatest_fragment: `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,
  alphatest_pars_fragment: `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,
  aomap_fragment: `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,
  aomap_pars_fragment: `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,
  batching_pars_vertex: `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,
  batching_vertex: `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,
  begin_vertex: `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,
  beginnormal_vertex: `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,
  bsdfs: `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,
  iridescence_fragment: `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,
  bumpmap_pars_fragment: `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,
  clipping_planes_fragment: `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,
  clipping_planes_pars_fragment: `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,
  clipping_planes_pars_vertex: `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,
  clipping_planes_vertex: `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,
  color_fragment: `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,
  color_pars_fragment: `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,
  color_pars_vertex: `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,
  color_vertex: `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,
  common: `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,
  cube_uv_reflection_fragment: `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,
  defaultnormal_vertex: `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,
  displacementmap_pars_vertex: `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,
  displacementmap_vertex: `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,
  emissivemap_fragment: `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,
  emissivemap_pars_fragment: `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,
  colorspace_fragment: "gl_FragColor = linearToOutputTexel( gl_FragColor );",
  colorspace_pars_fragment: `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,
  envmap_fragment: `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,
  envmap_common_pars_fragment: `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,
  envmap_pars_fragment: `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,
  envmap_pars_vertex: `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,
  envmap_physical_pars_fragment: `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,
  envmap_vertex: `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,
  fog_vertex: `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,
  fog_pars_vertex: `#ifdef USE_FOG
	varying float vFogDepth;
#endif`,
  fog_fragment: `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,
  fog_pars_fragment: `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,
  gradientmap_pars_fragment: `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,
  lightmap_pars_fragment: `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,
  lights_lambert_fragment: `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,
  lights_lambert_pars_fragment: `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,
  lights_pars_begin: `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,
  lights_toon_fragment: `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,
  lights_toon_pars_fragment: `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,
  lights_phong_fragment: `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,
  lights_phong_pars_fragment: `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,
  lights_physical_fragment: `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,
  lights_physical_pars_fragment: `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,
  lights_fragment_begin: `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,
  lights_fragment_maps: `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,
  lights_fragment_end: `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,
  logdepthbuf_fragment: `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,
  logdepthbuf_pars_fragment: `#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  logdepthbuf_pars_vertex: `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,
  logdepthbuf_vertex: `#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,
  map_fragment: `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,
  map_pars_fragment: `#ifdef USE_MAP
	uniform sampler2D map;
#endif`,
  map_particle_fragment: `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,
  map_particle_pars_fragment: `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,
  metalnessmap_fragment: `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,
  metalnessmap_pars_fragment: `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,
  morphinstance_vertex: `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,
  morphcolor_vertex: `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,
  morphnormal_vertex: `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  morphtarget_pars_vertex: `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,
  morphtarget_vertex: `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,
  normal_fragment_begin: `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,
  normal_fragment_maps: `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,
  normal_pars_fragment: `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  normal_pars_vertex: `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,
  normal_vertex: `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,
  normalmap_pars_fragment: `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,
  clearcoat_normal_fragment_begin: `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,
  clearcoat_normal_fragment_maps: `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,
  clearcoat_pars_fragment: `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,
  iridescence_pars_fragment: `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,
  opaque_fragment: `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
  packing: `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,
  premultiplied_alpha_fragment: `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,
  project_vertex: `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
  dithering_fragment: `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,
  dithering_pars_fragment: `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,
  roughnessmap_fragment: `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,
  roughnessmap_pars_fragment: `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,
  shadowmap_pars_fragment: `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,
  shadowmap_pars_vertex: `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,
  shadowmap_vertex: `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,
  shadowmask_pars_fragment: `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,
  skinbase_vertex: `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,
  skinning_pars_vertex: `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,
  skinning_vertex: `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,
  skinnormal_vertex: `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,
  specularmap_fragment: `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,
  specularmap_pars_fragment: `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,
  tonemapping_fragment: `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,
  tonemapping_pars_fragment: `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,
  transmission_fragment: `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,
  transmission_pars_fragment: `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,
  uv_pars_fragment: `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  uv_pars_vertex: `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,
  uv_vertex: `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,
  worldpos_vertex: `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,
  background_vert: `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,
  background_frag: `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  backgroundCube_vert: `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  backgroundCube_frag: `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  cube_vert: `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,
  cube_frag: `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  depth_vert: `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,
  depth_frag: `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,
  distanceRGBA_vert: `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,
  distanceRGBA_frag: `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,
  equirect_vert: `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,
  equirect_frag: `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,
  linedashed_vert: `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  linedashed_frag: `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  meshbasic_vert: `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,
  meshbasic_frag: `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshlambert_vert: `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  meshlambert_frag: `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshmatcap_vert: `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,
  meshmatcap_frag: `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshnormal_vert: `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,
  meshnormal_frag: `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,
  meshphong_vert: `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  meshphong_frag: `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshphysical_vert: `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,
  meshphysical_frag: `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  meshtoon_vert: `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  meshtoon_frag: `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  points_vert: `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,
  points_frag: `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,
  shadow_vert: `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,
  shadow_frag: `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,
  sprite_vert: `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,
  sprite_frag: `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`
}, se = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Be(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ne() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ne() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Ne() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Ne() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    ior: { value: 1.5 },
    refractionRatio: { value: 0.98 }
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new Ne() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Ne() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Ne() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Ne() },
    normalScale: { value: /* @__PURE__ */ new Te(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Ne() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Ne() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Ne() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Ne() }
  },
  gradientmap: { gradientMap: { value: null } },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Be(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: {
      value: [],
      properties: {
        direction: {},
        color: {}
      }
    },
    directionalLightShadows: {
      value: [],
      properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {}
      }
    },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        direction: {},
        distance: {},
        coneCos: {},
        penumbraCos: {},
        decay: {}
      }
    },
    spotLightShadows: {
      value: [],
      properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {}
      }
    },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        decay: {},
        distance: {}
      }
    },
    pointLightShadows: {
      value: [],
      properties: {
        shadowIntensity: 1,
        shadowBias: {},
        shadowNormalBias: {},
        shadowRadius: {},
        shadowMapSize: {},
        shadowCameraNear: {},
        shadowCameraFar: {}
      }
    },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: {
      value: [],
      properties: {
        direction: {},
        skyColor: {},
        groundColor: {}
      }
    },
    rectAreaLights: {
      value: [],
      properties: {
        color: {},
        position: {},
        width: {},
        height: {}
      }
    },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new Be(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ne() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Ne() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Be(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Te(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ne() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ne() },
    alphaTest: { value: 0 }
  }
}, Wt = {
  basic: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.specularmap,
      se.envmap,
      se.aomap,
      se.lightmap,
      se.fog
    ]),
    vertexShader: Ue.meshbasic_vert,
    fragmentShader: Ue.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.specularmap,
      se.envmap,
      se.aomap,
      se.lightmap,
      se.emissivemap,
      se.bumpmap,
      se.normalmap,
      se.displacementmap,
      se.fog,
      se.lights,
      { emissive: { value: /* @__PURE__ */ new Be(0) } }
    ]),
    vertexShader: Ue.meshlambert_vert,
    fragmentShader: Ue.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.specularmap,
      se.envmap,
      se.aomap,
      se.lightmap,
      se.emissivemap,
      se.bumpmap,
      se.normalmap,
      se.displacementmap,
      se.fog,
      se.lights,
      {
        emissive: { value: /* @__PURE__ */ new Be(0) },
        specular: { value: /* @__PURE__ */ new Be(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Ue.meshphong_vert,
    fragmentShader: Ue.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.envmap,
      se.aomap,
      se.lightmap,
      se.emissivemap,
      se.bumpmap,
      se.normalmap,
      se.displacementmap,
      se.roughnessmap,
      se.metalnessmap,
      se.fog,
      se.lights,
      {
        emissive: { value: /* @__PURE__ */ new Be(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Ue.meshphysical_vert,
    fragmentShader: Ue.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.aomap,
      se.lightmap,
      se.emissivemap,
      se.bumpmap,
      se.normalmap,
      se.displacementmap,
      se.gradientmap,
      se.fog,
      se.lights,
      { emissive: { value: /* @__PURE__ */ new Be(0) } }
    ]),
    vertexShader: Ue.meshtoon_vert,
    fragmentShader: Ue.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.bumpmap,
      se.normalmap,
      se.displacementmap,
      se.fog,
      { matcap: { value: null } }
    ]),
    vertexShader: Ue.meshmatcap_vert,
    fragmentShader: Ue.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ yt([se.points, se.fog]),
    vertexShader: Ue.points_vert,
    fragmentShader: Ue.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Ue.linedashed_vert,
    fragmentShader: Ue.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ yt([se.common, se.displacementmap]),
    vertexShader: Ue.depth_vert,
    fragmentShader: Ue.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.bumpmap,
      se.normalmap,
      se.displacementmap,
      { opacity: { value: 1 } }
    ]),
    vertexShader: Ue.meshnormal_vert,
    fragmentShader: Ue.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ yt([se.sprite, se.fog]),
    vertexShader: Ue.sprite_vert,
    fragmentShader: Ue.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Ne() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Ue.background_vert,
    fragmentShader: Ue.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Ne() }
    },
    vertexShader: Ue.backgroundCube_vert,
    fragmentShader: Ue.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Ue.cube_vert,
    fragmentShader: Ue.cube_frag
  },
  equirect: {
    uniforms: { tEquirect: { value: null } },
    vertexShader: Ue.equirect_vert,
    fragmentShader: Ue.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ yt([
      se.common,
      se.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new U() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Ue.distanceRGBA_vert,
    fragmentShader: Ue.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ yt([
      se.lights,
      se.fog,
      {
        color: { value: /* @__PURE__ */ new Be(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ue.shadow_vert,
    fragmentShader: Ue.shadow_frag
  }
};
Wt.physical = {
  uniforms: /* @__PURE__ */ yt([Wt.standard.uniforms, {
    clearcoat: { value: 0 },
    clearcoatMap: { value: null },
    clearcoatMapTransform: { value: /* @__PURE__ */ new Ne() },
    clearcoatNormalMap: { value: null },
    clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Ne() },
    clearcoatNormalScale: { value: /* @__PURE__ */ new Te(1, 1) },
    clearcoatRoughness: { value: 0 },
    clearcoatRoughnessMap: { value: null },
    clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Ne() },
    dispersion: { value: 0 },
    iridescence: { value: 0 },
    iridescenceMap: { value: null },
    iridescenceMapTransform: { value: /* @__PURE__ */ new Ne() },
    iridescenceIOR: { value: 1.3 },
    iridescenceThicknessMinimum: { value: 100 },
    iridescenceThicknessMaximum: { value: 400 },
    iridescenceThicknessMap: { value: null },
    iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Ne() },
    sheen: { value: 0 },
    sheenColor: { value: /* @__PURE__ */ new Be(0) },
    sheenColorMap: { value: null },
    sheenColorMapTransform: { value: /* @__PURE__ */ new Ne() },
    sheenRoughness: { value: 1 },
    sheenRoughnessMap: { value: null },
    sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Ne() },
    transmission: { value: 0 },
    transmissionMap: { value: null },
    transmissionMapTransform: { value: /* @__PURE__ */ new Ne() },
    transmissionSamplerSize: { value: /* @__PURE__ */ new Te() },
    transmissionSamplerMap: { value: null },
    thickness: { value: 0 },
    thicknessMap: { value: null },
    thicknessMapTransform: { value: /* @__PURE__ */ new Ne() },
    attenuationDistance: { value: 0 },
    attenuationColor: { value: /* @__PURE__ */ new Be(0) },
    specularColor: { value: /* @__PURE__ */ new Be(1, 1, 1) },
    specularColorMap: { value: null },
    specularColorMapTransform: { value: /* @__PURE__ */ new Ne() },
    specularIntensity: { value: 1 },
    specularIntensityMap: { value: null },
    specularIntensityMapTransform: { value: /* @__PURE__ */ new Ne() },
    anisotropyVector: { value: /* @__PURE__ */ new Te() },
    anisotropyMap: { value: null },
    anisotropyMapTransform: { value: /* @__PURE__ */ new Ne() }
  }]),
  vertexShader: Ue.meshphysical_vert,
  fragmentShader: Ue.meshphysical_frag
};
var Wi = {
  r: 0,
  b: 0,
  g: 0
}, Mn = /* @__PURE__ */ new nn(), Gc = /* @__PURE__ */ new st();
function kc(e, t, n, i, r, s, a) {
  const o = new Be(0);
  let l = s === !0 ? 0 : 1, c, h, u = null, d = 0, p = null;
  function M(x) {
    let E = x.isScene === !0 ? x.background : null;
    return E && E.isTexture && (E = (x.backgroundBlurriness > 0 ? n : t).get(E)), E;
  }
  function _(x) {
    let E = !1;
    const D = M(x);
    D === null ? f(o, l) : D && D.isColor && (f(D, 1), E = !0);
    const A = e.xr.getEnvironmentBlendMode();
    A === "additive" ? i.buffers.color.setClear(0, 0, 0, 1, a) : A === "alpha-blend" && i.buffers.color.setClear(0, 0, 0, 0, a), (e.autoClear || E) && (i.buffers.depth.setTest(!0), i.buffers.depth.setMask(!0), i.buffers.color.setMask(!0), e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil));
  }
  function m(x, E) {
    const D = M(E);
    D && (D.isCubeTexture || D.mapping === 306) ? (h === void 0 && (h = new xt(new tr(1, 1, 1), new dn({
      name: "BackgroundCubeMaterial",
      uniforms: ei(Wt.backgroundCube.uniforms),
      vertexShader: Wt.backgroundCube.vertexShader,
      fragmentShader: Wt.backgroundCube.fragmentShader,
      side: 1,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(A, P, N) {
      this.matrixWorld.copyPosition(N.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", { get: function() {
      return this.uniforms.envMap.value;
    } }), r.update(h)), Mn.copy(E.backgroundRotation), Mn.x *= -1, Mn.y *= -1, Mn.z *= -1, D.isCubeTexture && D.isRenderTargetTexture === !1 && (Mn.y *= -1, Mn.z *= -1), h.material.uniforms.envMap.value = D, h.material.uniforms.flipEnvMap.value = D.isCubeTexture && D.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = E.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Gc.makeRotationFromEuler(Mn)), h.material.toneMapped = ke.getTransfer(D.colorSpace) !== Qi, (u !== D || d !== D.version || p !== e.toneMapping) && (h.material.needsUpdate = !0, u = D, d = D.version, p = e.toneMapping), h.layers.enableAll(), x.unshift(h, h.geometry, h.material, 0, 0, null)) : D && D.isTexture && (c === void 0 && (c = new xt(new qa(2, 2), new dn({
      name: "BackgroundMaterial",
      uniforms: ei(Wt.background.uniforms),
      vertexShader: Wt.background.vertexShader,
      fragmentShader: Wt.background.fragmentShader,
      side: 0,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", { get: function() {
      return this.uniforms.t2D.value;
    } }), r.update(c)), c.material.uniforms.t2D.value = D, c.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, c.material.toneMapped = ke.getTransfer(D.colorSpace) !== Qi, D.matrixAutoUpdate === !0 && D.updateMatrix(), c.material.uniforms.uvTransform.value.copy(D.matrix), (u !== D || d !== D.version || p !== e.toneMapping) && (c.material.needsUpdate = !0, u = D, d = D.version, p = e.toneMapping), c.layers.enableAll(), x.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function f(x, E) {
    x.getRGB(Wi, Ia(e)), i.buffers.color.setClear(Wi.r, Wi.g, Wi.b, E, a);
  }
  function b() {
    h !== void 0 && (h.geometry.dispose(), h.material.dispose(), h = void 0), c !== void 0 && (c.geometry.dispose(), c.material.dispose(), c = void 0);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(x, E = 1) {
      o.set(x), l = E, f(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(x) {
      l = x, f(o, l);
    },
    render: _,
    addToRenderList: m,
    dispose: b
  };
}
function Wc(e, t) {
  const n = e.getParameter(e.MAX_VERTEX_ATTRIBS), i = {}, r = d(null);
  let s = r, a = !1;
  function o(S, w, F, H, V) {
    let j = !1;
    const k = u(H, F, w);
    s !== k && (s = k, c(s.object)), j = p(S, H, F, V), j && M(S, H, F, V), V !== null && t.update(V, e.ELEMENT_ARRAY_BUFFER), (j || a) && (a = !1, E(S, w, F, H), V !== null && e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, t.get(V).buffer));
  }
  function l() {
    return e.createVertexArray();
  }
  function c(S) {
    return e.bindVertexArray(S);
  }
  function h(S) {
    return e.deleteVertexArray(S);
  }
  function u(S, w, F) {
    const H = F.wireframe === !0;
    let V = i[S.id];
    V === void 0 && (V = {}, i[S.id] = V);
    let j = V[w.id];
    j === void 0 && (j = {}, V[w.id] = j);
    let k = j[H];
    return k === void 0 && (k = d(l()), j[H] = k), k;
  }
  function d(S) {
    const w = [], F = [], H = [];
    for (let V = 0; V < n; V++)
      w[V] = 0, F[V] = 0, H[V] = 0;
    return {
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: w,
      enabledAttributes: F,
      attributeDivisors: H,
      object: S,
      attributes: {},
      index: null
    };
  }
  function p(S, w, F, H) {
    const V = s.attributes, j = w.attributes;
    let k = 0;
    const J = F.getAttributes();
    for (const W in J) if (J[W].location >= 0) {
      const ee = V[W];
      let he = j[W];
      if (he === void 0 && (W === "instanceMatrix" && S.instanceMatrix && (he = S.instanceMatrix), W === "instanceColor" && S.instanceColor && (he = S.instanceColor)), ee === void 0 || ee.attribute !== he || he && ee.data !== he.data) return !0;
      k++;
    }
    return s.attributesNum !== k || s.index !== H;
  }
  function M(S, w, F, H) {
    const V = {}, j = w.attributes;
    let k = 0;
    const J = F.getAttributes();
    for (const W in J) if (J[W].location >= 0) {
      let ee = j[W];
      ee === void 0 && (W === "instanceMatrix" && S.instanceMatrix && (ee = S.instanceMatrix), W === "instanceColor" && S.instanceColor && (ee = S.instanceColor));
      const he = {};
      he.attribute = ee, ee && ee.data && (he.data = ee.data), V[W] = he, k++;
    }
    s.attributes = V, s.attributesNum = k, s.index = H;
  }
  function _() {
    const S = s.newAttributes;
    for (let w = 0, F = S.length; w < F; w++) S[w] = 0;
  }
  function m(S) {
    f(S, 0);
  }
  function f(S, w) {
    const F = s.newAttributes, H = s.enabledAttributes, V = s.attributeDivisors;
    F[S] = 1, H[S] === 0 && (e.enableVertexAttribArray(S), H[S] = 1), V[S] !== w && (e.vertexAttribDivisor(S, w), V[S] = w);
  }
  function b() {
    const S = s.newAttributes, w = s.enabledAttributes;
    for (let F = 0, H = w.length; F < H; F++) w[F] !== S[F] && (e.disableVertexAttribArray(F), w[F] = 0);
  }
  function x(S, w, F, H, V, j, k) {
    k === !0 ? e.vertexAttribIPointer(S, w, F, V, j) : e.vertexAttribPointer(S, w, F, H, V, j);
  }
  function E(S, w, F, H) {
    _();
    const V = H.attributes, j = F.getAttributes(), k = w.defaultAttributeValues;
    for (const J in j) {
      const W = j[J];
      if (W.location >= 0) {
        let ee = V[J];
        if (ee === void 0 && (J === "instanceMatrix" && S.instanceMatrix && (ee = S.instanceMatrix), J === "instanceColor" && S.instanceColor && (ee = S.instanceColor)), ee !== void 0) {
          const he = ee.normalized, Le = ee.itemSize, Fe = t.get(ee);
          if (Fe === void 0) continue;
          const nt = Fe.buffer, We = Fe.type, X = Fe.bytesPerElement, ie = We === e.INT || We === e.UNSIGNED_INT || ee.gpuType === 1013;
          if (ee.isInterleavedBufferAttribute) {
            const re = ee.data, Me = re.stride, De = ee.offset;
            if (re.isInstancedInterleavedBuffer) {
              for (let pe = 0; pe < W.locationSize; pe++) f(W.location + pe, re.meshPerAttribute);
              S.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = re.meshPerAttribute * re.count);
            } else for (let pe = 0; pe < W.locationSize; pe++) m(W.location + pe);
            e.bindBuffer(e.ARRAY_BUFFER, nt);
            for (let pe = 0; pe < W.locationSize; pe++) x(W.location + pe, Le / W.locationSize, We, he, Me * X, (De + Le / W.locationSize * pe) * X, ie);
          } else {
            if (ee.isInstancedBufferAttribute) {
              for (let re = 0; re < W.locationSize; re++) f(W.location + re, ee.meshPerAttribute);
              S.isInstancedMesh !== !0 && H._maxInstanceCount === void 0 && (H._maxInstanceCount = ee.meshPerAttribute * ee.count);
            } else for (let re = 0; re < W.locationSize; re++) m(W.location + re);
            e.bindBuffer(e.ARRAY_BUFFER, nt);
            for (let re = 0; re < W.locationSize; re++) x(W.location + re, Le / W.locationSize, We, he, Le * X, Le / W.locationSize * re * X, ie);
          }
        } else if (k !== void 0) {
          const he = k[J];
          if (he !== void 0) switch (he.length) {
            case 2:
              e.vertexAttrib2fv(W.location, he);
              break;
            case 3:
              e.vertexAttrib3fv(W.location, he);
              break;
            case 4:
              e.vertexAttrib4fv(W.location, he);
              break;
            default:
              e.vertexAttrib1fv(W.location, he);
          }
        }
      }
    }
    b();
  }
  function D() {
    N();
    for (const S in i) {
      const w = i[S];
      for (const F in w) {
        const H = w[F];
        for (const V in H)
          h(H[V].object), delete H[V];
        delete w[F];
      }
      delete i[S];
    }
  }
  function A(S) {
    if (i[S.id] === void 0) return;
    const w = i[S.id];
    for (const F in w) {
      const H = w[F];
      for (const V in H)
        h(H[V].object), delete H[V];
      delete w[F];
    }
    delete i[S.id];
  }
  function P(S) {
    for (const w in i) {
      const F = i[w];
      if (F[S.id] === void 0) continue;
      const H = F[S.id];
      for (const V in H)
        h(H[V].object), delete H[V];
      delete F[S.id];
    }
  }
  function N() {
    y(), a = !0, s !== r && (s = r, c(s.object));
  }
  function y() {
    r.geometry = null, r.program = null, r.wireframe = !1;
  }
  return {
    setup: o,
    reset: N,
    resetDefaultState: y,
    dispose: D,
    releaseStatesOfGeometry: A,
    releaseStatesOfProgram: P,
    initAttributes: _,
    enableAttribute: m,
    disableUnusedAttributes: b
  };
}
function Xc(e, t, n) {
  let i;
  function r(c) {
    i = c;
  }
  function s(c, h) {
    e.drawArrays(i, c, h), n.update(h, i, 1);
  }
  function a(c, h, u) {
    u !== 0 && (e.drawArraysInstanced(i, c, h, u), n.update(h, i, u));
  }
  function o(c, h, u) {
    if (u === 0) return;
    t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i, c, 0, h, 0, u);
    let d = 0;
    for (let p = 0; p < u; p++) d += h[p];
    n.update(d, i, 1);
  }
  function l(c, h, u, d) {
    if (u === 0) return;
    const p = t.get("WEBGL_multi_draw");
    if (p === null) for (let M = 0; M < c.length; M++) a(c[M], h[M], d[M]);
    else {
      p.multiDrawArraysInstancedWEBGL(i, c, 0, h, 0, d, 0, u);
      let M = 0;
      for (let _ = 0; _ < u; _++) M += h[_] * d[_];
      n.update(M, i, 1);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function Yc(e, t, n, i) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (t.has("EXT_texture_filter_anisotropic") === !0) {
      const P = t.get("EXT_texture_filter_anisotropic");
      r = e.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else r = 0;
    return r;
  }
  function a(P) {
    return !(P !== 1023 && i.convert(P) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(P) {
    const N = P === 1016 && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
    return !(P !== 1009 && i.convert(P) !== e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE) && P !== 1015 && !N);
  }
  function l(P) {
    if (P === "highp") {
      if (e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.HIGH_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.HIGH_FLOAT).precision > 0) return "highp";
      P = "mediump";
    }
    return P === "mediump" && e.getShaderPrecisionFormat(e.VERTEX_SHADER, e.MEDIUM_FLOAT).precision > 0 && e.getShaderPrecisionFormat(e.FRAGMENT_SHADER, e.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = n.precision !== void 0 ? n.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const u = n.logarithmicDepthBuffer === !0, d = n.reversedDepthBuffer === !0 && t.has("EXT_clip_control"), p = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), M = e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = e.getParameter(e.MAX_TEXTURE_SIZE), m = e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE), f = e.getParameter(e.MAX_VERTEX_ATTRIBS), b = e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS), x = e.getParameter(e.MAX_VARYING_VECTORS), E = e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS), D = M > 0, A = e.getParameter(e.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: u,
    reversedDepthBuffer: d,
    maxTextures: p,
    maxVertexTextures: M,
    maxTextureSize: _,
    maxCubemapSize: m,
    maxAttributes: f,
    maxVertexUniforms: b,
    maxVaryings: x,
    maxFragmentUniforms: E,
    vertexTextures: D,
    maxSamples: A
  };
}
function qc(e) {
  const t = this;
  let n = null, i = 0, r = !1, s = !1;
  const a = new hn(), o = new Ne(), l = {
    value: null,
    needsUpdate: !1
  };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
    const p = u.length !== 0 || d || i !== 0 || r;
    return r = d, i = u.length, p;
  }, this.beginShadows = function() {
    s = !0, h(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(u, d) {
    n = h(u, d, 0);
  }, this.setState = function(u, d, p) {
    const M = u.clippingPlanes, _ = u.clipIntersection, m = u.clipShadows, f = e.get(u);
    if (!r || M === null || M.length === 0 || s && !m) s ? h(null) : c();
    else {
      const b = s ? 0 : i, x = b * 4;
      let E = f.clippingState || null;
      l.value = E, E = h(M, d, x, p);
      for (let D = 0; D !== x; ++D) E[D] = n[D];
      f.clippingState = E, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += b;
    }
  };
  function c() {
    l.value !== n && (l.value = n, l.needsUpdate = i > 0), t.numPlanes = i, t.numIntersection = 0;
  }
  function h(u, d, p, M) {
    const _ = u !== null ? u.length : 0;
    let m = null;
    if (_ !== 0) {
      if (m = l.value, M !== !0 || m === null) {
        const f = p + _ * 4, b = d.matrixWorldInverse;
        o.getNormalMatrix(b), (m === null || m.length < f) && (m = new Float32Array(f));
        for (let x = 0, E = p; x !== _; ++x, E += 4)
          a.copy(u[x]).applyMatrix4(b, o), a.normal.toArray(m, E), m[E + 3] = a.constant;
      }
      l.value = m, l.needsUpdate = !0;
    }
    return t.numPlanes = _, t.numIntersection = 0, m;
  }
}
function jc(e) {
  let t = /* @__PURE__ */ new WeakMap();
  function n(a, o) {
    return o === 303 ? a.mapping = 301 : o === 304 && (a.mapping = 302), a;
  }
  function i(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === 303 || o === 304) if (t.has(a)) {
        const l = t.get(a).texture;
        return n(l, a.mapping);
      } else {
        const l = a.image;
        if (l && l.height > 0) {
          const c = new Ql(l.height);
          return c.fromEquirectangularTexture(e, a), t.set(a, c), a.addEventListener("dispose", r), n(c.texture, a.mapping);
        } else return null;
      }
    }
    return a;
  }
  function r(a) {
    const o = a.target;
    o.removeEventListener("dispose", r);
    const l = t.get(o);
    l !== void 0 && (t.delete(o), l.dispose());
  }
  function s() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: i,
    dispose: s
  };
}
var Zn = 4, Ys = [
  0.125,
  0.215,
  0.35,
  0.446,
  0.526,
  0.582
], yn = 20, Lr = /* @__PURE__ */ new Qa(), qs = /* @__PURE__ */ new Be(), Ur = null, Ir = 0, Nr = 0, Or = !1, Sn = (1 + Math.sqrt(5)) / 2, Wn = 1 / Sn, js = [
  /* @__PURE__ */ new U(-Sn, Wn, 0),
  /* @__PURE__ */ new U(Sn, Wn, 0),
  /* @__PURE__ */ new U(-Wn, 0, Sn),
  /* @__PURE__ */ new U(Wn, 0, Sn),
  /* @__PURE__ */ new U(0, Sn, -Wn),
  /* @__PURE__ */ new U(0, Sn, Wn),
  /* @__PURE__ */ new U(-1, 1, -1),
  /* @__PURE__ */ new U(1, 1, -1),
  /* @__PURE__ */ new U(-1, 1, 1),
  /* @__PURE__ */ new U(1, 1, 1)
], Kc = /* @__PURE__ */ new U(), Ks = class {
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  fromScene(e, t = 0, n = 0.1, i = 100, r = {}) {
    const { size: s = 256, position: a = Kc } = r;
    Ur = this._renderer.getRenderTarget(), Ir = this._renderer.getActiveCubeFace(), Nr = this._renderer.getActiveMipmapLevel(), Or = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(s);
    const o = this._allocateTargets();
    return o.depthBuffer = !0, this._sceneToCubeUV(e, n, i, o, a), t > 0 && this._blur(o, 0, 0, t), this._applyPMREM(o), this._cleanup(o), o;
  }
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = $s(), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Js(), this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(Ur, Ir, Nr), this._renderer.xr.enabled = Or, e.scissorTest = !1, Xi(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), Ur = this._renderer.getRenderTarget(), Ir = this._renderer.getActiveCubeFace(), Nr = this._renderer.getActiveMipmapLevel(), Or = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
      magFilter: Tn,
      minFilter: Tn,
      generateMipmaps: !1,
      type: Kr,
      format: pi,
      colorSpace: mi,
      depthBuffer: !1
    }, i = Zs(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Zs(e, t, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Zc(r)), this._blurMaterial = Jc(r, e, t);
    }
    return i;
  }
  _compileMaterial(e) {
    const t = new xt(this._lodPlanes[0], e);
    this._renderer.compile(t, Lr);
  }
  _sceneToCubeUV(e, t, n, i, r) {
    const s = new Lt(90, 1, t, n), a = [
      1,
      -1,
      1,
      1,
      1,
      1
    ], o = [
      1,
      1,
      1,
      -1,
      -1,
      -1
    ], l = this._renderer, c = l.autoClear, h = l.toneMapping;
    l.getClearColor(qs), l.toneMapping = 0, l.autoClear = !1, l.state.buffers.depth.getReversed() && (l.setRenderTarget(i), l.clearDepth(), l.setRenderTarget(null));
    const u = new ts({
      name: "PMREM.Background",
      side: 1,
      depthWrite: !1,
      depthTest: !1
    }), d = new xt(new tr(), u);
    let p = !1;
    const M = e.background;
    M ? M.isColor && (u.color.copy(M), e.background = null, p = !0) : (u.color.copy(qs), p = !0);
    for (let _ = 0; _ < 6; _++) {
      const m = _ % 3;
      m === 0 ? (s.up.set(0, a[_], 0), s.position.set(r.x, r.y, r.z), s.lookAt(r.x + o[_], r.y, r.z)) : m === 1 ? (s.up.set(0, 0, a[_]), s.position.set(r.x, r.y, r.z), s.lookAt(r.x, r.y + o[_], r.z)) : (s.up.set(0, a[_], 0), s.position.set(r.x, r.y, r.z), s.lookAt(r.x, r.y, r.z + o[_]));
      const f = this._cubeSize;
      Xi(i, m * f, _ > 2 ? f : 0, f, f), l.setRenderTarget(i), p && l.render(d, s), l.render(e, s);
    }
    d.geometry.dispose(), d.material.dispose(), l.toneMapping = h, l.autoClear = c, e.background = M;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, i = e.mapping === 301 || e.mapping === 302;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = $s()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Js());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, s = new xt(this._lodPlanes[0], r), a = r.uniforms;
    a.envMap.value = e;
    const o = this._cubeSize;
    Xi(t, 0, 0, 3 * o, 2 * o), n.setRenderTarget(t), n.render(s, Lr);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const s = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), a = js[(i - r - 1) % js.length];
      this._blur(e, r - 1, r, s, a);
    }
    t.autoClear = n;
  }
  _blur(e, t, n, i, r) {
    const s = this._pingPongRenderTarget;
    this._halfBlur(e, s, t, n, i, "latitudinal", r), this._halfBlur(s, e, n, n, i, "longitudinal", r);
  }
  _halfBlur(e, t, n, i, r, s, a) {
    const o = this._renderer, l = this._blurMaterial;
    s !== "latitudinal" && s !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
    const c = 3, h = new xt(this._lodPlanes[i], l), u = l.uniforms, d = this._sizeLods[n] - 1, p = isFinite(r) ? Math.PI / (2 * d) : 2 * Math.PI / (2 * yn - 1), M = r / p, _ = isFinite(r) ? 1 + Math.floor(c * M) : yn;
    _ > yn && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${_} samples when the maximum is set to ${yn}`);
    const m = [];
    let f = 0;
    for (let E = 0; E < yn; ++E) {
      const D = E / M, A = Math.exp(-D * D / 2);
      m.push(A), E === 0 ? f += A : E < _ && (f += 2 * A);
    }
    for (let E = 0; E < m.length; E++) m[E] = m[E] / f;
    u.envMap.value = e.texture, u.samples.value = _, u.weights.value = m, u.latitudinal.value = s === "latitudinal", a && (u.poleAxis.value = a);
    const { _lodMax: b } = this;
    u.dTheta.value = p, u.mipInt.value = b - n;
    const x = this._sizeLods[i];
    Xi(t, 3 * x * (i > b - Zn ? i - b + Zn : 0), 4 * (this._cubeSize - x), 3 * x, 2 * x), o.setRenderTarget(t), o.render(h, Lr);
  }
};
function Zc(e) {
  const t = [], n = [], i = [];
  let r = e;
  const s = e - Zn + 1 + Ys.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    n.push(o);
    let l = 1 / o;
    a > e - Zn ? l = Ys[a - e + Zn - 1] : a === 0 && (l = 0), i.push(l);
    const c = 1 / (o - 2), h = -c, u = 1 + c, d = [
      h,
      h,
      u,
      h,
      u,
      u,
      h,
      h,
      u,
      u,
      h,
      u
    ], p = 6, M = 6, _ = 3, m = 2, f = 1, b = new Float32Array(_ * M * p), x = new Float32Array(m * M * p), E = new Float32Array(f * M * p);
    for (let A = 0; A < p; A++) {
      const P = A % 3 * 2 / 3 - 1, N = A > 2 ? 0 : -1, y = [
        P,
        N,
        0,
        P + 2 / 3,
        N,
        0,
        P + 2 / 3,
        N + 1,
        0,
        P,
        N,
        0,
        P + 2 / 3,
        N + 1,
        0,
        P,
        N + 1,
        0
      ];
      b.set(y, _ * M * A), x.set(d, m * M * A);
      const S = [
        A,
        A,
        A,
        A,
        A,
        A
      ];
      E.set(S, f * M * A);
    }
    const D = new Ht();
    D.setAttribute("position", new Ut(b, _)), D.setAttribute("uv", new Ut(x, m)), D.setAttribute("faceIndex", new Ut(E, f)), t.push(D), r > Zn && r--;
  }
  return {
    lodPlanes: t,
    sizeLods: n,
    sigmas: i
  };
}
function Zs(e, t, n) {
  const i = new bn(e, t, n);
  return i.texture.mapping = 306, i.texture.name = "PMREM.cubeUv", i.scissorTest = !0, i;
}
function Xi(e, t, n, i, r) {
  e.viewport.set(t, n, i, r), e.scissor.set(t, n, i, r);
}
function Jc(e, t, n) {
  const i = new Float32Array(yn), r = new U(0, 1, 0);
  return new dn({
    name: "SphericalGaussianBlur",
    defines: {
      n: yn,
      CUBEUV_TEXEL_WIDTH: 1 / t,
      CUBEUV_TEXEL_HEIGHT: 1 / n,
      CUBEUV_MAX_MIP: `${e}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: i },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: r }
    },
    vertexShader: ss(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Js() {
  return new dn({
    name: "EquirectangularToCubeUV",
    uniforms: { envMap: { value: null } },
    vertexShader: ss(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function $s() {
  return new dn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: ss(),
    fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function ss() {
  return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
}
function $c(e) {
  let t = /* @__PURE__ */ new WeakMap(), n = null;
  function i(o) {
    if (o && o.isTexture) {
      const l = o.mapping, c = l === 303 || l === 304, h = l === 301 || l === 302;
      if (c || h) {
        let u = t.get(o);
        const d = u !== void 0 ? u.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== d)
          return n === null && (n = new Ks(e)), u = c ? n.fromEquirectangular(o, u) : n.fromCubemap(o, u), u.texture.pmremVersion = o.pmremVersion, t.set(o, u), u.texture;
        if (u !== void 0) return u.texture;
        {
          const p = o.image;
          return c && p && p.height > 0 || h && p && r(p) ? (n === null && (n = new Ks(e)), u = c ? n.fromEquirectangular(o) : n.fromCubemap(o), u.texture.pmremVersion = o.pmremVersion, t.set(o, u), o.addEventListener("dispose", s), u.texture) : null;
        }
      }
    }
    return o;
  }
  function r(o) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++) o[h] !== void 0 && l++;
    return l === c;
  }
  function s(o) {
    const l = o.target;
    l.removeEventListener("dispose", s);
    const c = t.get(l);
    c !== void 0 && (t.delete(l), c.dispose());
  }
  function a() {
    t = /* @__PURE__ */ new WeakMap(), n !== null && (n.dispose(), n = null);
  }
  return {
    get: i,
    dispose: a
  };
}
function Qc(e) {
  const t = {};
  function n(i) {
    if (t[i] !== void 0) return t[i];
    let r;
    switch (i) {
      case "WEBGL_depth_texture":
        r = e.getExtension("WEBGL_depth_texture") || e.getExtension("MOZ_WEBGL_depth_texture") || e.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        r = e.getExtension("EXT_texture_filter_anisotropic") || e.getExtension("MOZ_EXT_texture_filter_anisotropic") || e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        r = e.getExtension("WEBGL_compressed_texture_s3tc") || e.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        r = e.getExtension("WEBGL_compressed_texture_pvrtc") || e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        r = e.getExtension(i);
    }
    return t[i] = r, r;
  }
  return {
    has: function(i) {
      return n(i) !== null;
    },
    init: function() {
      n("EXT_color_buffer_float"), n("WEBGL_clip_cull_distance"), n("OES_texture_float_linear"), n("EXT_color_buffer_half_float"), n("WEBGL_multisampled_render_to_texture"), n("WEBGL_render_shared_exponent");
    },
    get: function(i) {
      const r = n(i);
      return r === null && gi("THREE.WebGLRenderer: " + i + " extension not supported."), r;
    }
  };
}
function eh(e, t, n, i) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(u) {
    const d = u.target;
    d.index !== null && t.remove(d.index);
    for (const M in d.attributes) t.remove(d.attributes[M]);
    d.removeEventListener("dispose", a), delete r[d.id];
    const p = s.get(d);
    p && (t.remove(p), s.delete(d)), i.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === !0 && delete d._maxInstanceCount, n.memory.geometries--;
  }
  function o(u, d) {
    return r[d.id] === !0 || (d.addEventListener("dispose", a), r[d.id] = !0, n.memory.geometries++), d;
  }
  function l(u) {
    const d = u.attributes;
    for (const p in d) t.update(d[p], e.ARRAY_BUFFER);
  }
  function c(u) {
    const d = [], p = u.index, M = u.attributes.position;
    let _ = 0;
    if (p !== null) {
      const b = p.array;
      _ = p.version;
      for (let x = 0, E = b.length; x < E; x += 3) {
        const D = b[x + 0], A = b[x + 1], P = b[x + 2];
        d.push(D, A, A, P, P, D);
      }
    } else if (M !== void 0) {
      const b = M.array;
      _ = M.version;
      for (let x = 0, E = b.length / 3 - 1; x < E; x += 3) {
        const D = x + 0, A = x + 1, P = x + 2;
        d.push(D, A, A, P, P, D);
      }
    } else return;
    const m = new (ba(d) ? Da : Pa)(d, 1);
    m.version = _;
    const f = s.get(u);
    f && t.remove(f), s.set(u, m);
  }
  function h(u) {
    const d = s.get(u);
    if (d) {
      const p = u.index;
      p !== null && d.version < p.version && c(u);
    } else c(u);
    return s.get(u);
  }
  return {
    get: o,
    update: l,
    getWireframeAttribute: h
  };
}
function th(e, t, n) {
  let i;
  function r(d) {
    i = d;
  }
  let s, a;
  function o(d) {
    s = d.type, a = d.bytesPerElement;
  }
  function l(d, p) {
    e.drawElements(i, p, s, d * a), n.update(p, i, 1);
  }
  function c(d, p, M) {
    M !== 0 && (e.drawElementsInstanced(i, p, s, d * a, M), n.update(p, i, M));
  }
  function h(d, p, M) {
    if (M === 0) return;
    t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i, p, 0, s, d, 0, M);
    let _ = 0;
    for (let m = 0; m < M; m++) _ += p[m];
    n.update(_, i, 1);
  }
  function u(d, p, M, _) {
    if (M === 0) return;
    const m = t.get("WEBGL_multi_draw");
    if (m === null) for (let f = 0; f < d.length; f++) c(d[f] / a, p[f], _[f]);
    else {
      m.multiDrawElementsInstancedWEBGL(i, p, 0, s, d, 0, _, 0, M);
      let f = 0;
      for (let b = 0; b < M; b++) f += p[b] * _[b];
      n.update(f, i, 1);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function nh(e) {
  const t = {
    geometries: 0,
    textures: 0
  }, n = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function i(s, a, o) {
    switch (n.calls++, a) {
      case e.TRIANGLES:
        n.triangles += o * (s / 3);
        break;
      case e.LINES:
        n.lines += o * (s / 2);
        break;
      case e.LINE_STRIP:
        n.lines += o * (s - 1);
        break;
      case e.LINE_LOOP:
        n.lines += o * s;
        break;
      case e.POINTS:
        n.points += o * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function r() {
    n.calls = 0, n.triangles = 0, n.points = 0, n.lines = 0;
  }
  return {
    memory: t,
    render: n,
    programs: null,
    autoReset: !0,
    reset: r,
    update: i
  };
}
function ih(e, t, n) {
  const i = /* @__PURE__ */ new WeakMap(), r = new lt();
  function s(a, o, l) {
    const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let d = i.get(o);
    if (d === void 0 || d.count !== u) {
      let y = function() {
        P.dispose(), i.delete(o), o.removeEventListener("dispose", y);
      };
      d !== void 0 && d.texture.dispose();
      const p = o.morphAttributes.position !== void 0, M = o.morphAttributes.normal !== void 0, _ = o.morphAttributes.color !== void 0, m = o.morphAttributes.position || [], f = o.morphAttributes.normal || [], b = o.morphAttributes.color || [];
      let x = 0;
      p === !0 && (x = 1), M === !0 && (x = 2), _ === !0 && (x = 3);
      let E = o.attributes.position.count * x, D = 1;
      E > t.maxTextureSize && (D = Math.ceil(E / t.maxTextureSize), E = t.maxTextureSize);
      const A = new Float32Array(E * D * 4 * u), P = new wa(A, E, D, u);
      P.type = jr, P.needsUpdate = !0;
      const N = x * 4;
      for (let S = 0; S < u; S++) {
        const w = m[S], F = f[S], H = b[S], V = E * D * 4 * S;
        for (let j = 0; j < w.count; j++) {
          const k = j * N;
          p === !0 && (r.fromBufferAttribute(w, j), A[V + k + 0] = r.x, A[V + k + 1] = r.y, A[V + k + 2] = r.z, A[V + k + 3] = 0), M === !0 && (r.fromBufferAttribute(F, j), A[V + k + 4] = r.x, A[V + k + 5] = r.y, A[V + k + 6] = r.z, A[V + k + 7] = 0), _ === !0 && (r.fromBufferAttribute(H, j), A[V + k + 8] = r.x, A[V + k + 9] = r.y, A[V + k + 10] = r.z, A[V + k + 11] = H.itemSize === 4 ? r.w : 1);
        }
      }
      d = {
        count: u,
        texture: P,
        size: new Te(E, D)
      }, i.set(o, d), o.addEventListener("dispose", y);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null) l.getUniforms().setValue(e, "morphTexture", a.morphTexture, n);
    else {
      let p = 0;
      for (let _ = 0; _ < c.length; _++) p += c[_];
      const M = o.morphTargetsRelative ? 1 : 1 - p;
      l.getUniforms().setValue(e, "morphTargetBaseInfluence", M), l.getUniforms().setValue(e, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(e, "morphTargetsTexture", d.texture, n), l.getUniforms().setValue(e, "morphTargetsTextureSize", d.size);
  }
  return { update: s };
}
function rh(e, t, n, i) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = i.render.frame, h = l.geometry, u = t.get(l, h);
    if (r.get(u) !== c && (t.update(u), r.set(u, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), r.get(l) !== c && (n.update(l.instanceMatrix, e.ARRAY_BUFFER), l.instanceColor !== null && n.update(l.instanceColor, e.ARRAY_BUFFER), r.set(l, c))), l.isSkinnedMesh) {
      const d = l.skeleton;
      r.get(d) !== c && (d.update(), r.set(d, c));
    }
    return u;
  }
  function a() {
    r = /* @__PURE__ */ new WeakMap();
  }
  function o(l) {
    const c = l.target;
    c.removeEventListener("dispose", o), n.remove(c.instanceMatrix), c.instanceColor !== null && n.remove(c.instanceColor);
  }
  return {
    update: s,
    dispose: a
  };
}
var to = /* @__PURE__ */ new Vt(), Qs = /* @__PURE__ */ new Ha(1, 1), no = /* @__PURE__ */ new wa(), io = /* @__PURE__ */ new Ol(), ro = /* @__PURE__ */ new Oa(), ea = [], ta = [], na = new Float32Array(16), ia = new Float32Array(9), ra = new Float32Array(4);
function ni(e, t, n) {
  const i = e[0];
  if (i <= 0 || i > 0) return e;
  const r = t * n;
  let s = ea[r];
  if (s === void 0 && (s = new Float32Array(r), ea[r] = s), t !== 0) {
    i.toArray(s, 0);
    for (let a = 1, o = 0; a !== t; ++a)
      o += n, e[a].toArray(s, o);
  }
  return s;
}
function ut(e, t) {
  if (e.length !== t.length) return !1;
  for (let n = 0, i = e.length; n < i; n++) if (e[n] !== t[n]) return !1;
  return !0;
}
function dt(e, t) {
  for (let n = 0, i = t.length; n < i; n++) e[n] = t[n];
}
function ir(e, t) {
  let n = ta[t];
  n === void 0 && (n = new Int32Array(t), ta[t] = n);
  for (let i = 0; i !== t; ++i) n[i] = e.allocateTextureUnit();
  return n;
}
function sh(e, t) {
  const n = this.cache;
  n[0] !== t && (e.uniform1f(this.addr, t), n[0] = t);
}
function ah(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) && (e.uniform2f(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
  else {
    if (ut(n, t)) return;
    e.uniform2fv(this.addr, t), dt(n, t);
  }
}
function oh(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3f(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
  else if (t.r !== void 0)
    (n[0] !== t.r || n[1] !== t.g || n[2] !== t.b) && (e.uniform3f(this.addr, t.r, t.g, t.b), n[0] = t.r, n[1] = t.g, n[2] = t.b);
  else {
    if (ut(n, t)) return;
    e.uniform3fv(this.addr, t), dt(n, t);
  }
}
function lh(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4f(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
  else {
    if (ut(n, t)) return;
    e.uniform4fv(this.addr, t), dt(n, t);
  }
}
function ch(e, t) {
  const n = this.cache, i = t.elements;
  if (i === void 0) {
    if (ut(n, t)) return;
    e.uniformMatrix2fv(this.addr, !1, t), dt(n, t);
  } else {
    if (ut(n, i)) return;
    ra.set(i), e.uniformMatrix2fv(this.addr, !1, ra), dt(n, i);
  }
}
function hh(e, t) {
  const n = this.cache, i = t.elements;
  if (i === void 0) {
    if (ut(n, t)) return;
    e.uniformMatrix3fv(this.addr, !1, t), dt(n, t);
  } else {
    if (ut(n, i)) return;
    ia.set(i), e.uniformMatrix3fv(this.addr, !1, ia), dt(n, i);
  }
}
function uh(e, t) {
  const n = this.cache, i = t.elements;
  if (i === void 0) {
    if (ut(n, t)) return;
    e.uniformMatrix4fv(this.addr, !1, t), dt(n, t);
  } else {
    if (ut(n, i)) return;
    na.set(i), e.uniformMatrix4fv(this.addr, !1, na), dt(n, i);
  }
}
function dh(e, t) {
  const n = this.cache;
  n[0] !== t && (e.uniform1i(this.addr, t), n[0] = t);
}
function fh(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) && (e.uniform2i(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
  else {
    if (ut(n, t)) return;
    e.uniform2iv(this.addr, t), dt(n, t);
  }
}
function ph(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3i(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
  else {
    if (ut(n, t)) return;
    e.uniform3iv(this.addr, t), dt(n, t);
  }
}
function mh(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4i(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
  else {
    if (ut(n, t)) return;
    e.uniform4iv(this.addr, t), dt(n, t);
  }
}
function _h(e, t) {
  const n = this.cache;
  n[0] !== t && (e.uniform1ui(this.addr, t), n[0] = t);
}
function gh(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y) && (e.uniform2ui(this.addr, t.x, t.y), n[0] = t.x, n[1] = t.y);
  else {
    if (ut(n, t)) return;
    e.uniform2uiv(this.addr, t), dt(n, t);
  }
}
function vh(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z) && (e.uniform3ui(this.addr, t.x, t.y, t.z), n[0] = t.x, n[1] = t.y, n[2] = t.z);
  else {
    if (ut(n, t)) return;
    e.uniform3uiv(this.addr, t), dt(n, t);
  }
}
function Mh(e, t) {
  const n = this.cache;
  if (t.x !== void 0)
    (n[0] !== t.x || n[1] !== t.y || n[2] !== t.z || n[3] !== t.w) && (e.uniform4ui(this.addr, t.x, t.y, t.z, t.w), n[0] = t.x, n[1] = t.y, n[2] = t.z, n[3] = t.w);
  else {
    if (ut(n, t)) return;
    e.uniform4uiv(this.addr, t), dt(n, t);
  }
}
function xh(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r);
  let s;
  this.type === e.SAMPLER_2D_SHADOW ? (Qs.compareFunction = 515, s = Qs) : s = to, n.setTexture2D(t || s, r);
}
function Sh(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r), n.setTexture3D(t || io, r);
}
function yh(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r), n.setTextureCube(t || ro, r);
}
function Eh(e, t, n) {
  const i = this.cache, r = n.allocateTextureUnit();
  i[0] !== r && (e.uniform1i(this.addr, r), i[0] = r), n.setTexture2DArray(t || no, r);
}
function Th(e) {
  switch (e) {
    case 5126:
      return sh;
    case 35664:
      return ah;
    case 35665:
      return oh;
    case 35666:
      return lh;
    case 35674:
      return ch;
    case 35675:
      return hh;
    case 35676:
      return uh;
    case 5124:
    case 35670:
      return dh;
    case 35667:
    case 35671:
      return fh;
    case 35668:
    case 35672:
      return ph;
    case 35669:
    case 35673:
      return mh;
    case 5125:
      return _h;
    case 36294:
      return gh;
    case 36295:
      return vh;
    case 36296:
      return Mh;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return xh;
    case 35679:
    case 36299:
    case 36307:
      return Sh;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return yh;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Eh;
  }
}
function bh(e, t) {
  e.uniform1fv(this.addr, t);
}
function Ah(e, t) {
  const n = ni(t, this.size, 2);
  e.uniform2fv(this.addr, n);
}
function wh(e, t) {
  const n = ni(t, this.size, 3);
  e.uniform3fv(this.addr, n);
}
function Rh(e, t) {
  const n = ni(t, this.size, 4);
  e.uniform4fv(this.addr, n);
}
function Ch(e, t) {
  const n = ni(t, this.size, 4);
  e.uniformMatrix2fv(this.addr, !1, n);
}
function Ph(e, t) {
  const n = ni(t, this.size, 9);
  e.uniformMatrix3fv(this.addr, !1, n);
}
function Dh(e, t) {
  const n = ni(t, this.size, 16);
  e.uniformMatrix4fv(this.addr, !1, n);
}
function Lh(e, t) {
  e.uniform1iv(this.addr, t);
}
function Uh(e, t) {
  e.uniform2iv(this.addr, t);
}
function Ih(e, t) {
  e.uniform3iv(this.addr, t);
}
function Nh(e, t) {
  e.uniform4iv(this.addr, t);
}
function Oh(e, t) {
  e.uniform1uiv(this.addr, t);
}
function Fh(e, t) {
  e.uniform2uiv(this.addr, t);
}
function Bh(e, t) {
  e.uniform3uiv(this.addr, t);
}
function zh(e, t) {
  e.uniform4uiv(this.addr, t);
}
function Vh(e, t, n) {
  const i = this.cache, r = t.length, s = ir(n, r);
  ut(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTexture2D(t[a] || to, s[a]);
}
function Hh(e, t, n) {
  const i = this.cache, r = t.length, s = ir(n, r);
  ut(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTexture3D(t[a] || io, s[a]);
}
function Gh(e, t, n) {
  const i = this.cache, r = t.length, s = ir(n, r);
  ut(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTextureCube(t[a] || ro, s[a]);
}
function kh(e, t, n) {
  const i = this.cache, r = t.length, s = ir(n, r);
  ut(i, s) || (e.uniform1iv(this.addr, s), dt(i, s));
  for (let a = 0; a !== r; ++a) n.setTexture2DArray(t[a] || no, s[a]);
}
function Wh(e) {
  switch (e) {
    case 5126:
      return bh;
    case 35664:
      return Ah;
    case 35665:
      return wh;
    case 35666:
      return Rh;
    case 35674:
      return Ch;
    case 35675:
      return Ph;
    case 35676:
      return Dh;
    case 5124:
    case 35670:
      return Lh;
    case 35667:
    case 35671:
      return Uh;
    case 35668:
    case 35672:
      return Ih;
    case 35669:
    case 35673:
      return Nh;
    case 5125:
      return Oh;
    case 36294:
      return Fh;
    case 36295:
      return Bh;
    case 36296:
      return zh;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Vh;
    case 35679:
    case 36299:
    case 36307:
      return Hh;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Gh;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return kh;
  }
}
var Xh = class {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = Th(t.type);
  }
}, Yh = class {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = Wh(t.type);
  }
}, qh = class {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, t, n) {
    const i = this.seq;
    for (let r = 0, s = i.length; r !== s; ++r) {
      const a = i[r];
      a.setValue(e, t[a.id], n);
    }
  }
}, Fr = /(\w+)(\])?(\[|\.)?/g;
function sa(e, t) {
  e.seq.push(t), e.map[t.id] = t;
}
function jh(e, t, n) {
  const i = e.name, r = i.length;
  for (Fr.lastIndex = 0; ; ) {
    const s = Fr.exec(i), a = Fr.lastIndex;
    let o = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === r) {
      sa(n, c === void 0 ? new Xh(o, e, t) : new Yh(o, e, t));
      break;
    } else {
      let h = n.map[o];
      h === void 0 && (h = new qh(o), sa(n, h)), n = h;
    }
  }
}
var Zi = class {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = e.getActiveUniform(t, i);
      jh(r, e.getUniformLocation(t, r.name), this);
    }
  }
  setValue(e, t, n, i) {
    const r = this.map[t];
    r !== void 0 && r.setValue(e, n, i);
  }
  setOptional(e, t, n) {
    const i = t[n];
    i !== void 0 && this.setValue(e, n, i);
  }
  static upload(e, t, n, i) {
    for (let r = 0, s = t.length; r !== s; ++r) {
      const a = t[r], o = n[a.id];
      o.needsUpdate !== !1 && a.setValue(e, o.value, i);
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let i = 0, r = e.length; i !== r; ++i) {
      const s = e[i];
      s.id in t && n.push(s);
    }
    return n;
  }
};
function aa(e, t, n) {
  const i = e.createShader(t);
  return e.shaderSource(i, n), e.compileShader(i), i;
}
var Kh = 37297, Zh = 0;
function Jh(e, t) {
  const n = e.split(`
`), i = [], r = Math.max(t - 6, 0), s = Math.min(t + 6, n.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    i.push(`${o === t ? ">" : " "} ${o}: ${n[a]}`);
  }
  return i.join(`
`);
}
var oa = /* @__PURE__ */ new Ne();
function $h(e) {
  ke._getMatrix(oa, ke.workingColorSpace, e);
  const t = `mat3( ${oa.elements.map((n) => n.toFixed(4))} )`;
  switch (ke.getTransfer(e)) {
    case $i:
      return [t, "LinearTransferOETF"];
    case Qi:
      return [t, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space: ", e), [t, "LinearTransferOETF"];
  }
}
function la(e, t, n) {
  const i = e.getShaderParameter(t, e.COMPILE_STATUS), r = (e.getShaderInfoLog(t) || "").trim();
  if (i && r === "") return "";
  const s = /ERROR: 0:(\d+)/.exec(r);
  if (s) {
    const a = parseInt(s[1]);
    return n.toUpperCase() + `

` + r + `

` + Jh(e.getShaderSource(t), a);
  } else return r;
}
function Qh(e, t) {
  const n = $h(t);
  return [
    `vec4 ${e}( vec4 value ) {`,
    `	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,
    "}"
  ].join(`
`);
}
function eu(e, t) {
  let n;
  switch (t) {
    case 1:
      n = "Linear";
      break;
    case 2:
      n = "Reinhard";
      break;
    case 3:
      n = "Cineon";
      break;
    case 4:
      n = "ACESFilmic";
      break;
    case 6:
      n = "AgX";
      break;
    case 7:
      n = "Neutral";
      break;
    case 5:
      n = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), n = "Linear";
  }
  return "vec3 " + e + "( vec3 color ) { return " + n + "ToneMapping( color ); }";
}
var Yi = /* @__PURE__ */ new U();
function tu() {
  return ke.getLuminanceCoefficients(Yi), [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${Yi.x.toFixed(4)}, ${Yi.y.toFixed(4)}, ${Yi.z.toFixed(4)} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function nu(e) {
  return [e.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "", e.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""].filter(ui).join(`
`);
}
function iu(e) {
  const t = [];
  for (const n in e) {
    const i = e[n];
    i !== !1 && t.push("#define " + n + " " + i);
  }
  return t.join(`
`);
}
function ru(e, t) {
  const n = {}, i = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES);
  for (let r = 0; r < i; r++) {
    const s = e.getActiveAttrib(t, r), a = s.name;
    let o = 1;
    s.type === e.FLOAT_MAT2 && (o = 2), s.type === e.FLOAT_MAT3 && (o = 3), s.type === e.FLOAT_MAT4 && (o = 4), n[a] = {
      type: s.type,
      location: e.getAttribLocation(t, a),
      locationSize: o
    };
  }
  return n;
}
function ui(e) {
  return e !== "";
}
function ca(e, t) {
  const n = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
  return e.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, n).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
}
function ha(e, t) {
  return e.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
}
var su = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Xr(e) {
  return e.replace(su, ou);
}
var au = /* @__PURE__ */ new Map();
function ou(e, t) {
  let n = Ue[t];
  if (n === void 0) {
    const i = au.get(t);
    if (i !== void 0)
      n = Ue[i], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, i);
    else throw new Error("Can not resolve #include <" + t + ">");
  }
  return Xr(n);
}
var lu = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function ua(e) {
  return e.replace(lu, cu);
}
function cu(e, t, n, i) {
  let r = "";
  for (let s = parseInt(t); s < parseInt(n); s++) r += i.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function da(e) {
  let t = `precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;
  return e.precision === "highp" ? t += `
#define HIGH_PRECISION` : e.precision === "mediump" ? t += `
#define MEDIUM_PRECISION` : e.precision === "lowp" && (t += `
#define LOW_PRECISION`), t;
}
function hu(e) {
  let t = "SHADOWMAP_TYPE_BASIC";
  return e.shadowMapType === 1 ? t = "SHADOWMAP_TYPE_PCF" : e.shadowMapType === 2 ? t = "SHADOWMAP_TYPE_PCF_SOFT" : e.shadowMapType === 3 && (t = "SHADOWMAP_TYPE_VSM"), t;
}
function uu(e) {
  let t = "ENVMAP_TYPE_CUBE";
  if (e.envMap) switch (e.envMapMode) {
    case 301:
    case 302:
      t = "ENVMAP_TYPE_CUBE";
      break;
    case 306:
      t = "ENVMAP_TYPE_CUBE_UV";
      break;
  }
  return t;
}
function du(e) {
  let t = "ENVMAP_MODE_REFLECTION";
  return e.envMap && e.envMapMode === 302 && (t = "ENVMAP_MODE_REFRACTION"), t;
}
function fu(e) {
  let t = "ENVMAP_BLENDING_NONE";
  if (e.envMap) switch (e.combine) {
    case 0:
      t = "ENVMAP_BLENDING_MULTIPLY";
      break;
    case 1:
      t = "ENVMAP_BLENDING_MIX";
      break;
    case 2:
      t = "ENVMAP_BLENDING_ADD";
      break;
  }
  return t;
}
function pu(e) {
  const t = e.envMapCubeUVHeight;
  if (t === null) return null;
  const n = Math.log2(t) - 2, i = 1 / t;
  return {
    texelWidth: 1 / (3 * Math.max(Math.pow(2, n), 112)),
    texelHeight: i,
    maxMip: n
  };
}
function mu(e, t, n, i) {
  const r = e.getContext(), s = n.defines;
  let a = n.vertexShader, o = n.fragmentShader;
  const l = hu(n), c = uu(n), h = du(n), u = fu(n), d = pu(n), p = nu(n), M = iu(s), _ = r.createProgram();
  let m, f, b = n.glslVersion ? "#version " + n.glslVersion + `
` : "";
  n.isRawShaderMaterial ? (m = [
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    M
  ].filter(ui).join(`
`), m.length > 0 && (m += `
`), f = [
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    M
  ].filter(ui).join(`
`), f.length > 0 && (f += `
`)) : (m = [
    da(n),
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    M,
    n.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    n.batching ? "#define USE_BATCHING" : "",
    n.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    n.instancing ? "#define USE_INSTANCING" : "",
    n.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    n.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    n.useFog && n.fog ? "#define USE_FOG" : "",
    n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
    n.map ? "#define USE_MAP" : "",
    n.envMap ? "#define USE_ENVMAP" : "",
    n.envMap ? "#define " + h : "",
    n.lightMap ? "#define USE_LIGHTMAP" : "",
    n.aoMap ? "#define USE_AOMAP" : "",
    n.bumpMap ? "#define USE_BUMPMAP" : "",
    n.normalMap ? "#define USE_NORMALMAP" : "",
    n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    n.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    n.anisotropy ? "#define USE_ANISOTROPY" : "",
    n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    n.specularMap ? "#define USE_SPECULARMAP" : "",
    n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    n.metalnessMap ? "#define USE_METALNESSMAP" : "",
    n.alphaMap ? "#define USE_ALPHAMAP" : "",
    n.alphaHash ? "#define USE_ALPHAHASH" : "",
    n.transmission ? "#define USE_TRANSMISSION" : "",
    n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    n.mapUv ? "#define MAP_UV " + n.mapUv : "",
    n.alphaMapUv ? "#define ALPHAMAP_UV " + n.alphaMapUv : "",
    n.lightMapUv ? "#define LIGHTMAP_UV " + n.lightMapUv : "",
    n.aoMapUv ? "#define AOMAP_UV " + n.aoMapUv : "",
    n.emissiveMapUv ? "#define EMISSIVEMAP_UV " + n.emissiveMapUv : "",
    n.bumpMapUv ? "#define BUMPMAP_UV " + n.bumpMapUv : "",
    n.normalMapUv ? "#define NORMALMAP_UV " + n.normalMapUv : "",
    n.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + n.displacementMapUv : "",
    n.metalnessMapUv ? "#define METALNESSMAP_UV " + n.metalnessMapUv : "",
    n.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + n.roughnessMapUv : "",
    n.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + n.anisotropyMapUv : "",
    n.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + n.clearcoatMapUv : "",
    n.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + n.clearcoatNormalMapUv : "",
    n.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + n.clearcoatRoughnessMapUv : "",
    n.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + n.iridescenceMapUv : "",
    n.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + n.iridescenceThicknessMapUv : "",
    n.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + n.sheenColorMapUv : "",
    n.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + n.sheenRoughnessMapUv : "",
    n.specularMapUv ? "#define SPECULARMAP_UV " + n.specularMapUv : "",
    n.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + n.specularColorMapUv : "",
    n.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + n.specularIntensityMapUv : "",
    n.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + n.transmissionMapUv : "",
    n.thicknessMapUv ? "#define THICKNESSMAP_UV " + n.thicknessMapUv : "",
    n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
    n.vertexColors ? "#define USE_COLOR" : "",
    n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    n.vertexUv1s ? "#define USE_UV1" : "",
    n.vertexUv2s ? "#define USE_UV2" : "",
    n.vertexUv3s ? "#define USE_UV3" : "",
    n.pointsUvs ? "#define USE_POINTS_UV" : "",
    n.flatShading ? "#define FLAT_SHADED" : "",
    n.skinning ? "#define USE_SKINNING" : "",
    n.morphTargets ? "#define USE_MORPHTARGETS" : "",
    n.morphNormals && n.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    n.morphColors ? "#define USE_MORPHCOLORS" : "",
    n.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + n.morphTextureStride : "",
    n.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + n.morphTargetsCount : "",
    n.doubleSided ? "#define DOUBLE_SIDED" : "",
    n.flipSided ? "#define FLIP_SIDED" : "",
    n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    n.shadowMapEnabled ? "#define " + l : "",
    n.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(ui).join(`
`), f = [
    da(n),
    "#define SHADER_TYPE " + n.shaderType,
    "#define SHADER_NAME " + n.shaderName,
    M,
    n.useFog && n.fog ? "#define USE_FOG" : "",
    n.useFog && n.fogExp2 ? "#define FOG_EXP2" : "",
    n.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    n.map ? "#define USE_MAP" : "",
    n.matcap ? "#define USE_MATCAP" : "",
    n.envMap ? "#define USE_ENVMAP" : "",
    n.envMap ? "#define " + c : "",
    n.envMap ? "#define " + h : "",
    n.envMap ? "#define " + u : "",
    d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "",
    d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "",
    d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "",
    n.lightMap ? "#define USE_LIGHTMAP" : "",
    n.aoMap ? "#define USE_AOMAP" : "",
    n.bumpMap ? "#define USE_BUMPMAP" : "",
    n.normalMap ? "#define USE_NORMALMAP" : "",
    n.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    n.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    n.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    n.anisotropy ? "#define USE_ANISOTROPY" : "",
    n.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    n.clearcoat ? "#define USE_CLEARCOAT" : "",
    n.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    n.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    n.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    n.dispersion ? "#define USE_DISPERSION" : "",
    n.iridescence ? "#define USE_IRIDESCENCE" : "",
    n.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    n.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    n.specularMap ? "#define USE_SPECULARMAP" : "",
    n.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    n.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    n.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    n.metalnessMap ? "#define USE_METALNESSMAP" : "",
    n.alphaMap ? "#define USE_ALPHAMAP" : "",
    n.alphaTest ? "#define USE_ALPHATEST" : "",
    n.alphaHash ? "#define USE_ALPHAHASH" : "",
    n.sheen ? "#define USE_SHEEN" : "",
    n.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    n.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    n.transmission ? "#define USE_TRANSMISSION" : "",
    n.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    n.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    n.vertexTangents && n.flatShading === !1 ? "#define USE_TANGENT" : "",
    n.vertexColors || n.instancingColor || n.batchingColor ? "#define USE_COLOR" : "",
    n.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    n.vertexUv1s ? "#define USE_UV1" : "",
    n.vertexUv2s ? "#define USE_UV2" : "",
    n.vertexUv3s ? "#define USE_UV3" : "",
    n.pointsUvs ? "#define USE_POINTS_UV" : "",
    n.gradientMap ? "#define USE_GRADIENTMAP" : "",
    n.flatShading ? "#define FLAT_SHADED" : "",
    n.doubleSided ? "#define DOUBLE_SIDED" : "",
    n.flipSided ? "#define FLIP_SIDED" : "",
    n.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    n.shadowMapEnabled ? "#define " + l : "",
    n.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    n.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    n.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    n.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
    n.logarithmicDepthBuffer ? "#define USE_LOGARITHMIC_DEPTH_BUFFER" : "",
    n.reversedDepthBuffer ? "#define USE_REVERSED_DEPTH_BUFFER" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    n.toneMapping !== 0 ? "#define TONE_MAPPING" : "",
    n.toneMapping !== 0 ? Ue.tonemapping_pars_fragment : "",
    n.toneMapping !== 0 ? eu("toneMapping", n.toneMapping) : "",
    n.dithering ? "#define DITHERING" : "",
    n.opaque ? "#define OPAQUE" : "",
    Ue.colorspace_pars_fragment,
    Qh("linearToOutputTexel", n.outputColorSpace),
    tu(),
    n.useDepthPacking ? "#define DEPTH_PACKING " + n.depthPacking : "",
    `
`
  ].filter(ui).join(`
`)), a = Xr(a), a = ca(a, n), a = ha(a, n), o = Xr(o), o = ca(o, n), o = ha(o, n), a = ua(a), o = ua(o), n.isRawShaderMaterial !== !0 && (b = `#version 300 es
`, m = [
    p,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + m, f = [
    "#define varying in",
    n.glslVersion === "300 es" ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    n.glslVersion === "300 es" ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + f);
  const x = b + m + a, E = b + f + o, D = aa(r, r.VERTEX_SHADER, x), A = aa(r, r.FRAGMENT_SHADER, E);
  r.attachShader(_, D), r.attachShader(_, A), n.index0AttributeName !== void 0 ? r.bindAttribLocation(_, 0, n.index0AttributeName) : n.morphTargets === !0 && r.bindAttribLocation(_, 0, "position"), r.linkProgram(_);
  function P(w) {
    if (e.debug.checkShaderErrors) {
      const F = r.getProgramInfoLog(_) || "", H = r.getShaderInfoLog(D) || "", V = r.getShaderInfoLog(A) || "", j = F.trim(), k = H.trim(), J = V.trim();
      let W = !0, ee = !0;
      if (r.getProgramParameter(_, r.LINK_STATUS) === !1)
        if (W = !1, typeof e.debug.onShaderError == "function") e.debug.onShaderError(r, _, D, A);
        else {
          const he = la(r, D, "vertex"), Le = la(r, A, "fragment");
          console.error("THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(_, r.VALIDATE_STATUS) + `

Material Name: ` + w.name + `
Material Type: ` + w.type + `

Program Info Log: ` + j + `
` + he + `
` + Le);
        }
      else j !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", j) : (k === "" || J === "") && (ee = !1);
      ee && (w.diagnostics = {
        runnable: W,
        programLog: j,
        vertexShader: {
          log: k,
          prefix: m
        },
        fragmentShader: {
          log: J,
          prefix: f
        }
      });
    }
    r.deleteShader(D), r.deleteShader(A), N = new Zi(r, _), y = ru(r, _);
  }
  let N;
  this.getUniforms = function() {
    return N === void 0 && P(this), N;
  };
  let y;
  this.getAttributes = function() {
    return y === void 0 && P(this), y;
  };
  let S = n.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return S === !1 && (S = r.getProgramParameter(_, Kh)), S;
  }, this.destroy = function() {
    i.releaseStatesOfProgram(this), r.deleteProgram(_), this.program = void 0;
  }, this.type = n.shaderType, this.name = n.shaderName, this.id = Zh++, this.cacheKey = t, this.usedTimes = 1, this.program = _, this.vertexShader = D, this.fragmentShader = A, this;
}
var _u = 0, gu = class {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(e) {
    const t = e.vertexShader, n = e.fragmentShader, i = this._getShaderStage(t), r = this._getShaderStage(n), s = this._getShaderCacheForMaterial(e);
    return s.has(i) === !1 && (s.add(i), i.usedTimes++), s.has(r) === !1 && (s.add(r), r.usedTimes++), this;
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && (n = new vu(e), t.set(e, n)), n;
  }
}, vu = class {
  constructor(e) {
    this.id = _u++, this.code = e, this.usedTimes = 0;
  }
};
function Mu(e, t, n, i, r, s, a) {
  const o = new es(), l = new gu(), c = /* @__PURE__ */ new Set(), h = [], u = r.logarithmicDepthBuffer, d = r.vertexTextures;
  let p = r.precision;
  const M = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function _(y) {
    return c.add(y), y === 0 ? "uv" : `uv${y}`;
  }
  function m(y, S, w, F, H) {
    const V = F.fog, j = H.geometry, k = y.isMeshStandardMaterial ? F.environment : null, J = (y.isMeshStandardMaterial ? n : t).get(y.envMap || k), W = J && J.mapping === 306 ? J.image.height : null, ee = M[y.type];
    y.precision !== null && (p = r.getMaxPrecision(y.precision), p !== y.precision && console.warn("THREE.WebGLProgram.getParameters:", y.precision, "not supported, using", p, "instead."));
    const he = j.morphAttributes.position || j.morphAttributes.normal || j.morphAttributes.color, Le = he !== void 0 ? he.length : 0;
    let Fe = 0;
    j.morphAttributes.position !== void 0 && (Fe = 1), j.morphAttributes.normal !== void 0 && (Fe = 2), j.morphAttributes.color !== void 0 && (Fe = 3);
    let nt, We, X, ie;
    if (ee) {
      const Ye = Wt[ee];
      nt = Ye.vertexShader, We = Ye.fragmentShader;
    } else
      nt = y.vertexShader, We = y.fragmentShader, l.update(y), X = l.getVertexShaderID(y), ie = l.getFragmentShaderID(y);
    const re = e.getRenderTarget(), Me = e.state.buffers.depth.getReversed(), De = H.isInstancedMesh === !0, pe = H.isBatchedMesh === !0, je = !!y.map, R = !!y.matcap, Ve = !!J, ze = !!y.aoMap, Ke = !!y.lightMap, xe = !!y.bumpMap, Qe = !!y.normalMap, Ee = !!y.displacementMap, be = !!y.emissiveMap, mt = !!y.metalnessMap, ft = !!y.roughnessMap, rt = y.anisotropy > 0, T = y.clearcoat > 0, g = y.dispersion > 0, O = y.iridescence > 0, Y = y.sheen > 0, Z = y.transmission > 0, G = rt && !!y.anisotropyMap, ue = T && !!y.clearcoatMap, ne = T && !!y.clearcoatNormalMap, ge = T && !!y.clearcoatRoughnessMap, Re = O && !!y.iridescenceMap, Q = O && !!y.iridescenceThicknessMap, oe = Y && !!y.sheenColorMap, Se = Y && !!y.sheenRoughnessMap, ye = !!y.specularMap, le = !!y.specularColorMap, Ie = !!y.specularIntensityMap, C = Z && !!y.transmissionMap, ae = Z && !!y.thicknessMap, te = !!y.gradientMap, _e = !!y.alphaMap, $ = y.alphaTest > 0, q = !!y.alphaHash, me = !!y.extensions;
    let Ae = 0;
    y.toneMapped && (re === null || re.isXRRenderTarget === !0) && (Ae = e.toneMapping);
    const at = {
      shaderID: ee,
      shaderType: y.type,
      shaderName: y.name,
      vertexShader: nt,
      fragmentShader: We,
      defines: y.defines,
      customVertexShaderID: X,
      customFragmentShaderID: ie,
      isRawShaderMaterial: y.isRawShaderMaterial === !0,
      glslVersion: y.glslVersion,
      precision: p,
      batching: pe,
      batchingColor: pe && H._colorsTexture !== null,
      instancing: De,
      instancingColor: De && H.instanceColor !== null,
      instancingMorph: De && H.morphTexture !== null,
      supportsVertexTextures: d,
      outputColorSpace: re === null ? e.outputColorSpace : re.isXRRenderTarget === !0 ? re.texture.colorSpace : mi,
      alphaToCoverage: !!y.alphaToCoverage,
      map: je,
      matcap: R,
      envMap: Ve,
      envMapMode: Ve && J.mapping,
      envMapCubeUVHeight: W,
      aoMap: ze,
      lightMap: Ke,
      bumpMap: xe,
      normalMap: Qe,
      displacementMap: d && Ee,
      emissiveMap: be,
      normalMapObjectSpace: Qe && y.normalMapType === 1,
      normalMapTangentSpace: Qe && y.normalMapType === 0,
      metalnessMap: mt,
      roughnessMap: ft,
      anisotropy: rt,
      anisotropyMap: G,
      clearcoat: T,
      clearcoatMap: ue,
      clearcoatNormalMap: ne,
      clearcoatRoughnessMap: ge,
      dispersion: g,
      iridescence: O,
      iridescenceMap: Re,
      iridescenceThicknessMap: Q,
      sheen: Y,
      sheenColorMap: oe,
      sheenRoughnessMap: Se,
      specularMap: ye,
      specularColorMap: le,
      specularIntensityMap: Ie,
      transmission: Z,
      transmissionMap: C,
      thicknessMap: ae,
      gradientMap: te,
      opaque: y.transparent === !1 && y.blending === 1 && y.alphaToCoverage === !1,
      alphaMap: _e,
      alphaTest: $,
      alphaHash: q,
      combine: y.combine,
      mapUv: je && _(y.map.channel),
      aoMapUv: ze && _(y.aoMap.channel),
      lightMapUv: Ke && _(y.lightMap.channel),
      bumpMapUv: xe && _(y.bumpMap.channel),
      normalMapUv: Qe && _(y.normalMap.channel),
      displacementMapUv: Ee && _(y.displacementMap.channel),
      emissiveMapUv: be && _(y.emissiveMap.channel),
      metalnessMapUv: mt && _(y.metalnessMap.channel),
      roughnessMapUv: ft && _(y.roughnessMap.channel),
      anisotropyMapUv: G && _(y.anisotropyMap.channel),
      clearcoatMapUv: ue && _(y.clearcoatMap.channel),
      clearcoatNormalMapUv: ne && _(y.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: ge && _(y.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Re && _(y.iridescenceMap.channel),
      iridescenceThicknessMapUv: Q && _(y.iridescenceThicknessMap.channel),
      sheenColorMapUv: oe && _(y.sheenColorMap.channel),
      sheenRoughnessMapUv: Se && _(y.sheenRoughnessMap.channel),
      specularMapUv: ye && _(y.specularMap.channel),
      specularColorMapUv: le && _(y.specularColorMap.channel),
      specularIntensityMapUv: Ie && _(y.specularIntensityMap.channel),
      transmissionMapUv: C && _(y.transmissionMap.channel),
      thicknessMapUv: ae && _(y.thicknessMap.channel),
      alphaMapUv: _e && _(y.alphaMap.channel),
      vertexTangents: !!j.attributes.tangent && (Qe || rt),
      vertexColors: y.vertexColors,
      vertexAlphas: y.vertexColors === !0 && !!j.attributes.color && j.attributes.color.itemSize === 4,
      pointsUvs: H.isPoints === !0 && !!j.attributes.uv && (je || _e),
      fog: !!V,
      useFog: y.fog === !0,
      fogExp2: !!V && V.isFogExp2,
      flatShading: y.flatShading === !0 && y.wireframe === !1,
      sizeAttenuation: y.sizeAttenuation === !0,
      logarithmicDepthBuffer: u,
      reversedDepthBuffer: Me,
      skinning: H.isSkinnedMesh === !0,
      morphTargets: j.morphAttributes.position !== void 0,
      morphNormals: j.morphAttributes.normal !== void 0,
      morphColors: j.morphAttributes.color !== void 0,
      morphTargetsCount: Le,
      morphTextureStride: Fe,
      numDirLights: S.directional.length,
      numPointLights: S.point.length,
      numSpotLights: S.spot.length,
      numSpotLightMaps: S.spotLightMap.length,
      numRectAreaLights: S.rectArea.length,
      numHemiLights: S.hemi.length,
      numDirLightShadows: S.directionalShadowMap.length,
      numPointLightShadows: S.pointShadowMap.length,
      numSpotLightShadows: S.spotShadowMap.length,
      numSpotLightShadowsWithMaps: S.numSpotLightShadowsWithMaps,
      numLightProbes: S.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: y.dithering,
      shadowMapEnabled: e.shadowMap.enabled && w.length > 0,
      shadowMapType: e.shadowMap.type,
      toneMapping: Ae,
      decodeVideoTexture: je && y.map.isVideoTexture === !0 && ke.getTransfer(y.map.colorSpace) === "srgb",
      decodeVideoTextureEmissive: be && y.emissiveMap.isVideoTexture === !0 && ke.getTransfer(y.emissiveMap.colorSpace) === "srgb",
      premultipliedAlpha: y.premultipliedAlpha,
      doubleSided: y.side === 2,
      flipSided: y.side === 1,
      useDepthPacking: y.depthPacking >= 0,
      depthPacking: y.depthPacking || 0,
      index0AttributeName: y.index0AttributeName,
      extensionClipCullDistance: me && y.extensions.clipCullDistance === !0 && i.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (me && y.extensions.multiDraw === !0 || pe) && i.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: i.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: y.customProgramCacheKey()
    };
    return at.vertexUv1s = c.has(1), at.vertexUv2s = c.has(2), at.vertexUv3s = c.has(3), c.clear(), at;
  }
  function f(y) {
    const S = [];
    if (y.shaderID ? S.push(y.shaderID) : (S.push(y.customVertexShaderID), S.push(y.customFragmentShaderID)), y.defines !== void 0) for (const w in y.defines)
      S.push(w), S.push(y.defines[w]);
    return y.isRawShaderMaterial === !1 && (b(S, y), x(S, y), S.push(e.outputColorSpace)), S.push(y.customProgramCacheKey), S.join();
  }
  function b(y, S) {
    y.push(S.precision), y.push(S.outputColorSpace), y.push(S.envMapMode), y.push(S.envMapCubeUVHeight), y.push(S.mapUv), y.push(S.alphaMapUv), y.push(S.lightMapUv), y.push(S.aoMapUv), y.push(S.bumpMapUv), y.push(S.normalMapUv), y.push(S.displacementMapUv), y.push(S.emissiveMapUv), y.push(S.metalnessMapUv), y.push(S.roughnessMapUv), y.push(S.anisotropyMapUv), y.push(S.clearcoatMapUv), y.push(S.clearcoatNormalMapUv), y.push(S.clearcoatRoughnessMapUv), y.push(S.iridescenceMapUv), y.push(S.iridescenceThicknessMapUv), y.push(S.sheenColorMapUv), y.push(S.sheenRoughnessMapUv), y.push(S.specularMapUv), y.push(S.specularColorMapUv), y.push(S.specularIntensityMapUv), y.push(S.transmissionMapUv), y.push(S.thicknessMapUv), y.push(S.combine), y.push(S.fogExp2), y.push(S.sizeAttenuation), y.push(S.morphTargetsCount), y.push(S.morphAttributeCount), y.push(S.numDirLights), y.push(S.numPointLights), y.push(S.numSpotLights), y.push(S.numSpotLightMaps), y.push(S.numHemiLights), y.push(S.numRectAreaLights), y.push(S.numDirLightShadows), y.push(S.numPointLightShadows), y.push(S.numSpotLightShadows), y.push(S.numSpotLightShadowsWithMaps), y.push(S.numLightProbes), y.push(S.shadowMapType), y.push(S.toneMapping), y.push(S.numClippingPlanes), y.push(S.numClipIntersection), y.push(S.depthPacking);
  }
  function x(y, S) {
    o.disableAll(), S.supportsVertexTextures && o.enable(0), S.instancing && o.enable(1), S.instancingColor && o.enable(2), S.instancingMorph && o.enable(3), S.matcap && o.enable(4), S.envMap && o.enable(5), S.normalMapObjectSpace && o.enable(6), S.normalMapTangentSpace && o.enable(7), S.clearcoat && o.enable(8), S.iridescence && o.enable(9), S.alphaTest && o.enable(10), S.vertexColors && o.enable(11), S.vertexAlphas && o.enable(12), S.vertexUv1s && o.enable(13), S.vertexUv2s && o.enable(14), S.vertexUv3s && o.enable(15), S.vertexTangents && o.enable(16), S.anisotropy && o.enable(17), S.alphaHash && o.enable(18), S.batching && o.enable(19), S.dispersion && o.enable(20), S.batchingColor && o.enable(21), S.gradientMap && o.enable(22), y.push(o.mask), o.disableAll(), S.fog && o.enable(0), S.useFog && o.enable(1), S.flatShading && o.enable(2), S.logarithmicDepthBuffer && o.enable(3), S.reversedDepthBuffer && o.enable(4), S.skinning && o.enable(5), S.morphTargets && o.enable(6), S.morphNormals && o.enable(7), S.morphColors && o.enable(8), S.premultipliedAlpha && o.enable(9), S.shadowMapEnabled && o.enable(10), S.doubleSided && o.enable(11), S.flipSided && o.enable(12), S.useDepthPacking && o.enable(13), S.dithering && o.enable(14), S.transmission && o.enable(15), S.sheen && o.enable(16), S.opaque && o.enable(17), S.pointsUvs && o.enable(18), S.decodeVideoTexture && o.enable(19), S.decodeVideoTextureEmissive && o.enable(20), S.alphaToCoverage && o.enable(21), y.push(o.mask);
  }
  function E(y) {
    const S = M[y.type];
    let w;
    if (S) {
      const F = Wt[S];
      w = Kl.clone(F.uniforms);
    } else w = y.uniforms;
    return w;
  }
  function D(y, S) {
    let w;
    for (let F = 0, H = h.length; F < H; F++) {
      const V = h[F];
      if (V.cacheKey === S) {
        w = V, ++w.usedTimes;
        break;
      }
    }
    return w === void 0 && (w = new mu(e, S, y, s), h.push(w)), w;
  }
  function A(y) {
    if (--y.usedTimes === 0) {
      const S = h.indexOf(y);
      h[S] = h[h.length - 1], h.pop(), y.destroy();
    }
  }
  function P(y) {
    l.remove(y);
  }
  function N() {
    l.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: f,
    getUniforms: E,
    acquireProgram: D,
    releaseProgram: A,
    releaseShaderCache: P,
    programs: h,
    dispose: N
  };
}
function xu() {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a) {
    return e.has(a);
  }
  function n(a) {
    let o = e.get(a);
    return o === void 0 && (o = {}, e.set(a, o)), o;
  }
  function i(a) {
    e.delete(a);
  }
  function r(a, o, l) {
    e.get(a)[o] = l;
  }
  function s() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: t,
    get: n,
    remove: i,
    update: r,
    dispose: s
  };
}
function Su(e, t) {
  return e.groupOrder !== t.groupOrder ? e.groupOrder - t.groupOrder : e.renderOrder !== t.renderOrder ? e.renderOrder - t.renderOrder : e.material.id !== t.material.id ? e.material.id - t.material.id : e.z !== t.z ? e.z - t.z : e.id - t.id;
}
function fa(e, t) {
  return e.groupOrder !== t.groupOrder ? e.groupOrder - t.groupOrder : e.renderOrder !== t.renderOrder ? e.renderOrder - t.renderOrder : e.z !== t.z ? t.z - e.z : e.id - t.id;
}
function pa() {
  const e = [];
  let t = 0;
  const n = [], i = [], r = [];
  function s() {
    t = 0, n.length = 0, i.length = 0, r.length = 0;
  }
  function a(u, d, p, M, _, m) {
    let f = e[t];
    return f === void 0 ? (f = {
      id: u.id,
      object: u,
      geometry: d,
      material: p,
      groupOrder: M,
      renderOrder: u.renderOrder,
      z: _,
      group: m
    }, e[t] = f) : (f.id = u.id, f.object = u, f.geometry = d, f.material = p, f.groupOrder = M, f.renderOrder = u.renderOrder, f.z = _, f.group = m), t++, f;
  }
  function o(u, d, p, M, _, m) {
    const f = a(u, d, p, M, _, m);
    p.transmission > 0 ? i.push(f) : p.transparent === !0 ? r.push(f) : n.push(f);
  }
  function l(u, d, p, M, _, m) {
    const f = a(u, d, p, M, _, m);
    p.transmission > 0 ? i.unshift(f) : p.transparent === !0 ? r.unshift(f) : n.unshift(f);
  }
  function c(u, d) {
    n.length > 1 && n.sort(u || Su), i.length > 1 && i.sort(d || fa), r.length > 1 && r.sort(d || fa);
  }
  function h() {
    for (let u = t, d = e.length; u < d; u++) {
      const p = e[u];
      if (p.id === null) break;
      p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null;
    }
  }
  return {
    opaque: n,
    transmissive: i,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: h,
    sort: c
  };
}
function yu() {
  let e = /* @__PURE__ */ new WeakMap();
  function t(i, r) {
    const s = e.get(i);
    let a;
    return s === void 0 ? (a = new pa(), e.set(i, [a])) : r >= s.length ? (a = new pa(), s.push(a)) : a = s[r], a;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
function Eu() {
  const e = {};
  return { get: function(t) {
    if (e[t.id] !== void 0) return e[t.id];
    let n;
    switch (t.type) {
      case "DirectionalLight":
        n = {
          direction: new U(),
          color: new Be()
        };
        break;
      case "SpotLight":
        n = {
          position: new U(),
          direction: new U(),
          color: new Be(),
          distance: 0,
          coneCos: 0,
          penumbraCos: 0,
          decay: 0
        };
        break;
      case "PointLight":
        n = {
          position: new U(),
          color: new Be(),
          distance: 0,
          decay: 0
        };
        break;
      case "HemisphereLight":
        n = {
          direction: new U(),
          skyColor: new Be(),
          groundColor: new Be()
        };
        break;
      case "RectAreaLight":
        n = {
          color: new Be(),
          position: new U(),
          halfWidth: new U(),
          halfHeight: new U()
        };
        break;
    }
    return e[t.id] = n, n;
  } };
}
function Tu() {
  const e = {};
  return { get: function(t) {
    if (e[t.id] !== void 0) return e[t.id];
    let n;
    switch (t.type) {
      case "DirectionalLight":
        n = {
          shadowIntensity: 1,
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Te()
        };
        break;
      case "SpotLight":
        n = {
          shadowIntensity: 1,
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Te()
        };
        break;
      case "PointLight":
        n = {
          shadowIntensity: 1,
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Te(),
          shadowCameraNear: 1,
          shadowCameraFar: 1e3
        };
        break;
    }
    return e[t.id] = n, n;
  } };
}
var bu = 0;
function Au(e, t) {
  return (t.castShadow ? 2 : 0) - (e.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (e.map ? 1 : 0);
}
function wu(e) {
  const t = new Eu(), n = Tu(), i = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [
      0,
      0,
      0
    ],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let c = 0; c < 9; c++) i.probe.push(new U());
  const r = new U(), s = new st(), a = new st();
  function o(c) {
    let h = 0, u = 0, d = 0;
    for (let y = 0; y < 9; y++) i.probe[y].set(0, 0, 0);
    let p = 0, M = 0, _ = 0, m = 0, f = 0, b = 0, x = 0, E = 0, D = 0, A = 0, P = 0;
    c.sort(Au);
    for (let y = 0, S = c.length; y < S; y++) {
      const w = c[y], F = w.color, H = w.intensity, V = w.distance, j = w.shadow && w.shadow.map ? w.shadow.map.texture : null;
      if (w.isAmbientLight)
        h += F.r * H, u += F.g * H, d += F.b * H;
      else if (w.isLightProbe) {
        for (let k = 0; k < 9; k++) i.probe[k].addScaledVector(w.sh.coefficients[k], H);
        P++;
      } else if (w.isDirectionalLight) {
        const k = t.get(w);
        if (k.color.copy(w.color).multiplyScalar(w.intensity), w.castShadow) {
          const J = w.shadow, W = n.get(w);
          W.shadowIntensity = J.intensity, W.shadowBias = J.bias, W.shadowNormalBias = J.normalBias, W.shadowRadius = J.radius, W.shadowMapSize = J.mapSize, i.directionalShadow[p] = W, i.directionalShadowMap[p] = j, i.directionalShadowMatrix[p] = w.shadow.matrix, b++;
        }
        i.directional[p] = k, p++;
      } else if (w.isSpotLight) {
        const k = t.get(w);
        k.position.setFromMatrixPosition(w.matrixWorld), k.color.copy(F).multiplyScalar(H), k.distance = V, k.coneCos = Math.cos(w.angle), k.penumbraCos = Math.cos(w.angle * (1 - w.penumbra)), k.decay = w.decay, i.spot[_] = k;
        const J = w.shadow;
        if (w.map && (i.spotLightMap[D] = w.map, D++, J.updateMatrices(w), w.castShadow && A++), i.spotLightMatrix[_] = J.matrix, w.castShadow) {
          const W = n.get(w);
          W.shadowIntensity = J.intensity, W.shadowBias = J.bias, W.shadowNormalBias = J.normalBias, W.shadowRadius = J.radius, W.shadowMapSize = J.mapSize, i.spotShadow[_] = W, i.spotShadowMap[_] = j, E++;
        }
        _++;
      } else if (w.isRectAreaLight) {
        const k = t.get(w);
        k.color.copy(F).multiplyScalar(H), k.halfWidth.set(w.width * 0.5, 0, 0), k.halfHeight.set(0, w.height * 0.5, 0), i.rectArea[m] = k, m++;
      } else if (w.isPointLight) {
        const k = t.get(w);
        if (k.color.copy(w.color).multiplyScalar(w.intensity), k.distance = w.distance, k.decay = w.decay, w.castShadow) {
          const J = w.shadow, W = n.get(w);
          W.shadowIntensity = J.intensity, W.shadowBias = J.bias, W.shadowNormalBias = J.normalBias, W.shadowRadius = J.radius, W.shadowMapSize = J.mapSize, W.shadowCameraNear = J.camera.near, W.shadowCameraFar = J.camera.far, i.pointShadow[M] = W, i.pointShadowMap[M] = j, i.pointShadowMatrix[M] = w.shadow.matrix, x++;
        }
        i.point[M] = k, M++;
      } else if (w.isHemisphereLight) {
        const k = t.get(w);
        k.skyColor.copy(w.color).multiplyScalar(H), k.groundColor.copy(w.groundColor).multiplyScalar(H), i.hemi[f] = k, f++;
      }
    }
    m > 0 && (e.has("OES_texture_float_linear") === !0 ? (i.rectAreaLTC1 = se.LTC_FLOAT_1, i.rectAreaLTC2 = se.LTC_FLOAT_2) : (i.rectAreaLTC1 = se.LTC_HALF_1, i.rectAreaLTC2 = se.LTC_HALF_2)), i.ambient[0] = h, i.ambient[1] = u, i.ambient[2] = d;
    const N = i.hash;
    (N.directionalLength !== p || N.pointLength !== M || N.spotLength !== _ || N.rectAreaLength !== m || N.hemiLength !== f || N.numDirectionalShadows !== b || N.numPointShadows !== x || N.numSpotShadows !== E || N.numSpotMaps !== D || N.numLightProbes !== P) && (i.directional.length = p, i.spot.length = _, i.rectArea.length = m, i.point.length = M, i.hemi.length = f, i.directionalShadow.length = b, i.directionalShadowMap.length = b, i.pointShadow.length = x, i.pointShadowMap.length = x, i.spotShadow.length = E, i.spotShadowMap.length = E, i.directionalShadowMatrix.length = b, i.pointShadowMatrix.length = x, i.spotLightMatrix.length = E + D - A, i.spotLightMap.length = D, i.numSpotLightShadowsWithMaps = A, i.numLightProbes = P, N.directionalLength = p, N.pointLength = M, N.spotLength = _, N.rectAreaLength = m, N.hemiLength = f, N.numDirectionalShadows = b, N.numPointShadows = x, N.numSpotShadows = E, N.numSpotMaps = D, N.numLightProbes = P, i.version = bu++);
  }
  function l(c, h) {
    let u = 0, d = 0, p = 0, M = 0, _ = 0;
    const m = h.matrixWorldInverse;
    for (let f = 0, b = c.length; f < b; f++) {
      const x = c[f];
      if (x.isDirectionalLight) {
        const E = i.directional[u];
        E.direction.setFromMatrixPosition(x.matrixWorld), r.setFromMatrixPosition(x.target.matrixWorld), E.direction.sub(r), E.direction.transformDirection(m), u++;
      } else if (x.isSpotLight) {
        const E = i.spot[p];
        E.position.setFromMatrixPosition(x.matrixWorld), E.position.applyMatrix4(m), E.direction.setFromMatrixPosition(x.matrixWorld), r.setFromMatrixPosition(x.target.matrixWorld), E.direction.sub(r), E.direction.transformDirection(m), p++;
      } else if (x.isRectAreaLight) {
        const E = i.rectArea[M];
        E.position.setFromMatrixPosition(x.matrixWorld), E.position.applyMatrix4(m), a.identity(), s.copy(x.matrixWorld), s.premultiply(m), a.extractRotation(s), E.halfWidth.set(x.width * 0.5, 0, 0), E.halfHeight.set(0, x.height * 0.5, 0), E.halfWidth.applyMatrix4(a), E.halfHeight.applyMatrix4(a), M++;
      } else if (x.isPointLight) {
        const E = i.point[d];
        E.position.setFromMatrixPosition(x.matrixWorld), E.position.applyMatrix4(m), d++;
      } else if (x.isHemisphereLight) {
        const E = i.hemi[_];
        E.direction.setFromMatrixPosition(x.matrixWorld), E.direction.transformDirection(m), _++;
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: i
  };
}
function ma(e) {
  const t = new wu(e), n = [], i = [];
  function r(h) {
    c.camera = h, n.length = 0, i.length = 0;
  }
  function s(h) {
    n.push(h);
  }
  function a(h) {
    i.push(h);
  }
  function o() {
    t.setup(n);
  }
  function l(h) {
    t.setupView(n, h);
  }
  const c = {
    lightsArray: n,
    shadowsArray: i,
    camera: null,
    lights: t,
    transmissionRenderTarget: {}
  };
  return {
    init: r,
    state: c,
    setupLights: o,
    setupLightsView: l,
    pushLight: s,
    pushShadow: a
  };
}
function Ru(e) {
  let t = /* @__PURE__ */ new WeakMap();
  function n(r, s = 0) {
    const a = t.get(r);
    let o;
    return a === void 0 ? (o = new ma(e), t.set(r, [o])) : s >= a.length ? (o = new ma(e), a.push(o)) : o = a[s], o;
  }
  function i() {
    t = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: i
  };
}
var Cu = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, Pu = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Du(e, t, n) {
  let i = new ns();
  const r = new Te(), s = new Te(), a = new lt(), o = new dc({ depthPacking: ul }), l = new fc(), c = {}, h = n.maxTextureSize, u = {
    0: 1,
    1: 0,
    2: 2
  }, d = new dn({
    defines: { VSM_SAMPLES: 8 },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Te() },
      radius: { value: 4 }
    },
    vertexShader: Cu,
    fragmentShader: Pu
  }), p = d.clone();
  p.defines.HORIZONTAL_PASS = 1;
  const M = new Ht();
  M.setAttribute("position", new Ut(new Float32Array([
    -1,
    -1,
    0.5,
    3,
    -1,
    0.5,
    -1,
    3,
    0.5
  ]), 3));
  const _ = new xt(M, d), m = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
  let f = this.type;
  this.render = function(A, P, N) {
    if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || A.length === 0) return;
    const y = e.getRenderTarget(), S = e.getActiveCubeFace(), w = e.getActiveMipmapLevel(), F = e.state;
    F.setBlending(0), F.buffers.depth.getReversed() === !0 ? F.buffers.color.setClear(0, 0, 0, 0) : F.buffers.color.setClear(1, 1, 1, 1), F.buffers.depth.setTest(!0), F.setScissorTest(!1);
    const H = f !== 3 && this.type === 3, V = f === 3 && this.type !== 3;
    for (let j = 0, k = A.length; j < k; j++) {
      const J = A[j], W = J.shadow;
      if (W === void 0) {
        console.warn("THREE.WebGLShadowMap:", J, "has no shadow.");
        continue;
      }
      if (W.autoUpdate === !1 && W.needsUpdate === !1) continue;
      r.copy(W.mapSize);
      const ee = W.getFrameExtents();
      if (r.multiply(ee), s.copy(W.mapSize), (r.x > h || r.y > h) && (r.x > h && (s.x = Math.floor(h / ee.x), r.x = s.x * ee.x, W.mapSize.x = s.x), r.y > h && (s.y = Math.floor(h / ee.y), r.y = s.y * ee.y, W.mapSize.y = s.y)), W.map === null || H === !0 || V === !0) {
        const Le = this.type !== 3 ? {
          minFilter: en,
          magFilter: en
        } : {};
        W.map !== null && W.map.dispose(), W.map = new bn(r.x, r.y, Le), W.map.texture.name = J.name + ".shadowMap", W.camera.updateProjectionMatrix();
      }
      e.setRenderTarget(W.map), e.clear();
      const he = W.getViewportCount();
      for (let Le = 0; Le < he; Le++) {
        const Fe = W.getViewport(Le);
        a.set(s.x * Fe.x, s.y * Fe.y, s.x * Fe.z, s.y * Fe.w), F.viewport(a), W.updateMatrices(J, Le), i = W.getFrustum(), E(P, N, W.camera, J, this.type);
      }
      W.isPointLightShadow !== !0 && this.type === 3 && b(W, N), W.needsUpdate = !1;
    }
    f = this.type, m.needsUpdate = !1, e.setRenderTarget(y, S, w);
  };
  function b(A, P) {
    const N = t.update(_);
    d.defines.VSM_SAMPLES !== A.blurSamples && (d.defines.VSM_SAMPLES = A.blurSamples, p.defines.VSM_SAMPLES = A.blurSamples, d.needsUpdate = !0, p.needsUpdate = !0), A.mapPass === null && (A.mapPass = new bn(r.x, r.y)), d.uniforms.shadow_pass.value = A.map.texture, d.uniforms.resolution.value = A.mapSize, d.uniforms.radius.value = A.radius, e.setRenderTarget(A.mapPass), e.clear(), e.renderBufferDirect(P, null, N, d, _, null), p.uniforms.shadow_pass.value = A.mapPass.texture, p.uniforms.resolution.value = A.mapSize, p.uniforms.radius.value = A.radius, e.setRenderTarget(A.map), e.clear(), e.renderBufferDirect(P, null, N, p, _, null);
  }
  function x(A, P, N, y) {
    let S = null;
    const w = N.isPointLight === !0 ? A.customDistanceMaterial : A.customDepthMaterial;
    if (w !== void 0) S = w;
    else if (S = N.isPointLight === !0 ? l : o, e.localClippingEnabled && P.clipShadows === !0 && Array.isArray(P.clippingPlanes) && P.clippingPlanes.length !== 0 || P.displacementMap && P.displacementScale !== 0 || P.alphaMap && P.alphaTest > 0 || P.map && P.alphaTest > 0 || P.alphaToCoverage === !0) {
      const F = S.uuid, H = P.uuid;
      let V = c[F];
      V === void 0 && (V = {}, c[F] = V);
      let j = V[H];
      j === void 0 && (j = S.clone(), V[H] = j, P.addEventListener("dispose", D)), S = j;
    }
    if (S.visible = P.visible, S.wireframe = P.wireframe, y === 3 ? S.side = P.shadowSide !== null ? P.shadowSide : P.side : S.side = P.shadowSide !== null ? P.shadowSide : u[P.side], S.alphaMap = P.alphaMap, S.alphaTest = P.alphaToCoverage === !0 ? 0.5 : P.alphaTest, S.map = P.map, S.clipShadows = P.clipShadows, S.clippingPlanes = P.clippingPlanes, S.clipIntersection = P.clipIntersection, S.displacementMap = P.displacementMap, S.displacementScale = P.displacementScale, S.displacementBias = P.displacementBias, S.wireframeLinewidth = P.wireframeLinewidth, S.linewidth = P.linewidth, N.isPointLight === !0 && S.isMeshDistanceMaterial === !0) {
      const F = e.properties.get(S);
      F.light = N;
    }
    return S;
  }
  function E(A, P, N, y, S) {
    if (A.visible === !1) return;
    if (A.layers.test(P.layers) && (A.isMesh || A.isLine || A.isPoints) && (A.castShadow || A.receiveShadow && S === 3) && (!A.frustumCulled || i.intersectsObject(A))) {
      A.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse, A.matrixWorld);
      const F = t.update(A), H = A.material;
      if (Array.isArray(H)) {
        const V = F.groups;
        for (let j = 0, k = V.length; j < k; j++) {
          const J = V[j], W = H[J.materialIndex];
          if (W && W.visible) {
            const ee = x(A, W, y, S);
            A.onBeforeShadow(e, A, P, N, F, ee, J), e.renderBufferDirect(N, null, F, ee, A, J), A.onAfterShadow(e, A, P, N, F, ee, J);
          }
        }
      } else if (H.visible) {
        const V = x(A, H, y, S);
        A.onBeforeShadow(e, A, P, N, F, V, null), e.renderBufferDirect(N, null, F, V, A, null), A.onAfterShadow(e, A, P, N, F, V, null);
      }
    }
    const w = A.children;
    for (let F = 0, H = w.length; F < H; F++) E(w[F], P, N, y, S);
  }
  function D(A) {
    A.target.removeEventListener("dispose", D);
    for (const P in c) {
      const N = c[P], y = A.target.uuid;
      y in N && (N[y].dispose(), delete N[y]);
    }
  }
}
var Lu = {
  0: 1,
  2: 6,
  4: 7,
  3: 5,
  1: 0,
  6: 2,
  7: 4,
  5: 3
};
function Uu(e, t) {
  function n() {
    let C = !1;
    const ae = new lt();
    let te = null;
    const _e = new lt(0, 0, 0, 0);
    return {
      setMask: function($) {
        te !== $ && !C && (e.colorMask($, $, $, $), te = $);
      },
      setLocked: function($) {
        C = $;
      },
      setClear: function($, q, me, Ae, at) {
        at === !0 && ($ *= Ae, q *= Ae, me *= Ae), ae.set($, q, me, Ae), _e.equals(ae) === !1 && (e.clearColor($, q, me, Ae), _e.copy(ae));
      },
      reset: function() {
        C = !1, te = null, _e.set(-1, 0, 0, 0);
      }
    };
  }
  function i() {
    let C = !1, ae = !1, te = null, _e = null, $ = null;
    return {
      setReversed: function(q) {
        if (ae !== q) {
          const me = t.get("EXT_clip_control");
          q ? me.clipControlEXT(me.LOWER_LEFT_EXT, me.ZERO_TO_ONE_EXT) : me.clipControlEXT(me.LOWER_LEFT_EXT, me.NEGATIVE_ONE_TO_ONE_EXT), ae = q;
          const Ae = $;
          $ = null, this.setClear(Ae);
        }
      },
      getReversed: function() {
        return ae;
      },
      setTest: function(q) {
        q ? re(e.DEPTH_TEST) : Me(e.DEPTH_TEST);
      },
      setMask: function(q) {
        te !== q && !C && (e.depthMask(q), te = q);
      },
      setFunc: function(q) {
        if (ae && (q = Lu[q]), _e !== q) {
          switch (q) {
            case 0:
              e.depthFunc(e.NEVER);
              break;
            case 1:
              e.depthFunc(e.ALWAYS);
              break;
            case 2:
              e.depthFunc(e.LESS);
              break;
            case 3:
              e.depthFunc(e.LEQUAL);
              break;
            case 4:
              e.depthFunc(e.EQUAL);
              break;
            case 5:
              e.depthFunc(e.GEQUAL);
              break;
            case 6:
              e.depthFunc(e.GREATER);
              break;
            case 7:
              e.depthFunc(e.NOTEQUAL);
              break;
            default:
              e.depthFunc(e.LEQUAL);
          }
          _e = q;
        }
      },
      setLocked: function(q) {
        C = q;
      },
      setClear: function(q) {
        $ !== q && (ae && (q = 1 - q), e.clearDepth(q), $ = q);
      },
      reset: function() {
        C = !1, te = null, _e = null, $ = null, ae = !1;
      }
    };
  }
  function r() {
    let C = !1, ae = null, te = null, _e = null, $ = null, q = null, me = null, Ae = null, at = null;
    return {
      setTest: function(Ye) {
        C || (Ye ? re(e.STENCIL_TEST) : Me(e.STENCIL_TEST));
      },
      setMask: function(Ye) {
        ae !== Ye && !C && (e.stencilMask(Ye), ae = Ye);
      },
      setFunc: function(Ye, Gt, kt) {
        (te !== Ye || _e !== Gt || $ !== kt) && (e.stencilFunc(Ye, Gt, kt), te = Ye, _e = Gt, $ = kt);
      },
      setOp: function(Ye, Gt, kt) {
        (q !== Ye || me !== Gt || Ae !== kt) && (e.stencilOp(Ye, Gt, kt), q = Ye, me = Gt, Ae = kt);
      },
      setLocked: function(Ye) {
        C = Ye;
      },
      setClear: function(Ye) {
        at !== Ye && (e.clearStencil(Ye), at = Ye);
      },
      reset: function() {
        C = !1, ae = null, te = null, _e = null, $ = null, q = null, me = null, Ae = null, at = null;
      }
    };
  }
  const s = new n(), a = new i(), o = new r(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let h = {}, u = {}, d = /* @__PURE__ */ new WeakMap(), p = [], M = null, _ = !1, m = null, f = null, b = null, x = null, E = null, D = null, A = null, P = new Be(0, 0, 0), N = 0, y = !1, S = null, w = null, F = null, H = null, V = null;
  const j = e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let k = !1, J = 0;
  const W = e.getParameter(e.VERSION);
  W.indexOf("WebGL") !== -1 ? (J = parseFloat(/^WebGL (\d)/.exec(W)[1]), k = J >= 1) : W.indexOf("OpenGL ES") !== -1 && (J = parseFloat(/^OpenGL ES (\d)/.exec(W)[1]), k = J >= 2);
  let ee = null, he = {};
  const Le = e.getParameter(e.SCISSOR_BOX), Fe = e.getParameter(e.VIEWPORT), nt = new lt().fromArray(Le), We = new lt().fromArray(Fe);
  function X(C, ae, te, _e) {
    const $ = new Uint8Array(4), q = e.createTexture();
    e.bindTexture(C, q), e.texParameteri(C, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(C, e.TEXTURE_MAG_FILTER, e.NEAREST);
    for (let me = 0; me < te; me++) C === e.TEXTURE_3D || C === e.TEXTURE_2D_ARRAY ? e.texImage3D(ae, 0, e.RGBA, 1, 1, _e, 0, e.RGBA, e.UNSIGNED_BYTE, $) : e.texImage2D(ae + me, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, $);
    return q;
  }
  const ie = {};
  ie[e.TEXTURE_2D] = X(e.TEXTURE_2D, e.TEXTURE_2D, 1), ie[e.TEXTURE_CUBE_MAP] = X(e.TEXTURE_CUBE_MAP, e.TEXTURE_CUBE_MAP_POSITIVE_X, 6), ie[e.TEXTURE_2D_ARRAY] = X(e.TEXTURE_2D_ARRAY, e.TEXTURE_2D_ARRAY, 1, 1), ie[e.TEXTURE_3D] = X(e.TEXTURE_3D, e.TEXTURE_3D, 1, 1), s.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), re(e.DEPTH_TEST), a.setFunc(3), xe(!1), Qe(1), re(e.CULL_FACE), ze(0);
  function re(C) {
    h[C] !== !0 && (e.enable(C), h[C] = !0);
  }
  function Me(C) {
    h[C] !== !1 && (e.disable(C), h[C] = !1);
  }
  function De(C, ae) {
    return u[C] !== ae ? (e.bindFramebuffer(C, ae), u[C] = ae, C === e.DRAW_FRAMEBUFFER && (u[e.FRAMEBUFFER] = ae), C === e.FRAMEBUFFER && (u[e.DRAW_FRAMEBUFFER] = ae), !0) : !1;
  }
  function pe(C, ae) {
    let te = p, _e = !1;
    if (C) {
      te = d.get(ae), te === void 0 && (te = [], d.set(ae, te));
      const $ = C.textures;
      if (te.length !== $.length || te[0] !== e.COLOR_ATTACHMENT0) {
        for (let q = 0, me = $.length; q < me; q++) te[q] = e.COLOR_ATTACHMENT0 + q;
        te.length = $.length, _e = !0;
      }
    } else te[0] !== e.BACK && (te[0] = e.BACK, _e = !0);
    _e && e.drawBuffers(te);
  }
  function je(C) {
    return M !== C ? (e.useProgram(C), M = C, !0) : !1;
  }
  const R = {
    100: e.FUNC_ADD,
    101: e.FUNC_SUBTRACT,
    102: e.FUNC_REVERSE_SUBTRACT
  };
  R[103] = e.MIN, R[104] = e.MAX;
  const Ve = {
    200: e.ZERO,
    201: e.ONE,
    202: e.SRC_COLOR,
    204: e.SRC_ALPHA,
    210: e.SRC_ALPHA_SATURATE,
    208: e.DST_COLOR,
    206: e.DST_ALPHA,
    203: e.ONE_MINUS_SRC_COLOR,
    205: e.ONE_MINUS_SRC_ALPHA,
    209: e.ONE_MINUS_DST_COLOR,
    207: e.ONE_MINUS_DST_ALPHA,
    211: e.CONSTANT_COLOR,
    212: e.ONE_MINUS_CONSTANT_COLOR,
    213: e.CONSTANT_ALPHA,
    214: e.ONE_MINUS_CONSTANT_ALPHA
  };
  function ze(C, ae, te, _e, $, q, me, Ae, at, Ye) {
    if (C === 0) {
      _ === !0 && (Me(e.BLEND), _ = !1);
      return;
    }
    if (_ === !1 && (re(e.BLEND), _ = !0), C !== 5) {
      if (C !== m || Ye !== y) {
        if ((f !== 100 || E !== 100) && (e.blendEquation(e.FUNC_ADD), f = 100, E = 100), Ye) switch (C) {
          case 1:
            e.blendFuncSeparate(e.ONE, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
            break;
          case 2:
            e.blendFunc(e.ONE, e.ONE);
            break;
          case 3:
            e.blendFuncSeparate(e.ZERO, e.ONE_MINUS_SRC_COLOR, e.ZERO, e.ONE);
            break;
          case 4:
            e.blendFuncSeparate(e.DST_COLOR, e.ONE_MINUS_SRC_ALPHA, e.ZERO, e.ONE);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", C);
            break;
        }
        else switch (C) {
          case 1:
            e.blendFuncSeparate(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA, e.ONE, e.ONE_MINUS_SRC_ALPHA);
            break;
          case 2:
            e.blendFuncSeparate(e.SRC_ALPHA, e.ONE, e.ONE, e.ONE);
            break;
          case 3:
            console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
            break;
          case 4:
            console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", C);
            break;
        }
        b = null, x = null, D = null, A = null, P.set(0, 0, 0), N = 0, m = C, y = Ye;
      }
      return;
    }
    $ = $ || ae, q = q || te, me = me || _e, (ae !== f || $ !== E) && (e.blendEquationSeparate(R[ae], R[$]), f = ae, E = $), (te !== b || _e !== x || q !== D || me !== A) && (e.blendFuncSeparate(Ve[te], Ve[_e], Ve[q], Ve[me]), b = te, x = _e, D = q, A = me), (Ae.equals(P) === !1 || at !== N) && (e.blendColor(Ae.r, Ae.g, Ae.b, at), P.copy(Ae), N = at), m = C, y = !1;
  }
  function Ke(C, ae) {
    C.side === 2 ? Me(e.CULL_FACE) : re(e.CULL_FACE);
    let te = C.side === 1;
    ae && (te = !te), xe(te), C.blending === 1 && C.transparent === !1 ? ze(0) : ze(C.blending, C.blendEquation, C.blendSrc, C.blendDst, C.blendEquationAlpha, C.blendSrcAlpha, C.blendDstAlpha, C.blendColor, C.blendAlpha, C.premultipliedAlpha), a.setFunc(C.depthFunc), a.setTest(C.depthTest), a.setMask(C.depthWrite), s.setMask(C.colorWrite);
    const _e = C.stencilWrite;
    o.setTest(_e), _e && (o.setMask(C.stencilWriteMask), o.setFunc(C.stencilFunc, C.stencilRef, C.stencilFuncMask), o.setOp(C.stencilFail, C.stencilZFail, C.stencilZPass)), be(C.polygonOffset, C.polygonOffsetFactor, C.polygonOffsetUnits), C.alphaToCoverage === !0 ? re(e.SAMPLE_ALPHA_TO_COVERAGE) : Me(e.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function xe(C) {
    S !== C && (C ? e.frontFace(e.CW) : e.frontFace(e.CCW), S = C);
  }
  function Qe(C) {
    C !== 0 ? (re(e.CULL_FACE), C !== w && (C === 1 ? e.cullFace(e.BACK) : C === 2 ? e.cullFace(e.FRONT) : e.cullFace(e.FRONT_AND_BACK))) : Me(e.CULL_FACE), w = C;
  }
  function Ee(C) {
    C !== F && (k && e.lineWidth(C), F = C);
  }
  function be(C, ae, te) {
    C ? (re(e.POLYGON_OFFSET_FILL), (H !== ae || V !== te) && (e.polygonOffset(ae, te), H = ae, V = te)) : Me(e.POLYGON_OFFSET_FILL);
  }
  function mt(C) {
    C ? re(e.SCISSOR_TEST) : Me(e.SCISSOR_TEST);
  }
  function ft(C) {
    C === void 0 && (C = e.TEXTURE0 + j - 1), ee !== C && (e.activeTexture(C), ee = C);
  }
  function rt(C, ae, te) {
    te === void 0 && (ee === null ? te = e.TEXTURE0 + j - 1 : te = ee);
    let _e = he[te];
    _e === void 0 && (_e = {
      type: void 0,
      texture: void 0
    }, he[te] = _e), (_e.type !== C || _e.texture !== ae) && (ee !== te && (e.activeTexture(te), ee = te), e.bindTexture(C, ae || ie[C]), _e.type = C, _e.texture = ae);
  }
  function T() {
    const C = he[ee];
    C !== void 0 && C.type !== void 0 && (e.bindTexture(C.type, null), C.type = void 0, C.texture = void 0);
  }
  function g() {
    try {
      e.compressedTexImage2D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function O() {
    try {
      e.compressedTexImage3D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function Y() {
    try {
      e.texSubImage2D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function Z() {
    try {
      e.texSubImage3D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function G() {
    try {
      e.compressedTexSubImage2D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function ue() {
    try {
      e.compressedTexSubImage3D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function ne() {
    try {
      e.texStorage2D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function ge() {
    try {
      e.texStorage3D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function Re() {
    try {
      e.texImage2D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function Q() {
    try {
      e.texImage3D(...arguments);
    } catch (C) {
      console.error("THREE.WebGLState:", C);
    }
  }
  function oe(C) {
    nt.equals(C) === !1 && (e.scissor(C.x, C.y, C.z, C.w), nt.copy(C));
  }
  function Se(C) {
    We.equals(C) === !1 && (e.viewport(C.x, C.y, C.z, C.w), We.copy(C));
  }
  function ye(C, ae) {
    let te = c.get(ae);
    te === void 0 && (te = /* @__PURE__ */ new WeakMap(), c.set(ae, te));
    let _e = te.get(C);
    _e === void 0 && (_e = e.getUniformBlockIndex(ae, C.name), te.set(C, _e));
  }
  function le(C, ae) {
    const te = c.get(ae).get(C);
    l.get(ae) !== te && (e.uniformBlockBinding(ae, te, C.__bindingPointIndex), l.set(ae, te));
  }
  function Ie() {
    e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.POLYGON_OFFSET_FILL), e.disable(e.SCISSOR_TEST), e.disable(e.STENCIL_TEST), e.disable(e.SAMPLE_ALPHA_TO_COVERAGE), e.blendEquation(e.FUNC_ADD), e.blendFunc(e.ONE, e.ZERO), e.blendFuncSeparate(e.ONE, e.ZERO, e.ONE, e.ZERO), e.blendColor(0, 0, 0, 0), e.colorMask(!0, !0, !0, !0), e.clearColor(0, 0, 0, 0), e.depthMask(!0), e.depthFunc(e.LESS), a.setReversed(!1), e.clearDepth(1), e.stencilMask(4294967295), e.stencilFunc(e.ALWAYS, 0, 4294967295), e.stencilOp(e.KEEP, e.KEEP, e.KEEP), e.clearStencil(0), e.cullFace(e.BACK), e.frontFace(e.CCW), e.polygonOffset(0, 0), e.activeTexture(e.TEXTURE0), e.bindFramebuffer(e.FRAMEBUFFER, null), e.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), e.bindFramebuffer(e.READ_FRAMEBUFFER, null), e.useProgram(null), e.lineWidth(1), e.scissor(0, 0, e.canvas.width, e.canvas.height), e.viewport(0, 0, e.canvas.width, e.canvas.height), h = {}, ee = null, he = {}, u = {}, d = /* @__PURE__ */ new WeakMap(), p = [], M = null, _ = !1, m = null, f = null, b = null, x = null, E = null, D = null, A = null, P = new Be(0, 0, 0), N = 0, y = !1, S = null, w = null, F = null, H = null, V = null, nt.set(0, 0, e.canvas.width, e.canvas.height), We.set(0, 0, e.canvas.width, e.canvas.height), s.reset(), a.reset(), o.reset();
  }
  return {
    buffers: {
      color: s,
      depth: a,
      stencil: o
    },
    enable: re,
    disable: Me,
    bindFramebuffer: De,
    drawBuffers: pe,
    useProgram: je,
    setBlending: ze,
    setMaterial: Ke,
    setFlipSided: xe,
    setCullFace: Qe,
    setLineWidth: Ee,
    setPolygonOffset: be,
    setScissorTest: mt,
    activeTexture: ft,
    bindTexture: rt,
    unbindTexture: T,
    compressedTexImage2D: g,
    compressedTexImage3D: O,
    texImage2D: Re,
    texImage3D: Q,
    updateUBOMapping: ye,
    uniformBlockBinding: le,
    texStorage2D: ne,
    texStorage3D: ge,
    texSubImage2D: Y,
    texSubImage3D: Z,
    compressedTexSubImage2D: G,
    compressedTexSubImage3D: ue,
    scissor: oe,
    viewport: Se,
    reset: Ie
  };
}
function Iu(e, t, n, i, r, s, a) {
  const o = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new Te(), h = /* @__PURE__ */ new WeakMap();
  let u;
  const d = /* @__PURE__ */ new WeakMap();
  let p = !1;
  try {
    p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function M(T, g) {
    return p ? new OffscreenCanvas(T, g) : er("canvas");
  }
  function _(T, g, O) {
    let Y = 1;
    const Z = rt(T);
    if ((Z.width > O || Z.height > O) && (Y = O / Math.max(Z.width, Z.height)), Y < 1) if (typeof HTMLImageElement < "u" && T instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && T instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && T instanceof ImageBitmap || typeof VideoFrame < "u" && T instanceof VideoFrame) {
      const G = Math.floor(Y * Z.width), ue = Math.floor(Y * Z.height);
      u === void 0 && (u = M(G, ue));
      const ne = g ? M(G, ue) : u;
      return ne.width = G, ne.height = ue, ne.getContext("2d").drawImage(T, 0, 0, G, ue), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + Z.width + "x" + Z.height + ") to (" + G + "x" + ue + ")."), ne;
    } else
      return "data" in T && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + Z.width + "x" + Z.height + ")."), T;
    return T;
  }
  function m(T) {
    return T.generateMipmaps;
  }
  function f(T) {
    e.generateMipmap(T);
  }
  function b(T) {
    return T.isWebGLCubeRenderTarget ? e.TEXTURE_CUBE_MAP : T.isWebGL3DRenderTarget ? e.TEXTURE_3D : T.isWebGLArrayRenderTarget || T.isCompressedArrayTexture ? e.TEXTURE_2D_ARRAY : e.TEXTURE_2D;
  }
  function x(T, g, O, Y, Z = !1) {
    if (T !== null) {
      if (e[T] !== void 0) return e[T];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + T + "'");
    }
    let G = g;
    if (g === e.RED && (O === e.FLOAT && (G = e.R32F), O === e.HALF_FLOAT && (G = e.R16F), O === e.UNSIGNED_BYTE && (G = e.R8)), g === e.RED_INTEGER && (O === e.UNSIGNED_BYTE && (G = e.R8UI), O === e.UNSIGNED_SHORT && (G = e.R16UI), O === e.UNSIGNED_INT && (G = e.R32UI), O === e.BYTE && (G = e.R8I), O === e.SHORT && (G = e.R16I), O === e.INT && (G = e.R32I)), g === e.RG && (O === e.FLOAT && (G = e.RG32F), O === e.HALF_FLOAT && (G = e.RG16F), O === e.UNSIGNED_BYTE && (G = e.RG8)), g === e.RG_INTEGER && (O === e.UNSIGNED_BYTE && (G = e.RG8UI), O === e.UNSIGNED_SHORT && (G = e.RG16UI), O === e.UNSIGNED_INT && (G = e.RG32UI), O === e.BYTE && (G = e.RG8I), O === e.SHORT && (G = e.RG16I), O === e.INT && (G = e.RG32I)), g === e.RGB_INTEGER && (O === e.UNSIGNED_BYTE && (G = e.RGB8UI), O === e.UNSIGNED_SHORT && (G = e.RGB16UI), O === e.UNSIGNED_INT && (G = e.RGB32UI), O === e.BYTE && (G = e.RGB8I), O === e.SHORT && (G = e.RGB16I), O === e.INT && (G = e.RGB32I)), g === e.RGBA_INTEGER && (O === e.UNSIGNED_BYTE && (G = e.RGBA8UI), O === e.UNSIGNED_SHORT && (G = e.RGBA16UI), O === e.UNSIGNED_INT && (G = e.RGBA32UI), O === e.BYTE && (G = e.RGBA8I), O === e.SHORT && (G = e.RGBA16I), O === e.INT && (G = e.RGBA32I)), g === e.RGB && (O === e.UNSIGNED_INT_5_9_9_9_REV && (G = e.RGB9_E5), O === e.UNSIGNED_INT_10F_11F_11F_REV && (G = e.R11F_G11F_B10F)), g === e.RGBA) {
      const ue = Z ? $i : ke.getTransfer(Y);
      O === e.FLOAT && (G = e.RGBA32F), O === e.HALF_FLOAT && (G = e.RGBA16F), O === e.UNSIGNED_BYTE && (G = ue === "srgb" ? e.SRGB8_ALPHA8 : e.RGBA8), O === e.UNSIGNED_SHORT_4_4_4_4 && (G = e.RGBA4), O === e.UNSIGNED_SHORT_5_5_5_1 && (G = e.RGB5_A1);
    }
    return (G === e.R16F || G === e.R32F || G === e.RG16F || G === e.RG32F || G === e.RGBA16F || G === e.RGBA32F) && t.get("EXT_color_buffer_float"), G;
  }
  function E(T, g) {
    let O;
    return T ? g === null || g === 1014 || g === 1020 ? O = e.DEPTH24_STENCIL8 : g === 1015 ? O = e.DEPTH32F_STENCIL8 : g === 1012 && (O = e.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : g === null || g === 1014 || g === 1020 ? O = e.DEPTH_COMPONENT24 : g === 1015 ? O = e.DEPTH_COMPONENT32F : g === 1012 && (O = e.DEPTH_COMPONENT16), O;
  }
  function D(T, g) {
    return m(T) === !0 || T.isFramebufferTexture && T.minFilter !== 1003 && T.minFilter !== 1006 ? Math.log2(Math.max(g.width, g.height)) + 1 : T.mipmaps !== void 0 && T.mipmaps.length > 0 ? T.mipmaps.length : T.isCompressedTexture && Array.isArray(T.image) ? g.mipmaps.length : 1;
  }
  function A(T) {
    const g = T.target;
    g.removeEventListener("dispose", A), N(g), g.isVideoTexture && h.delete(g);
  }
  function P(T) {
    const g = T.target;
    g.removeEventListener("dispose", P), S(g);
  }
  function N(T) {
    const g = i.get(T);
    if (g.__webglInit === void 0) return;
    const O = T.source, Y = d.get(O);
    if (Y) {
      const Z = Y[g.__cacheKey];
      Z.usedTimes--, Z.usedTimes === 0 && y(T), Object.keys(Y).length === 0 && d.delete(O);
    }
    i.remove(T);
  }
  function y(T) {
    const g = i.get(T);
    e.deleteTexture(g.__webglTexture);
    const O = T.source, Y = d.get(O);
    delete Y[g.__cacheKey], a.memory.textures--;
  }
  function S(T) {
    const g = i.get(T);
    if (T.depthTexture && (T.depthTexture.dispose(), i.remove(T.depthTexture)), T.isWebGLCubeRenderTarget) for (let Y = 0; Y < 6; Y++) {
      if (Array.isArray(g.__webglFramebuffer[Y])) for (let Z = 0; Z < g.__webglFramebuffer[Y].length; Z++) e.deleteFramebuffer(g.__webglFramebuffer[Y][Z]);
      else e.deleteFramebuffer(g.__webglFramebuffer[Y]);
      g.__webglDepthbuffer && e.deleteRenderbuffer(g.__webglDepthbuffer[Y]);
    }
    else {
      if (Array.isArray(g.__webglFramebuffer)) for (let Y = 0; Y < g.__webglFramebuffer.length; Y++) e.deleteFramebuffer(g.__webglFramebuffer[Y]);
      else e.deleteFramebuffer(g.__webglFramebuffer);
      if (g.__webglDepthbuffer && e.deleteRenderbuffer(g.__webglDepthbuffer), g.__webglMultisampledFramebuffer && e.deleteFramebuffer(g.__webglMultisampledFramebuffer), g.__webglColorRenderbuffer)
        for (let Y = 0; Y < g.__webglColorRenderbuffer.length; Y++) g.__webglColorRenderbuffer[Y] && e.deleteRenderbuffer(g.__webglColorRenderbuffer[Y]);
      g.__webglDepthRenderbuffer && e.deleteRenderbuffer(g.__webglDepthRenderbuffer);
    }
    const O = T.textures;
    for (let Y = 0, Z = O.length; Y < Z; Y++) {
      const G = i.get(O[Y]);
      G.__webglTexture && (e.deleteTexture(G.__webglTexture), a.memory.textures--), i.remove(O[Y]);
    }
    i.remove(T);
  }
  let w = 0;
  function F() {
    w = 0;
  }
  function H() {
    const T = w;
    return T >= r.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + T + " texture units while this GPU supports only " + r.maxTextures), w += 1, T;
  }
  function V(T) {
    const g = [];
    return g.push(T.wrapS), g.push(T.wrapT), g.push(T.wrapR || 0), g.push(T.magFilter), g.push(T.minFilter), g.push(T.anisotropy), g.push(T.internalFormat), g.push(T.format), g.push(T.type), g.push(T.generateMipmaps), g.push(T.premultiplyAlpha), g.push(T.flipY), g.push(T.unpackAlignment), g.push(T.colorSpace), g.join();
  }
  function j(T, g) {
    const O = i.get(T);
    if (T.isVideoTexture && mt(T), T.isRenderTargetTexture === !1 && T.isExternalTexture !== !0 && T.version > 0 && O.__version !== T.version) {
      const Y = T.image;
      if (Y === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (Y.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        ie(O, T, g);
        return;
      }
    } else T.isExternalTexture && (O.__webglTexture = T.sourceTexture ? T.sourceTexture : null);
    n.bindTexture(e.TEXTURE_2D, O.__webglTexture, e.TEXTURE0 + g);
  }
  function k(T, g) {
    const O = i.get(T);
    if (T.isRenderTargetTexture === !1 && T.version > 0 && O.__version !== T.version) {
      ie(O, T, g);
      return;
    }
    n.bindTexture(e.TEXTURE_2D_ARRAY, O.__webglTexture, e.TEXTURE0 + g);
  }
  function J(T, g) {
    const O = i.get(T);
    if (T.isRenderTargetTexture === !1 && T.version > 0 && O.__version !== T.version) {
      ie(O, T, g);
      return;
    }
    n.bindTexture(e.TEXTURE_3D, O.__webglTexture, e.TEXTURE0 + g);
  }
  function W(T, g) {
    const O = i.get(T);
    if (T.version > 0 && O.__version !== T.version) {
      re(O, T, g);
      return;
    }
    n.bindTexture(e.TEXTURE_CUBE_MAP, O.__webglTexture, e.TEXTURE0 + g);
  }
  const ee = {
    [Vr]: e.REPEAT,
    [En]: e.CLAMP_TO_EDGE,
    [Hr]: e.MIRRORED_REPEAT
  }, he = {
    [en]: e.NEAREST,
    [fo]: e.NEAREST_MIPMAP_NEAREST,
    [po]: e.NEAREST_MIPMAP_LINEAR,
    [Tn]: e.LINEAR,
    [mo]: e.LINEAR_MIPMAP_NEAREST,
    [Yr]: e.LINEAR_MIPMAP_LINEAR
  }, Le = {
    512: e.NEVER,
    519: e.ALWAYS,
    513: e.LESS,
    515: e.LEQUAL,
    514: e.EQUAL,
    518: e.GEQUAL,
    516: e.GREATER,
    517: e.NOTEQUAL
  };
  function Fe(T, g) {
    if (g.type === 1015 && t.has("OES_texture_float_linear") === !1 && (g.magFilter === 1006 || g.magFilter === 1007 || g.magFilter === 1005 || g.magFilter === 1008 || g.minFilter === 1006 || g.minFilter === 1007 || g.minFilter === 1005 || g.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), e.texParameteri(T, e.TEXTURE_WRAP_S, ee[g.wrapS]), e.texParameteri(T, e.TEXTURE_WRAP_T, ee[g.wrapT]), (T === e.TEXTURE_3D || T === e.TEXTURE_2D_ARRAY) && e.texParameteri(T, e.TEXTURE_WRAP_R, ee[g.wrapR]), e.texParameteri(T, e.TEXTURE_MAG_FILTER, he[g.magFilter]), e.texParameteri(T, e.TEXTURE_MIN_FILTER, he[g.minFilter]), g.compareFunction && (e.texParameteri(T, e.TEXTURE_COMPARE_MODE, e.COMPARE_REF_TO_TEXTURE), e.texParameteri(T, e.TEXTURE_COMPARE_FUNC, Le[g.compareFunction])), t.has("EXT_texture_filter_anisotropic") === !0) {
      if (g.magFilter === 1003 || g.minFilter !== 1005 && g.minFilter !== 1008 || g.type === 1015 && t.has("OES_texture_float_linear") === !1) return;
      if (g.anisotropy > 1 || i.get(g).__currentAnisotropy) {
        const O = t.get("EXT_texture_filter_anisotropic");
        e.texParameterf(T, O.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(g.anisotropy, r.getMaxAnisotropy())), i.get(g).__currentAnisotropy = g.anisotropy;
      }
    }
  }
  function nt(T, g) {
    let O = !1;
    T.__webglInit === void 0 && (T.__webglInit = !0, g.addEventListener("dispose", A));
    const Y = g.source;
    let Z = d.get(Y);
    Z === void 0 && (Z = {}, d.set(Y, Z));
    const G = V(g);
    if (G !== T.__cacheKey) {
      Z[G] === void 0 && (Z[G] = {
        texture: e.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, O = !0), Z[G].usedTimes++;
      const ue = Z[T.__cacheKey];
      ue !== void 0 && (Z[T.__cacheKey].usedTimes--, ue.usedTimes === 0 && y(g)), T.__cacheKey = G, T.__webglTexture = Z[G].texture;
    }
    return O;
  }
  function We(T, g, O) {
    return Math.floor(Math.floor(T / O) / g);
  }
  function X(T, g, O, Y) {
    const G = T.updateRanges;
    if (G.length === 0) n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, g.width, g.height, O, Y, g.data);
    else {
      G.sort((Q, oe) => Q.start - oe.start);
      let ue = 0;
      for (let Q = 1; Q < G.length; Q++) {
        const oe = G[ue], Se = G[Q], ye = oe.start + oe.count, le = We(Se.start, g.width, 4), Ie = We(oe.start, g.width, 4);
        Se.start <= ye + 1 && le === Ie && We(Se.start + Se.count - 1, g.width, 4) === le ? oe.count = Math.max(oe.count, Se.start + Se.count - oe.start) : (++ue, G[ue] = Se);
      }
      G.length = ue + 1;
      const ne = e.getParameter(e.UNPACK_ROW_LENGTH), ge = e.getParameter(e.UNPACK_SKIP_PIXELS), Re = e.getParameter(e.UNPACK_SKIP_ROWS);
      e.pixelStorei(e.UNPACK_ROW_LENGTH, g.width);
      for (let Q = 0, oe = G.length; Q < oe; Q++) {
        const Se = G[Q], ye = Math.floor(Se.start / 4), le = Math.ceil(Se.count / 4), Ie = ye % g.width, C = Math.floor(ye / g.width), ae = le, te = 1;
        e.pixelStorei(e.UNPACK_SKIP_PIXELS, Ie), e.pixelStorei(e.UNPACK_SKIP_ROWS, C), n.texSubImage2D(e.TEXTURE_2D, 0, Ie, C, ae, te, O, Y, g.data);
      }
      T.clearUpdateRanges(), e.pixelStorei(e.UNPACK_ROW_LENGTH, ne), e.pixelStorei(e.UNPACK_SKIP_PIXELS, ge), e.pixelStorei(e.UNPACK_SKIP_ROWS, Re);
    }
  }
  function ie(T, g, O) {
    let Y = e.TEXTURE_2D;
    (g.isDataArrayTexture || g.isCompressedArrayTexture) && (Y = e.TEXTURE_2D_ARRAY), g.isData3DTexture && (Y = e.TEXTURE_3D);
    const Z = nt(T, g), G = g.source;
    n.bindTexture(Y, T.__webglTexture, e.TEXTURE0 + O);
    const ue = i.get(G);
    if (G.version !== ue.__version || Z === !0) {
      n.activeTexture(e.TEXTURE0 + O);
      const ne = ke.getPrimaries(ke.workingColorSpace), ge = g.colorSpace === "" ? null : ke.getPrimaries(g.colorSpace), Re = g.colorSpace === "" || ne === ge ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
      e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, g.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, g.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, Re);
      let Q = _(g.image, !1, r.maxTextureSize);
      Q = ft(g, Q);
      const oe = s.convert(g.format, g.colorSpace), Se = s.convert(g.type);
      let ye = x(g.internalFormat, oe, Se, g.colorSpace, g.isVideoTexture);
      Fe(Y, g);
      let le;
      const Ie = g.mipmaps, C = g.isVideoTexture !== !0, ae = ue.__version === void 0 || Z === !0, te = G.dataReady, _e = D(g, Q);
      if (g.isDepthTexture)
        ye = E(g.format === xa, g.type), ae && (C ? n.texStorage2D(e.TEXTURE_2D, 1, ye, Q.width, Q.height) : n.texImage2D(e.TEXTURE_2D, 0, ye, Q.width, Q.height, 0, oe, Se, null));
      else if (g.isDataTexture) if (Ie.length > 0) {
        C && ae && n.texStorage2D(e.TEXTURE_2D, _e, ye, Ie[0].width, Ie[0].height);
        for (let $ = 0, q = Ie.length; $ < q; $++)
          le = Ie[$], C ? te && n.texSubImage2D(e.TEXTURE_2D, $, 0, 0, le.width, le.height, oe, Se, le.data) : n.texImage2D(e.TEXTURE_2D, $, ye, le.width, le.height, 0, oe, Se, le.data);
        g.generateMipmaps = !1;
      } else C ? (ae && n.texStorage2D(e.TEXTURE_2D, _e, ye, Q.width, Q.height), te && X(g, Q, oe, Se)) : n.texImage2D(e.TEXTURE_2D, 0, ye, Q.width, Q.height, 0, oe, Se, Q.data);
      else if (g.isCompressedTexture) if (g.isCompressedArrayTexture) {
        C && ae && n.texStorage3D(e.TEXTURE_2D_ARRAY, _e, ye, Ie[0].width, Ie[0].height, Q.depth);
        for (let $ = 0, q = Ie.length; $ < q; $++)
          if (le = Ie[$], g.format !== 1023) if (oe !== null) if (C) {
            if (te) if (g.layerUpdates.size > 0) {
              const me = Xs(le.width, le.height, g.format, g.type);
              for (const Ae of g.layerUpdates) {
                const at = le.data.subarray(Ae * me / le.data.BYTES_PER_ELEMENT, (Ae + 1) * me / le.data.BYTES_PER_ELEMENT);
                n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, $, 0, 0, Ae, le.width, le.height, 1, oe, at);
              }
              g.clearLayerUpdates();
            } else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY, $, 0, 0, 0, le.width, le.height, Q.depth, oe, le.data);
          } else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY, $, ye, le.width, le.height, Q.depth, 0, le.data, 0, 0);
          else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
          else C ? te && n.texSubImage3D(e.TEXTURE_2D_ARRAY, $, 0, 0, 0, le.width, le.height, Q.depth, oe, Se, le.data) : n.texImage3D(e.TEXTURE_2D_ARRAY, $, ye, le.width, le.height, Q.depth, 0, oe, Se, le.data);
      } else {
        C && ae && n.texStorage2D(e.TEXTURE_2D, _e, ye, Ie[0].width, Ie[0].height);
        for (let $ = 0, q = Ie.length; $ < q; $++)
          le = Ie[$], g.format !== 1023 ? oe !== null ? C ? te && n.compressedTexSubImage2D(e.TEXTURE_2D, $, 0, 0, le.width, le.height, oe, le.data) : n.compressedTexImage2D(e.TEXTURE_2D, $, ye, le.width, le.height, 0, le.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : C ? te && n.texSubImage2D(e.TEXTURE_2D, $, 0, 0, le.width, le.height, oe, Se, le.data) : n.texImage2D(e.TEXTURE_2D, $, ye, le.width, le.height, 0, oe, Se, le.data);
      }
      else if (g.isDataArrayTexture) if (C) {
        if (ae && n.texStorage3D(e.TEXTURE_2D_ARRAY, _e, ye, Q.width, Q.height, Q.depth), te) if (g.layerUpdates.size > 0) {
          const $ = Xs(Q.width, Q.height, g.format, g.type);
          for (const q of g.layerUpdates) {
            const me = Q.data.subarray(q * $ / Q.data.BYTES_PER_ELEMENT, (q + 1) * $ / Q.data.BYTES_PER_ELEMENT);
            n.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, q, Q.width, Q.height, 1, oe, Se, me);
          }
          g.clearLayerUpdates();
        } else n.texSubImage3D(e.TEXTURE_2D_ARRAY, 0, 0, 0, 0, Q.width, Q.height, Q.depth, oe, Se, Q.data);
      } else n.texImage3D(e.TEXTURE_2D_ARRAY, 0, ye, Q.width, Q.height, Q.depth, 0, oe, Se, Q.data);
      else if (g.isData3DTexture) C ? (ae && n.texStorage3D(e.TEXTURE_3D, _e, ye, Q.width, Q.height, Q.depth), te && n.texSubImage3D(e.TEXTURE_3D, 0, 0, 0, 0, Q.width, Q.height, Q.depth, oe, Se, Q.data)) : n.texImage3D(e.TEXTURE_3D, 0, ye, Q.width, Q.height, Q.depth, 0, oe, Se, Q.data);
      else if (g.isFramebufferTexture) {
        if (ae) if (C) n.texStorage2D(e.TEXTURE_2D, _e, ye, Q.width, Q.height);
        else {
          let $ = Q.width, q = Q.height;
          for (let me = 0; me < _e; me++)
            n.texImage2D(e.TEXTURE_2D, me, ye, $, q, 0, oe, Se, null), $ >>= 1, q >>= 1;
        }
      } else if (Ie.length > 0) {
        if (C && ae) {
          const $ = rt(Ie[0]);
          n.texStorage2D(e.TEXTURE_2D, _e, ye, $.width, $.height);
        }
        for (let $ = 0, q = Ie.length; $ < q; $++)
          le = Ie[$], C ? te && n.texSubImage2D(e.TEXTURE_2D, $, 0, 0, oe, Se, le) : n.texImage2D(e.TEXTURE_2D, $, ye, oe, Se, le);
        g.generateMipmaps = !1;
      } else if (C) {
        if (ae) {
          const $ = rt(Q);
          n.texStorage2D(e.TEXTURE_2D, _e, ye, $.width, $.height);
        }
        te && n.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, oe, Se, Q);
      } else n.texImage2D(e.TEXTURE_2D, 0, ye, oe, Se, Q);
      m(g) && f(Y), ue.__version = G.version, g.onUpdate && g.onUpdate(g);
    }
    T.__version = g.version;
  }
  function re(T, g, O) {
    if (g.image.length !== 6) return;
    const Y = nt(T, g), Z = g.source;
    n.bindTexture(e.TEXTURE_CUBE_MAP, T.__webglTexture, e.TEXTURE0 + O);
    const G = i.get(Z);
    if (Z.version !== G.__version || Y === !0) {
      n.activeTexture(e.TEXTURE0 + O);
      const ue = ke.getPrimaries(ke.workingColorSpace), ne = g.colorSpace === "" ? null : ke.getPrimaries(g.colorSpace), ge = g.colorSpace === "" || ue === ne ? e.NONE : e.BROWSER_DEFAULT_WEBGL;
      e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, g.flipY), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, g.premultiplyAlpha), e.pixelStorei(e.UNPACK_ALIGNMENT, g.unpackAlignment), e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL, ge);
      const Re = g.isCompressedTexture || g.image[0].isCompressedTexture, Q = g.image[0] && g.image[0].isDataTexture, oe = [];
      for (let q = 0; q < 6; q++)
        !Re && !Q ? oe[q] = _(g.image[q], !0, r.maxCubemapSize) : oe[q] = Q ? g.image[q].image : g.image[q], oe[q] = ft(g, oe[q]);
      const Se = oe[0], ye = s.convert(g.format, g.colorSpace), le = s.convert(g.type), Ie = x(g.internalFormat, ye, le, g.colorSpace), C = g.isVideoTexture !== !0, ae = G.__version === void 0 || Y === !0, te = Z.dataReady;
      let _e = D(g, Se);
      Fe(e.TEXTURE_CUBE_MAP, g);
      let $;
      if (Re) {
        C && ae && n.texStorage2D(e.TEXTURE_CUBE_MAP, _e, Ie, Se.width, Se.height);
        for (let q = 0; q < 6; q++) {
          $ = oe[q].mipmaps;
          for (let me = 0; me < $.length; me++) {
            const Ae = $[me];
            g.format !== 1023 ? ye !== null ? C ? te && n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me, 0, 0, Ae.width, Ae.height, ye, Ae.data) : n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me, Ie, Ae.width, Ae.height, 0, Ae.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : C ? te && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me, 0, 0, Ae.width, Ae.height, ye, le, Ae.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me, Ie, Ae.width, Ae.height, 0, ye, le, Ae.data);
          }
        }
      } else {
        if ($ = g.mipmaps, C && ae) {
          $.length > 0 && _e++;
          const q = rt(oe[0]);
          n.texStorage2D(e.TEXTURE_CUBE_MAP, _e, Ie, q.width, q.height);
        }
        for (let q = 0; q < 6; q++) if (Q) {
          C ? te && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, oe[q].width, oe[q].height, ye, le, oe[q].data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ie, oe[q].width, oe[q].height, 0, ye, le, oe[q].data);
          for (let me = 0; me < $.length; me++) {
            const Ae = $[me].image[q].image;
            C ? te && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me + 1, 0, 0, Ae.width, Ae.height, ye, le, Ae.data) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me + 1, Ie, Ae.width, Ae.height, 0, ye, le, Ae.data);
          }
        } else {
          C ? te && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, 0, 0, ye, le, oe[q]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, 0, Ie, ye, le, oe[q]);
          for (let me = 0; me < $.length; me++) {
            const Ae = $[me];
            C ? te && n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me + 1, 0, 0, ye, le, Ae.image[q]) : n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X + q, me + 1, Ie, ye, le, Ae.image[q]);
          }
        }
      }
      m(g) && f(e.TEXTURE_CUBE_MAP), G.__version = Z.version, g.onUpdate && g.onUpdate(g);
    }
    T.__version = g.version;
  }
  function Me(T, g, O, Y, Z, G) {
    const ue = s.convert(O.format, O.colorSpace), ne = s.convert(O.type), ge = x(O.internalFormat, ue, ne, O.colorSpace), Re = i.get(g), Q = i.get(O);
    if (Q.__renderTarget = g, !Re.__hasExternalTextures) {
      const oe = Math.max(1, g.width >> G), Se = Math.max(1, g.height >> G);
      Z === e.TEXTURE_3D || Z === e.TEXTURE_2D_ARRAY ? n.texImage3D(Z, G, ge, oe, Se, g.depth, 0, ue, ne, null) : n.texImage2D(Z, G, ge, oe, Se, 0, ue, ne, null);
    }
    n.bindFramebuffer(e.FRAMEBUFFER, T), be(g) ? o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, Y, Z, Q.__webglTexture, 0, Ee(g)) : (Z === e.TEXTURE_2D || Z >= e.TEXTURE_CUBE_MAP_POSITIVE_X && Z <= e.TEXTURE_CUBE_MAP_NEGATIVE_Z) && e.framebufferTexture2D(e.FRAMEBUFFER, Y, Z, Q.__webglTexture, G), n.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  function De(T, g, O) {
    if (e.bindRenderbuffer(e.RENDERBUFFER, T), g.depthBuffer) {
      const Y = g.depthTexture, Z = Y && Y.isDepthTexture ? Y.type : null, G = E(g.stencilBuffer, Z), ue = g.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, ne = Ee(g);
      be(g) ? o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, ne, G, g.width, g.height) : O ? e.renderbufferStorageMultisample(e.RENDERBUFFER, ne, G, g.width, g.height) : e.renderbufferStorage(e.RENDERBUFFER, G, g.width, g.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, ue, e.RENDERBUFFER, T);
    } else {
      const Y = g.textures;
      for (let Z = 0; Z < Y.length; Z++) {
        const G = Y[Z], ue = s.convert(G.format, G.colorSpace), ne = s.convert(G.type), ge = x(G.internalFormat, ue, ne, G.colorSpace), Re = Ee(g);
        O && be(g) === !1 ? e.renderbufferStorageMultisample(e.RENDERBUFFER, Re, ge, g.width, g.height) : be(g) ? o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER, Re, ge, g.width, g.height) : e.renderbufferStorage(e.RENDERBUFFER, ge, g.width, g.height);
      }
    }
    e.bindRenderbuffer(e.RENDERBUFFER, null);
  }
  function pe(T, g) {
    if (g && g.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (n.bindFramebuffer(e.FRAMEBUFFER, T), !(g.depthTexture && g.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const O = i.get(g.depthTexture);
    O.__renderTarget = g, (!O.__webglTexture || g.depthTexture.image.width !== g.width || g.depthTexture.image.height !== g.height) && (g.depthTexture.image.width = g.width, g.depthTexture.image.height = g.height, g.depthTexture.needsUpdate = !0), j(g.depthTexture, 0);
    const Y = O.__webglTexture, Z = Ee(g);
    if (g.depthTexture.format === 1026) be(g) ? o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, Y, 0, Z) : e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.TEXTURE_2D, Y, 0);
    else if (g.depthTexture.format === 1027) be(g) ? o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.TEXTURE_2D, Y, 0, Z) : e.framebufferTexture2D(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.TEXTURE_2D, Y, 0);
    else throw new Error("Unknown depthTexture format");
  }
  function je(T) {
    const g = i.get(T), O = T.isWebGLCubeRenderTarget === !0;
    if (g.__boundDepthTexture !== T.depthTexture) {
      const Y = T.depthTexture;
      if (g.__depthDisposeCallback && g.__depthDisposeCallback(), Y) {
        const Z = () => {
          delete g.__boundDepthTexture, delete g.__depthDisposeCallback, Y.removeEventListener("dispose", Z);
        };
        Y.addEventListener("dispose", Z), g.__depthDisposeCallback = Z;
      }
      g.__boundDepthTexture = Y;
    }
    if (T.depthTexture && !g.__autoAllocateDepthBuffer) {
      if (O) throw new Error("target.depthTexture not supported in Cube render targets");
      const Y = T.texture.mipmaps;
      Y && Y.length > 0 ? pe(g.__webglFramebuffer[0], T) : pe(g.__webglFramebuffer, T);
    } else if (O) {
      g.__webglDepthbuffer = [];
      for (let Y = 0; Y < 6; Y++)
        if (n.bindFramebuffer(e.FRAMEBUFFER, g.__webglFramebuffer[Y]), g.__webglDepthbuffer[Y] === void 0)
          g.__webglDepthbuffer[Y] = e.createRenderbuffer(), De(g.__webglDepthbuffer[Y], T, !1);
        else {
          const Z = T.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, G = g.__webglDepthbuffer[Y];
          e.bindRenderbuffer(e.RENDERBUFFER, G), e.framebufferRenderbuffer(e.FRAMEBUFFER, Z, e.RENDERBUFFER, G);
        }
    } else {
      const Y = T.texture.mipmaps;
      if (Y && Y.length > 0 ? n.bindFramebuffer(e.FRAMEBUFFER, g.__webglFramebuffer[0]) : n.bindFramebuffer(e.FRAMEBUFFER, g.__webglFramebuffer), g.__webglDepthbuffer === void 0)
        g.__webglDepthbuffer = e.createRenderbuffer(), De(g.__webglDepthbuffer, T, !1);
      else {
        const Z = T.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, G = g.__webglDepthbuffer;
        e.bindRenderbuffer(e.RENDERBUFFER, G), e.framebufferRenderbuffer(e.FRAMEBUFFER, Z, e.RENDERBUFFER, G);
      }
    }
    n.bindFramebuffer(e.FRAMEBUFFER, null);
  }
  function R(T, g, O) {
    const Y = i.get(T);
    g !== void 0 && Me(Y.__webglFramebuffer, T, T.texture, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, 0), O !== void 0 && je(T);
  }
  function Ve(T) {
    const g = T.texture, O = i.get(T), Y = i.get(g);
    T.addEventListener("dispose", P);
    const Z = T.textures, G = T.isWebGLCubeRenderTarget === !0, ue = Z.length > 1;
    if (ue || (Y.__webglTexture === void 0 && (Y.__webglTexture = e.createTexture()), Y.__version = g.version, a.memory.textures++), G) {
      O.__webglFramebuffer = [];
      for (let ne = 0; ne < 6; ne++) if (g.mipmaps && g.mipmaps.length > 0) {
        O.__webglFramebuffer[ne] = [];
        for (let ge = 0; ge < g.mipmaps.length; ge++) O.__webglFramebuffer[ne][ge] = e.createFramebuffer();
      } else O.__webglFramebuffer[ne] = e.createFramebuffer();
    } else {
      if (g.mipmaps && g.mipmaps.length > 0) {
        O.__webglFramebuffer = [];
        for (let ne = 0; ne < g.mipmaps.length; ne++) O.__webglFramebuffer[ne] = e.createFramebuffer();
      } else O.__webglFramebuffer = e.createFramebuffer();
      if (ue) for (let ne = 0, ge = Z.length; ne < ge; ne++) {
        const Re = i.get(Z[ne]);
        Re.__webglTexture === void 0 && (Re.__webglTexture = e.createTexture(), a.memory.textures++);
      }
      if (T.samples > 0 && be(T) === !1) {
        O.__webglMultisampledFramebuffer = e.createFramebuffer(), O.__webglColorRenderbuffer = [], n.bindFramebuffer(e.FRAMEBUFFER, O.__webglMultisampledFramebuffer);
        for (let ne = 0; ne < Z.length; ne++) {
          const ge = Z[ne];
          O.__webglColorRenderbuffer[ne] = e.createRenderbuffer(), e.bindRenderbuffer(e.RENDERBUFFER, O.__webglColorRenderbuffer[ne]);
          const Re = s.convert(ge.format, ge.colorSpace), Q = s.convert(ge.type), oe = x(ge.internalFormat, Re, Q, ge.colorSpace, T.isXRRenderTarget === !0), Se = Ee(T);
          e.renderbufferStorageMultisample(e.RENDERBUFFER, Se, oe, T.width, T.height), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + ne, e.RENDERBUFFER, O.__webglColorRenderbuffer[ne]);
        }
        e.bindRenderbuffer(e.RENDERBUFFER, null), T.depthBuffer && (O.__webglDepthRenderbuffer = e.createRenderbuffer(), De(O.__webglDepthRenderbuffer, T, !0)), n.bindFramebuffer(e.FRAMEBUFFER, null);
      }
    }
    if (G) {
      n.bindTexture(e.TEXTURE_CUBE_MAP, Y.__webglTexture), Fe(e.TEXTURE_CUBE_MAP, g);
      for (let ne = 0; ne < 6; ne++) if (g.mipmaps && g.mipmaps.length > 0) for (let ge = 0; ge < g.mipmaps.length; ge++) Me(O.__webglFramebuffer[ne][ge], T, g, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + ne, ge);
      else Me(O.__webglFramebuffer[ne], T, g, e.COLOR_ATTACHMENT0, e.TEXTURE_CUBE_MAP_POSITIVE_X + ne, 0);
      m(g) && f(e.TEXTURE_CUBE_MAP), n.unbindTexture();
    } else if (ue) {
      for (let ne = 0, ge = Z.length; ne < ge; ne++) {
        const Re = Z[ne], Q = i.get(Re);
        let oe = e.TEXTURE_2D;
        (T.isWebGL3DRenderTarget || T.isWebGLArrayRenderTarget) && (oe = T.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), n.bindTexture(oe, Q.__webglTexture), Fe(oe, Re), Me(O.__webglFramebuffer, T, Re, e.COLOR_ATTACHMENT0 + ne, oe, 0), m(Re) && f(oe);
      }
      n.unbindTexture();
    } else {
      let ne = e.TEXTURE_2D;
      if ((T.isWebGL3DRenderTarget || T.isWebGLArrayRenderTarget) && (ne = T.isWebGL3DRenderTarget ? e.TEXTURE_3D : e.TEXTURE_2D_ARRAY), n.bindTexture(ne, Y.__webglTexture), Fe(ne, g), g.mipmaps && g.mipmaps.length > 0) for (let ge = 0; ge < g.mipmaps.length; ge++) Me(O.__webglFramebuffer[ge], T, g, e.COLOR_ATTACHMENT0, ne, ge);
      else Me(O.__webglFramebuffer, T, g, e.COLOR_ATTACHMENT0, ne, 0);
      m(g) && f(ne), n.unbindTexture();
    }
    T.depthBuffer && je(T);
  }
  function ze(T) {
    const g = T.textures;
    for (let O = 0, Y = g.length; O < Y; O++) {
      const Z = g[O];
      if (m(Z)) {
        const G = b(T), ue = i.get(Z).__webglTexture;
        n.bindTexture(G, ue), f(G), n.unbindTexture();
      }
    }
  }
  const Ke = [], xe = [];
  function Qe(T) {
    if (T.samples > 0) {
      if (be(T) === !1) {
        const g = T.textures, O = T.width, Y = T.height;
        let Z = e.COLOR_BUFFER_BIT;
        const G = T.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT, ue = i.get(T), ne = g.length > 1;
        if (ne) for (let Re = 0; Re < g.length; Re++)
          n.bindFramebuffer(e.FRAMEBUFFER, ue.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re, e.RENDERBUFFER, null), n.bindFramebuffer(e.FRAMEBUFFER, ue.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re, e.TEXTURE_2D, null, 0);
        n.bindFramebuffer(e.READ_FRAMEBUFFER, ue.__webglMultisampledFramebuffer);
        const ge = T.texture.mipmaps;
        ge && ge.length > 0 ? n.bindFramebuffer(e.DRAW_FRAMEBUFFER, ue.__webglFramebuffer[0]) : n.bindFramebuffer(e.DRAW_FRAMEBUFFER, ue.__webglFramebuffer);
        for (let Re = 0; Re < g.length; Re++) {
          if (T.resolveDepthBuffer && (T.depthBuffer && (Z |= e.DEPTH_BUFFER_BIT), T.stencilBuffer && T.resolveStencilBuffer && (Z |= e.STENCIL_BUFFER_BIT)), ne) {
            e.framebufferRenderbuffer(e.READ_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.RENDERBUFFER, ue.__webglColorRenderbuffer[Re]);
            const Q = i.get(g[Re]).__webglTexture;
            e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, Q, 0);
          }
          e.blitFramebuffer(0, 0, O, Y, 0, 0, O, Y, Z, e.NEAREST), l === !0 && (Ke.length = 0, xe.length = 0, Ke.push(e.COLOR_ATTACHMENT0 + Re), T.depthBuffer && T.resolveDepthBuffer === !1 && (Ke.push(G), xe.push(G), e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, xe)), e.invalidateFramebuffer(e.READ_FRAMEBUFFER, Ke));
        }
        if (n.bindFramebuffer(e.READ_FRAMEBUFFER, null), n.bindFramebuffer(e.DRAW_FRAMEBUFFER, null), ne) for (let Re = 0; Re < g.length; Re++) {
          n.bindFramebuffer(e.FRAMEBUFFER, ue.__webglMultisampledFramebuffer), e.framebufferRenderbuffer(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re, e.RENDERBUFFER, ue.__webglColorRenderbuffer[Re]);
          const Q = i.get(g[Re]).__webglTexture;
          n.bindFramebuffer(e.FRAMEBUFFER, ue.__webglFramebuffer), e.framebufferTexture2D(e.DRAW_FRAMEBUFFER, e.COLOR_ATTACHMENT0 + Re, e.TEXTURE_2D, Q, 0);
        }
        n.bindFramebuffer(e.DRAW_FRAMEBUFFER, ue.__webglMultisampledFramebuffer);
      } else if (T.depthBuffer && T.resolveDepthBuffer === !1 && l) {
        const g = T.stencilBuffer ? e.DEPTH_STENCIL_ATTACHMENT : e.DEPTH_ATTACHMENT;
        e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER, [g]);
      }
    }
  }
  function Ee(T) {
    return Math.min(r.maxSamples, T.samples);
  }
  function be(T) {
    const g = i.get(T);
    return T.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === !0 && g.__useRenderToTexture !== !1;
  }
  function mt(T) {
    const g = a.render.frame;
    h.get(T) !== g && (h.set(T, g), T.update());
  }
  function ft(T, g) {
    const O = T.colorSpace, Y = T.format, Z = T.type;
    return T.isCompressedTexture === !0 || T.isVideoTexture === !0 || O !== "srgb-linear" && O !== "" && (ke.getTransfer(O) === "srgb" ? (Y !== 1023 || Z !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", O)), g;
  }
  function rt(T) {
    return typeof HTMLImageElement < "u" && T instanceof HTMLImageElement ? (c.width = T.naturalWidth || T.width, c.height = T.naturalHeight || T.height) : typeof VideoFrame < "u" && T instanceof VideoFrame ? (c.width = T.displayWidth, c.height = T.displayHeight) : (c.width = T.width, c.height = T.height), c;
  }
  this.allocateTextureUnit = H, this.resetTextureUnits = F, this.setTexture2D = j, this.setTexture2DArray = k, this.setTexture3D = J, this.setTextureCube = W, this.rebindTextures = R, this.setupRenderTarget = Ve, this.updateRenderTargetMipmap = ze, this.updateMultisampleRenderTarget = Qe, this.setupDepthRenderbuffer = je, this.setupFrameBufferTexture = Me, this.useMultisampledRTT = be;
}
function Nu(e, t) {
  function n(i, r = "") {
    let s;
    const a = ke.getTransfer(r);
    if (i === 1009) return e.UNSIGNED_BYTE;
    if (i === 1017) return e.UNSIGNED_SHORT_4_4_4_4;
    if (i === 1018) return e.UNSIGNED_SHORT_5_5_5_1;
    if (i === 35902) return e.UNSIGNED_INT_5_9_9_9_REV;
    if (i === 35899) return e.UNSIGNED_INT_10F_11F_11F_REV;
    if (i === 1010) return e.BYTE;
    if (i === 1011) return e.SHORT;
    if (i === 1012) return e.UNSIGNED_SHORT;
    if (i === 1013) return e.INT;
    if (i === 1014) return e.UNSIGNED_INT;
    if (i === 1015) return e.FLOAT;
    if (i === 1016) return e.HALF_FLOAT;
    if (i === 1021) return e.ALPHA;
    if (i === 1022) return e.RGB;
    if (i === 1023) return e.RGBA;
    if (i === 1026) return e.DEPTH_COMPONENT;
    if (i === 1027) return e.DEPTH_STENCIL;
    if (i === 1028) return e.RED;
    if (i === 1029) return e.RED_INTEGER;
    if (i === 1030) return e.RG;
    if (i === 1031) return e.RG_INTEGER;
    if (i === 1033) return e.RGBA_INTEGER;
    if (i === 33776 || i === 33777 || i === 33778 || i === 33779) if (a === "srgb")
      if (s = t.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
        if (i === 33776) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        if (i === 33777) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        if (i === 33778) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        if (i === 33779) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      } else return null;
    else if (s = t.get("WEBGL_compressed_texture_s3tc"), s !== null) {
      if (i === 33776) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
      if (i === 33777) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      if (i === 33778) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      if (i === 33779) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    } else return null;
    if (i === 35840 || i === 35841 || i === 35842 || i === 35843)
      if (s = t.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (i === 35840) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (i === 35841) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (i === 35842) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (i === 35843) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
    if (i === 36196 || i === 37492 || i === 37496)
      if (s = t.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (i === 36196 || i === 37492) return a === "srgb" ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (i === 37496) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
    if (i === 37808 || i === 37809 || i === 37810 || i === 37811 || i === 37812 || i === 37813 || i === 37814 || i === 37815 || i === 37816 || i === 37817 || i === 37818 || i === 37819 || i === 37820 || i === 37821)
      if (s = t.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (i === 37808) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (i === 37809) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (i === 37810) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (i === 37811) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (i === 37812) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (i === 37813) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (i === 37814) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (i === 37815) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (i === 37816) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (i === 37817) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (i === 37818) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (i === 37819) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (i === 37820) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (i === 37821) return a === "srgb" ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
    if (i === 36492 || i === 36494 || i === 36495)
      if (s = t.get("EXT_texture_compression_bptc"), s !== null) {
        if (i === 36492) return a === "srgb" ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (i === 36494) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (i === 36495) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
    if (i === 36283 || i === 36284 || i === 36285 || i === 36286)
      if (s = t.get("EXT_texture_compression_rgtc"), s !== null) {
        if (i === 36283) return s.COMPRESSED_RED_RGTC1_EXT;
        if (i === 36284) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (i === 36285) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (i === 36286) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
    return i === 1020 ? e.UNSIGNED_INT_24_8 : e[i] !== void 0 ? e[i] : null;
  }
  return { convert: n };
}
var Ou = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Fu = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`, Bu = class {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t) {
    if (this.texture === null) {
      const n = new Ga(e.texture);
      (e.depthNear !== t.depthNear || e.depthFar !== t.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = n;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new dn({
        vertexShader: Ou,
        fragmentShader: Fu,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new xt(new qa(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
}, zu = class extends An {
  constructor(e, t) {
    super();
    const n = this;
    let i = null, r = 1, s = null, a = "local-floor", o = 1, l = null, c = null, h = null, u = null, d = null, p = null;
    const M = typeof XRWebGLBinding < "u", _ = new Bu(), m = {}, f = t.getContextAttributes();
    let b = null, x = null;
    const E = [], D = [], A = new Te();
    let P = null;
    const N = new Lt();
    N.viewport = new lt();
    const y = new Lt();
    y.viewport = new lt();
    const S = [N, y], w = new Rc();
    let F = null, H = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(X) {
      let ie = E[X];
      return ie === void 0 && (ie = new Rr(), E[X] = ie), ie.getTargetRaySpace();
    }, this.getControllerGrip = function(X) {
      let ie = E[X];
      return ie === void 0 && (ie = new Rr(), E[X] = ie), ie.getGripSpace();
    }, this.getHand = function(X) {
      let ie = E[X];
      return ie === void 0 && (ie = new Rr(), E[X] = ie), ie.getHandSpace();
    };
    function V(X) {
      const ie = D.indexOf(X.inputSource);
      if (ie === -1) return;
      const re = E[ie];
      re !== void 0 && (re.update(X.inputSource, X.frame, l || s), re.dispatchEvent({
        type: X.type,
        data: X.inputSource
      }));
    }
    function j() {
      i.removeEventListener("select", V), i.removeEventListener("selectstart", V), i.removeEventListener("selectend", V), i.removeEventListener("squeeze", V), i.removeEventListener("squeezestart", V), i.removeEventListener("squeezeend", V), i.removeEventListener("end", j), i.removeEventListener("inputsourceschange", k);
      for (let X = 0; X < E.length; X++) {
        const ie = D[X];
        ie !== null && (D[X] = null, E[X].disconnect(ie));
      }
      F = null, H = null, _.reset();
      for (const X in m) delete m[X];
      e.setRenderTarget(b), d = null, u = null, h = null, i = null, x = null, We.stop(), n.isPresenting = !1, e.setPixelRatio(P), e.setSize(A.width, A.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(X) {
      r = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(X) {
      a = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return l || s;
    }, this.setReferenceSpace = function(X) {
      l = X;
    }, this.getBaseLayer = function() {
      return u !== null ? u : d;
    }, this.getBinding = function() {
      return h === null && M && (h = new XRWebGLBinding(i, t)), h;
    }, this.getFrame = function() {
      return p;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function(X) {
      if (i = X, i !== null) {
        if (b = e.getRenderTarget(), i.addEventListener("select", V), i.addEventListener("selectstart", V), i.addEventListener("selectend", V), i.addEventListener("squeeze", V), i.addEventListener("squeezestart", V), i.addEventListener("squeezeend", V), i.addEventListener("end", j), i.addEventListener("inputsourceschange", k), f.xrCompatible !== !0 && await t.makeXRCompatible(), P = e.getPixelRatio(), e.getSize(A), M && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let ie = null, re = null, Me = null;
          f.depth && (Me = f.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, ie = f.stencil ? xa : Ma, re = f.stencil ? yo : qr);
          const De = {
            colorFormat: t.RGBA8,
            depthFormat: Me,
            scaleFactor: r
          };
          h = this.getBinding(), u = h.createProjectionLayer(De), i.updateRenderState({ layers: [u] }), e.setPixelRatio(1), e.setSize(u.textureWidth, u.textureHeight, !1), x = new bn(u.textureWidth, u.textureHeight, {
            format: pi,
            type: $n,
            depthTexture: new Ha(u.textureWidth, u.textureHeight, re, void 0, void 0, void 0, void 0, void 0, void 0, ie),
            stencilBuffer: f.stencil,
            colorSpace: e.outputColorSpace,
            samples: f.antialias ? 4 : 0,
            resolveDepthBuffer: u.ignoreDepthValues === !1,
            resolveStencilBuffer: u.ignoreDepthValues === !1
          });
        } else {
          const ie = {
            antialias: f.antialias,
            alpha: !0,
            depth: f.depth,
            stencil: f.stencil,
            framebufferScaleFactor: r
          };
          d = new XRWebGLLayer(i, t, ie), i.updateRenderState({ baseLayer: d }), e.setPixelRatio(1), e.setSize(d.framebufferWidth, d.framebufferHeight, !1), x = new bn(d.framebufferWidth, d.framebufferHeight, {
            format: pi,
            type: $n,
            colorSpace: e.outputColorSpace,
            stencilBuffer: f.stencil,
            resolveDepthBuffer: d.ignoreDepthValues === !1,
            resolveStencilBuffer: d.ignoreDepthValues === !1
          });
        }
        x.isXRRenderTarget = !0, this.setFoveation(o), l = null, s = await i.requestReferenceSpace(a), We.setContext(i), We.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null) return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return _.getDepthTexture();
    };
    function k(X) {
      for (let ie = 0; ie < X.removed.length; ie++) {
        const re = X.removed[ie], Me = D.indexOf(re);
        Me >= 0 && (D[Me] = null, E[Me].disconnect(re));
      }
      for (let ie = 0; ie < X.added.length; ie++) {
        const re = X.added[ie];
        let Me = D.indexOf(re);
        if (Me === -1) {
          for (let pe = 0; pe < E.length; pe++) if (pe >= D.length) {
            D.push(re), Me = pe;
            break;
          } else if (D[pe] === null) {
            D[pe] = re, Me = pe;
            break;
          }
          if (Me === -1) break;
        }
        const De = E[Me];
        De && De.connect(re);
      }
    }
    const J = new U(), W = new U();
    function ee(X, ie, re) {
      J.setFromMatrixPosition(ie.matrixWorld), W.setFromMatrixPosition(re.matrixWorld);
      const Me = J.distanceTo(W), De = ie.projectionMatrix.elements, pe = re.projectionMatrix.elements, je = De[14] / (De[10] - 1), R = De[14] / (De[10] + 1), Ve = (De[9] + 1) / De[5], ze = (De[9] - 1) / De[5], Ke = (De[8] - 1) / De[0], xe = (pe[8] + 1) / pe[0], Qe = je * Ke, Ee = je * xe, be = Me / (-Ke + xe), mt = be * -Ke;
      if (ie.matrixWorld.decompose(X.position, X.quaternion, X.scale), X.translateX(mt), X.translateZ(be), X.matrixWorld.compose(X.position, X.quaternion, X.scale), X.matrixWorldInverse.copy(X.matrixWorld).invert(), De[10] === -1)
        X.projectionMatrix.copy(ie.projectionMatrix), X.projectionMatrixInverse.copy(ie.projectionMatrixInverse);
      else {
        const ft = je + be, rt = R + be, T = Qe - mt, g = Ee + (Me - mt), O = Ve * R / rt * ft, Y = ze * R / rt * ft;
        X.projectionMatrix.makePerspective(T, g, O, Y, ft, rt), X.projectionMatrixInverse.copy(X.projectionMatrix).invert();
      }
    }
    function he(X, ie) {
      ie === null ? X.matrixWorld.copy(X.matrix) : X.matrixWorld.multiplyMatrices(ie.matrixWorld, X.matrix), X.matrixWorldInverse.copy(X.matrixWorld).invert();
    }
    this.updateCamera = function(X) {
      if (i === null) return;
      let ie = X.near, re = X.far;
      _.texture !== null && (_.depthNear > 0 && (ie = _.depthNear), _.depthFar > 0 && (re = _.depthFar)), w.near = y.near = N.near = ie, w.far = y.far = N.far = re, (F !== w.near || H !== w.far) && (i.updateRenderState({
        depthNear: w.near,
        depthFar: w.far
      }), F = w.near, H = w.far), w.layers.mask = X.layers.mask | 6, N.layers.mask = w.layers.mask & 3, y.layers.mask = w.layers.mask & 5;
      const Me = X.parent, De = w.cameras;
      he(w, Me);
      for (let pe = 0; pe < De.length; pe++) he(De[pe], Me);
      De.length === 2 ? ee(w, N, y) : w.projectionMatrix.copy(N.projectionMatrix), Le(X, w, Me);
    };
    function Le(X, ie, re) {
      re === null ? X.matrix.copy(ie.matrixWorld) : (X.matrix.copy(re.matrixWorld), X.matrix.invert(), X.matrix.multiply(ie.matrixWorld)), X.matrix.decompose(X.position, X.quaternion, X.scale), X.updateMatrixWorld(!0), X.projectionMatrix.copy(ie.projectionMatrix), X.projectionMatrixInverse.copy(ie.projectionMatrixInverse), X.isPerspectiveCamera && (X.fov = _i * 2 * Math.atan(1 / X.projectionMatrix.elements[5]), X.zoom = 1);
    }
    this.getCamera = function() {
      return w;
    }, this.getFoveation = function() {
      if (!(u === null && d === null))
        return o;
    }, this.setFoveation = function(X) {
      o = X, u !== null && (u.fixedFoveation = X), d !== null && d.fixedFoveation !== void 0 && (d.fixedFoveation = X);
    }, this.hasDepthSensing = function() {
      return _.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return _.getMesh(w);
    }, this.getCameraTexture = function(X) {
      return m[X];
    };
    let Fe = null;
    function nt(X, ie) {
      if (c = ie.getViewerPose(l || s), p = ie, c !== null) {
        const re = c.views;
        d !== null && (e.setRenderTargetFramebuffer(x, d.framebuffer), e.setRenderTarget(x));
        let Me = !1;
        re.length !== w.cameras.length && (w.cameras.length = 0, Me = !0);
        for (let pe = 0; pe < re.length; pe++) {
          const je = re[pe];
          let R = null;
          if (d !== null) R = d.getViewport(je);
          else {
            const ze = h.getViewSubImage(u, je);
            R = ze.viewport, pe === 0 && (e.setRenderTargetTextures(x, ze.colorTexture, ze.depthStencilTexture), e.setRenderTarget(x));
          }
          let Ve = S[pe];
          Ve === void 0 && (Ve = new Lt(), Ve.layers.enable(pe), Ve.viewport = new lt(), S[pe] = Ve), Ve.matrix.fromArray(je.transform.matrix), Ve.matrix.decompose(Ve.position, Ve.quaternion, Ve.scale), Ve.projectionMatrix.fromArray(je.projectionMatrix), Ve.projectionMatrixInverse.copy(Ve.projectionMatrix).invert(), Ve.viewport.set(R.x, R.y, R.width, R.height), pe === 0 && (w.matrix.copy(Ve.matrix), w.matrix.decompose(w.position, w.quaternion, w.scale)), Me === !0 && w.cameras.push(Ve);
        }
        const De = i.enabledFeatures;
        if (De && De.includes("depth-sensing") && i.depthUsage == "gpu-optimized" && M) {
          h = n.getBinding();
          const pe = h.getDepthInformation(re[0]);
          pe && pe.isValid && pe.texture && _.init(pe, i.renderState);
        }
        if (De && De.includes("camera-access") && M) {
          e.state.unbindTexture(), h = n.getBinding();
          for (let pe = 0; pe < re.length; pe++) {
            const je = re[pe].camera;
            if (je) {
              let R = m[je];
              R || (R = new Ga(), m[je] = R);
              const Ve = h.getCameraImage(je);
              R.sourceTexture = Ve;
            }
          }
        }
      }
      for (let re = 0; re < E.length; re++) {
        const Me = D[re], De = E[re];
        Me !== null && De !== void 0 && De.update(Me, ie, l || s);
      }
      Fe && Fe(X, ie), ie.detectedPlanes && n.dispatchEvent({
        type: "planesdetected",
        data: ie
      }), p = null;
    }
    const We = new eo();
    We.setAnimationLoop(nt), this.setAnimationLoop = function(X) {
      Fe = X;
    }, this.dispose = function() {
    };
  }
}, xn = /* @__PURE__ */ new nn(), Vu = /* @__PURE__ */ new st();
function Hu(e, t) {
  function n(m, f) {
    m.matrixAutoUpdate === !0 && m.updateMatrix(), f.value.copy(m.matrix);
  }
  function i(m, f) {
    f.color.getRGB(m.fogColor.value, Ia(e)), f.isFog ? (m.fogNear.value = f.near, m.fogFar.value = f.far) : f.isFogExp2 && (m.fogDensity.value = f.density);
  }
  function r(m, f, b, x, E) {
    f.isMeshBasicMaterial || f.isMeshLambertMaterial ? s(m, f) : f.isMeshToonMaterial ? (s(m, f), u(m, f)) : f.isMeshPhongMaterial ? (s(m, f), h(m, f)) : f.isMeshStandardMaterial ? (s(m, f), d(m, f), f.isMeshPhysicalMaterial && p(m, f, E)) : f.isMeshMatcapMaterial ? (s(m, f), M(m, f)) : f.isMeshDepthMaterial ? s(m, f) : f.isMeshDistanceMaterial ? (s(m, f), _(m, f)) : f.isMeshNormalMaterial ? s(m, f) : f.isLineBasicMaterial ? (a(m, f), f.isLineDashedMaterial && o(m, f)) : f.isPointsMaterial ? l(m, f, b, x) : f.isSpriteMaterial ? c(m, f) : f.isShadowMaterial ? (m.color.value.copy(f.color), m.opacity.value = f.opacity) : f.isShaderMaterial && (f.uniformsNeedUpdate = !1);
  }
  function s(m, f) {
    m.opacity.value = f.opacity, f.color && m.diffuse.value.copy(f.color), f.emissive && m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity), f.map && (m.map.value = f.map, n(f.map, m.mapTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, n(f.alphaMap, m.alphaMapTransform)), f.bumpMap && (m.bumpMap.value = f.bumpMap, n(f.bumpMap, m.bumpMapTransform), m.bumpScale.value = f.bumpScale, f.side === 1 && (m.bumpScale.value *= -1)), f.normalMap && (m.normalMap.value = f.normalMap, n(f.normalMap, m.normalMapTransform), m.normalScale.value.copy(f.normalScale), f.side === 1 && m.normalScale.value.negate()), f.displacementMap && (m.displacementMap.value = f.displacementMap, n(f.displacementMap, m.displacementMapTransform), m.displacementScale.value = f.displacementScale, m.displacementBias.value = f.displacementBias), f.emissiveMap && (m.emissiveMap.value = f.emissiveMap, n(f.emissiveMap, m.emissiveMapTransform)), f.specularMap && (m.specularMap.value = f.specularMap, n(f.specularMap, m.specularMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
    const b = t.get(f), x = b.envMap, E = b.envMapRotation;
    x && (m.envMap.value = x, xn.copy(E), xn.x *= -1, xn.y *= -1, xn.z *= -1, x.isCubeTexture && x.isRenderTargetTexture === !1 && (xn.y *= -1, xn.z *= -1), m.envMapRotation.value.setFromMatrix4(Vu.makeRotationFromEuler(xn)), m.flipEnvMap.value = x.isCubeTexture && x.isRenderTargetTexture === !1 ? -1 : 1, m.reflectivity.value = f.reflectivity, m.ior.value = f.ior, m.refractionRatio.value = f.refractionRatio), f.lightMap && (m.lightMap.value = f.lightMap, m.lightMapIntensity.value = f.lightMapIntensity, n(f.lightMap, m.lightMapTransform)), f.aoMap && (m.aoMap.value = f.aoMap, m.aoMapIntensity.value = f.aoMapIntensity, n(f.aoMap, m.aoMapTransform));
  }
  function a(m, f) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, f.map && (m.map.value = f.map, n(f.map, m.mapTransform));
  }
  function o(m, f) {
    m.dashSize.value = f.dashSize, m.totalSize.value = f.dashSize + f.gapSize, m.scale.value = f.scale;
  }
  function l(m, f, b, x) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, m.size.value = f.size * b, m.scale.value = x * 0.5, f.map && (m.map.value = f.map, n(f.map, m.uvTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, n(f.alphaMap, m.alphaMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
  }
  function c(m, f) {
    m.diffuse.value.copy(f.color), m.opacity.value = f.opacity, m.rotation.value = f.rotation, f.map && (m.map.value = f.map, n(f.map, m.mapTransform)), f.alphaMap && (m.alphaMap.value = f.alphaMap, n(f.alphaMap, m.alphaMapTransform)), f.alphaTest > 0 && (m.alphaTest.value = f.alphaTest);
  }
  function h(m, f) {
    m.specular.value.copy(f.specular), m.shininess.value = Math.max(f.shininess, 1e-4);
  }
  function u(m, f) {
    f.gradientMap && (m.gradientMap.value = f.gradientMap);
  }
  function d(m, f) {
    m.metalness.value = f.metalness, f.metalnessMap && (m.metalnessMap.value = f.metalnessMap, n(f.metalnessMap, m.metalnessMapTransform)), m.roughness.value = f.roughness, f.roughnessMap && (m.roughnessMap.value = f.roughnessMap, n(f.roughnessMap, m.roughnessMapTransform)), f.envMap && (m.envMapIntensity.value = f.envMapIntensity);
  }
  function p(m, f, b) {
    m.ior.value = f.ior, f.sheen > 0 && (m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen), m.sheenRoughness.value = f.sheenRoughness, f.sheenColorMap && (m.sheenColorMap.value = f.sheenColorMap, n(f.sheenColorMap, m.sheenColorMapTransform)), f.sheenRoughnessMap && (m.sheenRoughnessMap.value = f.sheenRoughnessMap, n(f.sheenRoughnessMap, m.sheenRoughnessMapTransform))), f.clearcoat > 0 && (m.clearcoat.value = f.clearcoat, m.clearcoatRoughness.value = f.clearcoatRoughness, f.clearcoatMap && (m.clearcoatMap.value = f.clearcoatMap, n(f.clearcoatMap, m.clearcoatMapTransform)), f.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = f.clearcoatRoughnessMap, n(f.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), f.clearcoatNormalMap && (m.clearcoatNormalMap.value = f.clearcoatNormalMap, n(f.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale), f.side === 1 && m.clearcoatNormalScale.value.negate())), f.dispersion > 0 && (m.dispersion.value = f.dispersion), f.iridescence > 0 && (m.iridescence.value = f.iridescence, m.iridescenceIOR.value = f.iridescenceIOR, m.iridescenceThicknessMinimum.value = f.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = f.iridescenceThicknessRange[1], f.iridescenceMap && (m.iridescenceMap.value = f.iridescenceMap, n(f.iridescenceMap, m.iridescenceMapTransform)), f.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = f.iridescenceThicknessMap, n(f.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), f.transmission > 0 && (m.transmission.value = f.transmission, m.transmissionSamplerMap.value = b.texture, m.transmissionSamplerSize.value.set(b.width, b.height), f.transmissionMap && (m.transmissionMap.value = f.transmissionMap, n(f.transmissionMap, m.transmissionMapTransform)), m.thickness.value = f.thickness, f.thicknessMap && (m.thicknessMap.value = f.thicknessMap, n(f.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = f.attenuationDistance, m.attenuationColor.value.copy(f.attenuationColor)), f.anisotropy > 0 && (m.anisotropyVector.value.set(f.anisotropy * Math.cos(f.anisotropyRotation), f.anisotropy * Math.sin(f.anisotropyRotation)), f.anisotropyMap && (m.anisotropyMap.value = f.anisotropyMap, n(f.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = f.specularIntensity, m.specularColor.value.copy(f.specularColor), f.specularColorMap && (m.specularColorMap.value = f.specularColorMap, n(f.specularColorMap, m.specularColorMapTransform)), f.specularIntensityMap && (m.specularIntensityMap.value = f.specularIntensityMap, n(f.specularIntensityMap, m.specularIntensityMapTransform));
  }
  function M(m, f) {
    f.matcap && (m.matcap.value = f.matcap);
  }
  function _(m, f) {
    const b = t.get(f).light;
    m.referencePosition.value.setFromMatrixPosition(b.matrixWorld), m.nearDistance.value = b.shadow.camera.near, m.farDistance.value = b.shadow.camera.far;
  }
  return {
    refreshFogUniforms: i,
    refreshMaterialUniforms: r
  };
}
function Gu(e, t, n, i) {
  let r = {}, s = {}, a = [];
  const o = e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(b, x) {
    const E = x.program;
    i.uniformBlockBinding(b, E);
  }
  function c(b, x) {
    let E = r[b.id];
    E === void 0 && (M(b), E = h(b), r[b.id] = E, b.addEventListener("dispose", m));
    const D = x.program;
    i.updateUBOMapping(b, D);
    const A = t.render.frame;
    s[b.id] !== A && (d(b), s[b.id] = A);
  }
  function h(b) {
    const x = u();
    b.__bindingPointIndex = x;
    const E = e.createBuffer(), D = b.__size, A = b.usage;
    return e.bindBuffer(e.UNIFORM_BUFFER, E), e.bufferData(e.UNIFORM_BUFFER, D, A), e.bindBuffer(e.UNIFORM_BUFFER, null), e.bindBufferBase(e.UNIFORM_BUFFER, x, E), E;
  }
  function u() {
    for (let b = 0; b < o; b++) if (a.indexOf(b) === -1)
      return a.push(b), b;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(b) {
    const x = r[b.id], E = b.uniforms, D = b.__cache;
    e.bindBuffer(e.UNIFORM_BUFFER, x);
    for (let A = 0, P = E.length; A < P; A++) {
      const N = Array.isArray(E[A]) ? E[A] : [E[A]];
      for (let y = 0, S = N.length; y < S; y++) {
        const w = N[y];
        if (p(w, A, y, D) === !0) {
          const F = w.__offset, H = Array.isArray(w.value) ? w.value : [w.value];
          let V = 0;
          for (let j = 0; j < H.length; j++) {
            const k = H[j], J = _(k);
            typeof k == "number" || typeof k == "boolean" ? (w.__data[0] = k, e.bufferSubData(e.UNIFORM_BUFFER, F + V, w.__data)) : k.isMatrix3 ? (w.__data[0] = k.elements[0], w.__data[1] = k.elements[1], w.__data[2] = k.elements[2], w.__data[3] = 0, w.__data[4] = k.elements[3], w.__data[5] = k.elements[4], w.__data[6] = k.elements[5], w.__data[7] = 0, w.__data[8] = k.elements[6], w.__data[9] = k.elements[7], w.__data[10] = k.elements[8], w.__data[11] = 0) : (k.toArray(w.__data, V), V += J.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          e.bufferSubData(e.UNIFORM_BUFFER, F, w.__data);
        }
      }
    }
    e.bindBuffer(e.UNIFORM_BUFFER, null);
  }
  function p(b, x, E, D) {
    const A = b.value, P = x + "_" + E;
    if (D[P] === void 0)
      return typeof A == "number" || typeof A == "boolean" ? D[P] = A : D[P] = A.clone(), !0;
    {
      const N = D[P];
      if (typeof A == "number" || typeof A == "boolean") {
        if (N !== A)
          return D[P] = A, !0;
      } else if (N.equals(A) === !1)
        return N.copy(A), !0;
    }
    return !1;
  }
  function M(b) {
    const x = b.uniforms;
    let E = 0;
    const D = 16;
    for (let P = 0, N = x.length; P < N; P++) {
      const y = Array.isArray(x[P]) ? x[P] : [x[P]];
      for (let S = 0, w = y.length; S < w; S++) {
        const F = y[S], H = Array.isArray(F.value) ? F.value : [F.value];
        for (let V = 0, j = H.length; V < j; V++) {
          const k = H[V], J = _(k), W = E % D, ee = W % J.boundary, he = W + ee;
          E += ee, he !== 0 && D - he < J.storage && (E += D - he), F.__data = new Float32Array(J.storage / Float32Array.BYTES_PER_ELEMENT), F.__offset = E, E += J.storage;
        }
      }
    }
    const A = E % D;
    return A > 0 && (E += D - A), b.__size = E, b.__cache = {}, this;
  }
  function _(b) {
    const x = {
      boundary: 0,
      storage: 0
    };
    return typeof b == "number" || typeof b == "boolean" ? (x.boundary = 4, x.storage = 4) : b.isVector2 ? (x.boundary = 8, x.storage = 8) : b.isVector3 || b.isColor ? (x.boundary = 16, x.storage = 12) : b.isVector4 ? (x.boundary = 16, x.storage = 16) : b.isMatrix3 ? (x.boundary = 48, x.storage = 48) : b.isMatrix4 ? (x.boundary = 64, x.storage = 64) : b.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", b), x;
  }
  function m(b) {
    const x = b.target;
    x.removeEventListener("dispose", m);
    const E = a.indexOf(x.__bindingPointIndex);
    a.splice(E, 1), e.deleteBuffer(r[x.id]), delete r[x.id], delete s[x.id];
  }
  function f() {
    for (const b in r) e.deleteBuffer(r[b]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: f
  };
}
var ku = class {
  constructor(e = {}) {
    const { canvas: t = Cl(), context: n = null, depth: i = !0, stencil: r = !1, alpha: s = !1, antialias: a = !1, premultipliedAlpha: o = !0, preserveDrawingBuffer: l = !1, powerPreference: c = "default", failIfMajorPerformanceCaveat: h = !1, reversedDepthBuffer: u = !1 } = e;
    this.isWebGLRenderer = !0;
    let d;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      d = n.getContextAttributes().alpha;
    } else d = s;
    const p = new Uint32Array(4), M = new Int32Array(4);
    let _ = null, m = null;
    const f = [], b = [];
    this.domElement = t, this.debug = {
      checkShaderErrors: !0,
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = 0, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const x = this;
    let E = !1;
    this._outputColorSpace = Dt;
    let D = 0, A = 0, P = null, N = -1, y = null;
    const S = new lt(), w = new lt();
    let F = null;
    const H = new Be(0);
    let V = 0, j = t.width, k = t.height, J = 1, W = null, ee = null;
    const he = new lt(0, 0, j, k), Le = new lt(0, 0, j, k);
    let Fe = !1;
    const nt = new ns();
    let We = !1, X = !1;
    const ie = new st(), re = new U(), Me = new lt(), De = {
      background: null,
      fog: null,
      environment: null,
      overrideMaterial: null,
      isScene: !0
    };
    let pe = !1;
    function je() {
      return P === null ? J : 1;
    }
    let R = n;
    function Ve(v, I) {
      return t.getContext(v, I);
    }
    try {
      const v = {
        alpha: !0,
        depth: i,
        stencil: r,
        antialias: a,
        premultipliedAlpha: o,
        preserveDrawingBuffer: l,
        powerPreference: c,
        failIfMajorPerformanceCaveat: h
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", "three.js r180"), t.addEventListener("webglcontextlost", ae, !1), t.addEventListener("webglcontextrestored", te, !1), t.addEventListener("webglcontextcreationerror", _e, !1), R === null) {
        const I = "webgl2";
        if (R = Ve(I, v), R === null) throw Ve(I) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (v) {
      throw console.error("THREE.WebGLRenderer: " + v.message), v;
    }
    let ze, Ke, xe, Qe, Ee, be, mt, ft, rt, T, g, O, Y, Z, G, ue, ne, ge, Re, Q, oe, Se, ye, le;
    function Ie() {
      ze = new Qc(R), ze.init(), Se = new Nu(R, ze), Ke = new Yc(R, ze, e, Se), xe = new Uu(R, ze), Ke.reversedDepthBuffer && u && xe.buffers.depth.setReversed(!0), Qe = new nh(R), Ee = new xu(), be = new Iu(R, ze, xe, Ee, Ke, Se, Qe), mt = new jc(x), ft = new $c(x), rt = new Hc(R), ye = new Wc(R, rt), T = new eh(R, rt, Qe, ye), g = new rh(R, T, rt, Qe), Re = new ih(R, Ke, be), ue = new qc(Ee), O = new Mu(x, mt, ft, ze, Ke, ye, ue), Y = new Hu(x, Ee), Z = new yu(), G = new Ru(ze), ge = new kc(x, mt, ft, xe, g, d, o), ne = new Du(x, g, Ke), le = new Gu(R, Qe, Ke, xe), Q = new Xc(R, ze, Qe), oe = new th(R, ze, Qe), Qe.programs = O.programs, x.capabilities = Ke, x.extensions = ze, x.properties = Ee, x.renderLists = Z, x.shadowMap = ne, x.state = xe, x.info = Qe;
    }
    Ie();
    const C = new zu(x, R);
    this.xr = C, this.getContext = function() {
      return R;
    }, this.getContextAttributes = function() {
      return R.getContextAttributes();
    }, this.forceContextLoss = function() {
      const v = ze.get("WEBGL_lose_context");
      v && v.loseContext();
    }, this.forceContextRestore = function() {
      const v = ze.get("WEBGL_lose_context");
      v && v.restoreContext();
    }, this.getPixelRatio = function() {
      return J;
    }, this.setPixelRatio = function(v) {
      v !== void 0 && (J = v, this.setSize(j, k, !1));
    }, this.getSize = function(v) {
      return v.set(j, k);
    }, this.setSize = function(v, I, B = !0) {
      if (C.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      j = v, k = I, t.width = Math.floor(v * J), t.height = Math.floor(I * J), B === !0 && (t.style.width = v + "px", t.style.height = I + "px"), this.setViewport(0, 0, v, I);
    }, this.getDrawingBufferSize = function(v) {
      return v.set(j * J, k * J).floor();
    }, this.setDrawingBufferSize = function(v, I, B) {
      j = v, k = I, J = B, t.width = Math.floor(v * B), t.height = Math.floor(I * B), this.setViewport(0, 0, v, I);
    }, this.getCurrentViewport = function(v) {
      return v.copy(S);
    }, this.getViewport = function(v) {
      return v.copy(he);
    }, this.setViewport = function(v, I, B, z) {
      v.isVector4 ? he.set(v.x, v.y, v.z, v.w) : he.set(v, I, B, z), xe.viewport(S.copy(he).multiplyScalar(J).round());
    }, this.getScissor = function(v) {
      return v.copy(Le);
    }, this.setScissor = function(v, I, B, z) {
      v.isVector4 ? Le.set(v.x, v.y, v.z, v.w) : Le.set(v, I, B, z), xe.scissor(w.copy(Le).multiplyScalar(J).round());
    }, this.getScissorTest = function() {
      return Fe;
    }, this.setScissorTest = function(v) {
      xe.setScissorTest(Fe = v);
    }, this.setOpaqueSort = function(v) {
      W = v;
    }, this.setTransparentSort = function(v) {
      ee = v;
    }, this.getClearColor = function(v) {
      return v.copy(ge.getClearColor());
    }, this.setClearColor = function() {
      ge.setClearColor(...arguments);
    }, this.getClearAlpha = function() {
      return ge.getClearAlpha();
    }, this.setClearAlpha = function() {
      ge.setClearAlpha(...arguments);
    }, this.clear = function(v = !0, I = !0, B = !0) {
      let z = 0;
      if (v) {
        let L = !1;
        if (P !== null) {
          const K = P.texture.format;
          L = K === 1033 || K === 1031 || K === 1029;
        }
        if (L) {
          const K = P.texture.type, ce = K === 1009 || K === 1014 || K === 1012 || K === 1020 || K === 1017 || K === 1018, de = ge.getClearColor(), fe = ge.getClearAlpha(), Ce = de.r, Pe = de.g, we = de.b;
          ce ? (p[0] = Ce, p[1] = Pe, p[2] = we, p[3] = fe, R.clearBufferuiv(R.COLOR, 0, p)) : (M[0] = Ce, M[1] = Pe, M[2] = we, M[3] = fe, R.clearBufferiv(R.COLOR, 0, M));
        } else z |= R.COLOR_BUFFER_BIT;
      }
      I && (z |= R.DEPTH_BUFFER_BIT), B && (z |= R.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), R.clear(z);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", ae, !1), t.removeEventListener("webglcontextrestored", te, !1), t.removeEventListener("webglcontextcreationerror", _e, !1), ge.dispose(), Z.dispose(), G.dispose(), Ee.dispose(), mt.dispose(), ft.dispose(), g.dispose(), ye.dispose(), le.dispose(), O.dispose(), C.dispose(), C.removeEventListener("sessionstart", Gt), C.removeEventListener("sessionend", kt), fn.stop();
    };
    function ae(v) {
      v.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), E = !0;
    }
    function te() {
      console.log("THREE.WebGLRenderer: Context Restored."), E = !1;
      const v = Qe.autoReset, I = ne.enabled, B = ne.autoUpdate, z = ne.needsUpdate, L = ne.type;
      Ie(), Qe.autoReset = v, ne.enabled = I, ne.autoUpdate = B, ne.needsUpdate = z, ne.type = L;
    }
    function _e(v) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", v.statusMessage);
    }
    function $(v) {
      const I = v.target;
      I.removeEventListener("dispose", $), q(I);
    }
    function q(v) {
      me(v), Ee.remove(v);
    }
    function me(v) {
      const I = Ee.get(v).programs;
      I !== void 0 && (I.forEach(function(B) {
        O.releaseProgram(B);
      }), v.isShaderMaterial && O.releaseShaderCache(v));
    }
    this.renderBufferDirect = function(v, I, B, z, L, K) {
      I === null && (I = De);
      const ce = L.isMesh && L.matrixWorld.determinant() < 0, de = ao(v, I, B, z, L);
      xe.setMaterial(z, ce);
      let fe = B.index, Ce = 1;
      if (z.wireframe === !0) {
        if (fe = T.getWireframeAttribute(B), fe === void 0) return;
        Ce = 2;
      }
      const Pe = B.drawRange, we = B.attributes.position;
      let He = Pe.start * Ce, Ze = (Pe.start + Pe.count) * Ce;
      K !== null && (He = Math.max(He, K.start * Ce), Ze = Math.min(Ze, (K.start + K.count) * Ce)), fe !== null ? (He = Math.max(He, 0), Ze = Math.min(Ze, fe.count)) : we != null && (He = Math.max(He, 0), Ze = Math.min(Ze, we.count));
      const $e = Ze - He;
      if ($e < 0 || $e === 1 / 0) return;
      ye.setup(L, z, de, B, fe);
      let et, Je = Q;
      if (fe !== null && (et = rt.get(fe), Je = oe, Je.setIndex(et)), L.isMesh) z.wireframe === !0 ? (xe.setLineWidth(z.wireframeLinewidth * je()), Je.setMode(R.LINES)) : Je.setMode(R.TRIANGLES);
      else if (L.isLine) {
        let ve = z.linewidth;
        ve === void 0 && (ve = 1), xe.setLineWidth(ve * je()), L.isLineSegments ? Je.setMode(R.LINES) : L.isLineLoop ? Je.setMode(R.LINE_LOOP) : Je.setMode(R.LINE_STRIP);
      } else L.isPoints ? Je.setMode(R.POINTS) : L.isSprite && Je.setMode(R.TRIANGLES);
      if (L.isBatchedMesh) if (L._multiDrawInstances !== null)
        gi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), Je.renderMultiDrawInstances(L._multiDrawStarts, L._multiDrawCounts, L._multiDrawCount, L._multiDrawInstances);
      else if (ze.get("WEBGL_multi_draw"))
        Je.renderMultiDraw(L._multiDrawStarts, L._multiDrawCounts, L._multiDrawCount);
      else {
        const ve = L._multiDrawStarts, _t = L._multiDrawCounts, Ge = L._multiDrawCount, It = fe ? rt.get(fe).bytesPerElement : 1, wn = Ee.get(z).currentProgram.getUniforms();
        for (let bt = 0; bt < Ge; bt++)
          wn.setValue(R, "_gl_DrawID", bt), Je.render(ve[bt] / It, _t[bt]);
      }
      else if (L.isInstancedMesh) Je.renderInstances(He, $e, L.count);
      else if (B.isInstancedBufferGeometry) {
        const ve = B._maxInstanceCount !== void 0 ? B._maxInstanceCount : 1 / 0, _t = Math.min(B.instanceCount, ve);
        Je.renderInstances(He, $e, _t);
      } else Je.render(He, $e);
    };
    function Ae(v, I, B) {
      v.transparent === !0 && v.side === 2 && v.forceSinglePass === !1 ? (v.side = 1, v.needsUpdate = !0, yi(v, I, B), v.side = 0, v.needsUpdate = !0, yi(v, I, B), v.side = 2) : yi(v, I, B);
    }
    this.compile = function(v, I, B = null) {
      B === null && (B = v), m = G.get(B), m.init(I), b.push(m), B.traverseVisible(function(L) {
        L.isLight && L.layers.test(I.layers) && (m.pushLight(L), L.castShadow && m.pushShadow(L));
      }), v !== B && v.traverseVisible(function(L) {
        L.isLight && L.layers.test(I.layers) && (m.pushLight(L), L.castShadow && m.pushShadow(L));
      }), m.setupLights();
      const z = /* @__PURE__ */ new Set();
      return v.traverse(function(L) {
        if (!(L.isMesh || L.isPoints || L.isLine || L.isSprite)) return;
        const K = L.material;
        if (K) if (Array.isArray(K)) for (let ce = 0; ce < K.length; ce++) {
          const de = K[ce];
          Ae(de, B, L), z.add(de);
        }
        else
          Ae(K, B, L), z.add(K);
      }), m = b.pop(), z;
    }, this.compileAsync = function(v, I, B = null) {
      const z = this.compile(v, I, B);
      return new Promise((L) => {
        function K() {
          if (z.forEach(function(ce) {
            Ee.get(ce).currentProgram.isReady() && z.delete(ce);
          }), z.size === 0) {
            L(v);
            return;
          }
          setTimeout(K, 10);
        }
        ze.get("KHR_parallel_shader_compile") !== null ? K() : setTimeout(K, 10);
      });
    };
    let at = null;
    function Ye(v) {
      at && at(v);
    }
    function Gt() {
      fn.stop();
    }
    function kt() {
      fn.start();
    }
    const fn = new eo();
    fn.setAnimationLoop(Ye), typeof self < "u" && fn.setContext(self), this.setAnimationLoop = function(v) {
      at = v, C.setAnimationLoop(v), v === null ? fn.stop() : fn.start();
    }, C.addEventListener("sessionstart", Gt), C.addEventListener("sessionend", kt), this.render = function(v, I) {
      if (I !== void 0 && I.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (E === !0) return;
      if (v.matrixWorldAutoUpdate === !0 && v.updateMatrixWorld(), I.parent === null && I.matrixWorldAutoUpdate === !0 && I.updateMatrixWorld(), C.enabled === !0 && C.isPresenting === !0 && (C.cameraAutoUpdate === !0 && C.updateCamera(I), I = C.getCamera()), v.isScene === !0 && v.onBeforeRender(x, v, I, P), m = G.get(v, b.length), m.init(I), b.push(m), ie.multiplyMatrices(I.projectionMatrix, I.matrixWorldInverse), nt.setFromProjectionMatrix(ie, Qn, I.reversedDepth), X = this.localClippingEnabled, We = ue.init(this.clippingPlanes, X), _ = Z.get(v, f.length), _.init(), f.push(_), C.enabled === !0 && C.isPresenting === !0) {
        const K = x.xr.getDepthSensingMesh();
        K !== null && rr(K, I, -1 / 0, x.sortObjects);
      }
      rr(v, I, 0, x.sortObjects), _.finish(), x.sortObjects === !0 && _.sort(W, ee), pe = C.enabled === !1 || C.isPresenting === !1 || C.hasDepthSensing() === !1, pe && ge.addToRenderList(_, v), this.info.render.frame++, We === !0 && ue.beginShadows();
      const B = m.state.shadowsArray;
      ne.render(B, v, I), We === !0 && ue.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const z = _.opaque, L = _.transmissive;
      if (m.setupLights(), I.isArrayCamera) {
        const K = I.cameras;
        if (L.length > 0) for (let ce = 0, de = K.length; ce < de; ce++) {
          const fe = K[ce];
          ls(z, L, v, fe);
        }
        pe && ge.render(v);
        for (let ce = 0, de = K.length; ce < de; ce++) {
          const fe = K[ce];
          os(_, v, fe, fe.viewport);
        }
      } else
        L.length > 0 && ls(z, L, v, I), pe && ge.render(v), os(_, v, I);
      P !== null && A === 0 && (be.updateMultisampleRenderTarget(P), be.updateRenderTargetMipmap(P)), v.isScene === !0 && v.onAfterRender(x, v, I), ye.resetDefaultState(), N = -1, y = null, b.pop(), b.length > 0 ? (m = b[b.length - 1], We === !0 && ue.setGlobalState(x.clippingPlanes, m.state.camera)) : m = null, f.pop(), f.length > 0 ? _ = f[f.length - 1] : _ = null;
    };
    function rr(v, I, B, z) {
      if (v.visible === !1) return;
      if (v.layers.test(I.layers)) {
        if (v.isGroup) B = v.renderOrder;
        else if (v.isLOD)
          v.autoUpdate === !0 && v.update(I);
        else if (v.isLight)
          m.pushLight(v), v.castShadow && m.pushShadow(v);
        else if (v.isSprite) {
          if (!v.frustumCulled || nt.intersectsSprite(v)) {
            z && Me.setFromMatrixPosition(v.matrixWorld).applyMatrix4(ie);
            const K = g.update(v), ce = v.material;
            ce.visible && _.push(v, K, ce, B, Me.z, null);
          }
        } else if ((v.isMesh || v.isLine || v.isPoints) && (!v.frustumCulled || nt.intersectsObject(v))) {
          const K = g.update(v), ce = v.material;
          if (z && (v.boundingSphere !== void 0 ? (v.boundingSphere === null && v.computeBoundingSphere(), Me.copy(v.boundingSphere.center)) : (K.boundingSphere === null && K.computeBoundingSphere(), Me.copy(K.boundingSphere.center)), Me.applyMatrix4(v.matrixWorld).applyMatrix4(ie)), Array.isArray(ce)) {
            const de = K.groups;
            for (let fe = 0, Ce = de.length; fe < Ce; fe++) {
              const Pe = de[fe], we = ce[Pe.materialIndex];
              we && we.visible && _.push(v, K, we, B, Me.z, Pe);
            }
          } else ce.visible && _.push(v, K, ce, B, Me.z, null);
        }
      }
      const L = v.children;
      for (let K = 0, ce = L.length; K < ce; K++) rr(L[K], I, B, z);
    }
    function os(v, I, B, z) {
      const L = v.opaque, K = v.transmissive, ce = v.transparent;
      m.setupLightsView(B), We === !0 && ue.setGlobalState(x.clippingPlanes, B), z && xe.viewport(S.copy(z)), L.length > 0 && Si(L, I, B), K.length > 0 && Si(K, I, B), ce.length > 0 && Si(ce, I, B), xe.buffers.depth.setTest(!0), xe.buffers.depth.setMask(!0), xe.buffers.color.setMask(!0), xe.setPolygonOffset(!1);
    }
    function ls(v, I, B, z) {
      if ((B.isScene === !0 ? B.overrideMaterial : null) !== null) return;
      m.state.transmissionRenderTarget[z.id] === void 0 && (m.state.transmissionRenderTarget[z.id] = new bn(1, 1, {
        generateMipmaps: !0,
        type: ze.has("EXT_color_buffer_half_float") || ze.has("EXT_color_buffer_float") ? Kr : $n,
        minFilter: Yr,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: ke.workingColorSpace
      }));
      const L = m.state.transmissionRenderTarget[z.id], K = z.viewport || S;
      L.setSize(K.z * x.transmissionResolutionScale, K.w * x.transmissionResolutionScale);
      const ce = x.getRenderTarget(), de = x.getActiveCubeFace(), fe = x.getActiveMipmapLevel();
      x.setRenderTarget(L), x.getClearColor(H), V = x.getClearAlpha(), V < 1 && x.setClearColor(16777215, 0.5), x.clear(), pe && ge.render(B);
      const Ce = x.toneMapping;
      x.toneMapping = 0;
      const Pe = z.viewport;
      if (z.viewport !== void 0 && (z.viewport = void 0), m.setupLightsView(z), We === !0 && ue.setGlobalState(x.clippingPlanes, z), Si(v, B, z), be.updateMultisampleRenderTarget(L), be.updateRenderTargetMipmap(L), ze.has("WEBGL_multisampled_render_to_texture") === !1) {
        let we = !1;
        for (let He = 0, Ze = I.length; He < Ze; He++) {
          const $e = I[He], et = $e.object, Je = $e.geometry, ve = $e.material, _t = $e.group;
          if (ve.side === 2 && et.layers.test(z.layers)) {
            const Ge = ve.side;
            ve.side = 1, ve.needsUpdate = !0, cs(et, B, z, Je, ve, _t), ve.side = Ge, ve.needsUpdate = !0, we = !0;
          }
        }
        we === !0 && (be.updateMultisampleRenderTarget(L), be.updateRenderTargetMipmap(L));
      }
      x.setRenderTarget(ce, de, fe), x.setClearColor(H, V), Pe !== void 0 && (z.viewport = Pe), x.toneMapping = Ce;
    }
    function Si(v, I, B) {
      const z = I.isScene === !0 ? I.overrideMaterial : null;
      for (let L = 0, K = v.length; L < K; L++) {
        const ce = v[L], de = ce.object, fe = ce.geometry, Ce = ce.group;
        let Pe = ce.material;
        Pe.allowOverride === !0 && z !== null && (Pe = z), de.layers.test(B.layers) && cs(de, I, B, fe, Pe, Ce);
      }
    }
    function cs(v, I, B, z, L, K) {
      v.onBeforeRender(x, I, B, z, L, K), v.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse, v.matrixWorld), v.normalMatrix.getNormalMatrix(v.modelViewMatrix), L.onBeforeRender(x, I, B, z, v, K), L.transparent === !0 && L.side === 2 && L.forceSinglePass === !1 ? (L.side = 1, L.needsUpdate = !0, x.renderBufferDirect(B, I, z, L, v, K), L.side = 0, L.needsUpdate = !0, x.renderBufferDirect(B, I, z, L, v, K), L.side = 2) : x.renderBufferDirect(B, I, z, L, v, K), v.onAfterRender(x, I, B, z, L, K);
    }
    function yi(v, I, B) {
      I.isScene !== !0 && (I = De);
      const z = Ee.get(v), L = m.state.lights, K = m.state.shadowsArray, ce = L.state.version, de = O.getParameters(v, L.state, K, I, B), fe = O.getProgramCacheKey(de);
      let Ce = z.programs;
      z.environment = v.isMeshStandardMaterial ? I.environment : null, z.fog = I.fog, z.envMap = (v.isMeshStandardMaterial ? ft : mt).get(v.envMap || z.environment), z.envMapRotation = z.environment !== null && v.envMap === null ? I.environmentRotation : v.envMapRotation, Ce === void 0 && (v.addEventListener("dispose", $), Ce = /* @__PURE__ */ new Map(), z.programs = Ce);
      let Pe = Ce.get(fe);
      if (Pe !== void 0) {
        if (z.currentProgram === Pe && z.lightsStateVersion === ce)
          return us(v, de), Pe;
      } else
        de.uniforms = O.getUniforms(v), v.onBeforeCompile(de, x), Pe = O.acquireProgram(de, fe), Ce.set(fe, Pe), z.uniforms = de.uniforms;
      const we = z.uniforms;
      return (!v.isShaderMaterial && !v.isRawShaderMaterial || v.clipping === !0) && (we.clippingPlanes = ue.uniform), us(v, de), z.needsLights = lo(v), z.lightsStateVersion = ce, z.needsLights && (we.ambientLightColor.value = L.state.ambient, we.lightProbe.value = L.state.probe, we.directionalLights.value = L.state.directional, we.directionalLightShadows.value = L.state.directionalShadow, we.spotLights.value = L.state.spot, we.spotLightShadows.value = L.state.spotShadow, we.rectAreaLights.value = L.state.rectArea, we.ltc_1.value = L.state.rectAreaLTC1, we.ltc_2.value = L.state.rectAreaLTC2, we.pointLights.value = L.state.point, we.pointLightShadows.value = L.state.pointShadow, we.hemisphereLights.value = L.state.hemi, we.directionalShadowMap.value = L.state.directionalShadowMap, we.directionalShadowMatrix.value = L.state.directionalShadowMatrix, we.spotShadowMap.value = L.state.spotShadowMap, we.spotLightMatrix.value = L.state.spotLightMatrix, we.spotLightMap.value = L.state.spotLightMap, we.pointShadowMap.value = L.state.pointShadowMap, we.pointShadowMatrix.value = L.state.pointShadowMatrix), z.currentProgram = Pe, z.uniformsList = null, Pe;
    }
    function hs(v) {
      if (v.uniformsList === null) {
        const I = v.currentProgram.getUniforms();
        v.uniformsList = Zi.seqWithValue(I.seq, v.uniforms);
      }
      return v.uniformsList;
    }
    function us(v, I) {
      const B = Ee.get(v);
      B.outputColorSpace = I.outputColorSpace, B.batching = I.batching, B.batchingColor = I.batchingColor, B.instancing = I.instancing, B.instancingColor = I.instancingColor, B.instancingMorph = I.instancingMorph, B.skinning = I.skinning, B.morphTargets = I.morphTargets, B.morphNormals = I.morphNormals, B.morphColors = I.morphColors, B.morphTargetsCount = I.morphTargetsCount, B.numClippingPlanes = I.numClippingPlanes, B.numIntersection = I.numClipIntersection, B.vertexAlphas = I.vertexAlphas, B.vertexTangents = I.vertexTangents, B.toneMapping = I.toneMapping;
    }
    function ao(v, I, B, z, L) {
      I.isScene !== !0 && (I = De), be.resetTextureUnits();
      const K = I.fog, ce = z.isMeshStandardMaterial ? I.environment : null, de = P === null ? x.outputColorSpace : P.isXRRenderTarget === !0 ? P.texture.colorSpace : mi, fe = (z.isMeshStandardMaterial ? ft : mt).get(z.envMap || ce), Ce = z.vertexColors === !0 && !!B.attributes.color && B.attributes.color.itemSize === 4, Pe = !!B.attributes.tangent && (!!z.normalMap || z.anisotropy > 0), we = !!B.morphAttributes.position, He = !!B.morphAttributes.normal, Ze = !!B.morphAttributes.color;
      let $e = 0;
      z.toneMapped && (P === null || P.isXRRenderTarget === !0) && ($e = x.toneMapping);
      const et = B.morphAttributes.position || B.morphAttributes.normal || B.morphAttributes.color, Je = et !== void 0 ? et.length : 0, ve = Ee.get(z), _t = m.state.lights;
      if (We === !0 && (X === !0 || v !== y)) {
        const gt = v === y && z.id === N;
        ue.setState(z, v, gt);
      }
      let Ge = !1;
      z.version === ve.__version ? (ve.needsLights && ve.lightsStateVersion !== _t.state.version || ve.outputColorSpace !== de || L.isBatchedMesh && ve.batching === !1 || !L.isBatchedMesh && ve.batching === !0 || L.isBatchedMesh && ve.batchingColor === !0 && L.colorTexture === null || L.isBatchedMesh && ve.batchingColor === !1 && L.colorTexture !== null || L.isInstancedMesh && ve.instancing === !1 || !L.isInstancedMesh && ve.instancing === !0 || L.isSkinnedMesh && ve.skinning === !1 || !L.isSkinnedMesh && ve.skinning === !0 || L.isInstancedMesh && ve.instancingColor === !0 && L.instanceColor === null || L.isInstancedMesh && ve.instancingColor === !1 && L.instanceColor !== null || L.isInstancedMesh && ve.instancingMorph === !0 && L.morphTexture === null || L.isInstancedMesh && ve.instancingMorph === !1 && L.morphTexture !== null || ve.envMap !== fe || z.fog === !0 && ve.fog !== K || ve.numClippingPlanes !== void 0 && (ve.numClippingPlanes !== ue.numPlanes || ve.numIntersection !== ue.numIntersection) || ve.vertexAlphas !== Ce || ve.vertexTangents !== Pe || ve.morphTargets !== we || ve.morphNormals !== He || ve.morphColors !== Ze || ve.toneMapping !== $e || ve.morphTargetsCount !== Je) && (Ge = !0) : (Ge = !0, ve.__version = z.version);
      let It = ve.currentProgram;
      Ge === !0 && (It = yi(z, I, L));
      let wn = !1, bt = !1, ii = !1;
      const tt = It.getUniforms(), Rt = ve.uniforms;
      if (xe.useProgram(It.program) && (wn = !0, bt = !0, ii = !0), z.id !== N && (N = z.id, bt = !0), wn || y !== v) {
        xe.buffers.depth.getReversed() && v.reversedDepth !== !0 && (v._reversedDepth = !0, v.updateProjectionMatrix()), tt.setValue(R, "projectionMatrix", v.projectionMatrix), tt.setValue(R, "viewMatrix", v.matrixWorldInverse);
        const gt = tt.map.cameraPosition;
        gt !== void 0 && gt.setValue(R, re.setFromMatrixPosition(v.matrixWorld)), Ke.logarithmicDepthBuffer && tt.setValue(R, "logDepthBufFC", 2 / (Math.log(v.far + 1) / Math.LN2)), (z.isMeshPhongMaterial || z.isMeshToonMaterial || z.isMeshLambertMaterial || z.isMeshBasicMaterial || z.isMeshStandardMaterial || z.isShaderMaterial) && tt.setValue(R, "isOrthographic", v.isOrthographicCamera === !0), y !== v && (y = v, bt = !0, ii = !0);
      }
      if (L.isSkinnedMesh) {
        tt.setOptional(R, L, "bindMatrix"), tt.setOptional(R, L, "bindMatrixInverse");
        const gt = L.skeleton;
        gt && (gt.boneTexture === null && gt.computeBoneTexture(), tt.setValue(R, "boneTexture", gt.boneTexture, be));
      }
      L.isBatchedMesh && (tt.setOptional(R, L, "batchingTexture"), tt.setValue(R, "batchingTexture", L._matricesTexture, be), tt.setOptional(R, L, "batchingIdTexture"), tt.setValue(R, "batchingIdTexture", L._indirectTexture, be), tt.setOptional(R, L, "batchingColorTexture"), L._colorsTexture !== null && tt.setValue(R, "batchingColorTexture", L._colorsTexture, be));
      const Ct = B.morphAttributes;
      if ((Ct.position !== void 0 || Ct.normal !== void 0 || Ct.color !== void 0) && Re.update(L, B, It), (bt || ve.receiveShadow !== L.receiveShadow) && (ve.receiveShadow = L.receiveShadow, tt.setValue(R, "receiveShadow", L.receiveShadow)), z.isMeshGouraudMaterial && z.envMap !== null && (Rt.envMap.value = fe, Rt.flipEnvMap.value = fe.isCubeTexture && fe.isRenderTargetTexture === !1 ? -1 : 1), z.isMeshStandardMaterial && z.envMap === null && I.environment !== null && (Rt.envMapIntensity.value = I.environmentIntensity), bt && (tt.setValue(R, "toneMappingExposure", x.toneMappingExposure), ve.needsLights && oo(Rt, ii), K && z.fog === !0 && Y.refreshFogUniforms(Rt, K), Y.refreshMaterialUniforms(Rt, z, J, k, m.state.transmissionRenderTarget[v.id]), Zi.upload(R, hs(ve), Rt, be)), z.isShaderMaterial && z.uniformsNeedUpdate === !0 && (Zi.upload(R, hs(ve), Rt, be), z.uniformsNeedUpdate = !1), z.isSpriteMaterial && tt.setValue(R, "center", L.center), tt.setValue(R, "modelViewMatrix", L.modelViewMatrix), tt.setValue(R, "normalMatrix", L.normalMatrix), tt.setValue(R, "modelMatrix", L.matrixWorld), z.isShaderMaterial || z.isRawShaderMaterial) {
        const gt = z.uniformsGroups;
        for (let Nt = 0, sr = gt.length; Nt < sr; Nt++) {
          const pn = gt[Nt];
          le.update(pn, It), le.bind(pn, It);
        }
      }
      return It;
    }
    function oo(v, I) {
      v.ambientLightColor.needsUpdate = I, v.lightProbe.needsUpdate = I, v.directionalLights.needsUpdate = I, v.directionalLightShadows.needsUpdate = I, v.pointLights.needsUpdate = I, v.pointLightShadows.needsUpdate = I, v.spotLights.needsUpdate = I, v.spotLightShadows.needsUpdate = I, v.rectAreaLights.needsUpdate = I, v.hemisphereLights.needsUpdate = I;
    }
    function lo(v) {
      return v.isMeshLambertMaterial || v.isMeshToonMaterial || v.isMeshPhongMaterial || v.isMeshStandardMaterial || v.isShadowMaterial || v.isShaderMaterial && v.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return D;
    }, this.getActiveMipmapLevel = function() {
      return A;
    }, this.getRenderTarget = function() {
      return P;
    }, this.setRenderTargetTextures = function(v, I, B) {
      const z = Ee.get(v);
      z.__autoAllocateDepthBuffer = v.resolveDepthBuffer === !1, z.__autoAllocateDepthBuffer === !1 && (z.__useRenderToTexture = !1), Ee.get(v.texture).__webglTexture = I, Ee.get(v.depthTexture).__webglTexture = z.__autoAllocateDepthBuffer ? void 0 : B, z.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function(v, I) {
      const B = Ee.get(v);
      B.__webglFramebuffer = I, B.__useDefaultFramebuffer = I === void 0;
    };
    const co = R.createFramebuffer();
    this.setRenderTarget = function(v, I = 0, B = 0) {
      P = v, D = I, A = B;
      let z = !0, L = null, K = !1, ce = !1;
      if (v) {
        const de = Ee.get(v);
        if (de.__useDefaultFramebuffer !== void 0)
          xe.bindFramebuffer(R.FRAMEBUFFER, null), z = !1;
        else if (de.__webglFramebuffer === void 0) be.setupRenderTarget(v);
        else if (de.__hasExternalTextures) be.rebindTextures(v, Ee.get(v.texture).__webglTexture, Ee.get(v.depthTexture).__webglTexture);
        else if (v.depthBuffer) {
          const Pe = v.depthTexture;
          if (de.__boundDepthTexture !== Pe) {
            if (Pe !== null && Ee.has(Pe) && (v.width !== Pe.image.width || v.height !== Pe.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            be.setupDepthRenderbuffer(v);
          }
        }
        const fe = v.texture;
        (fe.isData3DTexture || fe.isDataArrayTexture || fe.isCompressedArrayTexture) && (ce = !0);
        const Ce = Ee.get(v).__webglFramebuffer;
        v.isWebGLCubeRenderTarget ? (Array.isArray(Ce[I]) ? L = Ce[I][B] : L = Ce[I], K = !0) : v.samples > 0 && be.useMultisampledRTT(v) === !1 ? L = Ee.get(v).__webglMultisampledFramebuffer : Array.isArray(Ce) ? L = Ce[B] : L = Ce, S.copy(v.viewport), w.copy(v.scissor), F = v.scissorTest;
      } else
        S.copy(he).multiplyScalar(J).floor(), w.copy(Le).multiplyScalar(J).floor(), F = Fe;
      if (B !== 0 && (L = co), xe.bindFramebuffer(R.FRAMEBUFFER, L) && z && xe.drawBuffers(v, L), xe.viewport(S), xe.scissor(w), xe.setScissorTest(F), K) {
        const de = Ee.get(v.texture);
        R.framebufferTexture2D(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_CUBE_MAP_POSITIVE_X + I, de.__webglTexture, B);
      } else if (ce) {
        const de = I;
        for (let fe = 0; fe < v.textures.length; fe++) {
          const Ce = Ee.get(v.textures[fe]);
          R.framebufferTextureLayer(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0 + fe, Ce.__webglTexture, B, de);
        }
      } else if (v !== null && B !== 0) {
        const de = Ee.get(v.texture);
        R.framebufferTexture2D(R.FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, de.__webglTexture, B);
      }
      N = -1;
    }, this.readRenderTargetPixels = function(v, I, B, z, L, K, ce, de = 0) {
      if (!(v && v.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let fe = Ee.get(v).__webglFramebuffer;
      if (v.isWebGLCubeRenderTarget && ce !== void 0 && (fe = fe[ce]), fe) {
        xe.bindFramebuffer(R.FRAMEBUFFER, fe);
        try {
          const Ce = v.textures[de], Pe = Ce.format, we = Ce.type;
          if (!Ke.textureFormatReadable(Pe)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Ke.textureTypeReadable(we)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          I >= 0 && I <= v.width - z && B >= 0 && B <= v.height - L && (v.textures.length > 1 && R.readBuffer(R.COLOR_ATTACHMENT0 + de), R.readPixels(I, B, z, L, Se.convert(Pe), Se.convert(we), K));
        } finally {
          const Ce = P !== null ? Ee.get(P).__webglFramebuffer : null;
          xe.bindFramebuffer(R.FRAMEBUFFER, Ce);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(v, I, B, z, L, K, ce, de = 0) {
      if (!(v && v.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let fe = Ee.get(v).__webglFramebuffer;
      if (v.isWebGLCubeRenderTarget && ce !== void 0 && (fe = fe[ce]), fe) if (I >= 0 && I <= v.width - z && B >= 0 && B <= v.height - L) {
        xe.bindFramebuffer(R.FRAMEBUFFER, fe);
        const Ce = v.textures[de], Pe = Ce.format, we = Ce.type;
        if (!Ke.textureFormatReadable(Pe)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!Ke.textureTypeReadable(we)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        const He = R.createBuffer();
        R.bindBuffer(R.PIXEL_PACK_BUFFER, He), R.bufferData(R.PIXEL_PACK_BUFFER, K.byteLength, R.STREAM_READ), v.textures.length > 1 && R.readBuffer(R.COLOR_ATTACHMENT0 + de), R.readPixels(I, B, z, L, Se.convert(Pe), Se.convert(we), 0);
        const Ze = P !== null ? Ee.get(P).__webglFramebuffer : null;
        xe.bindFramebuffer(R.FRAMEBUFFER, Ze);
        const $e = R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE, 0);
        return R.flush(), await Pl(R, $e, 4), R.bindBuffer(R.PIXEL_PACK_BUFFER, He), R.getBufferSubData(R.PIXEL_PACK_BUFFER, 0, K), R.deleteBuffer(He), R.deleteSync($e), K;
      } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function(v, I = null, B = 0) {
      const z = Math.pow(2, -B), L = Math.floor(v.image.width * z), K = Math.floor(v.image.height * z), ce = I !== null ? I.x : 0, de = I !== null ? I.y : 0;
      be.setTexture2D(v, 0), R.copyTexSubImage2D(R.TEXTURE_2D, B, 0, 0, ce, de, L, K), xe.unbindTexture();
    };
    const ho = R.createFramebuffer(), uo = R.createFramebuffer();
    this.copyTextureToTexture = function(v, I, B = null, z = null, L = 0, K = null) {
      K === null && (L !== 0 ? (gi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), K = L, L = 0) : K = 0);
      let ce, de, fe, Ce, Pe, we, He, Ze, $e;
      const et = v.isCompressedTexture ? v.mipmaps[K] : v.image;
      if (B !== null)
        ce = B.max.x - B.min.x, de = B.max.y - B.min.y, fe = B.isBox3 ? B.max.z - B.min.z : 1, Ce = B.min.x, Pe = B.min.y, we = B.isBox3 ? B.min.z : 0;
      else {
        const Ct = Math.pow(2, -L);
        ce = Math.floor(et.width * Ct), de = Math.floor(et.height * Ct), v.isDataArrayTexture ? fe = et.depth : v.isData3DTexture ? fe = Math.floor(et.depth * Ct) : fe = 1, Ce = 0, Pe = 0, we = 0;
      }
      z !== null ? (He = z.x, Ze = z.y, $e = z.z) : (He = 0, Ze = 0, $e = 0);
      const Je = Se.convert(I.format), ve = Se.convert(I.type);
      let _t;
      I.isData3DTexture ? (be.setTexture3D(I, 0), _t = R.TEXTURE_3D) : I.isDataArrayTexture || I.isCompressedArrayTexture ? (be.setTexture2DArray(I, 0), _t = R.TEXTURE_2D_ARRAY) : (be.setTexture2D(I, 0), _t = R.TEXTURE_2D), R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL, I.flipY), R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha), R.pixelStorei(R.UNPACK_ALIGNMENT, I.unpackAlignment);
      const Ge = R.getParameter(R.UNPACK_ROW_LENGTH), It = R.getParameter(R.UNPACK_IMAGE_HEIGHT), wn = R.getParameter(R.UNPACK_SKIP_PIXELS), bt = R.getParameter(R.UNPACK_SKIP_ROWS), ii = R.getParameter(R.UNPACK_SKIP_IMAGES);
      R.pixelStorei(R.UNPACK_ROW_LENGTH, et.width), R.pixelStorei(R.UNPACK_IMAGE_HEIGHT, et.height), R.pixelStorei(R.UNPACK_SKIP_PIXELS, Ce), R.pixelStorei(R.UNPACK_SKIP_ROWS, Pe), R.pixelStorei(R.UNPACK_SKIP_IMAGES, we);
      const tt = v.isDataArrayTexture || v.isData3DTexture, Rt = I.isDataArrayTexture || I.isData3DTexture;
      if (v.isDepthTexture) {
        const Ct = Ee.get(v), gt = Ee.get(I), Nt = Ee.get(Ct.__renderTarget), sr = Ee.get(gt.__renderTarget);
        xe.bindFramebuffer(R.READ_FRAMEBUFFER, Nt.__webglFramebuffer), xe.bindFramebuffer(R.DRAW_FRAMEBUFFER, sr.__webglFramebuffer);
        for (let pn = 0; pn < fe; pn++)
          tt && (R.framebufferTextureLayer(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, Ee.get(v).__webglTexture, L, we + pn), R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, Ee.get(I).__webglTexture, K, $e + pn)), R.blitFramebuffer(Ce, Pe, ce, de, He, Ze, ce, de, R.DEPTH_BUFFER_BIT, R.NEAREST);
        xe.bindFramebuffer(R.READ_FRAMEBUFFER, null), xe.bindFramebuffer(R.DRAW_FRAMEBUFFER, null);
      } else if (L !== 0 || v.isRenderTargetTexture || Ee.has(v)) {
        const Ct = Ee.get(v), gt = Ee.get(I);
        xe.bindFramebuffer(R.READ_FRAMEBUFFER, ho), xe.bindFramebuffer(R.DRAW_FRAMEBUFFER, uo);
        for (let Nt = 0; Nt < fe; Nt++)
          tt ? R.framebufferTextureLayer(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, Ct.__webglTexture, L, we + Nt) : R.framebufferTexture2D(R.READ_FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, Ct.__webglTexture, L), Rt ? R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, gt.__webglTexture, K, $e + Nt) : R.framebufferTexture2D(R.DRAW_FRAMEBUFFER, R.COLOR_ATTACHMENT0, R.TEXTURE_2D, gt.__webglTexture, K), L !== 0 ? R.blitFramebuffer(Ce, Pe, ce, de, He, Ze, ce, de, R.COLOR_BUFFER_BIT, R.NEAREST) : Rt ? R.copyTexSubImage3D(_t, K, He, Ze, $e + Nt, Ce, Pe, ce, de) : R.copyTexSubImage2D(_t, K, He, Ze, Ce, Pe, ce, de);
        xe.bindFramebuffer(R.READ_FRAMEBUFFER, null), xe.bindFramebuffer(R.DRAW_FRAMEBUFFER, null);
      } else Rt ? v.isDataTexture || v.isData3DTexture ? R.texSubImage3D(_t, K, He, Ze, $e, ce, de, fe, Je, ve, et.data) : I.isCompressedArrayTexture ? R.compressedTexSubImage3D(_t, K, He, Ze, $e, ce, de, fe, Je, et.data) : R.texSubImage3D(_t, K, He, Ze, $e, ce, de, fe, Je, ve, et) : v.isDataTexture ? R.texSubImage2D(R.TEXTURE_2D, K, He, Ze, ce, de, Je, ve, et.data) : v.isCompressedTexture ? R.compressedTexSubImage2D(R.TEXTURE_2D, K, He, Ze, et.width, et.height, Je, et.data) : R.texSubImage2D(R.TEXTURE_2D, K, He, Ze, ce, de, Je, ve, et);
      R.pixelStorei(R.UNPACK_ROW_LENGTH, Ge), R.pixelStorei(R.UNPACK_IMAGE_HEIGHT, It), R.pixelStorei(R.UNPACK_SKIP_PIXELS, wn), R.pixelStorei(R.UNPACK_SKIP_ROWS, bt), R.pixelStorei(R.UNPACK_SKIP_IMAGES, ii), K === 0 && I.generateMipmaps && R.generateMipmap(_t), xe.unbindTexture();
    }, this.initRenderTarget = function(v) {
      Ee.get(v).__webglFramebuffer === void 0 && be.setupRenderTarget(v);
    }, this.initTexture = function(v) {
      v.isCubeTexture ? be.setTextureCube(v, 0) : v.isData3DTexture ? be.setTexture3D(v, 0) : v.isDataArrayTexture || v.isCompressedArrayTexture ? be.setTexture2DArray(v, 0) : be.setTexture2D(v, 0), xe.unbindTexture();
    }, this.resetState = function() {
      D = 0, A = 0, P = null, xe.reset(), ye.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return Qn;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = ke._getDrawingBufferColorSpace(e), t.unpackColorSpace = ke._getUnpackColorSpace();
  }
}, _a = { type: "change" }, as = { type: "start" }, so = { type: "end" }, qi = new Qr(), ga = new hn(), Wu = Math.cos(70 * Rl.DEG2RAD), ct = new U(), Et = 2 * Math.PI, qe = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, Br = 1e-6, Xu = class extends zc {
  constructor(e, t = null) {
    super(e, t), this.state = qe.NONE, this.target = new U(), this.cursor = new U(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
      LEFT: "ArrowLeft",
      UP: "ArrowUp",
      RIGHT: "ArrowRight",
      BOTTOM: "ArrowDown"
    }, this.mouseButtons = {
      LEFT: Jt.ROTATE,
      MIDDLE: Jt.DOLLY,
      RIGHT: Jt.PAN
    }, this.touches = {
      ONE: un.ROTATE,
      TWO: un.DOLLY_PAN
    }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new U(), this._lastQuaternion = new tn(), this._lastTargetPosition = new U(), this._quat = new tn().setFromUnitVectors(e.up, new U(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new Ws(), this._sphericalDelta = new Ws(), this._scale = 1, this._panOffset = new U(), this._rotateStart = new Te(), this._rotateEnd = new Te(), this._rotateDelta = new Te(), this._panStart = new Te(), this._panEnd = new Te(), this._panDelta = new Te(), this._dollyStart = new Te(), this._dollyEnd = new Te(), this._dollyDelta = new Te(), this._dollyDirection = new U(), this._mouse = new Te(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = qu.bind(this), this._onPointerDown = Yu.bind(this), this._onPointerUp = ju.bind(this), this._onContextMenu = td.bind(this), this._onMouseWheel = Ju.bind(this), this._onKeyDown = $u.bind(this), this._onTouchStart = Qu.bind(this), this._onTouchMove = ed.bind(this), this._onMouseDown = Ku.bind(this), this._onMouseMove = Zu.bind(this), this._interceptControlDown = nd.bind(this), this._interceptControlUp = id.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
  }
  connect(e) {
    super.connect(e), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, {
      passive: !0,
      capture: !0
    }), this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, { capture: !0 }), this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  getPolarAngle() {
    return this._spherical.phi;
  }
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  listenToKeyEvents(e) {
    e.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = e;
  }
  stopListenToKeyEvents() {
    this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
  }
  saveState() {
    this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
  }
  reset() {
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(_a), this.update(), this.state = qe.NONE;
  }
  update(e = null) {
    const t = this.object.position;
    ct.copy(t).sub(this.target), ct.applyQuaternion(this._quat), this._spherical.setFromVector3(ct), this.autoRotate && this.state === qe.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, i = this.maxAzimuthAngle;
    isFinite(n) && isFinite(i) && (n < -Math.PI ? n += Et : n > Math.PI && (n -= Et), i < -Math.PI ? i += Et : i > Math.PI && (i -= Et), n <= i ? this._spherical.theta = Math.max(n, Math.min(i, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + i) / 2 ? Math.max(n, this._spherical.theta) : Math.min(i, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let r = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const s = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), r = s != this._spherical.radius;
    }
    if (ct.setFromSpherical(this._spherical), ct.applyQuaternion(this._quatInverse), t.copy(this.target).add(ct), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let s = null;
      if (this.object.isPerspectiveCamera) {
        const a = ct.length();
        s = this._clampDistance(a * this._scale);
        const o = a - s;
        this.object.position.addScaledVector(this._dollyDirection, o), this.object.updateMatrixWorld(), r = !!o;
      } else if (this.object.isOrthographicCamera) {
        const a = new U(this._mouse.x, this._mouse.y, 0);
        a.unproject(this.object);
        const o = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), r = o !== this.object.zoom;
        const l = new U(this._mouse.x, this._mouse.y, 0);
        l.unproject(this.object), this.object.position.sub(l).add(a), this.object.updateMatrixWorld(), s = ct.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      s !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(s).add(this.object.position) : (qi.origin.copy(this.object.position), qi.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(qi.direction)) < Wu ? this.object.lookAt(this.target) : (ga.setFromNormalAndCoplanarPoint(this.object.up, this.target), qi.intersectPlane(ga, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const s = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), s !== this.object.zoom && (this.object.updateProjectionMatrix(), r = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, r || this._lastPosition.distanceToSquared(this.object.position) > Br || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Br || this._lastTargetPosition.distanceToSquared(this.target) > Br ? (this.dispatchEvent(_a), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(e) {
    return e !== null ? Et / 60 * this.autoRotateSpeed * e : Et / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(e) {
    const t = Math.abs(e * 0.01);
    return Math.pow(0.95, this.zoomSpeed * t);
  }
  _rotateLeft(e) {
    this._sphericalDelta.theta -= e;
  }
  _rotateUp(e) {
    this._sphericalDelta.phi -= e;
  }
  _panLeft(e, t) {
    ct.setFromMatrixColumn(t, 0), ct.multiplyScalar(-e), this._panOffset.add(ct);
  }
  _panUp(e, t) {
    this.screenSpacePanning === !0 ? ct.setFromMatrixColumn(t, 1) : (ct.setFromMatrixColumn(t, 0), ct.crossVectors(this.object.up, ct)), ct.multiplyScalar(e), this._panOffset.add(ct);
  }
  _pan(e, t) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const i = this.object.position;
      ct.copy(i).sub(this.target);
      let r = ct.length();
      r *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * e * r / n.clientHeight, this.object.matrix), this._panUp(2 * t * r / n.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(e * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(t * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
  }
  _dollyOut(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _dollyIn(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _updateZoomParameters(e, t) {
    if (!this.zoomToCursor) return;
    this._performCursorZoom = !0;
    const n = this.domElement.getBoundingClientRect(), i = e - n.left, r = t - n.top, s = n.width, a = n.height;
    this._mouse.x = i / s * 2 - 1, this._mouse.y = -(r / a) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(e) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, e));
  }
  _handleMouseDownRotate(e) {
    this._rotateStart.set(e.clientX, e.clientY);
  }
  _handleMouseDownDolly(e) {
    this._updateZoomParameters(e.clientX, e.clientX), this._dollyStart.set(e.clientX, e.clientY);
  }
  _handleMouseDownPan(e) {
    this._panStart.set(e.clientX, e.clientY);
  }
  _handleMouseMoveRotate(e) {
    this._rotateEnd.set(e.clientX, e.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const t = this.domElement;
    this._rotateLeft(Et * this._rotateDelta.x / t.clientHeight), this._rotateUp(Et * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
  }
  _handleMouseMoveDolly(e) {
    this._dollyEnd.set(e.clientX, e.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
  }
  _handleMouseMovePan(e) {
    this._panEnd.set(e.clientX, e.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
  }
  _handleMouseWheel(e) {
    this._updateZoomParameters(e.clientX, e.clientY), e.deltaY < 0 ? this._dollyIn(this._getZoomScale(e.deltaY)) : e.deltaY > 0 && this._dollyOut(this._getZoomScale(e.deltaY)), this.update();
  }
  _handleKeyDown(e) {
    let t = !1;
    switch (e.code) {
      case this.keys.UP:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(Et * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
        break;
      case this.keys.BOTTOM:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-Et * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
        break;
      case this.keys.LEFT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(Et * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
        break;
      case this.keys.RIGHT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-Et * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
        break;
    }
    t && (e.preventDefault(), this.update());
  }
  _handleTouchStartRotate(e) {
    if (this._pointers.length === 1) this._rotateStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), i = 0.5 * (e.pageY + t.y);
      this._rotateStart.set(n, i);
    }
  }
  _handleTouchStartPan(e) {
    if (this._pointers.length === 1) this._panStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), i = 0.5 * (e.pageY + t.y);
      this._panStart.set(n, i);
    }
  }
  _handleTouchStartDolly(e) {
    const t = this._getSecondPointerPosition(e), n = e.pageX - t.x, i = e.pageY - t.y, r = Math.sqrt(n * n + i * i);
    this._dollyStart.set(0, r);
  }
  _handleTouchStartDollyPan(e) {
    this.enableZoom && this._handleTouchStartDolly(e), this.enablePan && this._handleTouchStartPan(e);
  }
  _handleTouchStartDollyRotate(e) {
    this.enableZoom && this._handleTouchStartDolly(e), this.enableRotate && this._handleTouchStartRotate(e);
  }
  _handleTouchMoveRotate(e) {
    if (this._pointers.length == 1) this._rotateEnd.set(e.pageX, e.pageY);
    else {
      const n = this._getSecondPointerPosition(e), i = 0.5 * (e.pageX + n.x), r = 0.5 * (e.pageY + n.y);
      this._rotateEnd.set(i, r);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const t = this.domElement;
    this._rotateLeft(Et * this._rotateDelta.x / t.clientHeight), this._rotateUp(Et * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(e) {
    if (this._pointers.length === 1) this._panEnd.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), i = 0.5 * (e.pageY + t.y);
      this._panEnd.set(n, i);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(e) {
    const t = this._getSecondPointerPosition(e), n = e.pageX - t.x, i = e.pageY - t.y, r = Math.sqrt(n * n + i * i);
    this._dollyEnd.set(0, r), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const s = (e.pageX + t.x) * 0.5, a = (e.pageY + t.y) * 0.5;
    this._updateZoomParameters(s, a);
  }
  _handleTouchMoveDollyPan(e) {
    this.enableZoom && this._handleTouchMoveDolly(e), this.enablePan && this._handleTouchMovePan(e);
  }
  _handleTouchMoveDollyRotate(e) {
    this.enableZoom && this._handleTouchMoveDolly(e), this.enableRotate && this._handleTouchMoveRotate(e);
  }
  _addPointer(e) {
    this._pointers.push(e.pointerId);
  }
  _removePointer(e) {
    delete this._pointerPositions[e.pointerId];
    for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t] == e.pointerId) {
      this._pointers.splice(t, 1);
      return;
    }
  }
  _isTrackingPointer(e) {
    for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t] == e.pointerId) return !0;
    return !1;
  }
  _trackPointer(e) {
    let t = this._pointerPositions[e.pointerId];
    t === void 0 && (t = new Te(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
  }
  _getSecondPointerPosition(e) {
    const t = e.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[t];
  }
  _customWheelEvent(e) {
    const t = e.deltaMode, n = {
      clientX: e.clientX,
      clientY: e.clientY,
      deltaY: e.deltaY
    };
    switch (t) {
      case 1:
        n.deltaY *= 16;
        break;
      case 2:
        n.deltaY *= 100;
        break;
    }
    return e.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
  }
};
function Yu(e) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e)));
}
function qu(e) {
  this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function ju(e) {
  switch (this._removePointer(e), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(e.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(so), this.state = qe.NONE;
      break;
    case 1:
      const t = this._pointers[0], n = this._pointerPositions[t];
      this._onTouchStart({
        pointerId: t,
        pageX: n.x,
        pageY: n.y
      });
      break;
  }
}
function Ku(e) {
  let t;
  switch (e.button) {
    case 0:
      t = this.mouseButtons.LEFT;
      break;
    case 1:
      t = this.mouseButtons.MIDDLE;
      break;
    case 2:
      t = this.mouseButtons.RIGHT;
      break;
    default:
      t = -1;
  }
  switch (t) {
    case Jt.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(e), this.state = qe.DOLLY;
      break;
    case Jt.ROTATE:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = qe.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = qe.ROTATE;
      }
      break;
    case Jt.PAN:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = qe.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = qe.PAN;
      }
      break;
    default:
      this.state = qe.NONE;
  }
  this.state !== qe.NONE && this.dispatchEvent(as);
}
function Zu(e) {
  switch (this.state) {
    case qe.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(e);
      break;
    case qe.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(e);
      break;
    case qe.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(e);
      break;
  }
}
function Ju(e) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== qe.NONE || (e.preventDefault(), this.dispatchEvent(as), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(so));
}
function $u(e) {
  this.enabled !== !1 && this._handleKeyDown(e);
}
function Qu(e) {
  switch (this._trackPointer(e), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case un.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(e), this.state = qe.TOUCH_ROTATE;
          break;
        case un.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(e), this.state = qe.TOUCH_PAN;
          break;
        default:
          this.state = qe.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case un.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(e), this.state = qe.TOUCH_DOLLY_PAN;
          break;
        case un.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(e), this.state = qe.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = qe.NONE;
      }
      break;
    default:
      this.state = qe.NONE;
  }
  this.state !== qe.NONE && this.dispatchEvent(as);
}
function ed(e) {
  switch (this._trackPointer(e), this.state) {
    case qe.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(e), this.update();
      break;
    case qe.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(e), this.update();
      break;
    case qe.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(e), this.update();
      break;
    case qe.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(e), this.update();
      break;
    default:
      this.state = qe.NONE;
  }
}
function td(e) {
  this.enabled !== !1 && e.preventDefault();
}
function nd(e) {
  e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
function id(e) {
  e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
function rd(e, t = !1) {
  const n = e[0].index !== null, i = new Set(Object.keys(e[0].attributes)), r = new Set(Object.keys(e[0].morphAttributes)), s = {}, a = {}, o = e[0].morphTargetsRelative, l = new Ht();
  let c = 0;
  for (let h = 0; h < e.length; ++h) {
    const u = e[h];
    let d = 0;
    if (n !== (u.index !== null))
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."), null;
    for (const p in u.attributes) {
      if (!i.has(p))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + '. All geometries must have compatible attributes; make sure "' + p + '" attribute exists among all geometries, or in none of them.'), null;
      s[p] === void 0 && (s[p] = []), s[p].push(u.attributes[p]), d++;
    }
    if (d !== i.size)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". Make sure all geometries have the same number of attributes."), null;
    if (o !== u.morphTargetsRelative)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". .morphTargetsRelative must be consistent throughout all geometries."), null;
    for (const p in u.morphAttributes) {
      if (!r.has(p))
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ".  .morphAttributes must be consistent throughout all geometries."), null;
      a[p] === void 0 && (a[p] = []), a[p].push(u.morphAttributes[p]);
    }
    if (t) {
      let p;
      if (n) p = u.index.count;
      else if (u.attributes.position !== void 0) p = u.attributes.position.count;
      else
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index " + h + ". The geometry must have either an index or a position attribute"), null;
      l.addGroup(c, p, h), c += p;
    }
  }
  if (n) {
    let h = 0;
    const u = [];
    for (let d = 0; d < e.length; ++d) {
      const p = e[d].index;
      for (let M = 0; M < p.count; ++M) u.push(p.getX(M) + h);
      h += e[d].attributes.position.count;
    }
    l.setIndex(u);
  }
  for (const h in s) {
    const u = va(s[h]);
    if (!u)
      return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + h + " attribute."), null;
    l.setAttribute(h, u);
  }
  for (const h in a) {
    const u = a[h][0].length;
    if (u === 0) break;
    l.morphAttributes = l.morphAttributes || {}, l.morphAttributes[h] = [];
    for (let d = 0; d < u; ++d) {
      const p = [];
      for (let _ = 0; _ < a[h].length; ++_) p.push(a[h][_][d]);
      const M = va(p);
      if (!M)
        return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the " + h + " morphAttribute."), null;
      l.morphAttributes[h].push(M);
    }
  }
  return l;
}
function va(e) {
  let t, n, i, r = -1, s = 0;
  for (let c = 0; c < e.length; ++c) {
    const h = e[c];
    if (t === void 0 && (t = h.array.constructor), t !== h.array.constructor)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (n === void 0 && (n = h.itemSize), n !== h.itemSize)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (i === void 0 && (i = h.normalized), i !== h.normalized)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (r === -1 && (r = h.gpuType), r !== h.gpuType)
      return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    s += h.count * n;
  }
  const a = new t(s), o = new Ut(a, n, i);
  let l = 0;
  for (let c = 0; c < e.length; ++c) {
    const h = e[c];
    if (h.isInterleavedBufferAttribute) {
      const u = l / n;
      for (let d = 0, p = h.count; d < p; d++) for (let M = 0; M < n; M++) {
        const _ = h.getComponent(d, M);
        o.setComponent(d + u, M, _);
      }
    } else a.set(h.array, l);
    l += h.count * n;
  }
  return r !== void 0 && (o.gpuType = r), o;
}
var sd = /* @__PURE__ */ new Set([
  "6,0",
  "0,6",
  "-6,6",
  "-6,0",
  "0,-6",
  "6,-6",
  "5,1"
]), ad = /* @__PURE__ */ new Set([
  "-4,0",
  "-3,4",
  "0,4",
  "4,0",
  "3,-4",
  "0,-4",
  "-4,3",
  "4,-3"
]), zr = Object.freeze(Array.from({ length: 13 }, (e, t) => t - 6).flatMap((e) => Array.from({ length: 13 }, (t, n) => n - 6).filter((t) => Math.abs(e + t) <= 6 && !sd.has(`${e},${t}`)).map((t) => {
  const n = Math.sqrt(3) * (e + t / 2);
  return {
    id: `hex:${e}:${t}`,
    q: e,
    r: t,
    x: e === 0 && t === 0 ? 0 : n + (n < Math.sin(t * 0.65) * 1.5 ? -0.65 : 0.65),
    z: 1.8 * t,
    kind: e === 0 && t === 0 ? "crown" : ad.has(`${e},${t}`) ? "mystery" : "regular"
  };
}))), od = class {
  constructor(e, t) {
    this.element = e, this.onSelect = t, this.scene = new nc(), this.scene.background = new Be("#102c39"), this.scene.fog = new tc("#102c39", 38, 80), this.camera = new Lt(42, 1, 0.1, 120), this.renderer = new ku({
      antialias: !0,
      alpha: !1,
      powerPreference: "low-power"
    }), this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)), this.renderer.outputColorSpace = Dt, this.renderer.toneMapping = 4, this.renderer.toneMappingExposure = 1.28, this.renderer.shadowMap.enabled = !0, this.renderer.shadowMap.type = 2, e.append(this.renderer.domElement), this.renderer.domElement.setAttribute("aria-label", "Interactive 3D kingdom. Drag to pan, pinch or scroll to zoom, tap a territory."), this.controls = new Xu(this.camera, this.renderer.domElement), this.controls.enableDamping = !1, this.controls.minDistance = 5, this.controls.maxDistance = 42, this.controls.minPolarAngle = 0.25, this.controls.maxPolarAngle = 1.12, this.controls.maxTargetRadius = 13, this.controls.mouseButtons = {
      LEFT: Jt.PAN,
      MIDDLE: Jt.DOLLY,
      RIGHT: Jt.ROTATE
    }, this.controls.touches = {
      ONE: un.PAN,
      TWO: un.DOLLY_ROTATE
    }, this.controls.addEventListener("change", () => this.draw()), this.scene.add(new bc("#d7efff", "#4b3423", 2.4));
    const n = new Hs("#ffe2a1", 3.4);
    n.position.set(-10, 20, 8), n.castShadow = !0, Object.assign(n.shadow.camera, {
      left: -15,
      right: 15,
      top: 15,
      bottom: -15,
      near: 1,
      far: 60
    }), n.shadow.mapSize.set(1024, 1024), n.shadow.bias = -15e-4, this.scene.add(n);
    const i = new Hs("#86bdff", 1.1);
    i.position.set(12, 8, -12), this.scene.add(i), this.materials = /* @__PURE__ */ new Map(), this.batches = /* @__PURE__ */ new Map(), this.hexes = /* @__PURE__ */ new Map(), this.markers = /* @__PURE__ */ new Map(), this.clouds = /* @__PURE__ */ new Map(), this.ray = new Bc(), this.pointer = new Te(), this.geometry = {
      hex: new qn(0.94, 0.97, 0.18, 6),
      base: new qn(0.98, 0.9, 0.63, 6),
      box: new tr(1, 1, 1),
      sphere: new Fs(1, 10, 7),
      cone: new Os(1, 1, 8),
      cyl: new qn(1, 1, 1, 10),
      rock: new hc(1, 0),
      roof: new Os(1, 1, 4),
      ring: new uc(1, 0.045, 5, 24)
    };
    const r = new xt(new qn(13.4, 13.2, 0.65, 64), this.mat("#167f9f", 0.3, 0.25));
    r.position.y = -0.82, r.receiveShadow = !0, this.scene.add(r);
    const s = new xt(new qn(14.3, 14.7, 0.55, 6), this.mat("#684123"));
    s.position.y = -1.47, s.rotation.y = Math.PI / 6, s.receiveShadow = !0, this.scene.add(s);
    for (const [a, o] of zr.entries()) {
      this.add("base", "#958c71", [
        o.x,
        -0.35,
        o.z
      ], [
        1,
        1,
        1
      ]);
      const l = new xt(this.geometry.hex, new Bs({
        color: "#fff3d8",
        roughness: 0.84
      }));
      l.position.set(o.x, 0.055, o.z), l.userData.tile = o.id, l.receiveShadow = !0, l.castShadow = !0, this.scene.add(l), this.hexes.set(o.id, l);
      const c = Math.abs(o.q * 73 + o.r * 137), h = o.x, u = o.z;
      if (o.kind === "crown") {
        const d = new Map([...this.batches].map(([p, M]) => [p, M.length]));
        this.castle(h, u, 1);
        for (const [p, M] of this.batches) for (const _ of M.slice(d.get(p) ?? 0)) _.scale(1.75, 1.55, 1.75);
      } else if (o.kind === "mystery") {
        this.ruins(h - 0.2, u + 0.1, 0.8);
        const d = new Kn();
        for (let M = 0; M < 7; M++) {
          const _ = new xt(this.geometry.sphere, this.mat("#e5e3e9", 0.9, 0));
          _.position.set(Math.sin(M * 2.3) * 0.48, 0.5 + M % 2 * 0.13, Math.cos(M * 2.3) * 0.38), _.scale.set(0.35, 0.25, 0.3), d.add(_);
        }
        const p = this.label("?", "#35214c");
        p.position.set(0, 1.1, 0), d.add(p), d.position.set(h, 0, u), this.scene.add(d), this.clouds.set(o.id, d);
      } else c % 7 === 0 ? this.house(h + 0.13, u + 0.12, c % 2 ? "#be5934" : "#326498") : c % 11 === 0 ? this.tower(h + 0.2, u + 0.15, 0.8) : c % 13 === 0 ? this.crystals(h, u) : c % 17 === 0 && this.ruins(h, u, 0.65);
      if (o.kind === "regular" && c % 3 === 0) for (let d = 0; d < 3; d++) this.tree(h - 0.5 + d * 0.19, u - 0.48 + d % 2 * 0.15, 0.6 + c % 4 * 0.12);
      if (a % 4 === 0 && (this.add("sphere", "#71954b", [
        h + 0.57,
        0.16,
        u + 0.3
      ], [
        0.17,
        0.08,
        0.17
      ]), this.add("sphere", "#e4b173", [
        h + 0.59,
        0.2,
        u + 0.3
      ], [
        0.04,
        0.05,
        0.04
      ])), Math.max(Math.abs(o.q), Math.abs(o.r), Math.abs(o.q + o.r)) >= 5) {
        for (let d = 0; d < 5; d++) this.add("rock", d % 2 ? "#a8a595" : "#6b7b77", [
          h + Math.sin(a + d) * 0.7,
          -0.2,
          u + Math.cos(a + d) * 0.7
        ], [
          0.22,
          0.43,
          0.24
        ]);
        c % 2 && this.tree(h - 0.55, u - 0.2, 0.8);
      }
    }
    this.mountains(-1, -9), this.rainbow(7, -7);
    for (const a of [
      -3,
      2,
      4
    ]) {
      const o = zr.filter((c) => c.r === a).sort((c, h) => c.x - h.x);
      let l = [o[0], o[1]];
      for (let c = 1; c < o.length; c++) o[c].x - o[c - 1].x > l[1].x - l[0].x && (l = [o[c - 1], o[c]]);
      this.bridge((l[0].x + l[1].x) / 2, a * 1.8, Math.PI / 2);
    }
    this.waterfall(-7.5, 6), this.waterfall(8, -5), this.waterfall(1, 10);
    for (let a = 0; a < 55; a++) {
      const o = a * 2.399, l = 11.7 + a % 5 * 0.27;
      this.add("box", "#59bad0", [
        Math.cos(o) * l,
        -0.46,
        Math.sin(o) * l
      ], [
        0.12 + a % 3 * 0.11,
        8e-3,
        0.025
      ], o);
    }
    this.flush(), this.reset(), this.down = (a) => {
      this.press = {
        x: a.clientX,
        y: a.clientY,
        id: a.pointerId
      };
    }, this.up = (a) => {
      if (!this.press || this.press.id !== a.pointerId || Math.hypot(a.clientX - this.press.x, a.clientY - this.press.y) > 7) return;
      const o = this.renderer.domElement.getBoundingClientRect();
      this.pointer.set((a.clientX - o.left) / o.width * 2 - 1, -(a.clientY - o.top) / o.height * 2 + 1), this.ray.setFromCamera(this.pointer, this.camera);
      const l = this.ray.intersectObjects([...this.hexes.values()])[0];
      l && (this.select(l.object.userData.tile), this.onSelect(l.object.userData.tile));
    }, this.renderer.domElement.addEventListener("pointerdown", this.down), this.renderer.domElement.addEventListener("pointerup", this.up), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(e), this.renderer.domElement.addEventListener("webglcontextlost", (a) => {
      a.preventDefault(), this.element.dispatchEvent(new CustomEvent("maplost"));
    }), this.renderer.domElement.addEventListener("webglcontextrestored", () => this.draw()), this.resize();
  }
  mat(e, t = 0.72, n = 0) {
    const i = e + t + n;
    return this.materials.has(i) || this.materials.set(i, new Bs({
      color: e,
      roughness: t,
      metalness: n
    })), this.materials.get(i);
  }
  add(e, t, n, i, r = 0) {
    const s = this.geometry[e].clone(), a = new st().compose(new U(...n), new tn().setFromEuler(new nn(0, r, 0)), new U(...i));
    s.applyMatrix4(a), this.batches.has(t) || this.batches.set(t, []), this.batches.get(t).push(s);
  }
  flush() {
    for (const [e, t] of this.batches) {
      const n = rd(t, !1), i = new xt(n, this.mat(e));
      i.castShadow = !0, i.receiveShadow = !0, this.scene.add(i), t.forEach((r) => r.dispose());
    }
    this.batches.clear();
  }
  tree(e, t, n = 1) {
    this.add("cyl", "#795438", [
      e,
      0.25 * n,
      t
    ], [
      0.045 * n,
      0.5 * n,
      0.045 * n
    ]);
    for (let i = 0; i < 3; i++) this.add("cone", [
      "#205f49",
      "#38794a",
      "#5b9758"
    ][i], [
      e,
      (0.4 + i * 0.19) * n,
      t
    ], [
      n * (0.27 - i * 0.035),
      0.47 * n,
      n * (0.27 - i * 0.035)
    ]);
  }
  house(e, t, n) {
    this.add("box", "#e6c994", [
      e,
      0.36,
      t
    ], [
      0.55,
      0.48,
      0.45
    ]), this.add("roof", n, [
      e,
      0.72,
      t
    ], [
      0.46,
      0.38,
      0.4
    ], Math.PI / 4), this.add("box", "#6c4634", [
      e,
      0.27,
      t + 0.232
    ], [
      0.12,
      0.25,
      0.02
    ]);
    for (const i of [-0.18, 0.18]) this.add("box", "#f6d98d", [
      e + i,
      0.45,
      t + 0.235
    ], [
      0.08,
      0.1,
      0.02
    ]);
    this.add("box", "#8b6542", [
      e + 0.14,
      0.8,
      t - 0.1
    ], [
      0.08,
      0.33,
      0.09
    ]);
    for (let i = 0; i < 3; i++) this.add("box", "#aa8b56", [
      e - 0.35 + i * 0.12,
      0.15,
      t + 0.42
    ], [
      0.09,
      0.04,
      0.2
    ]);
  }
  tower(e, t, n = 1) {
    this.add("box", "#a97538", [
      e,
      0.51 * n,
      t
    ], [
      0.32 * n,
      0.8 * n,
      0.32 * n
    ]), this.add("box", "#4b3626", [
      e,
      0.7 * n,
      t + 0.17 * n
    ], [
      0.19 * n,
      0.2 * n,
      0.015
    ]), this.add("roof", "#214b6b", [
      e,
      1.04 * n,
      t
    ], [
      0.4 * n,
      0.35 * n,
      0.4 * n
    ], Math.PI / 4), this.add("cyl", "#d3a94a", [
      e,
      1.38 * n,
      t
    ], [
      0.015,
      0.45 * n,
      0.015
    ]), this.add("box", "#176ca0", [
      e + 0.12 * n,
      1.52 * n,
      t
    ], [
      0.24 * n,
      0.14 * n,
      0.025
    ]);
  }
  castle(e, t, n) {
    this.add("cyl", "#b7a387", [
      e,
      0.22,
      t
    ], [
      0.75,
      0.22,
      0.75
    ]), this.add("box", "#ebdbb7", [
      e,
      0.65,
      t
    ], [
      0.8,
      0.85,
      0.7
    ]), this.add("roof", "#19569b", [
      e,
      1.26,
      t
    ], [
      0.74,
      0.5,
      0.65
    ], Math.PI / 4), this.add("box", "#332e30", [
      e,
      0.55,
      t + 0.36
    ], [
      0.23,
      0.46,
      0.02
    ]);
    for (let i = 0; i < 5; i++) this.add("box", "#d2c4a1", [
      e,
      0.16 + i * 0.045,
      t + 0.76 - i * 0.08
    ], [
      0.36,
      0.07,
      0.12
    ]);
    for (const i of [-0.47, 0.47]) for (const r of [-0.4, 0.4])
      this.add("cyl", "#f2e1b7", [
        e + i,
        0.7,
        t + r
      ], [
        0.19,
        1.04,
        0.19
      ]), this.add("cone", "#1755a2", [
        e + i,
        1.4,
        t + r
      ], [
        0.25,
        0.55,
        0.25
      ]), this.add("sphere", "#eab64a", [
        e + i,
        1.7,
        t + r
      ], [
        0.045,
        0.055,
        0.045
      ]), this.add("box", "#6a5638", [
        e + i,
        0.92,
        t + r + 0.19
      ], [
        0.07,
        0.14,
        0.01
      ]);
    this.add("cyl", "#e6cf98", [
      e,
      1.35,
      t
    ], [
      0.17,
      0.85,
      0.17
    ]), this.add("cone", "#1a57a6", [
      e,
      1.99,
      t
    ], [
      0.29,
      0.55,
      0.29
    ]);
    for (let i = 0; i < 5; i++) {
      const r = i / 5 * Math.PI * 2;
      this.add("cone", "#f4bd3e", [
        e + Math.cos(r) * 0.2,
        2.17,
        t + Math.sin(r) * 0.2
      ], [
        0.065,
        0.3,
        0.065
      ]);
    }
    this.add("cyl", "#e1a62a", [
      e,
      2.06,
      t
    ], [
      0.24,
      0.12,
      0.24
    ]), this.add("cyl", "#f4c551", [
      e,
      2.43,
      t
    ], [
      0.015,
      0.5,
      0.015
    ]), this.add("box", "#1669ac", [
      e + 0.15,
      2.57,
      t
    ], [
      0.3,
      0.17,
      0.025
    ]);
  }
  ruins(e, t, n) {
    for (let i = 0; i < 3; i++)
      this.add("cyl", "#c5b88c", [
        e + (i - 1) * 0.27 * n,
        0.38 * n,
        t
      ], [
        0.085 * n,
        0.55 * n,
        0.085 * n
      ]), this.add("box", "#b7aa81", [
        e + (i - 1) * 0.27 * n,
        0.71 * n,
        t
      ], [
        0.21 * n,
        0.12 * n,
        0.21 * n
      ]);
    this.add("box", "#b9ad89", [
      e,
      0.82 * n,
      t
    ], [
      0.85 * n,
      0.12 * n,
      0.21 * n
    ]);
  }
  crystals(e, t) {
    this.add("rock", "#6c657d", [
      e,
      0.21,
      t
    ], [
      0.5,
      0.18,
      0.4
    ]);
    for (let n = 0; n < 5; n++) this.add("cone", n % 2 ? "#ad7ee5" : "#697bd3", [
      e + (n - 2) * 0.13,
      0.43 + n % 2 * 0.2,
      t + n % 2 * 0.15
    ], [
      0.13,
      0.6 + n % 2 * 0.3,
      0.13
    ]);
  }
  mountains(e, t) {
    for (let n = 0; n < 6; n++) {
      const i = e + n % 3 * 0.5, r = t + Math.floor(n / 3) * 0.5, s = 1.4 + n % 3 * 0.4;
      this.add("cone", "#6d7f89", [
        i,
        s / 2,
        r
      ], [
        0.8,
        s,
        0.7
      ]), this.add("cone", "#eee9db", [
        i,
        s * 0.85,
        r
      ], [
        0.3,
        s * 0.35,
        0.26
      ]);
    }
  }
  bridge(e, t, n) {
    for (let i = 0; i < 9; i++) {
      const r = (i - 4) * 0.12;
      this.add("box", "#b08a54", [
        e + Math.sin(n) * r,
        0.24 + Math.sin(i / 8 * Math.PI) * 0.14,
        t + Math.cos(n) * r
      ], [
        0.45,
        0.07,
        0.11
      ], n);
    }
    for (const i of [-1, 1]) for (const r of [
      -0.5,
      0,
      0.5
    ]) this.add("box", "#805535", [
      e + Math.cos(n) * 0.23 * i + Math.sin(n) * r,
      0.45,
      t - Math.sin(n) * 0.23 * i + Math.cos(n) * r
    ], [
      0.045,
      0.45,
      0.045
    ]);
  }
  waterfall(e, t) {
    for (let n = 0; n < 6; n++) this.add("box", n % 2 ? "#b8e3e6" : "#52b6d2", [
      e + n * 0.075,
      -0.55,
      t
    ], [
      0.065,
      1.3,
      0.07
    ]);
    for (let n = 0; n < 6; n++) this.add("sphere", "#d2e9db", [
      e + n * 0.09,
      -1.12,
      t
    ], [
      0.12,
      0.08,
      0.15
    ]);
  }
  rainbow(e, t) {
    for (let n = 0; n < 5; n++) for (let i = 0; i < 20; i++) {
      const r = i / 19 * Math.PI;
      this.add("sphere", [
        "#ed8284",
        "#ebbd62",
        "#b8cd78",
        "#6ac7c1",
        "#a794d0"
      ][n], [
        e + Math.cos(r) * (1.3 - n * 0.07),
        0.5 + Math.sin(r) * (1.3 - n * 0.07),
        t
      ], [
        0.12,
        0.12,
        0.06
      ]);
    }
    for (let n = 0; n < 5; n++) this.add("sphere", "#eeebd6", [
      e - 1.2 + n * 0.15,
      0.45 + n % 2 * 0.1,
      t
    ], [
      0.25,
      0.2,
      0.3
    ]);
  }
  label(e, t) {
    const n = document.createElement("canvas");
    n.width = 128, n.height = 128;
    const i = n.getContext("2d");
    i.fillStyle = t, i.font = "bold 100px Georgia", i.textAlign = "center", i.fillText(e, 64, 100);
    const r = new lc(n), s = new rc(new za({
      map: r,
      depthTest: !1
    }));
    return s.scale.set(0.65, 0.65, 1), s;
  }
  update(e) {
    this.state = e;
    for (const t of e.tiles) {
      const n = this.hexes.get(t.id), i = e.players.find((o) => o.id === t.owner);
      n.material.color.set(i?.color ?? "#fff3d8");
      const r = this.markers.get(t.id), s = `${t.fortress}:${t.shield}:${i?.color}`;
      if (r?.userData.key !== s) {
        r && (this.scene.remove(r), r.traverse((l) => {
          l.material && this.materials.has(l.material);
        }));
        const o = new Kn();
        if (o.userData.key = s, o.position.set(t.x, 0.2, t.z), t.fortress) {
          for (let c = 0; c < 4; c++) {
            const h = new xt(this.geometry.cyl, this.mat("#d6bea0"));
            h.scale.set(0.13, 0.55, 0.13), h.position.set((c % 2 - 0.5) * 0.6, 0.25, (Math.floor(c / 2) - 0.5) * 0.6), o.add(h);
          }
          const l = this.label("F", "#ffdb72");
          l.position.set(0, 1.2, 0), o.add(l);
        }
        if (t.shield) {
          const l = new xt(new Fs(0.85, 16, 10), new ts({
            color: "#82dafa",
            transparent: !0,
            opacity: 0.22,
            wireframe: !0
          }));
          l.scale.y = 0.7, l.position.y = 0.3, o.add(l);
        }
        this.scene.add(o), this.markers.set(t.id, o);
      }
      const a = this.clouds.get(t.id);
      a && (a.visible = !t.resolved);
    }
    this.draw();
  }
  select(e) {
    this.selected && this.hexes.get(this.selected).material.emissive.set("#000000"), this.selected = e, this.hexes.get(e)?.material.emissive.set("#725415"), this.draw();
  }
  focus(e) {
    const t = zr.find((i) => i.id === e);
    if (!t) return;
    this.select(e);
    const n = new U(t.x, 0, t.z).sub(this.controls.target);
    this.camera.position.add(n), this.controls.target.add(n), this.controls.update(), this.draw();
  }
  reset() {
    const e = this.element.clientWidth < 600;
    this.camera.position.set(12, 18, 20).multiplyScalar(e ? 1.25 : 1), this.controls.target.set(0, 0, 0), this.controls.update(), this.draw();
  }
  zoom(e) {
    this.camera.position.sub(this.controls.target).multiplyScalar(e).add(this.controls.target), this.controls.update(), this.draw();
  }
  resize() {
    const e = this.element.clientWidth, t = this.element.clientHeight;
    !e || !t || (this.renderer.setSize(e, t, !1), this.camera.aspect = e / t, this.camera.updateProjectionMatrix(), this.draw());
  }
  draw() {
    this.renderer && this.element.clientWidth && this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.observer.disconnect(), this.controls.dispose(), this.renderer.dispose(), this.scene.traverse((e) => {
      e.geometry?.dispose(), e.material && (Array.isArray(e.material) ? e.material : [e.material]).forEach((t) => {
        t.map?.dispose(), t.dispose();
      });
    }), this.renderer.domElement.remove();
  }
};
export {
  od as Kingdom
};
