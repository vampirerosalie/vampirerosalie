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
]), P = Object.freeze(Array.from({ length: 13 }, (t, e) => e - 6).flatMap((t) => Array.from({ length: 13 }, (e, i) => i - 6).filter((e) => Math.abs(t + e) <= 6 && !X.has(`${t},${e}`)).map((e) => {
  const i = Math.sqrt(3) * (t + e / 2);
  return {
    id: `hex:${t}:${e}`,
    q: t,
    r: e,
    x: t === 0 && e === 0 ? 0 : i + (i < Math.sin(e * 0.65) * 1.5 ? -0.65 : 0.65),
    z: 1.8 * e,
    kind: t === 0 && e === 0 ? "crown" : _.has(`${t},${e}`) ? "mystery" : "regular"
  };
}))), S = {
  width: 1536,
  height: 1024
}, x = {
  halfWidth: 52.8,
  halfHeight: 41.8
}, w = {
  x: 768,
  y: 472
};
function V(t, e) {
  const { halfWidth: i, halfHeight: a } = x;
  return [
    [t, e - a],
    [t + i, e - a / 2],
    [t + i, e + a / 2],
    [t, e + a],
    [t - i, e + a / 2],
    [t - i, e - a / 2]
  ];
}
function Z(t) {
  let e = 0, i = 0, a = 0;
  for (let n = 0; n < t.length; n++) {
    const l = t[n], d = t[(n + 1) % t.length], u = l[0] * d[1] - d[0] * l[1];
    e += u, i += (l[0] + d[0]) * u, a += (l[1] + d[1]) * u;
  }
  return [i / (3 * e), a / (3 * e)];
}
function F([t, e]) {
  const i = t - w.x, a = e - w.y, n = Math.hypot(i / (x.halfWidth * 2 / Math.sqrt(3)), a / x.halfHeight), l = 1 + 0.28 * Math.max(0, 2 - n);
  return [w.x + i * l, w.y + a * l];
}
var L = P.map((t, e) => {
  const i = V(w.x + x.halfWidth * (2 * t.q + t.r), w.y + x.halfHeight * 1.5 * t.r).map(F), [a, n] = Z(i);
  return {
    ...t,
    number: e + 1,
    polygon: i,
    cx: a,
    cy: n
  };
}), Q = L.filter((t) => t.kind !== "crown"), J = L.find((t) => t.kind === "crown"), A = (t) => t.map((e) => e.toFixed(5)).join(","), y = /* @__PURE__ */ new Map();
for (const t of L) for (let e = 0; e < 6; e++) {
  const i = t.polygon[e], a = t.polygon[(e + 1) % 6], n = [A(i), A(a)].sort().join("|");
  y.has(n) ? y.delete(n) : y.set(n, [i, a]);
}
var G = new Map([...y.values()].map(([t, e]) => [A(t), e])), B = [], $ = y.values().next().value[0];
for (let t = 0; t < y.size; t++)
  B.push($), $ = G.get(A($));
