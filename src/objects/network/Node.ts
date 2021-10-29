import type { ElementDefinition, NodeDataDefinition } from "cytoscape";
import { networkStore } from "../..";

export default class Node implements ElementDefinition {
  public Id: string;
  public Label?: string;

  data: NodeDataDefinition = {};
  classes: string;

  private owDep: Node[] = [];
  private owInDep: Node[] = [];
  private twDep: Node[] = [];
  private twInDep: Node[] = [];

  public UpdateClass() {
    this.classes = this.data.nodeType =
      this.isProminent() !== -1
        ? this.isProminent() === 1
          ? "weaklyProminent"
          : "stronglyProminent"
        : "nonProminent";
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
    this.data.nodeType = "";
    this.classes = "";
  }

  public PlainObject(): ElementDefinition {
    return Object.assign({}, this);
  }

  /**
   * Returns prominency of the node.
   *
   * @returns 0 for strongly prominent node,
   *          1 for weakly prominent node,
   *          -1 if the node is not prominent.
   */
  public isProminent(): number {
    return this.owInDep.length > 0
      ? this.owDep.length === 0 && this.twDep.length === 0
        ? 0
        : 1
      : -1;
  }
}