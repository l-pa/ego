import cytoscape, { ElementDefinition } from "cytoscape";
import React, { useRef, useEffect } from "react";
import "./style.css";
// @ts-ignore
import cola from "cytoscape-cola";

import Zone from "./objects/Zone";
import { networkStore, zoneStore } from ".";

const automove = require("cytoscape-automove");
const cycanvas = require("cytoscape-canvas");

cytoscape.use(automove);
cytoscape.use(cycanvas);
cytoscape.use(cola);

export let cy: cytoscape.Core;

export const Graph: React.FunctionComponent = () => {
  const container = useRef<HTMLDivElement>(null);
  const nodes = useRef<ElementDefinition[]>([]);
  const edges = useRef<ElementDefinition[]>([]);

  useEffect(() => {
    networkStore.Network?.Nodes.forEach((node) => {
      nodes.current.push({
        data: {
          id: node.Id.toString(),
          nodeType:
            node.isProminent() !== -1
              ? node.isProminent() === 1
                ? "weaklyProminent"
                : "stronglyProminent"
              : "nonProminent",
        },
        classes:
          node.isProminent() !== -1
            ? node.isProminent() === 1
              ? "weaklyProminent"
              : "stronglyProminent"
            : "nonProminent",
      });
    });

    // networkStore.Network?.Edges.forEach((edge, i) => {
    //   edges.current.push({
    //     data: {
    //       source: edge.NodeA.Id,
    //       target: edge.NodeB.Id,
    //     },
    //   });
    // });

    networkStore.Network?.Nodes.forEach((node) => {
      node.OwDep.forEach((owdep) => {
        edges.current.push({
          data: {
            source: node.Id.toString(),
            target: owdep.Id.toString(),
          },
          classes: "owdep",
        });
      });

      node.OwInDep.forEach((owindep) => {
        edges.current.push({
          data: {
            target: node.Id.toString(),
            source: owindep.Id.toString(),
          },
          classes: "owindep",
        });
      });

      node.TwDep.forEach((twdep) => {
        edges.current.push({
          data: {
            source: node.Id.toString(),
            target: twdep.Id.toString(),
          },
          classes: "twdep",
        });
      });

      node.TwInDep.forEach((twindep) => {
        edges.current.push({
          data: {
            source: node.Id.toString(),
            target: twindep.Id.toString(),
          },
          classes: "twindep",
        });
      });

      // edges.current.forEach((e) => {
      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === 1 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === 1
      //   ) {
      //     e.classes = e.classes + " wptowp";
      //   }

      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === 0 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === 0
      //   ) {
      //     e.classes = e.classes + " sptosp";
      //   }

      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === -1 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === -1
      //   ) {
      //     e.classes = e.classes + " nptonp";
      //   }
      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === 0 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === 1
      //   ) {
      //     e.classes = e.classes + " sptowp";
      //   }

      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === 1 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === 0
      //   ) {
      //     e.classes = e.classes + " sptowp";
      //   }

      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === -1 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === 1
      //   ) {
      //     e.classes = e.classes + " wptonp";
      //   }

      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === 1 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === -1
      //   ) {
      //     e.classes = e.classes + " wptonp";
      //   }

      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === -1 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === 0
      //   ) {
      //     e.classes = e.classes + " sptonp";
      //   }

      //   if (
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.source
      //     )[0].isProminent() === 0 &&
      //     networkStore.Network?.Nodes.filter(
      //       (n) => n.Id === e.data.target
      //     )[0].isProminent() === -1
      //   ) {
      //     e.classes = e.classes + " sptonp";
      //   }
      // });
    });

    cy = cytoscape({
      container: container.current,
      elements: [...nodes.current, ...edges.current],
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
    // store.getState().cyReducer.cy.elements().makeLayout({ name: "cose-bilkent" }).start();
    let z: Zone | undefined = undefined;
    cy.on("mouseover", "node", (event) => {
      if (networkStore.Network) {
        z = new Zone(
          networkStore.Network.Nodes.filter(
            (e) => e.Id.toString() === event.target._private.data.id
          )[0]
        );
        zoneStore.ColorNodesInZone(z);
      }
    });

    cy.on("mouseout", "node", (event) => {
      zoneStore.ColorNodesInZones();
      z = undefined;
    });

    cy.on("click", "node", function (event) {
      if (networkStore.Network) {
        const z = new Zone(
          networkStore.Network.Nodes.filter(
            (e) => e.Id === event.target._private.data.id
          )[0]
        );
        zoneStore.AddZone(z);
        z.drawZone();
      }
    });

    cy.on("render cyCanvas.resize", (evt: cytoscape.EventObject) => {
      zoneStore.Zones.forEach((z) => {
        z.updatePath();
      });
    });

    return () => {
      cy.off("click mouseout mousein render cyCanvas.resize");
      cy.destroy();

      networkStore.Network = undefined;
    };
  }, []);

  return <div className="graph" ref={container}></div>;
};
