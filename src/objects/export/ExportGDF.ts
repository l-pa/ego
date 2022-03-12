import { networkStore } from "../..";

export class ExportGDF {
  constructor() {}

  /**
   * Export
   */
  public Export() {
    const network = networkStore.Network;

    if (network) {
      const res: string[] = [];
      const nodeHeader = "nodedef>name VARCHAR, label VARCHAR, com VARCHAR";
      const edgeHeader = "edgedef>node1 VARCHAR, node2 VARCHAR, weight DOUBLE";

      res.push(nodeHeader);

      for (const key in network.Nodes) {
        const node = network.Nodes[key];
        res.push(
          `${node.Id},${node.Label ? node.Label : node.Id},${
            networkStore.GroundTruth[node.Id]
              ? Array.from(networkStore.GroundTruth[node.Id])[0]
              : ""
          }`
        );
      }

      res.push(edgeHeader);

      for (const key in network.Edges) {
        const edge = network.Edges[key];
        res.push(
          `${edge.GetNodeA().Id},${edge.GetNodeB().Id},${edge.GetWeight()}`
        );
      }

      console.log(res.join("\n"));
    }
  }
}
