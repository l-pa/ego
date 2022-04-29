import React, { useRef, useEffect } from "react";
import "./style.css";

import { networkStore, settingsStore, zoneStore } from "..";
import Cytoscape, { cy } from "../objects/graph/Cytoscape";
import EgoZone from "../objects/zone/EgoZone";
import { createStandaloneToast } from "@chakra-ui/react";

export const Graph: React.FunctionComponent = () => {
  const container = useRef<HTMLDivElement>(null);
  const toast = createStandaloneToast();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const aa = new Cytoscape(container.current);
    try {
      console.log("CREATED", cy.nodes());
    } catch (error) {
      console.log(error);
      networkStore.Network = undefined
      toast({
        title: `Parsing error`,
        description: `${error as string}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    if (cy) {

      if (networkStore.Network?.JSONData) {

      cy.zoom(networkStore.Network?.JSONData.cySettings.zoom)
      cy.pan(networkStore.Network?.JSONData.cySettings.pan)

      networkStore.GroundTruth = networkStore.Network?.JSONData.network.groundTruth;
      settingsStore.MinNodesZoneShow = networkStore.Network?.JSONData.filters.nodes;
      settingsStore.Duplicates = networkStore.Network?.JSONData.filters.duplicates;
      settingsStore.ZoneSizes = networkStore.Network?.JSONData.filters.zoneSize;

      settingsStore.ShowEdgeWeight = networkStore.Network?.JSONData.cySettings.edges.showWeights
      settingsStore.NodeLabel = networkStore.Network?.JSONData.cySettings.nodes.label
      settingsStore.SetNodeSize(networkStore.Network?.JSONData.cySettings.nodes.size)

      networkStore.Network?.JSONData.zones.forEach(z => {
        const node = networkStore.Network?.Nodes[z.egoId]
        if (node) {
          zoneStore.AddZone(new EgoZone(node, z.color))
        }
      })
      for (const key in networkStore.Network?.JSONData.network.nodes) {
        const node = networkStore.Network?.JSONData.network.nodes[key];
        networkStore.Network.getNode(key).position(node.position)
      }
    } else {
      cy.layout({
        //@ts-ignore
        name: "cose-bilkent", nodeRepulsion: 4500, idealEdgeLength: 100, edgeElasticity: 0.45, nestingFactor: 0.1, gravity: 0.25
      }).start()
    }

      if (networkStore.Network) {
        toast({
          title: "Network loaded.",
          description: `${networkStore.FileName} - ${networkStore.Network.NodesLength()
            } nodes - ${networkStore.Network.EdgesLength()} edges -  ${networkStore.Network.Directed ? "✅" : "❌"
            } directed`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    return () => {
      if (cy) {

        cy.off("click mouseout mousein render cyCanvas.resize");
        cy.on("destroy", () => {
        networkStore.Network = undefined;

        cy.elements().remove()
        console.log("DESTROYED ", cy.nodes());


        console.log("Cy instance destroyed");
        })
      cy.destroy();

      }
    };
  }, []);

  return <div className="graph" ref={container}></div>;
};
