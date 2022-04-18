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

    const nodeHeaders = split[0].split(">")[1].split(",");

    for (let i = 0; i < nodeHeaders.length; i++) {
      const element = nodeHeaders[i].split(" ");
      if (element[0] === "name") idIndex = i;
      if (element[0] === "label") labelIndex = i;
    }

    let i = 1;

    while (i < split.length) {
      const line = split[i].split(",");

      if (line.length > 0) {
        if (line[0].includes(">")) {
          break;
        }
        network.addNode(new Node(line[idIndex], line[labelIndex]));
      }
      i++;
    }

    let sourceIndex = 0;
    let targetIndex = 1;
    let weightIndex = 2;

    const edgeHeaders = split[i].split(">")[1].split(",");

    for (let i = 0; i < edgeHeaders.length; i++) {
      const element = edgeHeaders[i].split(" ");
      if (element[0] === "node1") sourceIndex = i;
      if (element[0] === "node2") targetIndex = i;
      if (element[0] === "weight") weightIndex = i;
    }

    i++;

    while (i < split.length) {
      const line = split[i].split(",");

      if (line.length > 1) {
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
