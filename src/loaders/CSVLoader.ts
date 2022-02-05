import { Loader } from "./Loader";
import Network from "../objects/network/Network";
import Node from "../objects/network/Node";
import parse from "csv-parse/lib/sync";
import { arrayContainsAll } from "../objects/utility/ArrayUtils";

export class CSVLoader extends Loader {
  public GetNetworkFile(data: any, directed?: boolean): Network {
    const network = new Network([], [], directed);

    const parsed = parse(data, {
      delimiter: ",",
      columns: false,
      skip_empty_lines: true,
    });

    if (arrayContainsAll(parsed[0], ["source", "target", "value"]))
      parsed.shift();
    if (parsed[2]) {
      parsed.forEach((element: any) => {
        network.addEdge(
          new Node(element[0]),
          new Node(element[1]),
          Number.parseFloat(element[2])
        );
      });
    } else {
      parsed.forEach((element: any) => {
        network.addEdge(new Node(element[0]), new Node(element[1]), 1);
      });
    }

    return network;
  }

  public async GetNetworkURL(
    url: string,
    directed?: boolean
  ): Promise<Network> {
    return await fetch(url).then((res) =>
      res.text().then((text) => {
        return this.GetNetworkFile(text, directed);
      })
    );
  }
}
