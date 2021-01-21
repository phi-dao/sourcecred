// @flow
import {WeightedGraph2 as WG} from "./weightedGraph2";
import {Graph} from "./graph";

import * as GraphUtil from "./graphTestUtil";

describe("src/core/weightedGraph2", () => {
  function getWG(graph?: Graph): WG {
    return new WG(graph);
  }
  function testWg(graph?: Graph) {
    const node1 = GraphUtil.node("test");
    const node2 = GraphUtil.node("test2");
    return {
      wg: getWG(graph),
      node1,
      node2,
      nodeWeight: 5,
      edge: GraphUtil.edge("edge1", node1, node2),
      edgeWeight: {forwards: 2, backwards: 2},
      defaultEdgeWeight: {forwards: 1, backwards: 1},
      defaultNodeWeight: 1,
    };
  }
  describe("constructor", () => {
    it("can be instantiated without args", () => {
      getWG();
    });
    it("can be instantiated with a valid graph param", () => {
      const g = new Graph();
      getWG(g);
    });
  });
  describe("setNodePrefixWeight", () => {
    it("can set the weight for a node prefix", () => {
      const node = GraphUtil.node("test");
      const weight = 5;
      const result = getWG().setNodePrefixWeight(node.address, weight);
      expect(result._weights.getNodeWeight(node.address)).toEqual(weight);
    });
    it("can overwrite an existing weight", () => {
      const node = GraphUtil.node("test");
      const weight = 6;
      const newWeight = 10;
      const wg = getWG()
        .setNodePrefixWeight(node.address, weight)
        .setNodePrefixWeight(node.address, newWeight);
      expect(wg._weights.getNodeWeight(node.address)).toEqual(newWeight);
    });
  });
  describe("setEdgePrefixWeight", () => {
    const node1 = GraphUtil.node("test1");
    const node2 = GraphUtil.node("test2");
    const weight = {forwards: 2, backwards: 2};
    const edge = GraphUtil.edge("edge1", node1, node2);

    it("can set the weight for an edge prefix", () => {
      const result = getWG().setEdgePrefixWeight(edge.address, weight);
      expect(result._weights.getEdgeWeight(edge.address)).toEqual(weight);
    });
    it("can overwrite an existing weight", () => {
      const newWeight = {forwards: 4, backwards: 4};
      const wg = getWG()
        .setEdgePrefixWeight(edge.address, weight)
        .setEdgePrefixWeight(edge.address, newWeight);
      expect(wg._weights.getEdgeWeight(edge.address)).toEqual(newWeight);
    });
  });
  describe("addNode", () => {
    it("adds an node", () => {
      const {node1, wg, defaultNodeWeight} = testWg();
      wg.addNode(node1);
      expect(wg.graph.node(node1.address)).toEqual(node1);
      expect(wg._weights.getNodeWeight(node1.address)).toEqual(
        defaultNodeWeight
      );
    });
    it("can add a duplicated node", () => {
      const {node1, wg, defaultNodeWeight} = testWg();
      wg.addNode(node1).addNode(node1);
      expect(wg.graph.node(node1.address)).toEqual(node1);
      expect(wg._weights.getNodeWeight(node1.address)).toEqual(
        defaultNodeWeight
      );
    });
    it("cannot modify an existing node", () => {
      const {node1, wg, node2} = testWg();
      const changedNode = {...node1, description: node2.description};
      const thunk = () => wg.addNode(node1).addNode(changedNode);
      expect(thunk).toThrow("conflict between new node");
    });
    it("accepts a configured weight", () => {
      const {node1, wg, nodeWeight} = testWg();
      wg.addNode(node1, nodeWeight);
      expect(wg.graph.node(node1.address)).toEqual(node1);
      expect(wg._weights.getNodeWeight(node1.address)).toEqual(nodeWeight);
    });
  });
  describe("node", () => {
    it("returns a node with the default weight if one exists", () => {
      const {node1, wg, defaultNodeWeight} = testWg();
      wg.addNode(node1);
      expect(wg.node(node1.address)).toEqual({
        node: node1,
        weight: defaultNodeWeight,
      });
    });
    it("returns an node with the configured weight if one exists", () => {
      const {node1, wg, nodeWeight} = testWg();
      wg.addNode(node1, nodeWeight);
      expect(wg.node(node1.address)).toEqual({node: node1, weight: nodeWeight});
    });
    it("returns undefined if no node exists", () => {
      const {node1, wg} = testWg();
      expect(wg.node(node1.address)).toBe(undefined);
    });
  });
  describe("nodes", () => {
    it("returns an array of nodes", () => {
      const {node1, wg, defaultNodeWeight} = testWg();
      wg.addNode(node1);
      expect(Array.from(wg.nodes())).toEqual([
        {node: node1, weight: defaultNodeWeight},
      ]);
    });
  });
  describe("addEdge", () => {
    it("adds an edge", () => {
      const {edge, wg, defaultEdgeWeight} = testWg();
      wg.addEdge(edge);
      expect(wg.graph.edge(edge.address)).toEqual(edge);
      expect(wg._weights.getEdgeWeight(edge.address)).toEqual(
        defaultEdgeWeight
      );
    });
    it("can add a duplicated edge", () => {
      const {edge, wg, defaultEdgeWeight} = testWg();
      wg.addEdge(edge).addEdge(edge);
      expect(wg.graph.edge(edge.address)).toEqual(edge);
      expect(wg._weights.getEdgeWeight(edge.address)).toEqual(
        defaultEdgeWeight
      );
    });
    it("cannot modify an existing edge", () => {
      const {edge, wg, node2} = testWg();
      const changedEdge = {...edge, src: node2.address};
      const thunk = () => wg.addEdge(edge).addEdge(changedEdge);
      expect(thunk).toThrow("conflict between new edge");
    });
    it("accepts a configured weight", () => {
      const {edge, wg, edgeWeight} = testWg();
      wg.addEdge(edge, edgeWeight);
      expect(wg.graph.edge(edge.address)).toEqual(edge);
      expect(wg._weights.getEdgeWeight(edge.address)).toEqual(edgeWeight);
    });
  });
  describe("edge", () => {
    it("returns an edge with the default weight if one exists", () => {
      const {edge, wg, defaultEdgeWeight} = testWg();
      wg.addEdge(edge);
      expect(wg.edge(edge.address)).toEqual({edge, weight: defaultEdgeWeight});
    });
    it("returns an edge with the configured weight if one exists", () => {
      const {edge, wg, edgeWeight} = testWg();
      wg.addEdge(edge, edgeWeight);
      expect(wg.edge(edge.address)).toEqual({edge, weight: edgeWeight});
    });
    it("returns undefined if no edge exists", () => {
      const {edge, wg} = testWg();
      expect(wg.edge(edge.address)).toBe(undefined);
    });
  });
  describe("edges", () => {
    const defaultOptions = {showDangling: true};
    it("returns an array of edges", () => {
      const {edge, wg, defaultEdgeWeight} = testWg();
      wg.addEdge(edge);
      expect(Array.from(wg.edges(defaultOptions))).toEqual([
        {edge, weight: defaultEdgeWeight},
      ]);
    });
  });
});
