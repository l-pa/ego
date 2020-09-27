import { Network } from "./Network";
import { Node } from "./Node";

export class Matrix {
  private network: Network;

  public AdjencyMatrix: number[][];
  public CommonNeighbors: Node[][];

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
   * Calculates the boolean dependency matrix.
   *
   *
   * @param isDirected - If a network is directed ->
   * @returns Boolean dependency matrix.
   *
   */
  public CalculateDependecy(isDirected: boolean = false) {
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

    let copyAdjencyMatrix = JSON.parse(JSON.stringify(this.AdjencyMatrix));

    this.network.Edges.forEach((edge) => {
      copyAdjencyMatrix[Number.parseInt(edge.NodeA.Id.toString())][
        Number.parseInt(edge.NodeB.Id.toString())
      ] = this.Dependency(edge.NodeA, edge.NodeB);
      copyAdjencyMatrix[Number.parseInt(edge.NodeB.Id.toString())][
        Number.parseInt(edge.NodeA.Id.toString())
      ] = this.Dependency(edge.NodeB, edge.NodeA);
    });
    console.log(copyAdjencyMatrix);
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
  private Weight(nodeA: Node, nodeB: Node): number {
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

  private R(nodeA: Node, commonNode: Node, nodeB: Node): number {
    let y: number = this.Weight(commonNode, nodeB);
    return y / (this.Weight(nodeA, commonNode) + y);
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

  private Dependency(nodeA: Node, nodeB: Node): number {
    const w = this.Weight(nodeA, nodeB);
    const cN = this.CommonNeighbors[
      Number.parseInt(nodeA.Id.toString())
    ].filter((value) =>
      this.CommonNeighbors[Number.parseInt(nodeB.Id.toString())].includes(value)
    );
    const N = this.CommonNeighbors[Number.parseInt(nodeA.Id.toString())];

    let cNSum = 0;
    let NSum = 0;
    cN.forEach((element) => {
      cNSum += this.Weight(nodeA, element) * this.R(nodeA, element, nodeB);
    });

    N.forEach((element) => {
      NSum += this.Weight(nodeA, element);
    });

    return (w + cNSum) / NSum;
  }

  /**
   * Checks if a nodeA is dependent on a nodeB according to the threshold value.
   *
   * @param nodeA - The first node.
   * @param nodeB - The second node.
   * @returns Boolean value if the nodeA is dependent on the nodeB.
   *
   */

  private isDependent(
    nodeA: Node,
    nodeB: Node,
    threshold: number = 0.5
  ): boolean {
    return this.Dependency(nodeA, nodeB) > threshold ? true : false;
  }
}
