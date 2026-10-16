import { DataSet } from 'vis-data/esnext';

export interface NodePosition {
  x: number;
  y: number;
  theta: number;
}
export interface Node {
  nodeId: string;
  nodeName?: string;
  nodePosition: NodePosition;
}

export interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SVGJSON {
  redundant: SVGElement[],
  used: SVGElement[],
}

type SVGJSONContainer = Record<string, SVGJSON>

/**
 * Allocate or generate an SVG element if needed. Store a reference to it in the JSON container and draw it in the svgContainer
 * the JSON container and the SVG container have to be supplied so other svg containers (like the legend) can use this.
 *
 * @param {string} elementType
 * @param {Object} JSONcontainer
 * @param {Object} svgContainer
 * @returns {Element}
 * @private
 */
export function getSVGElement(elementType: string, JSONcontainer: SVGJSONContainer, svgContainer: Element): SVGElement {
  var element;
  // allocate SVG element, if it doesnt yet exist, create one.
  if (Object.prototype.hasOwnProperty.call(JSONcontainer, elementType)) {
    // this element has been created before
    // check if there is an redundant element
    if (JSONcontainer[elementType].redundant.length > 0) {
      element = JSONcontainer[elementType].redundant[0];
      JSONcontainer[elementType].redundant.shift();
    } else {
      // create a new element and add it to the SVG
      element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        elementType,
      );
      svgContainer.appendChild(element);
    }
  } else {
    // create a new element and add it to the SVG, also create a new object in the svgElements to keep track of it.
    element = document.createElementNS(
      "http://www.w3.org/2000/svg",
      elementType,
    );
    JSONcontainer[elementType] = { used: [], redundant: [] };
    svgContainer.appendChild(element);
  }
  JSONcontainer[elementType].used.push(element);
  return element;
}

export interface MapViewer2DOptions {
  /** Node radius as a fraction of viewBox width. */
  nodeRadiusFrac: number;
  /** Padding around the map bounds on fit, as a fraction of the larger dimension. */
  fitViewPadding: number;
};

const _DEFAULT_OPTIONS: MapViewer2DOptions = {
  nodeRadiusFrac: 0.012,
  fitViewPadding: 0.02,
}

export class MapViewer2D{
  private _nodes: DataSet<Node> | undefined;
  private _options: MapViewer2DOptions | undefined;
  private _elements: SVGJSONContainer = {};
  private _svg: SVGSVGElement | undefined;

  constructor(nodes: DataSet<Node>, options: Record<string, number> = {}, container: Element) {
    // Override default settings
    this._options = {..._DEFAULT_OPTIONS, ...options}

    // Calculate Viewbox
    const view = this._fitView(nodes.get(), this._options.fitViewPadding);
    
    // Create SVG
    const rootSVG = getSVGElement("svg", this._elements, container)
    rootSVG.setAttributeNS(null, "viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`)

    // Calculate NodeRadius
    const nodeRadius = view.w * this._options.nodeRadiusFrac;
    rootSVG.style.setProperty("--node-radius", `${nodeRadius}px`)


    nodes.forEach((n) => {
      const node = getSVGElement("circle", this._elements, rootSVG)
      node.setAttributeNS(null, "cx", `${n.nodePosition.x}`)
      node.setAttributeNS(null, "cy", `${-n.nodePosition.y}`)
      node.style.setProperty("r", "var(--node-radius)")
      node.setAttributeNS(null, "fill", "currentColor")
    })

    this._svg = rootSVG as SVGSVGElement

    this._nodes = nodes

    // Setup callbacks
    this._nodes.on('add', (event, properties) => {
      if (!this._options) {
        return
      }

      // Calculate Viewbox
      const nodes = this._nodes?.get() ?? []
      const view  = this._fitView(nodes, this._options.fitViewPadding);
    
      this._svg?.setAttributeNS(null, "viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`)
    const nodeRadius = view.w * this._options.nodeRadiusFrac;
    this._svg?.style.setProperty("--node-radius", `${nodeRadius}px`)
    nodes.forEach((n) => {
      const node = getSVGElement("circle", this._elements, rootSVG)
      node.setAttributeNS(null, "cx", `${n.nodePosition.x}`)
      node.setAttributeNS(null, "cy", `${-n.nodePosition.y}`)
      node.style.setProperty("r", "var(--node-radius)")
      node.setAttributeNS(null, "fill", "currentColor")
    })

      console.log('event', event, properties);
    });
  }

  private _fitView(nodes: Node[], padding: number): View {
    if (nodes.length === 0) return { x: -5, y: -5, w: 10, h: 10 };
  
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.nodePosition.x);
      minY = Math.min(minY, n.nodePosition.y);
      maxX = Math.max(maxX, n.nodePosition.x);
      maxY = Math.max(maxY, n.nodePosition.y);
    }
  
    const w = maxX - minX || 1;
    const h = maxY - minY || 1;
    const pad = Math.max(w, h) * padding;
    // Negate Y: LIF uses Y-up, SVG uses Y-down. maxY in world space becomes the top (most negative SVG y).
    return { x: minX - pad, y: -maxY - pad, w: w + pad * 2, h: h + pad * 2 };
  }
}
