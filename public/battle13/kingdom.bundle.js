var X = /* @__PURE__ */ new Set([
  "6,0",
  "0,6",
  "-6,6",
  "-6,0",
  "0,-6",
  "6,-6",
  "5,1"
]), _ = /* @__PURE__ */ new Set([
  "-4,0",
  "-3,4",
  "0,4",
  "4,0",
  "3,-4",
  "0,-4",
  "-4,3",
  "4,-3"
]), B = Object.freeze(Array.from({ length: 13 }, (t, e) => e - 6).flatMap((t) => Array.from({ length: 13 }, (e, s) => s - 6).filter((e) => Math.abs(t + e) <= 6 && !X.has(`${t},${e}`)).map((e) => {
  const s = Math.sqrt(3) * (t + e / 2);
  return {
    id: `hex:${t}:${e}`,
    q: t,
    r: e,
    x: t === 0 && e === 0 ? 0 : s + (s < Math.sin(e * 0.65) * 1.5 ? -0.65 : 0.65),
    z: 1.8 * e,
    kind: t === 0 && e === 0 ? "crown" : _.has(`${t},${e}`) ? "mystery" : "regular"
  };
}))), M = {
  width: 1536,
  height: 1024
}, y = {
  halfWidth: 52.8,
  halfHeight: 41.8
}, v = {
  x: 768,
  y: 472
};
function P(t, e) {
  const { halfWidth: s, halfHeight: a } = y;
  return [
    [t, e - a],
    [t + s, e - a / 2],
    [t + s, e + a / 2],
    [t, e + a],
    [t - s, e + a / 2],
    [t - s, e - a / 2]
  ];
}
function V(t) {
  let e = 0, s = 0, a = 0;
  for (let r = 0; r < t.length; r++) {
    const l = t[r], d = t[(r + 1) % t.length], u = l[0] * d[1] - d[0] * l[1];
    e += u, s += (l[0] + d[0]) * u, a += (l[1] + d[1]) * u;
  }
  return [s / (3 * e), a / (3 * e)];
}
function Z([t, e]) {
  const s = t - v.x, a = e - v.y, r = Math.hypot(s / (y.halfWidth * 2 / Math.sqrt(3)), a / y.halfHeight), l = 1 + 0.28 * Math.max(0, 2 - r);
  return [v.x + s * l, v.y + a * l];
}
var L = B.map((t, e) => {
  const s = P(v.x + y.halfWidth * (2 * t.q + t.r), v.y + y.halfHeight * 1.5 * t.r).map(Z), [a, r] = V(s);
  return {
    ...t,
    number: e + 1,
    polygon: s,
    cx: a,
    cy: r
  };
}), Q = L.filter((t) => t.kind !== "crown"), G = L.find((t) => t.kind === "crown"), A = (t) => t.map((e) => e.toFixed(5)).join(","), w = /* @__PURE__ */ new Map();
for (const t of L) for (let e = 0; e < 6; e++) {
  const s = t.polygon[e], a = t.polygon[(e + 1) % 6], r = [A(s), A(a)].sort().join("|");
  w.has(r) ? w.delete(r) : w.set(r, [s, a]);
}
var F = new Map([...w.values()].map(([t, e]) => [A(t), e])), N = [], H = w.values().next().value[0];
for (let t = 0; t < w.size; t++)
  N.push(H), H = F.get(A(H));
