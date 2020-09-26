import { Network } from "./Network";

export class Matrix {
  private network: Network;

  public AdjencyMatrix: Number[][];
  public CommonNeighbors: Node[][];

  constructor(network: Network) {
    this.network = network;
    this.AdjencyMatrix = new Array<Array<Number>>();
    this.CommonNeighbors = new Array<Array<Node>>();

    for (var i: number = 0; i < network.Nodes.length + 1; i++) {
      let row: Number[] = new Array<Number>();
      for (var j: number = 0; j < network.Nodes.length + 1; j++) {
        row.push(0);
      }
      this.AdjencyMatrix.push(row);
    }
  }

  /**
   * CalculateDependecy
   */
  public CalculateDependecy() {
    this.network.Edges.forEach((edge) => {
      this.AdjencyMatrix[Number.parseInt(edge.NodeA.Id.toString())][
        Number.parseInt(edge.NodeB.Id.toString())
      ] = edge.Weight;
    });

    for (let i = 0; i < this.AdjencyMatrix.length; i++) {
      let column = new Array();
      for (let j = 0; j < this.AdjencyMatrix[i].length; j++) {
        const element = this.AdjencyMatrix[j][i];
        if (element !== 0) {
          column.push(this.network.Nodes.filter((e) => e.Id == j)[0]);
        }
      }
      this.CommonNeighbors[i] = column;
    }
    console.log(this.CommonNeighbors);
  }
}
