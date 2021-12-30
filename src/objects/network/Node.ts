import type { ElementDefinition, NodeDataDefinition } from "cytoscape";
import { networkStore } from "../..";

export enum NodeProminency {
  StronglyProminent = "stronglyProminent",
  WeaklyProminent = "weaklyProminent",
  NonProminent = "nonProminent",
}

export default class Node implements ElementDefinition {
  public Id: string;
  public Label?: string;

  data: NodeDataDefinition = {};
  classes: string;

  private owDep: Node[] = [];
  private owInDep: Node[] = [];
  private twDep: Node[] = [];
  private twInDep: Node[] = [];

  private neighbors: { [id: string]: [Node, number] } = {};

  public UpdateClass() {
    switch (this.isProminent()) {
      case NodeProminency.StronglyProminent:
        this.classes += " " + NodeProminency.StronglyProminent;
        this.data.nodeType = NodeProminency.StronglyProminent;
        break;

      case NodeProminency.WeaklyProminent:
        this.classes += " " + NodeProminency.WeaklyProminent;
        this.data.nodeType = NodeProminency.WeaklyProminent;
        break;

      case NodeProminency.NonProminent:
        this.classes += " " + NodeProminency.NonProminent;
        this.data.nodeType = NodeProminency.NonProminent;
        break;

      default:
        break;
    }
  }

  public set OwDep(nodes: Node[]) {
    this.owDep = [...nodes];
  }

  public set OwInDep(nodes: Node[]) {
    this.owInDep = [...nodes];
  }

  public set TwDep(nodes: Node[]) {
    this.twDep = [...nodes];
  }

  public set TwInDep(nodes: Node[]) {
    this.twInDep = [...nodes];
  }

  public get OwDep() {
    return this.owDep;
  }
  public get OwInDep() {
    return this.owInDep;
  }
  public get TwDep() {
    return this.twDep;
  }
  public get TwInDep() {
    return this.twInDep;
  }

  constructor(id: string, label?: string) {
    this.Id = id;
    this.Label = label;
    this.data.id = this.Id.toString();
    this.data.label = this.Label;
    this.data.nodeType = "";
    this.classes = "nodeLabelId";
  }

  public PlainObject(): ElementDefinition {
    return Object.assign({}, this);
  }

  /**
   * AddNeighbor
   */
  public AddNeighbor(nodeB: Node, dependency: number) {
    this.neighbors[nodeB.Id] = [nodeB, dependency];
  }

  /**
   * Returns prominency of the node.
   *
   * @returns Enum value - strongly/weakly/non prominent
   */
  public isProminent(): string {
    return this.owInDep.length > 0
      ? this.owDep.length === 0 && this.twDep.length === 0
        ? NodeProminency.StronglyProminent
        : NodeProminency.WeaklyProminent
      : NodeProminency.NonProminent;
  }
}