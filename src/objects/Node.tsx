export class Node {
  public Id: Number;
  public Label?: string;
  constructor(id: Number, label?: string) {
    this.Id = id;
    this.Label = label;
  }
}
