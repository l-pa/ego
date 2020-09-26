import { Node } from "./Node";
import { Edge } from "./Edge";

export class Network {
  public Nodes: Node[];
  public Edges: Edge[];

  constructor(nodes: Node[], edges: Edge[]) {
    this.Edges = edges;
    this.Nodes = nodes;
  }

  /**
   * addNode
   */
  public addNode(node: Node) {
    if (!this.Nodes.some((e) => e.Id === node.Id)) {
      this.Nodes.push(node);
    }
  }

  /**
   * addEdge
   */
  public addEdge(nodeA: Node, nodeB: Node, weight?: Number) {
    this.addNode(nodeA);
    this.addNode(nodeB);

    this.Edges.push(new Edge(nodeA, nodeB, weight));
  }
}
