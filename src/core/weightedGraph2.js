// @flow

import {
  type Edge,
  type EdgesOptions,
  type Node,
  type EdgeAddressT,
  type NodeAddressT,
  Graph,
} from "./graph";
import {type NodeWeight} from "./weights/nodeWeights";
import {type EdgeWeight} from "./weights/edgeWeights";
import {type WeightsComparison} from "./weights/weightsT";
import {Weights, type WeightsI} from "./weights";

/**
 * An entry in the array returned by AddressModule.toParts()
 */
export type AddressPart = string;

export type WeightedNode = {|
  +node: Node,
  +weight: NodeWeight,
|};

export type WeightedEdge = {|
  +edge: Edge,
  +weight: EdgeWeight,
|};

/**
 * The WeightedGraph2 class is a replacement for the WeightedGraph type. This class
 * eliminates the need give every node and edge that exists a weight. Rather,
 * address prefixes can be assigned a weight and when a node or edge weight is
 * queried, the product of matching weights along the address chain is returned.
 *
 * Over the longer-term, WeightedGraph should be refactored out of existence and
 * WeightedGraph2 should completely replace it.
 */
export class WeightedGraph2 {
  _weights: WeightsI;
  graph: Graph;

  constructor(graph?: Graph) {
    this.graph = graph ? graph : new Graph();
    this._weights = new Weights();
  }

  /**
   * Set the weight for a node address prefix.
   */
  setNodePrefixWeight(prefix: NodeAddressT, w: NodeWeight): this {
    this._weights.setNodeWeight(prefix, w);
    return this;
  }

  /**
   * Set the weights for an edge address prefix.
   */
  setEdgePrefixWeight(prefix: EdgeAddressT, w: EdgeWeight): this {
    this._weights.setEdgeWeight(prefix, w);
    return this;
  }

  /**
   * Add a node and optionally assign its weight. If a weight is not passed in,
   * the weight will default to 1.
   */
  addNode(n: Node, w?: NodeWeight): this {
    this.graph.addNode(n);
    if (w != null) this._weights.setNodeWeight(n.address, w);
    return this;
  }

  node(n: NodeAddressT): ?WeightedNode {
    const node = this.graph.node(n);
    if (node) {
      return {
        node,
        weight: this._weights.getNodeWeight(n),
      };
    }
  }

  nodes(options?: {|+prefix: NodeAddressT|}): Iterator<WeightedNode> {
    return this._nodesIterator(options);
  }

  *_nodesIterator(options?: {|+prefix: NodeAddressT|}): Iterator<WeightedNode> {
    const nodes = this.graph.nodes(options);
    for (const node of nodes) {
      const weight = this._weights.getNodeWeight(node.address);
      yield {node, weight};
    }
  }

  /**
   * Add an edge and optionally assign its weight. If a prefix of the edge's
   * address doesn't have a weight assigned, the weight will default to 1.
   */
  addEdge(e: Edge, w?: EdgeWeight): this {
    this.graph.addEdge(e);
    if (w != null) this._weights.setEdgeWeight(e.address, w);
    return this;
  }

  edge(e: EdgeAddressT): ?WeightedEdge {
    const edge = this.graph.edge(e);
    if (edge) {
      return {
        edge,
        weight: this._weights.getEdgeWeight(e),
      };
    }
  }

  edges(options: EdgesOptions): Iterator<WeightedEdge> {
    return this._edgesIterator(options);
  }

  *_edgesIterator(options: EdgesOptions): Iterator<WeightedEdge> {
    const edges = this.graph.edges(options);
    for (const edge of edges) {
      const weight = this._weights.getEdgeWeight(edge.address);
      yield {edge, weight};
    }
  }

  /**
   * Return the weight of a Node address.
   */
  getNodeAddressWeight(_unused_a: NodeAddressT): NodeWeight {
    throw new Error("method not implemented");
  }

  /**
   * Return the weight of an Edge address.
   */
  getEdgeAddressWeight(_unused_a: EdgeAddressT): EdgeWeight {
    throw new Error("method not implemented");
  }

  // Utilities

  merge(_unused_wg: WeightedGraph2): WeightedGraph2 {
    throw new Error("method not implemented");
  }

  compareWeights(_unused_wg: WeightedGraph2): WeightsComparison {
    throw new Error("method not implemented");
  }

  // TODO: add JSON serialization and deserialization helpers
  // TODO: Add a tagging system so nodes and edges can have their weights
  // programmatically shifted
}