var K = "http://www.w3.org/2000/svg", b = "/battle13/assets/map/", n = (t, e = {}, s) => {
  const a = document.createElementNS(K, t);
  for (const [r, l] of Object.entries(e)) a.setAttribute(r, l);
  return s !== void 0 && (a.textContent = s), a;
}, S = (t) => t.map((e) => e.map((s) => s.toFixed(2)).join(",")).join(" "), J = class {
  constructor(t, e) {
    this.element = t, this.onSelect = e, this.abort = new AbortController(), this.tiles = /* @__PURE__ */ new Map(), this.pointers = /* @__PURE__ */ new Map(), this.scale = 1, this.x = 0, this.y = 0, this.selected = null, this.disposed = !1, t.classList.add("illustrated-kingdom"), this.viewport = document.createElement("div"), this.viewport.className = "kingdom-viewport", this.viewport.tabIndex = 0, this.viewport.setAttribute("aria-label", "120 hexagonal territories. Drag to pan, pinch to zoom, or tap a small hexagon to enlarge it."), this.board = document.createElement("div"), this.board.className = "kingdom-board", this.art = document.createElement("img"), this.art.className = "kingdom-landscape", this.art.src = b + "kingdom-board-v3.webp", this.art.alt = "An ivory kingdom board surrounded by forests, a coastal village, waterfalls, turquoise sea and a rainbow.", this.art.draggable = !1, this.svg = n("svg", {
      viewBox: `0 0 ${M.width} ${M.height}`,
      class: "kingdom-territories",
      "aria-label": "120 territories, including eight Mystery Lands and the central Crown"
    });
    const s = n("defs"), a = n("pattern", {
      id: "kingdom-ivory-stone",
      patternUnits: "userSpaceOnUse",
      width: 180,
      height: 180
    });
    a.append(n("image", {
      href: b + "kingdom-board-v2.webp",
      x: -650,
      y: -550,
      width: 1536,
      height: 1024
    })), s.append(a), this.svg.append(s);
    const r = "M" + N.map((i) => i.join(",")).join("L") + "Z", l = n("pattern", {
      id: "kingdom-verge-texture",
      patternUnits: "userSpaceOnUse",
      width: 128,
      height: 128
    });
    l.append(n("image", {
      href: b + "coastal-verge.webp",
      width: 128,
      height: 128
    })), s.append(l);
    const d = n("mask", {
      id: "kingdom-outside-board",
      maskUnits: "userSpaceOnUse",
      x: 0,
      y: 0,
      width: 1536,
      height: 1024
    });
    d.append(n("rect", {
      width: 1536,
      height: 1024,
      fill: "white"
    }), n("path", {
      d: r,
      fill: "black"
    })), s.append(d);
    const u = n("filter", {
      id: "kingdom-verge-feather",
      x: "-50%",
      y: "-50%",
      width: "200%",
      height: "200%"
    });
    u.append(n("feGaussianBlur", { stdDeviation: 12 })), s.append(u);
    const $ = n("mask", {
      id: "kingdom-verge-repairs",
      maskUnits: "userSpaceOnUse",
      x: 0,
      y: 0,
      width: 1536,
      height: 1024
    });
    for (const [i, o, h, g] of [
      [
        173,
        345,
        70,
        55
      ],
      [
        145,
        490,
        65,
        40
      ],
      [
        1362,
        340,
        85,
        75
      ],
      [
        1362,
        558,
        85,
        55
      ]
    ]) $.append(n("ellipse", {
      cx: i,
      cy: o,
      rx: h,
      ry: g,
      fill: "white",
      filter: "url(#kingdom-verge-feather)"
    }));
    s.append($);
    const E = n("g", {
      class: "kingdom-verge",
      mask: "url(#kingdom-outside-board)",
      "pointer-events": "none",
      "aria-hidden": "true"
    }), O = n("g", { mask: "url(#kingdom-verge-repairs)" });
    O.append(n("path", {
      d: r,
      fill: "none",
      stroke: "url(#kingdom-verge-texture)",
      "stroke-width": 58,
      "stroke-linejoin": "round"
    }), n("path", {
      d: r,
      fill: "none",
      stroke: "#907a44",
      "stroke-width": 5,
      "stroke-linejoin": "round"
    })), E.append(O), this.svg.append(E);
    for (const i of L) {
      const o = i.kind === "crown", h = n("g", {
        class: "kingdom-land" + (o ? " crown-land" : ""),
        "data-land": i.id,
        role: "button",
        tabindex: 0,
        "aria-pressed": "false"
      }), g = n("title");
      h.append(g);
      const m = n("polygon", {
        points: S(i.polygon),
        class: "land-stone"
      });
      h.append(m), h.append(n("polygon", {
        points: S(i.polygon),
        class: "land-owner"
      })), o && h.append(n("image", {
        href: b + "crown-castle-v2.png",
        x: i.cx - 58,
        y: i.cy - 56,
        width: 116,
        height: 84,
        preserveAspectRatio: "xMidYMax meet",
        class: "crown-castle"
      }));
      const f = n("text", {
        x: i.cx,
        y: i.cy + (o ? 34 : 0),
        class: o ? "crown-label" : "land-number"
      }, o ? "CROWN" : i.number);
      h.append(f);
      let p = null;
      if (i.kind === "mystery") {
        const W = i.polygon.map((z) => z[0]), Y = i.polygon.map((z) => z[1]), R = Math.max(...W) - Math.min(...W), D = Math.max(...Y) - Math.min(...Y), j = "mist-" + i.number, I = n("clipPath", { id: j });
        I.append(n("polygon", { points: S(i.polygon) })), s.append(I), p = n("g", {
          class: "land-mist",
          "clip-path": `url(#${j})`
        }), p.append(n("polygon", {
          points: S(i.polygon),
          fill: "#c9cedc"
        })), p.append(n("image", {
          href: b + "mist.webp",
          x: i.cx - R * 0.82,
          y: i.cy - D * 0.95,
          width: R * 1.64,
          height: D * 1.9,
          preserveAspectRatio: "none",
          class: "mist-paint"
        })), p.append(n("text", {
          x: i.cx,
          y: i.cy,
          class: "mystery-symbol"
        }, "?")), h.append(p);
      }
      const x = i.cx, U = i.cy, C = n("g", {
        class: "fortress-marker",
        transform: `translate(${x},${U})`
      });
      C.append(n("path", { d: "M-9 5V-7H-5V-3H-2V-7H2V-3H5V-7H9V5H3V0H-3V5Z" })), h.append(C);
      const k = n("g", {
        class: "shield-marker",
        transform: `translate(${x + 11},${U - 7})`
      });
      k.append(n("path", { d: "M-6-8L6-8L6 0Q5 6 0 9Q-5 6-6 0Z" })), k.append(n("path", {
        d: "M-3-1L-1 2L4-4",
        class: "shield-check"
      })), h.append(k), this.svg.append(h), this.tiles.set(i.id, {
        land: i,
        g: h,
        title: g,
        top: m,
        number: f,
        mist: p,
        fortress: C,
        shield: k
      });
    }
    this.board.append(this.art, this.svg), this.viewport.append(this.board), this.status = document.createElement("p"), this.status.className = "kingdom-map-status", this.status.setAttribute("role", "status"), this.status.textContent = "120 lands · Pinch to zoom · Drag to explore", t.replaceChildren(this.viewport, this.status);
    const c = (i, o, h, g = {}) => i.addEventListener(o, h, {
      ...g,
      signal: this.abort.signal
    });
    c(this.art, "error", () => {
      this.status.textContent = "The illustration could not load. You can still use Choose territory below.";
    }), c(this.viewport, "pointerdown", (i) => {
      i.button !== 0 && i.pointerType === "mouse" || (this.pointers.set(i.pointerId, {
        x: i.clientX,
        y: i.clientY,
        startX: i.clientX,
        startY: i.clientY,
        id: i.target.closest("[data-land]")?.dataset.land
      }), this.viewport.setPointerCapture(i.pointerId), this.pointers.size === 1 ? this.dragged = !1 : this.dragged = !0, this.pinch = null, this.viewport.classList.add("is-dragging"));
    }), c(this.viewport, "pointermove", (i) => {
      const o = this.pointers.get(i.pointerId);
      if (!o) return;
      const h = i.clientX - o.x, g = i.clientY - o.y;
      if (o.x = i.clientX, o.y = i.clientY, Math.hypot(i.clientX - o.startX, i.clientY - o.startY) > 7 && (this.dragged = !0), this.pointers.size === 2) {
        const [m, f] = [...this.pointers.values()], p = Math.hypot(m.x - f.x, m.y - f.y), x = this.viewport.getBoundingClientRect();
        this.pinch && this.zoomAt(p / this.pinch, (m.x + f.x) / 2 - x.left, (m.y + f.y) / 2 - x.top), this.pinch = p;
      } else
        this.x += h, this.y += g, this.draw();
    });
    const T = (i, o = !1) => {
      const h = this.pointers.get(i.pointerId);
      h && (this.pointers.delete(i.pointerId), this.pinch = null, this.pointers.size || (this.viewport.classList.remove("is-dragging"), !o && !this.dragged && h.id && this.activate(h.id)), this.viewport.hasPointerCapture(i.pointerId) && this.viewport.releasePointerCapture(i.pointerId));
    };
    c(this.viewport, "pointerup", (i) => T(i)), c(this.viewport, "pointercancel", (i) => T(i, !0)), c(this.viewport, "wheel", (i) => {
      i.preventDefault();
      const o = this.viewport.getBoundingClientRect();
      this.zoomAt(Math.exp(-i.deltaY * 15e-4), i.clientX - o.left, i.clientY - o.top);
    }, { passive: !1 }), c(this.svg, "keydown", (i) => {
      if (i.key === "Enter" || i.key === " ") {
        const o = i.target.closest("[data-land]")?.dataset.land;
        o && (i.preventDefault(), this.select(o), this.onSelect(o));
      }
    }), c(this.viewport, "keydown", (i) => {
      if (i.target === this.viewport) {
        if (i.key === "+" || i.key === "=") this.zoom(0.8);
        else if (i.key === "-") this.zoom(1.25);
        else if (i.key === "ArrowLeft") this.x += 60;
        else if (i.key === "ArrowRight") this.x -= 60;
        else if (i.key === "ArrowUp") this.y += 60;
        else if (i.key === "ArrowDown") this.y -= 60;
        else return;
        i.preventDefault(), this.draw();
      }
    }), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(this.viewport), this.resize();
  }
  activate(t) {
    const e = this.tiles.get(t);
    if (e) {
      if (e.land.kind !== "crown" && this.scale * y.halfWidth * 2 < 28) {
        this.focus(t), this.status.textContent = "Map enlarged. Tap a hexagon to choose it.";
        return;
      }
      this.select(t), this.onSelect(t);
    }
  }
  update(t) {
    this.state = t;
    for (const e of t.tiles) {
      const s = this.tiles.get(e.id);
      if (!s) continue;
      const a = t.players.find((d) => d.id === e.owner), r = /^#[0-9a-f]{6}$/i.test(a?.color ?? "") ? a.color : "#f3e5c3";
      s.g.style.setProperty("--owner", r), s.g.classList.toggle("is-owned", !!a), s.g.classList.toggle("is-resolved", !!e.resolved), s.g.classList.toggle("is-fortress", !!e.fortress), s.g.classList.toggle("is-shielded", !!e.shield), Object.assign(s.g.dataset, {
        resolved: String(!!e.resolved),
        owner: a?.id ?? "",
        fortress: String(!!e.fortress),
        shield: String(!!e.shield)
      });
      const l = [
        e.kind === "crown" ? "King’s Crown" : `Territory ${s.land.number}`,
        a?.name ?? "Unclaimed",
        e.kind === "mystery" && !e.resolved ? "Mystery Land" : "",
        e.fortress ? "Fortress" : "",
        e.shield ? "Shield" : ""
      ].filter(Boolean).join(" · ");
      s.title.textContent = l, s.g.setAttribute("aria-label", l);
    }
    this.element.dataset.ready = "true";
  }
  select(t) {
    if (this.tiles.has(t)) {
      for (const [e, s] of this.tiles)
        s.g.classList.toggle("is-selected", e === t), s.g.setAttribute("aria-pressed", String(e === t));
      this.selected = t, this.status.textContent = this.tiles.get(t).title.textContent;
    }
  }
  focus(t) {
    const e = this.tiles.get(t);
    e && (this.select(t), this.moveTo(e.land.cx, e.land.cy, Math.min(2.2, Math.max(1, this.viewport.clientWidth / 300))));
  }
  moveTo(t, e, s) {
    this.scale = Math.max(this.fitScale, s), this.x = this.viewport.clientWidth / 2 - t * this.scale, this.y = this.viewport.clientHeight / 2 - e * this.scale, this.draw();
  }
  zoom(t) {
    this.zoomAt(1 / t, this.viewport.clientWidth / 2, this.viewport.clientHeight / 2);
  }
  zoomAt(t, e, s) {
    if (!this.fitScale) return;
    const a = Math.max(this.fitScale, Math.min(2.8, this.fitScale * 8, this.scale * t)), r = a / this.scale;
    this.x = e - (e - this.x) * r, this.y = s - (s - this.y) * r, this.scale = a, this.draw();
  }
  reset() {
    this.viewport.clientWidth && (this.fitScale = Math.min(this.viewport.clientWidth / M.width, this.viewport.clientHeight / M.height), this.scale = this.fitScale, this.x = this.y = 0, this.draw(), this.status.textContent = "120 lands · Pinch to zoom · Drag to explore");
  }
  resize() {
    if (this.disposed) return;
    const t = this.viewport.clientWidth, e = this.viewport.clientHeight;
    if (!t || !e) return;
    const s = this.fitScale ? this.scale / this.fitScale : 1, a = this.w ? (this.w / 2 - this.x) / this.scale : 768, r = this.h ? (this.h / 2 - this.y) / this.scale : 512;
    this.w = t, this.h = e, this.fitScale = Math.min(t / 1536, e / 1024), this.moveTo(a, r, this.fitScale * s);
  }
  draw() {
    if (this.disposed || !this.viewport.clientWidth) return;
    const t = this.viewport.clientWidth, e = this.viewport.clientHeight, s = 1536 * this.scale, a = 1024 * this.scale;
    this.x = s < t ? (t - s) / 2 : Math.min(0, Math.max(t - s, this.x)), this.y = a < e ? (e - a) / 2 : Math.min(0, Math.max(e - a, this.y)), this.board.style.transform = `translate(${this.x}px,${this.y}px)`;
    for (const r of [
      this.board,
      this.art,
      this.svg
    ])
      r.style.width = s + "px", r.style.height = a + "px";
    this.element.classList.toggle("map-detail", this.scale >= 0.8), this.element.dataset.zoom = (this.scale / this.fitScale).toFixed(2);
  }
  dispose() {
    this.disposed = !0, this.abort.abort(), this.observer.disconnect(), this.pointers.clear(), this.element.replaceChildren(), this.element.classList.remove("illustrated-kingdom", "map-detail"), delete this.element.dataset.ready, delete this.element.dataset.zoom;
  }
};
export {
  J as Kingdom
};
