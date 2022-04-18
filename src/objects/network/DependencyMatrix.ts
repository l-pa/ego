import type Network from "./Network";
import type Node from "./Node";
import { NodeProminency } from "./Node";

export default class Matrix {
  private network: Network;

  private NodeNeighbors: Map<string, Node[]>;

  constructor(network: Network) {
    this.network = network;
    this.NodeNeighbors = new Map<string, Node[]>();
  }

  /**
   * Calculates the dependency matrix.
   *
   * @returns Dependency matrix.
   *
   */
  public dependencyMatrix() {
    Object.keys(this.network.Edges).forEach((key) => {
      const e = this.network.Edges[key];
      if (this.NodeNeighbors.has(e.GetNodeA().Id)) {
        this.NodeNeighbors.get(e.GetNodeA().Id)?.push(e.GetNodeB());
      } else {
        this.NodeNeighbors.set(e.GetNodeA().Id, [e.GetNodeB()]);
      }

      if (!this.network.Directed) {
        if (this.NodeNeighbors.has(e.GetNodeB().Id)) {
          this.NodeNeighbors.get(e.GetNodeB().Id)?.push(e.GetNodeA());
        } else {
          this.NodeNeighbors.set(e.GetNodeB().Id, [e.GetNodeA()]);
        }
      }
    });

    // const DependencyMatrix: number[][] = new Array(
    //   this.network.Nodes.length + 1
    // )
    //   .fill(-1)
    //   .map(() => new Array(this.network.Nodes.length).fill(-1));

    const DependencyMatrix: Map<string, { node: Node; dependency: number }[]> =
      new Map();

    Object.keys(this.network.Edges).forEach((key) => {
      const edge = this.network.Edges[key];

      if (!DependencyMatrix.has(edge.GetNodeA().Id)) {
        DependencyMatrix.set(edge.GetNodeA().Id, [
          {
            node: edge.GetNodeB(),
            dependency: this.isDependent(edge.GetNodeA(), edge.GetNodeB()),
          },
        ]);
      } else {
        DependencyMatrix.get(edge.GetNodeA().Id)?.push({
          node: edge.GetNodeB(),
          dependency: this.isDependent(edge.GetNodeA(), edge.GetNodeB()),
        });
      }

      if (!this.network.Directed) {
        if (!DependencyMatrix.has(edge.GetNodeB().Id)) {
          DependencyMatrix.set(edge.GetNodeB().Id, [
            {
              node: edge.GetNodeA(),
              dependency: this.isDependent(edge.GetNodeB(), edge.GetNodeA()),
            },
          ]);
        } else {
          DependencyMatrix.get(edge.GetNodeB().Id)?.push({
            node: edge.GetNodeA(),
            dependency: this.isDependent(edge.GetNodeB(), edge.GetNodeA()),
          });
        }
      }
    });

    return DependencyMatrix;
  }

