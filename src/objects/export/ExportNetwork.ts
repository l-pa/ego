import { networkStore, settingsStore, zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";
import { NodeLabel } from "../network/Node";
import EgoZone from "../zone/EgoZone";
import { IColor } from "../zone/Zone";

interface INode {
  label?: string;
  position: {
    x: number;
    y: number;
  };
}

interface IEdge {
  weight: number;
  source: string;
  target: string;
}

interface INetworkExport {
  fileName: string;
  groundTruth: {
    [key: string]: Set<number>;
  };
  directed: boolean;
  edges: { [key: string]: IEdge };
  nodes: {
    [key: string]: INode;
  };
}

interface IZoneExport {
  egoId: string;
  isDrawn: boolean;
  style: string;
  opacity: number;
  color: IColor;
}

interface IFilterExport {
  nodes: number;
  duplicates: string;
  zoneSize: string;
}

interface ISettingsExport {
  pan: cytoscape.Position;
  zoom: number;
  nodes: {
    label: NodeLabel;
    size: string;
  };
  edges: {
    showWeights: boolean;
  };
}

export interface IJSONExport {
  app: string;
  filters: IFilterExport;
  network: INetworkExport;
  zones: IZoneExport[];
  cySettings: ISettingsExport;
}

export class ExportNetwork {
  private GetFilter(): IFilterExport {
    return {
      duplicates: settingsStore.Duplicates,
      nodes: settingsStore.MinNodesZoneShow,
      zoneSize: settingsStore.ZoneSizes,
    };
  }

  private GetZones(): IZoneExport[] {
    const zArr: IZoneExport[] = [];

    zoneStore.Zones.forEach((z) => {
      z as EgoZone;
      zArr.push({
        egoId: z.Id,
        isDrawn: z.IsDrawn,
        style: z.CTX.fillStyle,
        opacity: z.Alpha,
        color: z.Color,
      });
    });
    return zArr;
  }

  private GetNetwork() {
    const edges: {
      [key: string]: IEdge;
    } = {};

    const nodes: {
      [key: string]: INode;
    } = {};

    for (const key in networkStore.Network?.Edges) {
      const element = networkStore.Network?.Edges[key];
      if (element) {
        edges[element?.GetId()] = {
          source: element.GetNodeA().Id,
          target: element.GetNodeB().Id,
          weight: element.GetWeight(),
        };
      }
    }

    for (const key in networkStore.Network?.Nodes) {
      const element = networkStore.Network?.Nodes[key];
      if (networkStore.Network && element) {
        const pos = {
          x: networkStore.Network.getNode(element.Id).position().x,
          y: networkStore.Network.getNode(element.Id).position().y,
        };

        if (element.Label) {
          nodes[element.Id] = {
            label: element.Id,
            position: pos,
          };
        } else {
          nodes[element.Id] = { label: undefined, position: pos };
        }
      }
    }

    const res: INetworkExport = {
      fileName: networkStore.FileName,
      groundTruth: networkStore.GroundTruth,
      directed: networkStore.Network!!.Directed,
      edges: edges,
      nodes: nodes,
    };

    return res;
  }

  private GetCySettings(): ISettingsExport {
    const data: ISettingsExport = {
      pan: cy.pan(),
      zoom: cy.zoom(),
      edges: {
        showWeights: settingsStore.ShowEdgeWeight,
      },
      nodes: {
        label: settingsStore.NodeLabel,
        size: settingsStore.GetNodeSize(),
      },
    };

    return data;
  }

  /**
   * Export
   */
  public Export(): IJSONExport {
    const data: IJSONExport = {
      app: "ego.0.1",
      network: this.GetNetwork(),
      filters: this.GetFilter(),
      cySettings: this.GetCySettings(),
      zones: this.GetZones(),
    };
    return data;
  }
}
