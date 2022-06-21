import {
  html,
  Component,
  render,
} from "https://cdn.jsdelivr.net/npm/htm@3.1.0/preact/standalone.module.js";
import {
  mode,
  defaultdict,
  reversed,
  take_while,
  pointwise,
  extent,
  shuffled,
  min_by,
  max_by,
  skip,
  randn,
  choose,
  argmax,
  enumerate,
  div,
  matmul,
  mod,
  jitter2d,
  randint,
  random,
  lerp,
  range,
  range2,
  sum,
  add,
  take,
  TAU,
  zip,
} from "./util.mjs";
import {
  area,
  wrap,
  axial_to_pixel,
  pixel_to_axial,
  axial_to_odd_q,
  rotation,
  corners,
  odd_q_to_axial,
  directions,
  generate_random_walk,
} from "./hexagons.mjs";

class Map extends Component {
  canvas = null;

  componentDidMount() {
    this.#draw(this.props);
  }

  componentDidUpdate() {
    this.#draw(this.props);
  }

  #draw({ width, height, left, top, scale, fillAt }) {
    window.requestAnimationFrame(() => {
      const context = this.canvas.getContext("2d");

      context.canvas.width = width;
      context.canvas.height = height;

      context.translate(-left, -top);

      const right = left + width;
      const bottom = top + height;

      const [left_, top_] = axial_to_odd_q(pixel_to_axial([left, top], scale));
      const [right_, bottom_] = axial_to_odd_q(pixel_to_axial([right, bottom], scale));

      for (const x of range2(left_ - 1, right_ + 2))
        for (const y of range2(top_ - 1, bottom_ + 2)) {
          const [q, r] = odd_q_to_axial([x, y]);

          context.beginPath();
          for (const [edgeX, edgeY] of corners(axial_to_pixel([q, r], scale), scale))
            context.lineTo(edgeX, edgeY);
          context.closePath();

          context.strokeStyle = context.fillStyle = fillAt({ q, r });
          context.fill();
          context.stroke();
        }
    });
  }

  render(props) {
    return html`<canvas ...${props} ref=${(canvas) => (this.canvas = canvas)} />`;
  }
}

function generateWorld(radius) {
  const steps = 0.4 * area(radius);
  const cells = defaultdict((_) => defaultdict((_) => false));

  for (const [q, r] of take(generate_random_walk([0, 0], cells, radius), steps))
    cells[r][q] = true;

  for (const q of range2(-radius, radius))
    for (const r of range2(-radius, radius)) {
      const neighbors = directions.map(add([q, r]));
    }

  return cells;
}

class App extends Component {
  state = {
    ...this.props,
    offsetX: 0,
    offsetY: 0,
    cells: generateWorld(this.props.radius),
  };

  onWheel = ({ wheelDelta, clientX, clientY }) => {
    this.setState({
      scale: this.state.scale + wheelDelta / 100.0,
    });
  };

  #fillAt = ({ q, r }) => {
    const [q_, r_] = wrap(this.props.radius)([q, r]);
    return d3.schemeTableau10[this.state.cells[q_][r_] | 0];
  };

  render({ width, height }, { offsetX, offsetY, scale }) {
    return html`
      <${Viewport} onMove=${(viewport) => this.setState(viewport)}>
        <div onWheel=${this.onWheel}>
          <${Map}
            width=${width}
            height=${height}
            left=${offsetX}
            top=${offsetY}
            scale=${scale}
            fillAt=${this.#fillAt}
          ></${Map}>
        </div>
      </${Viewport}>
    `;
  }
}

class Viewport extends Component {
  state = {
    lastX: 0,
    lastY: 0,
    offsetX: 0,
    offsetY: 0,
  };

  #beginDrag = (event) => {
    this.setState({ lastX: event.clientX, lastY: event.clientY }, () => {
      document.addEventListener("mouseup", this.#endDrag);
      document.addEventListener("mousemove", this.#updateDrag);
    });
  };

  #endDrag = (event) => {
    document.removeEventListener("mouseup", this.#endDrag);
    document.removeEventListener("mousemove", this.#updateDrag);
  };

  #updateDrag = (event) => {
    const { clientX, clientY } = event;
    const { lastX, lastY, offsetX, offsetY } = this.state;

    const state = {
      lastX: clientX,
      lastY: clientY,
      offsetX: offsetX + (lastX - clientX),
      offsetY: offsetY + (lastY - clientY),
    };

    this.setState(state, () => this.props.onMove(this.state));
  };

  render({ children }) {
    return html`<div onMouseDown=${this.#beginDrag}>${children}</div>`;
  }
}

class AppComponent extends HTMLElement {
  connectedCallback() {
    const radius = parseInt(this.dataset.radius);

    render(
      html`<${App}
        radius=${radius}
        scale=${16}
        width=${window.innerWidth}
        height=${window.innerHeight}
      />`,
      this
    );
  }
}

customElements.define("n9-app", AppComponent);
