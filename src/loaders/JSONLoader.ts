import Network from "../objects/network/Network";
import Node from "../objects/network/Node";
import { Loader } from "./Loader";

export class JSONLoader extends Loader {
  public async GetNetwork(directed?: boolean) {
    const network = new Network([], [], directed);

    await fetch(super.GetUrl()).then((res) =>
      res.json().then((data) => {
        data.edges.forEach((element: any) => {
          network.addEdge(
            new Node(element.source),
            new Node(element.target),
            element.size
          );
        });
      })
    );

    return network;
  }
}
