import { Node } from "./Node";
import { Edge } from "./Edge";

export class Network {
  public Nodes: Node[];
  public Edges: Edge[];
  public Directed: boolean = false;

  constructor(nodes: Node[], edges: Edge[], directed?: boolean) {
    this.Edges = edges;
    this.Nodes = nodes;
    if (directed) {
      this.Directed = directed;
    }
  }

  /**
   * Adds a node to the network.
   *
   * @param node - Node to be added to the network.
   *
   */
  public addNode(node: Node) {
    if (!this.Nodes.some((e) => e.Id === node.Id)) {
      this.Nodes.push(node);
    }
  }

  /**
   * Adds an edge to the network.
   *
   * @param nodeA - First node of the edge.
   * @param nodeB - Second node of the edge.
   * @param weight - The edge weight.
   *
   */
  public addEdge(nodeA: Node, nodeB: Node, weight?: number) {
    this.addNode(nodeA);
    this.addNode(nodeB);

    this.Edges.push(new Edge(nodeA, nodeB, this.Edges.length, weight));
  }
}
