import type Network from "./Network";
import type Node from "./Node";

export default class Matrix {
  private network: Network;

  private CommonNeighbors: Map<string, Node[]>;

  constructor(network: Network) {
    this.network = network;
    this.CommonNeighbors = new Map<string, Node[]>();
  }

  /**
   * Calculates the dependency matrix.
   *
   * @returns Dependency matrix.
   *
   */
  public dependencyMatrix() {
    this.network.Edges.forEach((edge) => {
      if (this.CommonNeighbors.has(edge.GetNodeA().Id)) {
        this.CommonNeighbors.get(edge.GetNodeA().Id)?.push(edge.GetNodeB());
      } else {
        this.CommonNeighbors.set(edge.GetNodeA().Id, [edge.GetNodeB()]);
      }

      if (!this.network.Directed) {
        if (this.CommonNeighbors.has(edge.GetNodeB().Id)) {
          this.CommonNeighbors.get(edge.GetNodeB().Id)?.push(edge.GetNodeA());
        } else {
          this.CommonNeighbors.set(edge.GetNodeB().Id, [edge.GetNodeA()]);
        }
      }
    });

    // const DependencyMatrix: number[][] = new Array(
    //   this.network.Nodes.length + 1
    // )
    //   .fill(-1)
    //   .map(() => new Array(this.network.Nodes.length).fill(-1));

    const DependencyMatrix: Map<
      string,
      { node: Node; dependency: number }[]
    > = new Map();

    this.network.Edges.forEach((edge) => {
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
                    v.node.Id ===
                      this.network.Nodes.filter((n) => n.Id === key)[0].Id &&
                    v.dependency === 0
                )
            ) {
              owdep.push(
                this.network.Nodes.filter((n) => n.Id === element.node.Id)[0]
              );
            }

            if (
              dependency === 0 &&
              dependencyMatrix
                .get(element.node.Id)
                ?.some(
                  (v) =>
                    v.node.Id ===
                      this.network.Nodes.filter((n) => n.Id === key)[0].Id &&
                    v.dependency === 1
                )
            ) {
              owindep.push(
                this.network.Nodes.filter((n) => n.Id === element.node.Id)[0]
              );
            }

            if (
              dependency === 1 &&
              dependencyMatrix
                .get(element.node.Id)
                ?.some(
                  (v) =>
                    v.node.Id ===
                      this.network.Nodes.filter((n) => n.Id === key)[0].Id &&
                    v.dependency === 1
                )
            ) {
              twdep.push(
                this.network.Nodes.filter((n) => n.Id === element.node.Id)[0]
              );
            }

            if (
              dependency === 0 &&
              dependencyMatrix
                .get(element.node.Id)
                ?.some(
                  (v) =>
                    v.node.Id ===
                      this.network.Nodes.filter((n) => n.Id === key)[0].Id &&
                    v.dependency === 0
                )
            ) {
              twindep.push(
                this.network.Nodes.filter((n) => n.Id === element.node.Id)[0]
              );
            }
          }
        });

        this.network.Nodes.filter((n) => n.Id === key)[0].OwDep = owdep;

        this.network.Nodes.filter((n) => n.Id === key)[0].OwInDep = owindep;

        this.network.Nodes.filter((n) => n.Id === key)[0].TwDep = twdep;

        this.network.Nodes.filter((n) => n.Id === key)[0].TwInDep = twindep;

        this.network.Nodes.filter((n) => n.Id === key)[0].UpdateClass();
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
      const r = this.network.Edges.filter(
        (e) =>
          (e.GetNodeA().Id === nodeA.Id && e.GetNodeB().Id === nodeB.Id)
      )[0];
      return r ? r.GetWeight() : 1;
    } else {
      const r = this.network.Edges.filter(
        (e) =>
          (e.GetNodeA().Id === nodeA.Id && e.GetNodeB().Id === nodeB.Id) ||
          (e.GetNodeB().Id === nodeA.Id && e.GetNodeA().Id === nodeB.Id)
      )[0];
      return r ? r.GetWeight() : 1;
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
   * Calculates the dependency between two nodes.
   *
   *
   * @param nodeA - First node
   * @param nodeB - Second node
   * @returns Numeric dependency between input nodes.
   *
   */

  private dependency(nodeA: Node, nodeB: Node): number {
    const w = this.weight(nodeA, nodeB);
    const cN = this.CommonNeighbors.get(nodeA.Id)?.filter((value) =>
      this.CommonNeighbors.get(nodeB.Id)?.some((v2) => v2.Id === value.Id)
    );
    const N = this.CommonNeighbors.get(nodeA.Id);

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
    return d >= threshold ? 1 : 0;
  }
}
