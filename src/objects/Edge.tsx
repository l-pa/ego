import { Node } from "./Node";

export class Edge {
  public NodeA: Node;
  public NodeB: Node;
  public Weight: number = 1;

  constructor(nodeA: Node, nodeB: Node, weight?: number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;

    if (weight) {
      this.Weight = weight;
    }
  }
}
