import { Node } from "./Node";

export class Zone {
  public Ego: Node;
  public innerZoneNodes: Node[];
  public outerZoneNodes: Node[][];

  constructor(ego: Node) {
    this.Ego = ego;

    this.innerZoneNodes = [];
    this.outerZoneNodes = [[], []];

    this.innerZone(ego);
    this.outerZone(this.innerZoneNodes);

    console.log(this.innerZoneNodes);
    console.log(this.outerZoneNodes);
    console.log("---------------------");
  }

  private innerZone(node: Node) {
    this.innerZoneNodes.push(node);
    node.OwInDep.forEach((node) => {
      if (!this.innerZoneNodes.includes(node)) {
        this.innerZone(node);
      }
    });
  }

  private outerZone(nodes: Node[]) {
    nodes.forEach((node) => {
      node.OwDep.forEach((node) => {
        if (
          !this.innerZoneNodes.includes(node) &&
          !this.outerZoneNodes[0].includes(node)
        ) {
          this.outerZoneNodes[0].push(node);
        }
      });
    });

    this.outerZoneNodes[0].forEach((node) => {
      node.OwDep.forEach((owdep) => {
        if (
          this.outerZoneNodes[0].includes(owdep) &&
          !this.outerZoneNodes[1].includes(node)
        ) {
          this.outerZoneNodes[1].push(node);
          this.outerZoneNodes[0] = this.outerZoneNodes[0].filter(
            (obj) => obj.Id !== node.Id
          );
        }
      });
    });
  }
}
