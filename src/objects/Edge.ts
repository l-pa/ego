import type Node from "./Node";
import type { EdgeDataDefinition, ElementDefinition } from "cytoscape";

export default class Edge implements ElementDefinition {
  public Id: string | number;
  public NodeA: Node;
  public NodeB: Node;
  public Weight: number = 1;

  data: EdgeDataDefinition;
  classes = "";

  constructor(nodeA: Node, nodeB: Node, id: string | number, weight?: number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;
    this.Id = id;

    this.data = {
      source: this.NodeA.Id.toString(),
      target: this.NodeB.Id.toString(),
    };

    if (weight) {
      this.Weight = weight;
    }
  }

  public plainObject() {
    return Object.assign({}, this);
  }

  public updateClasses() {
    this.classes = "";
    if (this.NodeA.OwDep.filter((n) => n.Id === this.NodeB.Id)) {
      this.classes = "owdep";
    }

    if (this.NodeA.OwInDep.filter((n) => n.Id === this.NodeB.Id)) {
      this.classes = "owindep";
    }

    if (this.NodeA.TwDep.filter((n) => n.Id === this.NodeB.Id)) {
      this.classes = "twdep";
    }

    if (this.NodeA.TwInDep.filter((n) => n.Id === this.NodeB.Id)) {
      this.classes = "twindep";
    }

    if (this.NodeA.isProminent() === 1) {
      if (this.NodeB.isProminent() === 1) {
        this.classes += " wptowp";
      }
      if (this.NodeB.isProminent() === 0) {
        this.classes += " sptowp";
      }

      if (this.NodeB.isProminent() === -1) {
        this.classes += " wptonp";
      }
    }

    if (this.NodeA.isProminent() === 0) {
      if (this.NodeB.isProminent() === 1) {
        this.classes += " sptowp";
      }
      if (this.NodeB.isProminent() === 0) {
        this.classes += " sptosp";
      }

      if (this.NodeB.isProminent() === -1) {
        this.classes += " wptonp";
      }
    }

    if (this.NodeA.isProminent() === -1) {
      if (this.NodeB.isProminent() === 1) {
        this.classes += " wptonp";
      }
      if (this.NodeB.isProminent() === 0) {
        this.classes += " sptonp";
      }

      if (this.NodeB.isProminent() === -1) {
        this.classes += " nptonp";
      }
    }
  }
}
