import Network from "../objects/network/Network";
import Node from "../objects/network/Node";
import { Loader } from "./Loader";

export class GDFLoader extends Loader {
  public async GetNetworkFromURL(
    url: string,
    directed?: boolean
  ): Promise<Network> {
    return await fetch(url).then((res) =>
      res.text().then((text) => {
        return this.GetNetworkFromFile(text, directed);
      })
    );
  }
  public GetNetworkFromFile(data: any, directed?: boolean): Network {
    const network = new Network([], [], directed);
    const split = (data as string).split("\n");

    let idIndex = 0;
    let labelIndex = 1;

    let sourceIndex = 0;
    let targetIndex = 1;
    let weightIndex = 2;

    let i = 1;
    let nodes = true;

    while (i < split.length) {
      const line = split[i].split(",");

      if (line[0].includes(">")) {
        nodes = false;
        i++;
        continue;
      }

      if (nodes) {
        network.addNode(new Node(line[idIndex], line[labelIndex]));
      } else {
        network.addEdge(
          network.Nodes[line[sourceIndex]],
          network.Nodes[line[targetIndex]],
          Number.parseFloat(line[weightIndex])
        );
      }
      i++;
    }

    return network;
  }
}
