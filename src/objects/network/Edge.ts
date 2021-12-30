import type Node from "./Node";
import type { EdgeDataDefinition, ElementDefinition } from "cytoscape";
import { networkStore } from "../..";
import { NodeProminency } from "./Node";

export default class Edge implements ElementDefinition {
  private Id: string | number;
  private NodeA: Node;
  private NodeB: Node;
  private Weight: number = 1;

  private sourceDependency: number = -1;
  private targetDependency: number = -1;

  data: EdgeDataDefinition;
  classes = "";

  constructor(nodeA: Node, nodeB: Node, id: string, weight: number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;
    this.Id = id;

    this.data = {
      source: this.NodeA.Id,
      target: this.NodeB.Id,
      edgeType: "",
    };

    this.Weight = weight;
  }

  public GetNodeA() {
    return this.NodeA;
  }

  public GetNodeB() {
    return this.NodeB;
  }

  public GetId() {
    return this.Id;
  }

  public GetWeight() {
    return this.Weight;
  }

  public PlainObject(): ElementDefinition {
    return Object.assign({}, this);
  }

  public SetDependencySource(source: number) {
    this.sourceDependency = source;
    this.data.sourceDependency = parseFloat(source.toString()).toFixed(2);
  }

  public SetDependencyTarget(target: number) {
    this.targetDependency = target;
    this.data.targetDependency = parseFloat(target.toString()).toFixed(2);
  }

  public UpdateClasses() {
    const source: string | undefined =
      networkStore.Network?.Nodes[this.NodeA.Id].isProminent();
    const target: string | undefined =
      networkStore.Network?.Nodes[this.NodeB.Id].isProminent();

    if (
      source === NodeProminency.StronglyProminent &&
      target === NodeProminency.StronglyProminent
    ) {
      // this.classes = "sptosp";
      this.data.edgeType = "sptosp";
    }

    if (
      source === NodeProminency.WeaklyProminent &&
      target === NodeProminency.WeaklyProminent
    ) {
      // this.classes = "wptowp";
      this.data.edgeType = "wptowp";
    }

    if (
      source === NodeProminency.NonProminent &&
      target === NodeProminency.NonProminent
    ) {
      // this.classes = "nptonp";
      this.data.edgeType = "nptonp";
    }

    if (
      (source === NodeProminency.StronglyProminent &&
        target === NodeProminency.WeaklyProminent) ||
      (source === NodeProminency.WeaklyProminent &&
        target === NodeProminency.StronglyProminent)
    ) {
      // this.classes = "sptowp";
      this.data.edgeType = "sptowp";
    }

    if (
      (source === NodeProminency.StronglyProminent &&
        target === NodeProminency.NonProminent) ||
      (source === NodeProminency.NonProminent &&
        target === NodeProminency.StronglyProminent)
    ) {
      // this.classes = "sptonp";
      this.data.edgeType = "sptonp";
    }

    if (
      (source === NodeProminency.WeaklyProminent &&
        target === NodeProminency.NonProminent) ||
      (source === NodeProminency.NonProminent &&
        target === NodeProminency.WeaklyProminent)
    ) {
      // this.classes = "wptonp";
      this.data.edgeType = "wptonp";
    }
  }
}
