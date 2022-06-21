/**
 * The full circle constant (τ). Equal to 2π.
 */
export const TAU = 2 * Math.PI;

/**
 * Returns an array containing all integers in the range `[0, n)`.
 * @param n The non-inclusive upper bound of the range.
 * @returns {number[]} An array containing all integers in the range `[0, n)`.
 */
export function range(n) {
  return [...range2(0, n, 1)];
}

/**
 * Returns an iterator with the numbers of the form `x_n = start + step * n` where `x_n < stop`.
 * @param start The inclusive lower bound of the range.
 * @param stop The non-inclusive upper bound of the range.
 * @param step The skip size.
 * @returns {number[]} An iterator.
 */
export function* range2(start, stop, step = 1) {
  while (start < stop) {
    yield start;
    start += step;
  }
}

/**
 * Returns the first `n` elements of the `iterator`.
 * @param iterator
 * @param n
 * @returns {Generator<*, void, *>}
 */
export function take(iterator, n) {
  return take_while(iterator, (_) => n-- > 0);
}

export function* take_while(iterator, predicate) {
  for (const value of iterator)
    if (predicate(value)) yield value;
    else break;
}

export function* skip(iterator, n) {
  for (const value of iterator) if (n-- <= 0) yield value;
}

export function reversed(it) {
  return [...it].reverse();
}

export function mode(it) {
  const elements = [...it];
  const frequencies = {};

  for (const entry of elements)
    if (entry in frequencies) frequencies[entry] += 1;
    else frequencies[entry] = 0;

  return max_by(elements, (n) => frequencies[n]);
}

/**
 * Determines whether two objects are equal.
 * Their keys must be in the same order.
 * @param left An object.
 * @param right An object to compare against.
 * @returns {boolean} Whether the objects are equal.
 */
export function isEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Returns the fractional part of a number.
 * @param n A number.
 * @returns {number} The fractional part of `n`, in the range `[0, 1)`.
 */
export function fract(n) {
  return Math.abs(n % 1);
}

/**
 * Returns the dot product of two 2-vectors.
 * @param x1 A vector.
 * @param x2 A vector.
 * @returns {number} The dot product of `x1` and `x2`.
 */
export function dot(x1, x2) {
  return sum([...zip(x1, x2)].map(([a, b]) => a * b));
}

export function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

export function matmul(x1, x2) {
  return x1.map((row) => transpose(x2).map((col) => dot(row, col)));
}

/**
 * Generates a noise value for a given point.
 * @param vec A 2-vector.
 * @returns {number} A pseudo-random number in the range `[0, 1)`.
 */
export function noise2d(x, y) {
  // Source: <https://stackoverflow.com/a/4275343>
  return fract(Math.sin(dot([x, y], [12.9898, 78.233])) * 43758.5453);
}

/**
 * Returns the cartesian product of two arrays.
 * @param left An array.
 * @param right An array.
 * @returns {Generator<*[], void, *>}
 */
export function cartesian(left, right) {
  return left.flatMap((p) => right.map((q) => [p, q]));
}

/**
 * Returns an iterator over the combinations with no replacement of the specified elements.
 * @param elements The elements with which the pairs will be made.
 * @param n The number of elements per combination.
 */
export function combinations(elements, n = 2) {
  if (n === 1) return elements.map((e) => [e]);

  return elements.flatMap((first, index) => {
    return combinations(elements.slice(index + 1), n - 1).map((partial) => {
      return [first, ...partial];
    });
  });
}

export function* zip(...arrays) {
  const lengths = arrays.map((array) => array.length);
  const length = Math.min(...lengths);

  for (const at in range(length)) {
    yield arrays.map((array) => array[at]);
  }
}

/**
 * Limits `n` to the range `[min, max]`.
 * @param n A number.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns {number} The value, clamped to the range `[min, max]`.
 */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Randomly jitters a 2-vector.
 * @param radius The amount of jitter.
 * @returns {function({x: *, y: *}): {x: number|*, y: number|*}}
 * @see https://stackoverflow.com/a/50746409
 */
export function jitter2d([x, y], [seedX, seedY], radius) {
  // Note: Because `rand2d` is deterministic, we have to swap the arguments to obtain
  // two different values.

  // A random polar coordinate.
  const p = TAU * noise2d(seedX, seedY);
  const r = radius * Math.sqrt(noise2d(seedY, seedX));

  x += r * Math.cos(p);
  y += r * Math.sin(p);

  return [x, y];
}

/**
 * Returns the linear interpolation of two numbers.
 */
export function lerp(t, a, b) {
  return a + (b - a) * t;
}

export function random(a, b) {
  return lerp(Math.random(), a, b);
}

export function randint(a, b) {
  return random(a, b) | 0;
}

export function choose(array) {
  return array[randint(0, array.length)];
}

export function* chunks(array, n) {
  for (let i = 0; i < array.length; i += n) {
    yield array.slice(i, i + n);
  }
}

export function enumerate(array) {
  return [...array].map((x, i) => [i, x]);
}

export function sum(array) {
  return array.reduce((sum, x) => sum + x, 0);
}

export function pointwise(a, b) {
  return [...zip(a, b)].map(([a, b]) => a * b);
}

export function add(a) {
  return function add(b) {
    return [...zip(a, b)].map(([a, b]) => a + b);
  };
}

export function mean(array) {
  return sum(array) / array.length;
}

/**
 * Returns a random variable sampled from the standard normal distribution.
 * @returns {number} A number.
 */
export function randn() {
  //Converting [0,1) to (0,1)
  const u = lerp(Math.random(), 1e-20, 1);
  const v = lerp(Math.random(), 1e-20, 1);

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function randn1() {
  return randn() * 0.5 + 0.5;
}

export function argmax(array) {
  return array.reduce(
    (max, x, i) => (x > max[1] ? [i, x] : max),
    [undefined, -Infinity]
  );
}

export function max_by(array, key = (x) => x) {
  const [index, _] = argmax(array.map(key));
  return array[index];
}

export function min_by(array, key = (x) => x) {
  return max_by(array, (x) => -key(x));
}

export function extent(array) {
  let min = Infinity;
  let max = -Infinity;

  for (const x of array) {
    min = Math.min(min, x);
    max = Math.max(max, x);
  }

  return [min, max];
}

export function div(x, y) {
  return Math.floor(x / y) | 0;
}

export function mod(x, y) {
  return ((x % y) + y) % y;
}

export function curry(fn) {
  function _curry(args, remaining) {
    return remaining === 0 ? fn(...args) : (p) => _curry([...args, p], remaining - 1);
  }

  return _curry([], fn.length);
}

export function shuffled(array) {
  const array_ = [...array];

  for (const i of range(array_.length - 1)) {
    const j = randint(i, array_.length);
    [array_[i], array_[j]] = [array_[j], array_[i]];
  }

  return array_;
}

/**
 * @see <https://docs.python.org/3/library/collections.html#collections.defaultdict>
 */
export function defaultdict(factory) {
  const handler = {
    get(target, name) {
      if (name in target) {
        return target[name];
      } else {
        return (target[name] = factory(name));
      }
    },
  };

  return new Proxy({}, handler);
}