  public nodesDependency() {
    const dependencyMatrix = this.dependencyMatrix();

    dependencyMatrix.forEach(
      (
        value: {
          node: Node;
          dependency: number;
        }[],
        key: string
      ) => {
        const twdep: Node[] = [];
        const twindep: Node[] = [];
        const owdep: Node[] = [];
        const owindep: Node[] = [];

        value.forEach((element: { node: Node; dependency: number }) => {
          if (element.node.Id !== key) {
            const dependency = element.dependency;
            dependencyMatrix.get(element.node.Id);
            if (
              dependency === 1 &&
              dependencyMatrix
                .get(element.node.Id)
                ?.some(
                  (v) =>
                    v.node.Id === this.network.Nodes[key].Id &&
                    v.dependency === 0
                )
            ) {
              owdep.push(this.network.Nodes[element.node.Id]);
            }

            if (
              dependency === 0 &&
              dependencyMatrix
                .get(element.node.Id)
                ?.some(
                  (v) =>
                    v.node.Id === this.network.Nodes[key].Id &&
                    v.dependency === 1
                )
            ) {
              owindep.push(this.network.Nodes[element.node.Id]);
            }

            if (
              dependency === 1 &&
              dependencyMatrix
                .get(element.node.Id)
                ?.some(
                  (v) =>
                    v.node.Id === this.network.Nodes[key].Id &&
                    v.dependency === 1
                )
            ) {
              twdep.push(this.network.Nodes[element.node.Id]);
            }

            if (
              dependency === 0 &&
              dependencyMatrix
                .get(element.node.Id)
                ?.some(
                  (v) =>
                    v.node.Id === this.network.Nodes[key].Id &&
                    v.dependency === 0
                )
            ) {
              twindep.push(this.network.Nodes[element.node.Id]);
            }
          }
        });

        this.network.Nodes[key].OwDep = owdep;

        this.network.Nodes[key].OwInDep = owindep;

        this.network.Nodes[key].TwDep = twdep;

        this.network.Nodes[key].TwInDep = twindep;

        this.network.Nodes[key].UpdateClass();

        const p = this.network.Nodes[key].isProminent();

        if (p === NodeProminency.StronglyProminent) {
          this.network.StronglyProminent++;
        }

        if (p === NodeProminency.WeaklyProminent) {
          this.network.WeaklyProminent++;
        }
      }
    );
  }

  /**
   * Returns the weight between two nodes.
   *
   * @remarks
   * If an edge does not exist between these two nodes, then returns -1.
   *
   * @param nodeA - Node A
   * @param nodeB - Node B
   * @returns Weight between the nodeA and the nodeB.
   *
   */
  private weight(nodeA: Node, nodeB: Node): number {
    if (this.network.Directed) {
      const r = this.network.getEdgeByNodes(nodeA.Id, nodeB.Id);

      return r ? r.GetWeight() : 1;
    } else {
      const a = this.network.getEdgeByNodes(nodeA.Id, nodeB.Id);
      const b = this.network.getEdgeByNodes(nodeB.Id, nodeA.Id);
      if (a) {
        return a.GetWeight();
      } else {
        if (b) {
          return b.GetWeight();
        }
        return 1;
      }
    }
  }

  /**
   * Returns the average of two numbers.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   */

  private r(nodeA: Node, commonNode: Node, nodeB: Node): number {
    let y: number = this.weight(commonNode, nodeB);
    return y / (this.weight(nodeA, commonNode) + y);
  }

  /**
   * Calculates the dependency between node A to B.
   *
   *
   * @param nodeA - First node
   * @param nodeB - Second node
   * @returns Numeric dependency between node A to B.
   *
   */

  private dependency(nodeA: Node, nodeB: Node): number {
    const w = this.weight(nodeA, nodeB);
    const cN = this.NodeNeighbors.get(nodeA.Id)?.filter((value) =>
      this.NodeNeighbors.get(nodeB.Id)?.some((v2) => v2.Id === value.Id)
    );
    const N = this.NodeNeighbors.get(nodeA.Id);

    let cNSum = 0;
    let NSum = 0;

    cN?.forEach((element) => {
      cNSum += this.weight(nodeA, element) * this.r(nodeA, element, nodeB);
    });

    N?.forEach((element) => {
      NSum += this.weight(nodeA, element);
    });

    return (w + cNSum) / NSum;
  }

  /**
   * Checks if a nodeA is dependent on a nodeB according to the threshold value.
   *
   * @param nodeA - The first node.
   * @param nodeB - The second node.
   * @returns Binary value if the nodeA is dependent on the nodeB.
   *
   */

  private isDependent(
    nodeA: Node,
    nodeB: Node,
    threshold: number = 0.5
  ): number {
    const d = this.dependency(nodeA, nodeB);

    this.network.Nodes[nodeA.Id].AddNeighbor(nodeB, d);

    const e = this.network.getEdgeByNodes(nodeA.Id, nodeB.Id);

    if (e) {
      if (e.GetNodeA().Id === nodeA.Id) {
        e.SetDependencyTarget(d);
      } else {
        e.SetDependencySource(d);
      }
    }

    return d >= threshold ? 1 : 0;
  }
}
