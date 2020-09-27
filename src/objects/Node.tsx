export class Node {
  public Id: number;
  public Label?: string;
  constructor(id: number, label?: string) {
    this.Id = id;
    this.Label = label;
  }
}
