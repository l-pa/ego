import type Node from "./Node";
import Edge from "./Edge";
import { cy } from "../graph/Cytoscape";

export default class Network {
  public Nodes: { [id: string]: Node } = {};
  public Edges: { [id: string]: Edge } = {};

  public Directed: boolean = false;

  public StronglyProminent: number = 0;
  public WeaklyProminent: number = 0;

  constructor(nodes: {}, edges: {}, directed?: boolean) {
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
    if (!(node.Id in this.Nodes)) this.Nodes[node.Id] = node;
  }

  public getNode(nodeId: string): cytoscape.NodeCollection {
    return cy.getElementById(nodeId);
  }

  public getEdge(source: number, target: number): cytoscape.EdgeCollection {
    return cy.$(
      `edge[source = "${source.toString()}"][target = "${target.toString()}"]`
    );
  }

  public getEdges(source: number): cytoscape.EdgeCollection {
    return cy.edges(`[source = "${source.toString()}"]`);
  }

  public getEdgeByNodes(nodeAid: string, nodeBid: string): Edge | undefined {
    const id1 = nodeAid + nodeBid;
    const id2 = nodeBid + nodeAid;

    const e1 = this.Edges[id1];
    const e2 = this.Edges[id2];

    if (e1) return e1;
    else if (e2) return e2;
    else return undefined;
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
    const e = new Edge(nodeA, nodeB, nodeA.Id + nodeB.Id, weight ? weight : 1);
    this.Edges[e.GetId()] = e;
  }
}
