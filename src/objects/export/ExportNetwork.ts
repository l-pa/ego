import { networkStore, settingsStore, zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";
import Edge from "../network/Edge";
import Node from "../network/Node";
import EgoZone from "../zone/EgoZone";

interface INetworkExport {
  fileName: string;
  groundTruth: {
    [key: string]: Set<number>;
  };
  directed: boolean;
  network: {
    nodes: {
      [id: string]: Node;
    };
    edges: {
      [id: string]: Edge;
    };
  };
}

interface IZoneExport {
  zones: {
    egoId: string;
    isDrawn: boolean;
    style: string;
  }[];
}

interface IFilterExport {
  nodes: number;
  duplicates: string;
  zoneSize: string;
}

export class ExportNetwork {
  private GetSettings() {}

  private GetFilter(): IFilterExport {
    return {
      duplicates: settingsStore.Duplicates,
      nodes: settingsStore.MinNodesZoneShow,
      zoneSize: settingsStore.ZoneSizes,
    };
  }

  private GetZones() {
    const zArr: IZoneExport = { zones: [] };

    zoneStore.Zones.forEach((z) => {
      z as EgoZone;
      zArr.zones.push({
        egoId: z.Id,
        isDrawn: z.IsDrawn,
        style: z.CTXStyle.toString(),
      });
    });
  }

  private GetNetwork() {
    const res: INetworkExport = {
      fileName: networkStore.FileName,
      groundTruth: networkStore.GroundTruth,
      network: {
        nodes: networkStore.Network!!.Nodes,
        edges: networkStore.Network!!.Edges,
      },
      directed: networkStore.Network!!.Directed,
    };

    return res;
  }

  private GetCySettings() {
    const data = {
      pan: cy.pan(),
      zoom: cy.zoom(),
    };
  }

  /**
   * Export
   */
  public Export() {
    const data = {
      network: this.GetNetwork(),
      filter: this.GetFilter(),
      cySettings: this.GetCySettings(),
      zones: this.GetZones(),
    };
    return JSON.stringify(data);
  }
}
