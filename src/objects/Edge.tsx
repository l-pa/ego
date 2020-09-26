import { Node } from "./Node";

export class Edge {
  public NodeA: Node;
  public NodeB: Node;
  public Weight: Number = 1;

  constructor(nodeA: Node, nodeB: Node, weight?: Number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;

    if (weight) {
      this.Weight = weight;
    }
  }
}
