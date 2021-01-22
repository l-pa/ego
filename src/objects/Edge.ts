import type Node from "./Node";
import type { EdgeDataDefinition, ElementDefinition } from "cytoscape";
import { networkStore } from "..";

export default class Edge implements ElementDefinition {
  private Id: string | number;
  private NodeA: Node;
  private NodeB: Node;
  private Weight: number = 1;

  data: EdgeDataDefinition;
  classes = "";

  constructor(nodeA: Node, nodeB: Node, id: string | number, weight?: number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;
    this.Id = id.toString();

    this.data = {
      source: this.NodeA.Id,
      target: this.NodeB.Id,
      edgeType: "",
    };

    if (weight) {
      this.Weight = weight;
    }
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

  public UpdateClasses() {
    const source: number | undefined = networkStore.Network?.Nodes.filter(
      (n) => n.Id === this.NodeA.Id
    )[0].isProminent();
    const target: number | undefined = networkStore.Network?.Nodes.filter(
      (n) => n.Id === this.NodeB.Id
    )[0].isProminent();

    if (source === 0 && target === 0) {
      // this.classes = "sptosp";
      this.data.edgeType = "sptosp";
    }

    if (source === 1 && target === 1) {
      // this.classes = "wptowp";
      this.data.edgeType = "wptowp";
    }

    if (source === -1 && target === -1) {
      // this.classes = "nptonp";
      this.data.edgeType = "nptonp";
    }

    if ((source === 0 && target === 1) || (source === 1 && target === 0)) {
      // this.classes = "sptowp";
      this.data.edgeType = "sptowp";
    }

    if ((source === 0 && target === -1) || (source === -1 && target === 0)) {
      // this.classes = "sptonp";
      this.data.edgeType = "sptonp";
    }

    if ((source === 1 && target === -1) || (source === -1 && target === 1)) {
      // this.classes = "wptonp";
      this.data.edgeType = "wptonp";
    }
  }
}
