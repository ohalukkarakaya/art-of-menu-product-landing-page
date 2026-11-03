/**
 * Stands: five QR menu stands in a row on a long table, each a plate leaning
 * back in a rounded foot, its face carrying a QR code of three finder squares
 * and dot modules. The stand under the pointer comes upright and its code
 * lights; the others lean back, staggered outwards from it. Table 4 is the
 * one lit at rest. The slider is the stagger, in ms.
 */
const {
  Cam, clamp, facing, fit, poly, proj, rad, rings, rrect, prism, seg,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, reflect, register, solid,
} = HL;

const N = 5, W = 46, H = 60, G = 40, TK = 1.6, BH = 7;
const LEAN = [-15, -10, -17, -5, -12], BACK = -22, LIFT = 5, REST_LIT = 3;
const X0 = -14, X1 = W + 14, Y0 = -16, Y1 = (N - 1) * G + 16;
// QR area on the plate face (plate units, v up), and its 6 × 6 module grid
const QU = 7, QV = 18, QS = 32, CELL = QS / 6;
const MOD = [
  "..#.#.", "..##..", "#.#.##", ".##.#.", "..#.##", "..##.#",
].map((r) => r.split("").map((ch) => ch === "#"));
const FINDER = [[0, 4], [4, 4], [0, 0]];   // top-left, top-right, bottom-left, in cells
const inFinder = (cx, cy) => FINDER.some(([fx, fy]) => cx >= fx && cx < fx + 2 && cy >= fy && cy < fy + 2);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 1.5);
  fit(C, [[X0, Y0, -6], [X1, Y1, -6], [X1, Y0, 0], [X0, Y1, 0], [0, Y0, BH + H + LIFT], [W, Y0, BH + H + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // the table: a long rounded slab
  const [tRing, tInner] = rings(X0, Y0, X1, Y1, 9, 2);
  reflect(svg, g, P, front, tRing, -6, 12);
  put(solid(g), prism(P, front, tRing, tInner, -6, 0));

  const stands = [];
  for (let i = 0; i < N; i++) {
    const yb = i * G, grp = mk("g", {}, g);
    // the foot: a low rounded block with a slot along its top
    const [fRing, fInner] = rings(-5, yb - 6, W + 5, yb + 6, 4, 1.2);
    put(solid(grp), prism(P, front, fRing, fInner, 0, BH));
    mk("path", { d: seg(P(2, yb, BH), P(W - 2, yb, BH)), class: "nf lo" }, grp);
    const back = mk("path", { class: "lo" }, grp), face = mk("path", { class: "sil" }, grp);
    const line = mk("path", { class: "nf lo" }, grp);
    const finders = FINDER.map(() => mk("path", { class: "nf" }, grp));
    const dots = [];
    for (let cy = 0; cy < 6; cy++) for (let cx = 0; cx < 6; cx++) {
      if (!MOD[5 - cy][cx] || inFinder(cx, cy)) continue;
      dots.push({ cx, cy, el: mk("circle", { r: 1.05, class: "dot off" }, grp) });
    }
    stands.push({ yb, back, face, line, finders, dots, a: tween(LEAN[i]), z: tween(i === REST_LIT ? 2 : 0) });
  }

  /** Stand i leaning th degrees back and lifted by `lift`: its plate drawn in its own tilted plane. */
  function draw(i, th, lift) {
    const st = stands[i], s = Math.sin(rad(th)), c = Math.cos(rad(th));
    const w = (u, v) => P(u, st.yb + v * s, BH + v * c + lift);
    const wb = (u, v) => P(u, st.yb + v * s - TK * c, BH + v * c + TK * s + lift);
    const plate = rrect(0, 0, W, H, 4, 4);
    st.back.setAttribute("d", poly(plate.map((q) => wb(q.u, q.v))));
    st.face.setAttribute("d", poly(plate.map((q) => w(q.u, q.v))));
    st.line.setAttribute("d", seg(w(10, 10), w(W - 10, 10)));
    st.finders.forEach((el, k) => {
      const [fx, fy] = FINDER[k], u0 = QU + fx * CELL + 0.6, v0 = QV + fy * CELL + 0.6, sz = CELL * 2 - 1.2;
      el.setAttribute("d", poly(rrect(u0, v0, u0 + sz, v0 + sz, 1.6, 3).map((q) => w(q.u, q.v))));
    });
    st.dots.forEach((d) => place(d.el, w(QU + (d.cx + 0.5) * CELL, QV + (d.cy + 0.5) * CELL)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    stands.forEach((st, i) => { draw(i, tval(st.a, now), tval(st.z, now)); if (!tdone(st.a, now) || !tdone(st.z, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit test: the stand whose resting foot is nearest the pointer along the row, on the table's plane
  const foot = stands.map((st) => P(W / 2, st.yb, 0));
  function hit([x, y]) {
    let best = -1, bd = 1e9;
    foot.forEach((f, i) => { const d = Math.hypot(x - f[0], (y - f[1]) * 0.55); if (d < bd) { bd = d; best = i; } });
    return bd < 62 ? best : -1;
  }

  function light(i, on) {
    const st = stands[i];
    st.face.classList.toggle("hi", on);
    st.finders.forEach((el) => el.classList.toggle("hi", on));
    st.dots.forEach((d) => d.el.setAttribute("class", on ? "dot" : "dot off"));
  }

  let act = null;
  /** Brings stand a upright (-1 puts every stand back to its own rest lean); the others lean away in turn. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : REST_LIT;
    act = a;
    stands.forEach((st, i) => {
      const delay = Math.abs(i - from) * stag;
      tset(st.a, a < 0 ? LEAN[i] : i === a ? 0 : BACK, now, delay);
      tset(st.z, a < 0 ? (i === REST_LIT ? 2 : 0) : i === a ? LIFT : 0, now, delay);
      light(i, a < 0 ? i === REST_LIT : i === a);
    });
    read.textContent = a < 0 ? "rest" : String(a + 1).padStart(2, "0");
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = clamp(v, 0, 120); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "stands",
  means: "Five QR menu stands on a table: the one under the pointer comes upright and its code lights, the rest lean away.",
  rules: [1, 2, 4, 5],
  range: [0, 45, 90],
  tour: [[150, 150], [215, 175], [280, 205], null],
  mount,
});
