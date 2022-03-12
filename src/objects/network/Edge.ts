import type Node from "./Node";
import type { EdgeDataDefinition, ElementDefinition } from "cytoscape";
import { networkStore } from "../..";
import { NodeProminency } from "./Node";


export enum EdgeType {
  S2S = "sptosp",
  S2W = "sptowp",
  S2N = "sptonp",
  W2W = "wptowp",
  W2N = "wptonp",
  N2N = "nptonp",

  E2I = "egotoinner",
  E2L = "egotoliaison",
  E2C = "egotocoliaison",
  I2I = "innertoinner",
  I2L = "innertoliaison",
  I2C = "innertocoliaison",
  L2C = "liaisontocoliaison",
  L2L = "liaisontoliaison",
  C2C = "coliaisontocoliaison",
  Blank = "",
}

export enum EdgeShowWeight {
  Show = "edgeWeight",
  Hide = "",
}

export interface IEdgeProperties {
  EdgeType: EdgeType;
  EdgeWeightsShown: EdgeShowWeight;
}

export default class Edge {
  private Id: string | number;
  private NodeA: Node;
  private NodeB: Node;
  private Weight: number = 1;

  private classes: { [key in keyof IEdgeProperties]: string } = {
    EdgeType: EdgeType.N2N,
    EdgeWeightsShown: EdgeShowWeight.Hide,
  };

  data: EdgeDataDefinition;

  constructor(nodeA: Node, nodeB: Node, id: string, weight: number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;
    this.Id = id;

    this.data = {
      source: this.NodeA.Id,
      target: this.NodeB.Id,
      edgeType: "",
      weight: weight.toFixed(2),
    };

    this.Weight = weight;
  }

  /**
   * ChangeClass
   */

  public SetClass(
    type: keyof IEdgeProperties,
    value: EdgeType | EdgeShowWeight
  ) {
    this.classes[type] = value;

    networkStore.Network?.getEdge(this.NodeA.Id, this.NodeB.Id).classes(
      Object.values(this.classes).join(" ")
    );
  }

  /**
   * GetClass
   */

  public GetClass(value: keyof IEdgeProperties) {
    return this.classes[value];
  }

  /**
   * NodesClassType
   */
  public NodesClassType(a: Node, b: Node) {
    networkStore.Network?.getEdgeByNodes(a.Id, b.Id);

    const aProminency = a.GetClass("NodeProminency");
    const bProminency = b.GetClass("NodeProminency");

    if (aProminency === NodeProminency.StronglyProminent) {
      if (bProminency === NodeProminency.WeaklyProminent) {
        return EdgeType.E2I;
      }

      if (bProminency === NodeProminency.Liaison) {
        return EdgeType.E2L;
      }

      if (bProminency === NodeProminency.Coliaison) {
        return EdgeType.E2C;
      }
    }

    if (aProminency === NodeProminency.WeaklyProminent) {
      if (bProminency === NodeProminency.WeaklyProminent) {
        return EdgeType.I2I;
      }

      if (bProminency === NodeProminency.Liaison) {
        return EdgeType.I2L;
      }

      if (bProminency === NodeProminency.Coliaison) {
        return EdgeType.I2C;
      }
    }

    if (aProminency === NodeProminency.Liaison) {
      if (bProminency === NodeProminency.Liaison) {
        return EdgeType.L2L;
      }

      if (bProminency === NodeProminency.Coliaison) {
        return EdgeType.L2C;
      }
    }

    if (aProminency === NodeProminency.Coliaison) {
      if (bProminency === NodeProminency.Coliaison) {
        return EdgeType.C2C;
      }
    }
  }

  public ResetClass() {
    this.SetClass("EdgeType", this.data.edgeType);
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
    return { data: this.data, classes: Object.values(this.classes).join(" ") };
  }

  public SetDependencySource(source: number) {
    this.data.sourceDependency = parseFloat(source.toString()).toFixed(2);
  }

  public SetDependencyTarget(target: number) {
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
      this.data.edgeType = EdgeType.S2S;
      this.classes.EdgeType = EdgeType.S2S;
    }

    if (
      source === NodeProminency.WeaklyProminent &&
      target === NodeProminency.WeaklyProminent
    ) {
      this.data.edgeType = EdgeType.W2W;
      this.classes.EdgeType = EdgeType.W2W;
    }

    if (
      source === NodeProminency.NonProminent &&
      target === NodeProminency.NonProminent
    ) {
      this.data.edgeType = EdgeType.N2N;
      this.classes.EdgeType = EdgeType.N2N;
    }

    if (
      (source === NodeProminency.StronglyProminent &&
        target === NodeProminency.WeaklyProminent) ||
      (source === NodeProminency.WeaklyProminent &&
        target === NodeProminency.StronglyProminent)
    ) {
      this.data.edgeType = EdgeType.S2W;
      this.classes.EdgeType = EdgeType.S2W;
    }

    if (
      (source === NodeProminency.StronglyProminent &&
        target === NodeProminency.NonProminent) ||
      (source === NodeProminency.NonProminent &&
        target === NodeProminency.StronglyProminent)
    ) {
      this.data.edgeType = EdgeType.S2N;
      this.classes.EdgeType = EdgeType.S2N;
    }

    if (
      (source === NodeProminency.WeaklyProminent &&
        target === NodeProminency.NonProminent) ||
      (source === NodeProminency.NonProminent &&
        target === NodeProminency.WeaklyProminent)
    ) {
      this.data.edgeType = EdgeType.W2N;
      this.classes.EdgeType = EdgeType.W2N;
    }
  }
}
