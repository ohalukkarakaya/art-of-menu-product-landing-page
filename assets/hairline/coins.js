/**
 * Coins: three stacks of coins on a counter mat, one per plan (Menu, Order,
 * Smart), each taller than the last, the way a yearly sale pays more on a
 * bigger plan. The stack under the pointer fans open so every coin shows its
 * face and rim; the others settle, staggered outwards from it. The top coin
 * of the tallest stack is lit at rest. The slider is the gap between coins.
 */
const {
  Cam, clamp, circ, facing, fit, open, poly, proj, prism, ringAt, rings, run,
  tdone, tset, tval, tween, disposer, mk, pointer, put, reflect, register, solid,
} = HL;

const R = 15, T = 3.6, STEP = 46, COUNT = [3, 5, 9], NAMES = ["Menu", "Order", "Smart"];
const REST_LIT = 2, STAG = 45, GMAX = 6;
const X0 = -26, X1 = STEP * 2 + 26, Y0 = -25, Y1 = 25;
// a hand-made stack: every coin sits a little off the one under it
const JIT = (i, k) => [Math.sin(i * 3.1 + k * 1.7) * 1.3, Math.cos(i * 2.3 + k * 2.9) * 1.3];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gap = value;

  const C = Cam(45, 0.5, 2.1);
  const top = COUNT[2] * (T + GMAX);
  fit(C, [[X0, Y0, -4], [X1, Y1, -4], [X1, Y0, 0], [X0, Y1, 0], [STEP * 2 - R, -R, top], [STEP * 2 + R, R, top]], 200, 172);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // the counter mat: a low rounded slab the stacks stand on
  const [mRing, mInner] = rings(X0, Y0, X1, Y1, 10, 2);
  reflect(svg, g, P, front, mRing, -4, 12);
  put(solid(g), prism(P, front, mRing, mInner, -4, 0));

  const ring = circ(R, 40), inner = circ(R - 1.6, 40), boss = circ(R * 0.42, 24);
  const at = (rg, cx, cy) => rg.map((q) => ({ u: q.u + cx, v: q.v + cy, nu: q.nu, nv: q.nv }));

  const stacks = COUNT.map((n, i) => {
    const grp = mk("g", {}, g), coins = [];
    for (let k = 0; k < n; k++) {
      const [dx, dy] = JIT(i, k), cx = i * STEP + dx, cy = dy;
      const s = solid(grp), mark = mk("path", { class: "nf lo" }, grp);
      coins.push({ s, mark, ring: at(ring, cx, cy), inner: at(inner, cx, cy), boss: at(boss, cx, cy), z: null });
    }
    return { coins, t: tween(0), lit: false };
  });

  function draw(st, spread) {
    st.coins.forEach((c, k) => {
      const z0 = k * (T + spread * gap);
      if (c.z === z0) return;
      c.z = z0;
      put(c.s, prism(P, front, c.ring, c.inner, z0, z0 + T));
      // the raised boss in the middle of the face, seen only where the face is open
      c.mark.setAttribute("d", open(ringAt(P, run(c.boss, front), z0 + T)));
    });
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    stacks.forEach((st) => { draw(st, tval(st.t, now)); if (!tdone(st.t, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // hit test: the stack whose resting middle is nearest the pointer, on screen x, with a loose band in y
  const mid = COUNT.map((n, i) => P(i * STEP, 0, (n * T) / 2));
  function hit([x, y]) {
    let best = -1, bd = 1e9;
    mid.forEach((m, i) => { const d = Math.hypot(x - m[0], (y - m[1]) * 0.45); if (d < bd) { bd = d; best = i; } });
    return bd < 48 ? best : -1;
  }

  function light(i, on) {
    const st = stacks[i], n = st.coins.length;
    st.coins.forEach((c, k) => c.s.sil.classList.toggle("hi", on === "all" || (on === "top" && k === n - 1)));
  }

  let act = null;
  /** Fans stack a open (-1 closes them all); the others settle in turn, outwards from it. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : REST_LIT;
    act = a;
    stacks.forEach((st, i) => {
      tset(st.t, i === a ? 1 : 0, now, Math.abs(i - from) * STAG);
      light(i, a < 0 ? (i === REST_LIT ? "top" : "") : i === a ? "all" : "");
    });
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gap = clamp(v, 2, GMAX); stacks.forEach((st) => st.coins.forEach((c) => { c.z = null; })); B.wake(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "coins",
  means: "Three stacks of coins, one per plan, each taller than the last: the stack under the pointer fans open, coin by coin.",
  rules: [1, 2, 4, 5],
  range: [2, 4, 6],
  tour: [[134, 150], [268, 172], [200, 162], null],
  mount,
});
