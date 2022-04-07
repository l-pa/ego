import { networkStore, settingsStore, zoneStore } from "..";
import { IJSONExport } from "../objects/export/ExportNetwork";
import { cy } from "../objects/graph/Cytoscape";
import Network from "../objects/network/Network";
import Node from "../objects/network/Node";
import EgoZone from "../objects/zone/EgoZone";
import { IExportSettings } from "../stores/IExportSettings";
import { Loader } from "./Loader";

export class JSONLoader extends Loader {
  public GetNetworkFromFile(data: any, directed?: boolean): Network {
    const network = new Network([], [], directed);

    let d = JSON.parse(data);

    if (d["app"]) {
      const json = d as IJSONExport;

      network.Directed = json.network.directed;

      for (const key in json.network.edges) {
        if (Object.prototype.hasOwnProperty.call(json.network.edges, key)) {
          const edge = json.network.edges[key];

          network.addEdge(
            new Node(edge.source, json.network.nodes[edge.source].label),
            new Node(edge.target, json.network.nodes[edge.source].label),
            edge.weight
          );
        }
      }

      network.JSONData = json;
    } else {
      d.edges.forEach((element: any) => {
        network.addEdge(
          new Node(element.source),
          new Node(element.target),
          element.size
        );
      });
    }
    return network;
  }
  public async GetNetworkFromURL(url: string, directed?: boolean) {
    return await fetch(url).then((res) => {
      return res.text().then((text) => {
        return this.GetNetworkFromFile(text, directed);
      });
    });
  }
}