var K = "http://www.w3.org/2000/svg", v = "/battle13/assets/map/", r = (t, e = {}, i) => {
  const a = document.createElementNS(K, t);
  for (const [n, l] of Object.entries(e)) a.setAttribute(n, l);
  return i !== void 0 && (a.textContent = i), a;
}, M = (t) => t.map((e) => e.map((i) => i.toFixed(2)).join(",")).join(" "), q = class {
  constructor(t, e) {
    this.element = t, this.onSelect = e, this.abort = new AbortController(), this.tiles = /* @__PURE__ */ new Map(), this.pointers = /* @__PURE__ */ new Map(), this.scale = 1, this.x = 0, this.y = 0, this.selected = null, this.disposed = !1, t.classList.add("illustrated-kingdom"), this.viewport = document.createElement("div"), this.viewport.className = "kingdom-viewport", this.viewport.tabIndex = 0, this.viewport.setAttribute("aria-label", "120 hexagonal territories. Drag to pan, pinch to zoom, or tap a small hexagon to enlarge it."), this.board = document.createElement("div"), this.board.className = "kingdom-board", this.art = document.createElement("img"), this.art.className = "kingdom-landscape", this.art.src = v + "kingdom-board-v3.webp", this.art.alt = "An ivory kingdom board surrounded by forests, a coastal village, waterfalls, turquoise sea and a rainbow.", this.art.draggable = !1, this.svg = r("svg", {
      viewBox: `0 0 ${S.width} ${S.height}`,
      class: "kingdom-territories",
      "aria-label": "120 territories, including eight Mystery Lands and the central Crown"
    });
    const i = r("defs"), a = r("pattern", {
      id: "kingdom-ivory-stone",
      patternUnits: "userSpaceOnUse",
      width: 180,
      height: 180
    });
    a.append(r("image", {
      href: v + "kingdom-board-v2.webp",
      x: -650,
      y: -550,
      width: 1536,
      height: 1024
    })), i.append(a), this.svg.append(i);
    const n = r("pattern", {
      id: "kingdom-grass",
      patternUnits: "userSpaceOnUse",
      width: 160,
      height: 160
    });
    n.append(r("image", {
      href: v + "grass-reserve-v1.webp",
      width: 160,
      height: 160
    })), i.append(n);
    const l = "M" + B.map((s) => s.join(",")).join("L") + "Z", d = r("pattern", {
      id: "kingdom-verge-texture",
      patternUnits: "userSpaceOnUse",
      width: 128,
      height: 128
    });
    d.append(r("image", {
      href: v + "coastal-verge.webp",
      width: 128,
      height: 128
    })), i.append(d);
    const u = r("mask", {
      id: "kingdom-outside-board",
      maskUnits: "userSpaceOnUse",
      x: 0,
      y: 0,
      width: 1536,
      height: 1024
    });
    u.append(r("rect", {
      width: 1536,
      height: 1024,
      fill: "white"
    }), r("path", {
      d: l,
      fill: "black"
    })), i.append(u);
    const H = r("filter", {
      id: "kingdom-verge-feather",
      x: "-50%",
      y: "-50%",
      width: "200%",
      height: "200%"
    });
    H.append(r("feGaussianBlur", { stdDeviation: 12 })), i.append(H);
    const O = r("mask", {
      id: "kingdom-verge-repairs",
      maskUnits: "userSpaceOnUse",
      x: 0,
      y: 0,
      width: 1536,
      height: 1024
    });
    for (const [s, o, h, g] of [
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
    ]) O.append(r("ellipse", {
      cx: s,
      cy: o,
      rx: h,
      ry: g,
      fill: "white",
      filter: "url(#kingdom-verge-feather)"
    }));
    i.append(O);
    const U = r("g", {
      class: "kingdom-verge",
      mask: "url(#kingdom-outside-board)",
      "pointer-events": "none",
      "aria-hidden": "true"
    }), E = r("g", { mask: "url(#kingdom-verge-repairs)" });
    E.append(r("path", {
      d: l,
      fill: "none",
      stroke: "url(#kingdom-verge-texture)",
      "stroke-width": 58,
      "stroke-linejoin": "round"
    }), r("path", {
      d: l,
      fill: "none",
      stroke: "#907a44",
      "stroke-width": 5,
      "stroke-linejoin": "round"
    })), U.append(E), this.svg.append(U);
    for (const s of L) {
      const o = s.kind === "crown", h = r("g", {
        class: "kingdom-land" + (o ? " crown-land" : ""),
        "data-land": s.id,
        role: "button",
        tabindex: 0,
        "aria-pressed": "false"
      }), g = r("title");
      h.append(g);
      const m = r("polygon", {
        points: M(s.polygon),
        class: "land-stone"
      });
      h.append(m), h.append(r("polygon", {
        points: M(s.polygon),
        class: "land-owner"
      })), o && h.append(r("image", {
        href: v + "crown-castle-v2.png",
        x: s.cx - 58,
        y: s.cy - 56,
        width: 116,
        height: 84,
        preserveAspectRatio: "xMidYMax meet",
        class: "crown-castle"
      }));
      const f = r("text", {
        x: s.cx,
        y: s.cy + (o ? 34 : 0),
        class: o ? "crown-label" : "land-number"
      }, o ? "CROWN" : s.number);
      h.append(f);
      let p = null;
      if (s.kind === "mystery") {
        const W = s.polygon.map((z) => z[0]), Y = s.polygon.map((z) => z[1]), D = Math.max(...W) - Math.min(...W), j = Math.max(...Y) - Math.min(...Y), I = "mist-" + s.number, N = r("clipPath", { id: I });
        N.append(r("polygon", { points: M(s.polygon) })), i.append(N), p = r("g", {
          class: "land-mist",
          "clip-path": `url(#${I})`
        }), p.append(r("polygon", {
          points: M(s.polygon),
          fill: "#c9cedc"
        })), p.append(r("image", {
          href: v + "mist.webp",
          x: s.cx - D * 0.82,
          y: s.cy - j * 0.95,
          width: D * 1.64,
          height: j * 1.9,
          preserveAspectRatio: "none",
          class: "mist-paint"
        })), p.append(r("text", {
          x: s.cx,
          y: s.cy,
          class: "mystery-symbol"
        }, "?")), h.append(p);
      }
      const b = s.cx, T = s.cy, C = r("g", {
        class: "fortress-marker",
        transform: `translate(${b},${T})`
      });
      C.append(r("path", { d: "M-9 5V-7H-5V-3H-2V-7H2V-3H5V-7H9V5H3V0H-3V5Z" })), h.append(C);
      const k = r("g", {
        class: "shield-marker",
        transform: `translate(${b + 11},${T - 7})`
      });
      k.append(r("path", { d: "M-6-8L6-8L6 0Q5 6 0 9Q-5 6-6 0Z" })), k.append(r("path", {
        d: "M-3-1L-1 2L4-4",
        class: "shield-check"
      })), h.append(k), this.svg.append(h), this.tiles.set(s.id, {
        land: s,
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
    const c = (s, o, h, g = {}) => s.addEventListener(o, h, {
      ...g,
      signal: this.abort.signal
    });
    c(this.art, "error", () => {
      this.status.textContent = "The illustration could not load. You can still use Choose territory below.";
    }), c(this.viewport, "pointerdown", (s) => {
      s.button !== 0 && s.pointerType === "mouse" || (this.pointers.set(s.pointerId, {
        x: s.clientX,
        y: s.clientY,
        startX: s.clientX,
        startY: s.clientY,
        id: s.target.closest("[data-land]")?.dataset.land
      }), this.viewport.setPointerCapture(s.pointerId), this.pointers.size === 1 ? this.dragged = !1 : this.dragged = !0, this.pinch = null, this.viewport.classList.add("is-dragging"));
    }), c(this.viewport, "pointermove", (s) => {
      const o = this.pointers.get(s.pointerId);
      if (!o) return;
      const h = s.clientX - o.x, g = s.clientY - o.y;
      if (o.x = s.clientX, o.y = s.clientY, Math.hypot(s.clientX - o.startX, s.clientY - o.startY) > 7 && (this.dragged = !0), this.pointers.size === 2) {
        const [m, f] = [...this.pointers.values()], p = Math.hypot(m.x - f.x, m.y - f.y), b = this.viewport.getBoundingClientRect();
        this.pinch && this.zoomAt(p / this.pinch, (m.x + f.x) / 2 - b.left, (m.y + f.y) / 2 - b.top), this.pinch = p;
      } else
        this.x += h, this.y += g, this.draw();
    });
    const R = (s, o = !1) => {
      const h = this.pointers.get(s.pointerId);
      h && (this.pointers.delete(s.pointerId), this.pinch = null, this.pointers.size || (this.viewport.classList.remove("is-dragging"), !o && !this.dragged && h.id && this.activate(h.id)), this.viewport.hasPointerCapture(s.pointerId) && this.viewport.releasePointerCapture(s.pointerId));
    };
    c(this.viewport, "pointerup", (s) => R(s)), c(this.viewport, "pointercancel", (s) => R(s, !0)), c(this.viewport, "wheel", (s) => {
      s.preventDefault();
      const o = this.viewport.getBoundingClientRect();
      this.zoomAt(Math.exp(-s.deltaY * 15e-4), s.clientX - o.left, s.clientY - o.top);
    }, { passive: !1 }), c(this.svg, "keydown", (s) => {
      if (s.key === "Enter" || s.key === " ") {
        const o = s.target.closest("[data-land]")?.dataset.land;
        o && (s.preventDefault(), this.select(o), this.onSelect(o));
      }
    }), c(this.viewport, "keydown", (s) => {
      if (s.target === this.viewport) {
        if (s.key === "+" || s.key === "=") this.zoom(0.8);
        else if (s.key === "-") this.zoom(1.25);
        else if (s.key === "ArrowLeft") this.x += 60;
        else if (s.key === "ArrowRight") this.x -= 60;
        else if (s.key === "ArrowUp") this.y += 60;
        else if (s.key === "ArrowDown") this.y -= 60;
        else return;
        s.preventDefault(), this.draw();
      }
    }), this.observer = new ResizeObserver(() => this.resize()), this.observer.observe(this.viewport), this.resize();
  }
  activate(t) {
    const e = this.tiles.get(t);
    if (e) {
      if (e.land.kind !== "crown" && this.scale * x.halfWidth * 2 < 28) {
        this.focus(t), this.status.textContent = "Map enlarged. Tap a hexagon to choose it.";
        return;
      }
      this.select(t), this.onSelect(t);
    }
  }
  update(t) {
    this.state = t;
    for (const e of t.tiles) {
      const i = this.tiles.get(e.id);
      if (!i) continue;
      const a = t.players.find((d) => d.id === e.owner), n = /^#[0-9a-f]{6}$/i.test(a?.color ?? "") ? a.color : "#f3e5c3";
      i.g.style.setProperty("--owner", n), i.g.classList.toggle("is-blocked", !!e.blocked), i.g.dataset.blocked = String(!!e.blocked), i.g.classList.toggle("is-owned", !!a), i.g.classList.toggle("is-resolved", !!e.resolved), i.mist && (i.mist.querySelector(".mystery-symbol").textContent = e.explored ? "✓" : "?"), i.g.classList.toggle("is-fortress", !!e.fortress), i.g.classList.toggle("is-shielded", !!e.shield), Object.assign(i.g.dataset, {
        resolved: String(!!e.resolved),
        owner: a?.id ?? "",
        fortress: String(!!e.fortress),
        shield: String(!!e.shield)
      });
      const l = e.blocked ? "Grassy reserve · Not playable in this round" : [
        e.kind === "crown" ? "King’s Crown" : `Territory ${i.land.number}`,
        a?.name ?? "Unclaimed",
        e.kind === "mystery" ? e.explored ? "Mystery Land · explored by your team" : "Mystery Land" : "",
        e.fortress ? "Fortress" : "",
        e.shield ? "Shield" : ""
      ].filter(Boolean).join(" · ");
      i.title.textContent = l, i.g.setAttribute("aria-label", l);
    }
    this.element.dataset.ready = "true", this.selected || (this.status.textContent = this.boardStatus());
  }
  boardStatus() {
    const t = this.state;
    return (t?.board ? `${t.board.claimable} lands · 8 mysteries · ${t.board.blocked} grass (blocked)` : t?.boardRules === 1 ? "Board size locks at Start Game" : t?.mysteryRules === 2 ? "112 lands + 8 mysteries" : "120 lands") + " · Pinch to zoom · Drag to explore";
  }
  select(t) {
    if (this.tiles.has(t)) {
      for (const [e, i] of this.tiles)
        i.g.classList.toggle("is-selected", e === t), i.g.setAttribute("aria-pressed", String(e === t));
      this.selected = t, this.status.textContent = this.tiles.get(t).title.textContent;
    }
  }
  focus(t) {
    const e = this.tiles.get(t);
    e && (this.select(t), this.moveTo(e.land.cx, e.land.cy, Math.min(2.2, Math.max(1, this.viewport.clientWidth / 300))));
  }
  moveTo(t, e, i) {
    this.scale = Math.max(this.fitScale, i), this.x = this.viewport.clientWidth / 2 - t * this.scale, this.y = this.viewport.clientHeight / 2 - e * this.scale, this.draw();
  }
  zoom(t) {
    this.zoomAt(1 / t, this.viewport.clientWidth / 2, this.viewport.clientHeight / 2);
  }
  zoomAt(t, e, i) {
    if (!this.fitScale) return;
    const a = Math.max(this.fitScale, Math.min(2.8, this.fitScale * 8, this.scale * t)), n = a / this.scale;
    this.x = e - (e - this.x) * n, this.y = i - (i - this.y) * n, this.scale = a, this.draw();
  }
  reset() {
    this.viewport.clientWidth && (this.fitScale = Math.min(this.viewport.clientWidth / S.width, this.viewport.clientHeight / S.height), this.scale = this.fitScale, this.x = this.y = 0, this.draw(), this.status.textContent = this.boardStatus());
  }
  resize() {
    if (this.disposed) return;
    const t = this.viewport.clientWidth, e = this.viewport.clientHeight;
    if (!t || !e) return;
    const i = this.fitScale ? this.scale / this.fitScale : 1, a = this.w ? (this.w / 2 - this.x) / this.scale : 768, n = this.h ? (this.h / 2 - this.y) / this.scale : 512;
    this.w = t, this.h = e, this.fitScale = Math.min(t / 1536, e / 1024), this.moveTo(a, n, this.fitScale * i);
  }
  draw() {
    if (this.disposed || !this.viewport.clientWidth) return;
    const t = this.viewport.clientWidth, e = this.viewport.clientHeight, i = 1536 * this.scale, a = 1024 * this.scale;
    this.x = i < t ? (t - i) / 2 : Math.min(0, Math.max(t - i, this.x)), this.y = a < e ? (e - a) / 2 : Math.min(0, Math.max(e - a, this.y)), this.board.style.transform = `translate(${this.x}px,${this.y}px)`;
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
  q as Kingdom
};
