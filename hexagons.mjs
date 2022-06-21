import {
  shuffled,
  min_by,
  max_by,
  dot,
  isEqual,
  skip,
  randn,
  choose,
  argmax,
  enumerate,
  div,
  matmul,
  mod,
  randint,
  random,
  range,
  range2,
  sum,
  add,
  pointwise,
  take,
  TAU,
  zip,
} from "./util.mjs";

const AXIAL_TO_PIXEL = [
  [3 / 2, 0],
  [Math.sqrt(3) / 2, Math.sqrt(3)],
];

const PIXEL_TO_AXIAL = [
  [2 / 3, 0],
  [-1 / 3, Math.sqrt(3) / 3],
];

export const directions = [
  [+0, +1],
  [+0, -1],
  [-1, +1],
  [+1, -1],
  [+1, +0],
  [-1, +0],
];

export function odd_q_to_axial([x, y]) {
  return [x, y - (x >> 1)];
}

export function axial_to_odd_q([x, y]) {
  return [x, y + (x >> 1)];
}

export function anticlockwise([q, r]) {
  const s = -q - r;
  return [-s, -q];
}

export function rotation(qr, t) {
  return range(t).reduce(anticlockwise, qr);
}

export function axial_to_pixel([q, r], size) {
  return matmul(AXIAL_TO_PIXEL, [[q], [r]])
    .flat()
    .map((t) => t * size);
}

export function pixel_to_axial([x, y], size) {
  const [q_, r_] = matmul(PIXEL_TO_AXIAL, [[x], [y]])
    .flat()
    .map((t) => t / size);

  const s_ = -q_ - r_;

  const q = Math.round(q_) | 0;
  const r = Math.round(r_) | 0;
  const s = Math.round(s_) | 0;

  const qDiff = Math.abs(q - q_);
  const rDiff = Math.abs(r - r_);
  const sDiff = Math.abs(s - s_);

  if (qDiff > rDiff && qDiff > sDiff) {
    return [-r - s, r];
  } else if (rDiff > qDiff && rDiff > sDiff) {
    return [q, -q - s];
  } else {
    return [q, r];
  }
}

export function distance([Aq, Ar]) {
  return function distance([Bq, Br]) {
    const As = -Aq - Ar;
    const Bs = -Bq - Br;

    return Math.max(Math.abs(Aq - Bq), Math.abs(Ar - Br), Math.abs(As - Bs));
  };
}

export function corners([x, y], size) {
  return range(6).map((t) => [
    x + size * Math.cos((t * TAU) / 6.0),
    y + size * Math.sin((t * TAU) / 6.0),
  ]);
}

/**
 * Returns the area of a hexagon spiral with the specified radius.
 * @param r The radius.
 */
export function area(r) {
  return 3 * r ** 2 + 3 * r + 1;
}

/**
 * Converts a pair of axial coordinates into relative coordinates inside a hexagon of
 * hexagons with the specified `radius`.
 */
export function wrap(radius) {
  return function wrap([q, r]) {
    if (distance([q, r])([0, 0]) <= radius) {
      return [q, r];
    }

    const centers = range(6).map((t) => rotation([radius, radius + 1], t));
    const [dq, dr] = min_by(centers, distance([q, r]));

    return wrap([q - dq, r - dr]);
  };
}

/**
 * Generates a sequence of steps from the starting position.
 * @see <https://teddit.net/r/roguelikedev/comments/hhzszb/using_a_modified_drunkards_walk_to_generate_cave/>
 */
export function* generate_random_walk(at, cells, radius) {
  const wrap_ = wrap(radius);
  const stack = [at];

  step: while (stack.length > 0) {
    for (const direction of shuffled(directions)) {
      const [q, r] = wrap_(add(at)(direction));

      // Is the cell unoccupied?
      if (cells[r][q] === false) {
        stack.push([q, r]);
        at = [q, r];

        yield at;
        continue step;
      }
    }

    at = stack.pop();
  }
}
