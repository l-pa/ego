export class Node {
  public Id: number;
  public Label?: string;

  public OwDep: Node[] = [];
  public OwInDep: Node[] = [];
  public TwDep: Node[] = [];
  public TwInDep: Node[] = [];

  constructor(id: number, label?: string) {
    this.Id = id;
    this.Label = label;
  }

  /**
   * Returns prominency of the node.
   *
   * @returns 0 for strongly prominent node,
   *          1 for weakly prominent node,
   *          -1 if the node is not prominent.
   */
  public isProminent(): number {
    return this.OwInDep.length > 0
      ? this.OwDep.length === 0 && this.TwDep.length === 0
        ? 0
        : 1
      : -1;
  }
}
