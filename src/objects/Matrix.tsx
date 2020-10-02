import { Network } from "./Network";
import { Node } from "./Node";

export class Matrix {
  private network: Network;

  private AdjencyMatrix: number[][];
  private CommonNeighbors: Node[][];

  constructor(network: Network) {
    this.network = network;
    this.AdjencyMatrix = new Array<Array<number>>();
    this.CommonNeighbors = new Array<Array<Node>>();

    for (var i: number = 0; i < network.Nodes.length + 1; i++) {
      let row: number[] = new Array<number>();
      for (var j: number = 0; j < network.Nodes.length + 1; j++) {
        row.push(0);
      }
      this.AdjencyMatrix.push(row);
    }
  }

  /**
   * Calculates the dependency matrix.
   *
   *
   * @param isDirected - If a network is directed ->
   * @returns Dependency matrix.
   *
   */
  public calculateDependecy(isDirected: boolean = false): number[][] {
    this.network.Edges.forEach((edge) => {
      this.AdjencyMatrix[Number.parseInt(edge.NodeA.Id.toString())][
        Number.parseInt(edge.NodeB.Id.toString())
      ] = edge.Weight;
    });

    for (let i = 0; i < this.AdjencyMatrix.length; i++) {
      let column = [];
      for (let j = 0; j < this.AdjencyMatrix[i].length; j++) {
        const e1 = this.AdjencyMatrix[i][j];
        const e2 = this.AdjencyMatrix[j][i];

        if (e1 !== 0) {
          column.push(
            this.network.Nodes.filter(
              (e) => Number.parseInt(e.Id.toString()) === j
            )[0]
          );
        }
        if (e2 !== 0 && !isDirected) {
          column.push(
            this.network.Nodes.filter(
              (e) => Number.parseInt(e.Id.toString()) === j
            )[0]
          );
        }
      }
      this.CommonNeighbors[i] = column;
    }

    const DependencyMatrix: number[][] = new Array(
      this.network.Nodes.length + 1
    )
      .fill(-1)
      .map(() => new Array(this.network.Nodes.length + 1).fill(-1));

    this.network.Edges.forEach((edge) => {
      DependencyMatrix[Number.parseInt(edge.NodeA.Id.toString())][
        Number.parseInt(edge.NodeB.Id.toString())
      ] = this.isDependent(edge.NodeA, edge.NodeB);
      if (!isDirected) {
        DependencyMatrix[Number.parseInt(edge.NodeB.Id.toString())][
          Number.parseInt(edge.NodeA.Id.toString())
        ] = this.isDependent(edge.NodeB, edge.NodeA);
      }
    });

    console.log(DependencyMatrix);
    return DependencyMatrix;
  }

  public calculateNodesDependency() {
    const minNodeId = Math.min.apply(
      Math,
      this.network.Nodes.map(function (o) {
        return o.Id;
      })
    );

    const dependencyMatrix = this.calculateDependecy();

    for (let i = minNodeId; i <= this.network.Nodes.length; i++) {
      const node = dependencyMatrix[i];
      for (let j = minNodeId; j <= node.length; j++) {
        const dependency = node[j];

        if (j !== i) {
          if (dependency === 1 && dependencyMatrix[j][i] === 0) {
            this.network.Nodes.filter(
              (n) => Number.parseInt(n.Id.toString()) === i
            )[0].OwDep.push(
              this.network.Nodes.filter(
                (n) => Number.parseInt(n.Id.toString()) === j
              )[0]
            );
          }

          if (dependency === 0 && dependencyMatrix[j][i] === 1) {
            this.network.Nodes.filter(
              (n) => Number.parseInt(n.Id.toString()) === i
            )[0].OwInDep.push(
              this.network.Nodes.filter(
                (n) => Number.parseInt(n.Id.toString()) === j
              )[0]
            );
          }

          if (dependency === 1 && dependencyMatrix[j][i] === 1) {
            this.network.Nodes.filter(
              (n) => Number.parseInt(n.Id.toString()) === i
            )[0].TwDep.push(
              this.network.Nodes.filter(
                (n) => Number.parseInt(n.Id.toString()) === j
              )[0]
            );
          }

          if (dependency === 0 && dependencyMatrix[j][i] === 0) {
            this.network.Nodes.filter(
              (n) => Number.parseInt(n.Id.toString()) === i
            )[0].TwInDep.push(
              this.network.Nodes.filter(
                (n) => Number.parseInt(n.Id.toString()) === j
              )[0]
            );
          }
        }
      }
    }
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
    const r = this.network.Edges.filter(
      (e) => e.NodeA.Id === nodeA.Id && e.NodeB.Id === nodeB.Id
    )[0];
    return r ? r.Weight : 1;
  }

  /**
   * Returns the average of two numbers.
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   * @beta
   */

  private r(nodeA: Node, commonNode: Node, nodeB: Node): number {
    let y: number = this.weight(commonNode, nodeB);
    return y / (this.weight(nodeA, commonNode) + y);
  }

  /**
   * Calculates the dependency between two nodes.
   *
   * @remarks
   *
   *
   * @param nodeA - First node
   * @param nodeB - Second node
   * @returns Numeric dependency between input nodes.
   *
   * @beta
   */

  private dependency(nodeA: Node, nodeB: Node): number {
    const w = this.weight(nodeA, nodeB);
    const cN = this.CommonNeighbors[
      Number.parseInt(nodeA.Id.toString())
    ].filter((value) =>
      this.CommonNeighbors[Number.parseInt(nodeB.Id.toString())].includes(value)
    );
    const N = this.CommonNeighbors[Number.parseInt(nodeA.Id.toString())];

    let cNSum = 0;
    let NSum = 0;
    cN.forEach((element) => {
      cNSum += this.weight(nodeA, element) * this.r(nodeA, element, nodeB);
    });

    N.forEach((element) => {
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
