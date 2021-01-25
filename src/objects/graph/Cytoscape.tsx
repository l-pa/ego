import cytoscape from "cytoscape";
// @ts-ignore
import cola from "cytoscape-cola";
// @ts-ignore
import coseBilkent from "cytoscape-cose-bilkent";
import { networkStore, zoneStore } from "../..";
import Edge from "../Edge";
import EgoZone from "../EgoZone";

export let cy: cytoscape.Core;

export default class Cytoscape {
  constructor(div: HTMLDivElement | null) {
    if (networkStore.Network) {
      networkStore.Network.Edges.forEach((e: Edge) => {
        e.UpdateClasses();
      });

      const automove = require("cytoscape-automove");
      const cycanvas = require("cytoscape-canvas");

      cytoscape.use(automove);
      cytoscape.use(cycanvas);
      cytoscape.use(cola);
      cytoscape.use(coseBilkent);
      
      cy = cytoscape({
        container: div,
        elements: [
          ...networkStore.Network.Nodes.map((e) => e.PlainObject()),
          ...networkStore.Network.Edges.map((e) => e.PlainObject()),
        ],
        layout: {
          // @ts-ignore
          name: "cose-bilkent",
          // @ts-ignore
          quality: "proof",
          // @ts-ignore
          nodeRepulsion: 4500,
          // @ts-ignore
          idealEdgeLength: 100,
          // @ts-ignore
          edgeElasticity: 0.45,
          // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
          nestingFactor: 0.1,
          // Gravity force (constant)
          gravity: 0.25,
        },
        //  wheelSensitivity: 0.3,
        style: [
          // the stylesheet for the graph
          {
            selector: "node",
            style: {
              label: "data(id)",
              "text-valign": "center",
              "text-halign": "center",
            },
          },
          {
            selector: ".hide",
            style: {
              display: "none",
            },
          },
          {
            selector: ".weaklyProminent",
            style: {
              "background-color": "yellow",
              label: "data(id)",
            },
          },

          {
            selector: ".stronglyProminent",
            style: {
              "background-color": "red",
              label: "data(id)",
            },
          },

          {
            selector: ".nonProminent",
            style: {
              "background-color": "lime",
              label: "data(id)",
            },
          },
          {
            selector: ".coliaisons",
            style: {
              "background-color": "cyan",
              label: "data(id)",
            },
          },

          {
            selector: ".liaisons",
            style: {
              "background-color": "blue",
              label: "data(id)",
            },
          },

          {
            selector: ".owdep",
            style: {
              "target-arrow-shape": "triangle",
              "curve-style": "straight",
            },
          },
          {
            selector: ".twdep",
            style: {
              "target-arrow-shape": "triangle",
              "source-arrow-shape": "triangle",
              "curve-style": "straight",
            },
          },

          {
            selector: ".sptowp",
            style: {
              "line-color": "orange",
            },
          },

          {
            selector: ".sptosp",
            style: {
              "line-color": "red",
            },
          },

          {
            selector: ".wptowp",
            style: {
              "line-color": "yellow",
            },
          },

          {
            selector: ".wptonp",
            style: {
              "line-color": "lime",
            },
          },

          {
            selector: ".sptonp",
            style: {
              "line-color": "brown",
            },
          },

          {
            selector: ".nptonp",
            style: {
              "line-color": "green",
            },
          },

          {
            selector: ".owindep",
            style: {
              "target-arrow-color": "#ccc",
              "target-arrow-shape": "triangle",
              "curve-style": "straight",
            },
          },

          {
            selector: ".twindep",
            style: {
              "curve-style": "straight",
            },
          },

          {
            selector: "edge",
            style: {
              width: 3,
            },
          },
        ],
      });


      let z: EgoZone | undefined = undefined;
      cy.on("mouseover", "node", (event) => {
        if (networkStore.Network) {
          z = new EgoZone(
            networkStore.Network.Nodes.filter(
              (e) => e.Id.toString() === event.target._private.data.id
            )[0]
          );
          zoneStore.ColorNodesInZone(z);
        }
      });

      cy.on("mouseout", "node", (event) => {
        zoneStore.ColorNodesInZones(zoneStore.Zones);
        // zoneStore.ColorNodesInZones(zoneStore.TmpZones);
        console.log(zoneStore.Zones);
        console.log(zoneStore.TmpZones);

        z = undefined;
      });

      cy.on("click", "node", function (event) {
        if (networkStore.Network) {
          const z = new EgoZone(
            networkStore.Network.Nodes.filter(
              (e) => e.Id === event.target._private.data.id
            )[0]
          );
          zoneStore.AddZone(z);
        }
      });

      cy.on("click", "edge", function (event) {});

      cy.on("render cyCanvas.resize", (evt: cytoscape.EventObject) => {
        zoneStore.Zones.forEach((z) => {
          z.Update();
        });

        zoneStore.TmpZones.forEach((z) => {
          z.Update();
        });
      });
    }
  }
}
