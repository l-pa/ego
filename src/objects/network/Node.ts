import type { ElementDefinition, NodeDataDefinition } from "cytoscape";
import { networkStore } from "../..";
import { cy } from "../graph/Cytoscape";

export enum NodeProminency {
  StronglyProminent = "stronglyProminent",
  WeaklyProminent = "weaklyProminent",
  NonProminent = "nonProminent",
  Liaison = "liaisons",
  Coliaison = "coliaisons",
  Blank = "",
}

export enum NodeLabel {
  Id = "nodeLabelId",
  Label = "nodeLabelText",
  None = "nodeLabelNone",
}

export enum NodeDisplay {
  Visible = "",
  Hidden = "hide",
}

export interface INodeProperties {
  NodeProminency: NodeProminency;
  NodeLabel: NodeLabel;
  NodeDisplay: NodeDisplay;
}

export default class Node {
  public Id: string;
  public Label?: string;

  data: NodeDataDefinition = {};

  // {Display : NodeDisplay.Visible, Label: NodeLabel.Label, Prominency: NodeProminency.NonProminent}

  private classes: { [key in keyof INodeProperties]: string } = {
    NodeDisplay: NodeDisplay.Visible,
    NodeLabel: NodeLabel.Id,
    NodeProminency: NodeProminency.NonProminent,
  };

  private owDep: Node[] = [];
  private owInDep: Node[] = [];
  private twDep: Node[] = [];
  private twInDep: Node[] = [];

  private neighbors: { [id: string]: [Node, number] } = {};

  public UpdateClass() {
    switch (this.isProminent()) {
      case NodeProminency.StronglyProminent:
        this.classes.NodeProminency = NodeProminency.StronglyProminent;
        this.data.nodeType = NodeProminency.StronglyProminent;
        break;

      case NodeProminency.WeaklyProminent:
        this.classes.NodeProminency = NodeProminency.WeaklyProminent;
        this.data.nodeType = NodeProminency.WeaklyProminent;
        break;

      case NodeProminency.NonProminent:
        this.classes.NodeProminency = NodeProminency.NonProminent;
        this.data.nodeType = NodeProminency.NonProminent;
        break;

      default:
        break;
    }
  }

  /**
   * ResetClasses
   */
  public ResetClasses() {
    this.SetClass("NodeProminency", this.data.nodeType);
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
    this.data.id = this.Id;
    this.data.label = this.Label;
    this.data.nodeType = "";
  }

  public PlainObject(): ElementDefinition {
    return { data: this.data, classes: Object.values(this.classes).join(" ") };
  }

  /**
   * ChangeClass
   */

  public SetClass(
    type: keyof INodeProperties,
    value: NodeProminency | NodeDisplay | NodeLabel
  ) {
    this.classes[type] = value;

    networkStore.Network?.getNode(this.Id).classes(
      Object.values(this.classes).join(" ")
    );
  }

  /**
   * GetClass
   */

  public GetClass(value: keyof INodeProperties) {
    return this.classes[value];
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
