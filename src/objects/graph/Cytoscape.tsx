import cytoscape, { ElementDefinition } from "cytoscape";
import { networkStore, zoneStore } from "../..";
import EgoZone from "../zone/EgoZone";

export let cy: cytoscape.Core;

export default class Cytoscape {
  constructor(div: HTMLDivElement | null) {
    if (networkStore.Network) {
      Object.keys(networkStore.Network.Edges).forEach(function (key) {
        const e = networkStore.Network!!.Edges[key]
        e.UpdateClasses();
      });

      cy = cytoscape({
        container: div,
        elements: [
          ...Object.keys(networkStore.Network.Nodes).map(function (key) {
            return networkStore.Network?.Nodes[key].PlainObject();
          }) as ElementDefinition[],
          ...Object.keys(networkStore.Network.Edges).map(function (key) {
            return networkStore.Network?.Edges[key].PlainObject();
          }) as ElementDefinition[],
        ],

        wheelSensitivity: 0.15,

        // layout: {
        //   // @ts-ignore
        //   name: "cose-bilkent",
        //   // @ts-ignore
        //   quality: "proof",
        //   // @ts-ignore
        //   nodeRepulsion: 4500,
        //   // @ts-ignore
        //   idealEdgeLength: 100,
        //   // @ts-ignore
        //   edgeElasticity: 0.45,
        //   // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
        //   nestingFactor: 0.1,
        //   // Gravity force (constant)
        //   gravity: 0.25,
        // },
        style: [
          {
            selector: "node",
            style: {
              "text-valign": "center",
              "text-halign": "center",
            },
          },
          {
            selector: ".nodeLabelId",
            style: {
              label: "data(id)",
              "font-size": "5"
            },
          },
          {
            selector: ".nodeLabelNone",
            style: {
            },
          },
          {
            selector: ".nodeLabelText",
            style: {
              label: "data(label)",
            },
          },
          {
            selector: ".hide",
            style: {
              display: "none",
            },
          },
          {
            selector: ".tmpHide",
            style: {
              display: "none",
            },
          },
          {
            selector: ".weaklyProminent",
            style: {
              "background-color": "yellow",
            },
          },

          {
            selector: ".stronglyProminent",
            style: {
              "background-color": "red",
            },
          },

          {
            selector: ".nonProminent",
            style: {
              "background-color": "lime",
            },
          },
          {
            selector: ".coliaisons",
            style: {
              "background-color": "cyan",
            },
          },

          {
            selector: ".liaisons",
            style: {
              "background-color": "blue",
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
              "line-color": "rgb(255, 128, 0)",
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
              "line-color": "rgb(128, 255, 0)",
            },
          },

          {
            selector: ".sptonp",
            style: {
              "line-color": "rgb(128, 128, 0)",
            },
          },

          {
            selector: ".nptonp",
            style: {
              "line-color": "rgb(0, 255, 0)",
            },
          },

          {
            selector: ".egotoinner",
            style: {
              "line-color": "rgb(255, 128, 0)",
            },
          }, {
            selector: ".egotoliaison",
            style: {
              "line-color": "rgb(128, 0, 128)",
            },
          }, {
            selector: ".egotocoliaison",
            style: {
              "line-color": "rgb(128, 128, 128)",
            },
          }, {
            selector: ".innertoinner",
            style: {
              "line-color": "yellow",
            },
          }, {
            selector: ".innertoliaison",
            style: {
              "line-color": "rgb(128, 128, 128)",
            },
          }, {
            selector: ".innertocoliaison",
            style: {
              "line-color": "rgb(128, 255, 128)",
            },
          }, {
            selector: ".liaisontocoliaison",
            style: {
              "line-color": "rgb(0, 128, 255)",
            },
          }, {
            selector: ".liaisontoliaison",
            style: {
              "line-color": "blue",
            },
          }, {
            selector: ".coliaisontocoliaison",
            style: {
              "line-color": "cyan",
            },
          },

          {
            selector: ".owindep",
            style: {
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
              width: "data(weight)",
            },
          },
          {
            selector: ".edgeDependencyLabel",
            style: {
              "source-label": 'data(sourceDependency)',
              "target-label": 'data(targetDependency)',
              // @ts-ignore
              "source-text-rotation": "autorotate",
              // @ts-ignore
              "target-text-rotation": "autorotate",
              "source-text-offset": 35,
              "target-text-offset": 35
            },
          },
          {
            selector: ".edgeWeight",
            style: {
              "label": 'data(weight)',
              // @ts-ignore
              // "source-text-rotation": "autorotate",
              // @ts-ignore
              // "target-text-rotation": "autorotate",
              // "source-text-offset": 35,
              // "target-text-offset": 35
            },
          },
          {
            selector: ".edgeDependencyTargetArrow",
            style: {
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
            },
          },
          {
            selector: ".edgeDependencySourceArrow",
            style: {
              "curve-style": "bezier",
              "source-arrow-shape": "triangle",
            },
          },
        ],
      });

      let z: EgoZone | undefined = undefined;
      cy.on("mouseover", "node", (event) => {
        if (networkStore.Network) {
          z = new EgoZone(

            networkStore.Network.Nodes[event.target._private.data.id]
          );
          zoneStore.ColorNodesInZone(z);
        }
      });

      cy.on("mouseout", "node", (event) => {

        zoneStore.ColorNodesInZones(zoneStore.Zones.concat(zoneStore.TmpZones));

        z = undefined;
      });

      cy.on("click", "node", function (event) {
        if (networkStore.Network) {
          const z = new EgoZone(

            networkStore.Network.Nodes[event.target._private.data.id]

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


      const nodes: string[] = []
      const edges: { source: string, target: string }[] = []

      cy.nodes().forEach(n => {
        nodes.push(n.id())
      })


      cy.edges().forEach(n => {
        edges.push({ source: n.source().id(), target: n.target().id() })
      })


      // @ts-ignore
      const c = jLouvain()
        .nodes(nodes)
        .edges(edges)

      for (const [key, value] of Object.entries(c())) {
        cy.$id(key).attr("louvain", value)
      }
    }
  }
}
