import { Node } from "./Node";

export class Edge {
  public Id: string | number;
  public NodeA: Node;
  public NodeB: Node;
  public Weight: number = 1;

  constructor(nodeA: Node, nodeB: Node, id: string | number, weight?: number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;
    this.Id = id;

    if (weight) {
      this.Weight = weight;
    }
  }
}
