import type Node from "./Node";
import Edge from "./Edge";
import { cy } from "../graph/Cytoscape";
import { networkStore, zoneStore } from "../..";
import EgoZone from "../zone/EgoZone";

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
   * NodesLength
   */
  public NodesLength() {
    return Object.keys(this.Nodes).length || 0;
  }

  /**
   * EdgesLength
   */
  public EdgesLength() {
    return Object.keys(this.Edges).length;
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

  public getEdge(source: string, target: string): cytoscape.EdgeCollection {
    if (this.Directed){
      return cy.$(`edge[source = "${source}"][target = "${target}"]`);
    } else {
      const a = cy.$(`edge[source = "${source}"][target = "${target}"]`);
      const b = cy.$(`edge[source = "${target}"][target = "${source}"]`);

      if (a.length > 0) {
        return a
      }

      else if (b.length > 0) {
        return b
      }
      else {
        return cy.collection()
      }

      
    }
  }

  public getEdges(source: string): cytoscape.EdgeCollection {
    if (this.Directed) {
      return cy.edges(`[source = "${source}"]`);
    } else {
      return cy
        .edges(`[source = "${source}"]`)
        .union(cy.edges(`[target = "${source}"]`));
    }
  }

  public getEdgeByNodes(nodeAid: string, nodeBid: string): Edge | undefined {
    const id1 = nodeAid + nodeBid;
    const e1 = this.Edges[id1];
    if (e1) return e1;

    if (!networkStore.Network?.Directed) {
      const id2 = nodeBid + nodeAid;
      const e2 = this.Edges[id2];
      if (e2) return e2;
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
    const e = new Edge(nodeA, nodeB, nodeA.Id + nodeB.Id, weight ? weight : 1);
    const e2 = new Edge(nodeB, nodeA, nodeB.Id + nodeA.Id, weight ? weight : 1);

    if (this.Directed && !this.Edges[e.GetId()]) {
      this.Edges[e.GetId()] = e;
      return;
    }

    if (!this.Edges[e.GetId()] && !this.Edges[e2.GetId()]) {
      this.Edges[e.GetId()] = e;
      return;
    }
  }

  /**
   * GetCurrentZonesParticipation
   */
  public GetCurrentZonesParticipation() {
    const participation: { [key: string]: Set<number> } = {};

    for (let i = 0; i < zoneStore.Zones.length; i++) {
      const zone = zoneStore.Zones[i] as EgoZone;

      zone.InnerNodes.forEach((n) => {
        if (participation[n.Id]) {
          participation[n.Id].add(i);
        } else {
          participation[n.Id] = new Set<number>([i]);
        }
      });

      zone.OutsideNodes[0].forEach((n) => {
        if (participation[n.Id]) {
          participation[n.Id].add(i);
        } else {
          participation[n.Id] = new Set<number>([i]);
        }
      });

      zone.OutsideNodes[1].forEach((n) => {
        if (participation[n.Id]) {
          participation[n.Id].add(i);
        } else {
          participation[n.Id] = new Set<number>([i]);
        }
      });
    }

    return participation;
  }
}
