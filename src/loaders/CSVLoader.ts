import { Loader } from "./Loader";
import Network from "../objects/network/Network";
import Node from "../objects/network/Node";
import parse from "csv-parse/lib/sync";
import { arrayContainsAll } from "../objects/utility/ArrayUtils";
import { networkStore } from "..";

export class CSVLoader extends Loader {
  public GetNetworkFromFile(data: any, directed?: boolean): Network {
    const network = new Network([], [], directed);

    const parsed = parse(data, {
      delimiter: ";",
      columns: false,
      skip_empty_lines: true,
    });

    if (
      arrayContainsAll(parsed[0], [
        "source",
        "target",
        "value",
        "Source",
        "Target",
        "Value",
      ])
    )
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

  public async LoadGroundTruth(text: string) {
    const parsed = parse(text, {
      delimiter: ";",
      columns: false,
      skip_empty_lines: true,
    });

    const participation: { [key: string]: Set<number> } = {};

    parsed.forEach((row: string[]) => {
      if (participation[row[1]]) {
        participation[row[1]].add(parseInt(row[0]));
      } else {
        participation[row[1]] = new Set<number>([parseInt(row[0])]);
      }
    });
    networkStore.GroundTruth = participation;    
  }
}
