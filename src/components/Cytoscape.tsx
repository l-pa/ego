import cytoscape, { ElementDefinition } from "cytoscape";
import React, { useRef, useEffect } from "react";
import "./style.css";
import { Network } from "../objects/Network";
import { Button } from "@chakra-ui/core";

const cola = require("cytoscape-cola");

cytoscape.use(cola);

export const Graph: React.FunctionComponent<{
  network: Network;
}> = ({ network }) => {
  const graph = useRef<cytoscape.Core>();
  const container = useRef<HTMLDivElement>(null);

  const nodes = useRef<ElementDefinition[]>([]);
  const edges = useRef<ElementDefinition[]>([]);

  useEffect(() => {
    network.Nodes.forEach((node) => {
      nodes.current.push({
        data: { id: node.Id.toString() },
        classes:
          node.isProminent() !== -1
            ? node.isProminent() === 1
              ? "weaklyProminent"
              : "stronglyProminent"
            : "nonProminent",
      });
    });
    /*
    network.Edges.forEach((edge, i) => {
      edges.current.push({
        data: {
          source: edge.NodeA.Id,
          target: edge.NodeB.Id,
        },
      });
    });
    */

    network.Nodes.forEach((node) => {
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
    });

    graph.current = cytoscape({
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
          selector: ".owdep",
          style: {
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "straight",
          },
        },

        {
          selector: ".twdep",
          style: {
            "line-color": "purple",
            "target-arrow-color": "purple",
            "target-arrow-shape": "triangle",
            "source-arrow-color": "purple",
            "source-arrow-shape": "triangle",
            "curve-style": "straight",
          },
        },

        {
          selector: ".owindep",
          style: {
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "straight",
          },
        },

        {
          selector: ".twindep",
          style: {
            "line-color": "grey",
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

    graph.current.elements().makeLayout({ name: "cola" }).start();

    return () => {
      console.log("destroy");
      graph.current && graph.current.destroy();
      nodes.current = [];
      edges.current = [];
    };
  }, [network]);

  return (
    <div>
      <div className="graph" ref={container}></div>
    </div>
  );
};
