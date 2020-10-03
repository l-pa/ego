import cytoscape, { ElementDefinition } from "cytoscape";
import React, { useRef, useEffect } from "react";
import "./style.css";
import { Network } from "../objects/Network";

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

    network.Edges.forEach((edge, i) => {
      edges.current.push({
        data: {
          source: edge.NodeA.Id,
          target: edge.NodeB.Id,
        },
      });
    });

    graph.current = cytoscape({
      container: container.current,
      elements: [...nodes.current, ...edges.current],

      layout: {
        name: "cose",

        fit: true,
        padding: 30,
        boundingBox: undefined,
        animate: true,
        animationDuration: 5000,
      },

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
            "background-color": "lime",
            label: "data(id)",
          },
        },

        {
          selector: ".twdep",
          style: {
            "background-color": "lime",
            label: "data(id)",
          },
        },

        {
          selector: ".owindep",
          style: {
            "background-color": "lime",
            label: "data(id)",
          },
        },

        {
          selector: ".twindep",
          style: {
            "background-color": "lime",
            label: "data(id)",
          },
        },

        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#ccc",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
    });
    return () => {
      console.log("destroy");
      graph.current && graph.current.destroy();
      nodes.current = [];
      edges.current = [];
    };
  }, [network]);

  return <div className="graph" ref={container} />;
};
