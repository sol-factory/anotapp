type Sides5 = {
  left: boolean;
  top: boolean;
  right: boolean;
  bottom: boolean;
  diag: boolean; // ↗ desde (abajo-izquierda) a (arriba-derecha)
};

/** Transforma 0..15 en 3 cuadros (5 palitos c/u). */
export function countToThreeSquares(n: number): Sides5[] {
  const total = Math.max(0, Math.min(15, n));
  const out: Sides5[] = [];
  for (let i = 0; i < 3; i++) {
    const local = Math.max(0, Math.min(5, total - i * 5));
    out.push({
      left: local >= 1,
      top: local >= 2,
      right: local >= 3,
      bottom: local >= 4,
      diag: local >= 5,
    });
  }
  return out;
}
