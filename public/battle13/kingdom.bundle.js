var E = /* @__PURE__ */ new Set([
  "6,0",
  "0,6",
  "-6,6",
  "-6,0",
  "0,-6",
  "6,-6",
  "5,1"
]), I = /* @__PURE__ */ new Set([
  "-4,0",
  "-3,4",
  "0,4",
  "4,0",
  "3,-4",
  "0,-4",
  "-4,3",
  "4,-3"
]), g = Object.freeze(Array.from({ length: 13 }, (s, e) => e - 6).flatMap((s) => Array.from({ length: 13 }, (e, i) => i - 6).filter((e) => Math.abs(s + e) <= 6 && !E.has(`${s},${e}`)).map((e) => {
  const i = Math.sqrt(3) * (s + e / 2);
  return {
    id: `hex:${s}:${e}`,
    q: s,
    r: e,
    x: s === 0 && e === 0 ? 0 : i + (i < Math.sin(e * 0.65) * 1.5 ? -0.65 : 0.65),
    z: 1.8 * e,
    kind: s === 0 && e === 0 ? "crown" : I.has(`${s},${e}`) ? "mystery" : "regular"
  };
}))), T = {
  width: 1536,
  height: 1024
}, x = [
  ["Highland", [
    [375, 88],
    [441, 66],
    [510, 89],
    [510, 125],
    [439, 149],
    [373, 126]
  ]],
  ["Windmill", [
    [1007, 110],
    [1076, 85],
    [1145, 112],
    [1153, 149],
    [1085, 173],
    [1009, 148]
  ]],
  ["Crystal", [
    [156, 305],
    [234, 280],
    [305, 303],
    [305, 340],
    [230, 366],
    [158, 342]
  ]],
  ["Orchard", [
    [950, 221],
    [1024, 198],
    [1095, 218],
    [1101, 262],
    [1026, 287],
    [953, 263]
  ]],
  ["Village", [
    [217, 497],
    [298, 469],
    [376, 495],
    [373, 541],
    [295, 571],
    [214, 545]
  ]],
  ["Gardens", [
    [947, 473],
    [1019, 448],
    [1092, 473],
    [1097, 520],
    [1024, 546],
    [948, 517]
  ]],
  ["Harbour", [
    [1268, 537],
    [1343, 506],
    [1430, 538],
    [1442, 585],
    [1364, 617],
    [1272, 586]
  ]],
  ["Waterfall", [
    [752, 657],
    [835, 628],
    [914, 656],
    [920, 712],
    [837, 745],
    [750, 713]
  ]],
  ["Meadow", [
    [397, 706],
    [480, 672],
    [562, 707],
    [561, 767],
    [480, 800],
    [394, 765]
  ]],
  ["Approach", [
    [638, 782],
    [723, 746],
    [811, 779],
    [814, 837],
    [727, 875],
    [638, 840]
  ]]
].map(([s, e], i) => {
  const a = e.map((c) => c[0]), n = e.map((c) => c[1]), h = Math.min(...a), t = Math.min(...n), r = Math.max(...a) - h, o = Math.max(...n) - t;
  return {
    name: s,
    index: i,
    polygon: e,
    left: h,
    top: t,
    width: r,
    height: o,
    cx: h + r / 2,
    cy: t + o / 2
  };
});
function Y(s) {
  let e = 0, i = 0, a = 0;
  for (let n = 0; n < s.length; n++) {
    const h = s[n], t = s[(n + 1) % s.length], r = h[0] * t[1] - t[0] * h[1];
    e += r, i += (h[0] + t[0]) * r, a += (h[1] + t[1]) * r;
  }
  return [i / (3 * e), a / (3 * e)];
}
function W(s, e, i, a) {
  const n = [];
  for (let h = 0; h < s.length; h++) {
    const t = s[h], r = s[(h + 1) % s.length], o = t[0] * e + t[1] * i - a, c = r[0] * e + r[1] * i - a;
    if (o <= 1e-9 && n.push(t), o < 0 && c > 0 || o > 0 && c < 0) {
      const d = o / (o - c);
      n.push([t[0] + (r[0] - t[0]) * d, t[1] + (r[1] - t[1]) * d]);
    }
  }
  return n;
}
function R(s, e) {
  const i = [];
  for (let n = 0; n < 3; n++) for (let h = 0; h < 4; h++) i.push([-0.66 + h * 0.43 + (n === 1 ? 0.12 : 0), -0.49 + n * 0.49]);
  e === 11 && i.splice(3, 1);
  const a = s.polygon.map(([n, h]) => [(n - s.cx) / (s.width / 2), (h - s.cy) / (s.height / 2)]);
  return i.map((n, h) => {
    let t = a;
    for (let r = 0; r < i.length; r++) {
      if (h === r) continue;
      const o = i[r];
      t = W(t, o[0] - n[0], o[1] - n[1], (o[0] * o[0] + o[1] * o[1] - n[0] * n[0] - n[1] * n[1]) / 2);
    }
    return t.map(([r, o]) => [s.cx + r * s.width / 2, s.cy + o * s.height / 2]);
  });
}
var N = g.filter((s) => s.kind === "regular"), O = g.filter((s) => s.kind === "mystery"), V = 0, X = x.flatMap((s, e) => R(s, e === 9 ? 11 : 12).map((i, a) => {
  const n = e < 8 && a === 5 ? O[e] : N[V++], [h, t] = Y(i);
  return {
    ...n,
    number: g.findIndex((r) => r.id === n.id) + 1,
    terrace: e,
    polygon: i,
    cx: h,
    cy: t
  };
})), z = g.find((s) => s.kind === "crown"), H = {
  ...z,
  number: g.findIndex((s) => s.id === z.id) + 1,
  terrace: null,
  cx: 799,
  cy: 342,
  polygon: [
    [612, 235],
    [676, 172],
    [700, 115],
    [738, 113],
    [759, 20],
    [805, 67],
    [833, 151],
    [853, 188],
    [903, 226],
    [931, 334],
    [925, 390],
    [875, 432],
    [834, 480],
    [754, 463],
    [704, 421],
    [631, 382],
    [590, 310]
  ]
}, j = [...X, H], D = "http://www.w3.org/2000/svg", $ = "/battle13/assets/map/", l = (s, e = {}, i) => {
  const a = document.createElementNS(D, s);
  for (const [n, h] of Object.entries(e)) a.setAttribute(n, h);
  return i !== void 0 && (a.textContent = i), a;
}, y = (s) => s.map((e) => e.map((i) => i.toFixed(2)).join(",")).join(" "), P = class {
  constructor(s, e) {
    this.element = s, this.onSelect = e, this.abort = new AbortController(), this.tiles = /* @__PURE__ */ new Map(), this.pointers = /* @__PURE__ */ new Map(), this.scale = 1, this.x = 0, this.y = 0, this.selected = null, this.disposed = !1, s.classList.add("illustrated-kingdom"), this.viewport = document.createElement("div"), this.viewport.className = "kingdom-viewport", this.viewport.tabIndex = 0, this.viewport.setAttribute("aria-label", "Illustrated kingdom. Drag to pan, pinch to zoom. Use terrace shortcuts to enlarge small territories."), this.board = document.createElement("div"), this.board.className = "kingdom-board", this.art = document.createElement("img"), this.art.className = "kingdom-landscape", this.art.src = $ + "kingdom.webp", this.art.alt = "A royal castle surrounded by villages, waterfalls, crystal caves and turquoise water.", this.art.draggable = !1, this.svg = l("svg", {
      viewBox: `0 0 ${T.width} ${T.height}`,
      class: "kingdom-territories",
      "aria-label": "120 territories, including eight Mystery Lands and the central Crown"
    });
    const i = l("defs");
    this.svg.append(i);
    for (const t of j) {
      const r = t.kind === "crown", o = l("g", {
        class: "kingdom-land" + (r ? " crown-land" : ""),
        "data-land": t.id,
        role: "button",
        tabindex: 0,
        "aria-pressed": "false"
      }), c = l("title");
      o.append(c);
      const d = l("polygon", {
        points: y(t.polygon),
        class: "land-stone"
      });
      o.append(d), r && (o.append(l("path", {
        d: "M744 449 L757 467 L834 482 L879 435",
        class: "crown-plinth"
      })), o.append(l("path", {
        d: "M786 260 L803 260 L803 271 Q795 281 786 271 Z",
        class: "crown-owner-seal"
      })));
      const m = l("text", {
        x: r ? 800 : t.cx,
        y: r ? 496 : t.cy,
        class: r ? "crown-label" : "land-number"
      }, r ? "King’s Crown" : t.number);
      o.append(m);
      let p = null;
      if (t.kind === "mystery") {
        const k = t.polygon.map((v) => v[0]), M = t.polygon.map((v) => v[1]), S = Math.max(...k) - Math.min(...k), A = Math.max(...M) - Math.min(...M), L = "mist-" + t.number, C = l("clipPath", { id: L });
        C.append(l("polygon", { points: y(t.polygon) })), i.append(C), p = l("g", {
          class: "land-mist",
          "clip-path": `url(#${L})`
        }), p.append(l("polygon", {
          points: y(t.polygon),
          fill: "#c9cedc"
        })), p.append(l("image", {
          href: $ + "mist.webp",
          x: t.cx - S * 0.82,
          y: t.cy - A * 0.95,
          width: S * 1.64,
          height: A * 1.9,
          preserveAspectRatio: "none",
          class: "mist-paint"
        })), p.append(l("text", {
          x: t.cx,
          y: t.cy,
          class: "mystery-symbol"
        }, "?")), o.append(p);
      }
      const u = r ? 800 : t.cx, b = r ? 465 : t.cy, w = l("g", {
        class: "fortress-marker",
        transform: `translate(${u},${b})`
      });
      w.append(l("path", { d: "M-9 5V-7H-5V-3H-2V-7H2V-3H5V-7H9V5H3V0H-3V5Z" })), o.append(w);
      const f = l("g", {
        class: "shield-marker",
        transform: `translate(${u + 11},${b - 7})`
      });
      f.append(l("path", { d: "M-6-8L6-8L6 0Q5 6 0 9Q-5 6-6 0Z" })), f.append(l("path", {
        d: "M-3-1L-1 2L4-4",
        class: "shield-check"
      })), o.append(f), this.svg.append(o), this.tiles.set(t.id, {
        land: t,
        g: o,
        title: c,
        top: d,
        number: m,
        mist: p,
        fortress: w,
        shield: f
      });
    }
    this.board.append(this.art, this.svg), this.viewport.append(this.board), this.status = document.createElement("p"), this.status.className = "kingdom-map-status", this.status.setAttribute("role", "status"), this.status.textContent = "Tap a terrace to zoom in, then choose a territory.", this.shortcuts = document.createElement("nav"), this.shortcuts.className = "kingdom-terraces", this.shortcuts.setAttribute("aria-label", "Zoom to a terrace");
    const a = document.createElement("button");
    a.type = "button", a.textContent = "Crown", a.onclick = () => this.focus(H.id), this.shortcuts.append(a);
    for (const t of x) {
      const r = document.createElement("button");
      r.type = "button", r.textContent = t.name, r.dataset.terrace = t.index, r.onclick = () => this.focusTerrace(t.index), this.shortcuts.append(r);
    }
    s.replaceChildren(this.viewport, this.status, this.shortcuts);
    const n = (t, r, o, c = {}) => t.addEventListener(r, o, {
      ...c,
      signal: this.abort.signal
    });
    n(this.art, "error", () => {
      this.status.textContent = "The illustration could not load. You can still use Choose territory below.";
    }), n(this.viewport, "pointerdown", (t) => {
      t.button !== 0 && t.pointerType === "mouse" || (this.pointers.set(t.pointerId, {
        x: t.clientX,
        y: t.clientY,
        startX: t.clientX,
        startY: t.clientY,
        id: t.target.closest("[data-land]")?.dataset.land
      }), this.viewport.setPointerCapture(t.pointerId), this.pointers.size === 1 ? this.dragged = !1 : this.dragged = !0, this.pinch = null, this.viewport.classList.add("is-dragging"));
    }), n(this.viewport, "pointermove", (t) => {
      const r = this.pointers.get(t.pointerId);
      if (!r) return;
      const o = t.clientX - r.x, c = t.clientY - r.y;
      if (r.x = t.clientX, r.y = t.clientY, Math.hypot(t.clientX - r.startX, t.clientY - r.startY) > 7 && (this.dragged = !0), this.pointers.size === 2) {
        const [d, m] = [...this.pointers.values()], p = Math.hypot(d.x - m.x, d.y - m.y), u = this.viewport.getBoundingClientRect();
        this.pinch && this.zoomAt(p / this.pinch, (d.x + m.x) / 2 - u.left, (d.y + m.y) / 2 - u.top), this.pinch = p;
      } else
        this.x += o, this.y += c, this.draw();
    });
    const h = (t, r = !1) => {
      const o = this.pointers.get(t.pointerId);
      o && (this.pointers.delete(t.pointerId), this.pinch = null, this.pointers.size || (this.viewport.classList.remove("is-dragging"), !r && !this.dragged && o.id && this.activate(o.id)), this.viewport.hasPointerCapture(t.pointerId) && this.viewport.releasePointerCapture(t.pointerId));
    };
    n(this.viewport, "pointerup", (t) => h(t)), n(this.viewport, "pointercancel", (t) => h(t, !0)), n(this.viewport, "wheel", (t) => {
      t.preventDefault();
      const r = this.viewport.getBoundingClientRect();
      this.zoomAt(Math.exp(-t.deltaY * 15e-4), t.clientX - r.left, t.clientY - r.top);
    }, { passive: !1 }), n(this.svg, "keydown", (t) => {
      if (t.key === "Enter" || t.key === " ") {
        const r = t.target.closest("[data-land]")?.dataset.land;
        r && (t.preventDefault(), this.select(r), this.onSelect(r));
      }
    }), n(this.viewport, "keydown", (t) => {
      if (t.target === this.viewport) {
        if (t.key === "+" || t.key === "=") this.zoom(0.8);
        else if (t.key === "-") this.zoom(1.25);
        else if (t.key === "ArrowLeft") this.x += 60;
        else if (t.key === "ArrowRight") this.x -= 60;
        else if (t.key === "ArrowUp") this.y += 60;
        else if (t.key === "ArrowDown") this.y -= 60;
        else return;
        t.preventDefault(), this.draw();
      }
    }), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(this.viewport), this.resize();
  }
  activate(s) {
    const e = this.tiles.get(s);
    if (e) {
      if (e.land.kind !== "crown" && this.scale < 1.15) {
        this.focusTerrace(e.land.terrace), this.status.textContent = "Terrace enlarged. Tap a numbered stone to choose it.";
        return;
      }
      this.select(s), this.onSelect(s);
    }
  }
  update(s) {
    this.state = s;
    for (const e of s.tiles) {
      const i = this.tiles.get(e.id);
      if (!i) continue;
      const a = s.players.find((t) => t.id === e.owner), n = /^#[0-9a-f]{6}$/i.test(a?.color ?? "") ? a.color : "#f3e5c3";
      i.g.style.setProperty("--owner", n), i.g.classList.toggle("is-owned", !!a), i.g.classList.toggle("is-resolved", !!e.resolved), i.g.classList.toggle("is-fortress", !!e.fortress), i.g.classList.toggle("is-shielded", !!e.shield), Object.assign(i.g.dataset, {
        resolved: String(!!e.resolved),
        owner: a?.id ?? "",
        fortress: String(!!e.fortress),
        shield: String(!!e.shield)
      });
      const h = [
        e.kind === "crown" ? "King’s Crown" : `Territory ${i.land.number}`,
        a?.name ?? "Unclaimed",
        e.kind === "mystery" && !e.resolved ? "Mystery Land" : "",
        e.fortress ? "Fortress" : "",
        e.shield ? "Shield" : ""
      ].filter(Boolean).join(" · ");
      i.title.textContent = h, i.g.setAttribute("aria-label", h);
    }
    this.element.dataset.ready = "true";
  }
  select(s) {
    if (this.tiles.has(s)) {
      for (const [e, i] of this.tiles)
        i.g.classList.toggle("is-selected", e === s), i.g.setAttribute("aria-pressed", String(e === s));
      this.selected = s, this.status.textContent = this.tiles.get(s).title.textContent;
    }
  }
  focus(s) {
    const e = this.tiles.get(s);
    e && (this.select(s), e.land.kind === "crown" ? this.moveTo(790, 300, Math.min(1.8, this.fitScale * 8, this.viewport.clientWidth / 440, this.viewport.clientHeight / 520)) : this.focusTerrace(e.land.terrace));
  }
  focusTerrace(s) {
    const e = x[s];
    e && (this.moveTo(e.cx, e.cy, Math.min(2.2, this.fitScale * 8, this.viewport.clientWidth / (e.width + 35), this.viewport.clientHeight / (e.height + 40))), this.status.textContent = e.name + " terrace · Tap a numbered stone.");
  }
  moveTo(s, e, i) {
    this.scale = Math.max(this.fitScale, i), this.x = this.viewport.clientWidth / 2 - s * this.scale, this.y = this.viewport.clientHeight / 2 - e * this.scale, this.draw();
  }
  zoom(s) {
    this.zoomAt(1 / s, this.viewport.clientWidth / 2, this.viewport.clientHeight / 2);
  }
  zoomAt(s, e, i) {
    if (!this.fitScale) return;
    const a = Math.max(this.fitScale, Math.min(2.8, this.fitScale * 8, this.scale * s)), n = a / this.scale;
    this.x = e - (e - this.x) * n, this.y = i - (i - this.y) * n, this.scale = a, this.draw();
  }
  reset() {
    this.viewport.clientWidth && (this.fitScale = Math.min(this.viewport.clientWidth / 1536, this.viewport.clientHeight / 1024), this.scale = this.fitScale, this.x = this.y = 0, this.draw(), this.status.textContent = "Tap a terrace to zoom in, then choose a territory.");
  }
  resize() {
    if (this.disposed) return;
    const s = this.viewport.clientWidth, e = this.viewport.clientHeight;
    if (!s || !e) return;
    const i = this.fitScale ? this.scale / this.fitScale : 1, a = this.w ? (this.w / 2 - this.x) / this.scale : 768, n = this.h ? (this.h / 2 - this.y) / this.scale : 512;
    this.w = s, this.h = e, this.fitScale = Math.min(s / 1536, e / 1024), this.moveTo(a, n, this.fitScale * i);
  }
  draw() {
    if (this.disposed || !this.viewport.clientWidth) return;
    const s = this.viewport.clientWidth, e = this.viewport.clientHeight, i = 1536 * this.scale, a = 1024 * this.scale;
    this.x = i < s ? (s - i) / 2 : Math.min(0, Math.max(s - i, this.x)), this.y = a < e ? (e - a) / 2 : Math.min(0, Math.max(e - a, this.y)), this.board.style.transform = `translate(${this.x}px,${this.y}px)`;
    for (const n of [
      this.board,
      this.art,
      this.svg
    ])
      n.style.width = i + "px", n.style.height = a + "px";
    this.element.classList.toggle("map-detail", this.scale >= 0.8), this.element.dataset.zoom = (this.scale / this.fitScale).toFixed(2);
  }
  dispose() {
    this.disposed = !0, this.abort.abort(), this.observer.disconnect(), this.pointers.clear(), this.element.replaceChildren(), this.element.classList.remove("illustrated-kingdom", "map-detail"), delete this.element.dataset.ready, delete this.element.dataset.zoom;
  }
};
export {
  P as Kingdom
};
