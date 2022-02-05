import Network from "../objects/network/Network";
import Node from "../objects/network/Node";
import { Loader } from "./Loader";

export class JSONLoader extends Loader {
  public GetNetworkFile(data: any, directed?: boolean): Network {
    const network = new Network([], [], directed);
    console.log(data);

    const d = JSON.parse(data);

    d.edges.forEach((element: any) => {
      network.addEdge(
        new Node(element.source),
        new Node(element.target),
        element.size
      );
    });

    return network;
  }
  public async GetNetworkURL(url: string, directed?: boolean) {
    return await fetch(url).then((res) => {
      return res.text().then((text) => {
        return this.GetNetworkFile(text, directed);
      });
    });
  }
}
