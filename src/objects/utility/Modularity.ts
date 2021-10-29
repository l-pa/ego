import { Collection, Core, NodeCollection, NodeSingular } from "cytoscape";
import { cy } from "../graph/Cytoscape";
import Zone from "../zone/Zone";

export default class Modularity {
  private zone: Zone;

  private basicValue = 0;
  private innerValue = 0;
  private zoneValue = 0;

  constructor(zone: Zone) {
    this.zone = zone;

    zone.AllCollection.forEach((n) => {});
  }
}
