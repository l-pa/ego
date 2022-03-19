//@ts-nocheck

import React, { useRef, useEffect } from "react";
import "./style.css";
import Sigma from "sigma";
import Graph from "graphology";
import { networkStore } from "..";
import chroma from "chroma-js";
import { NodeProminency } from "../objects/network/Node";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import EgoZone from "../objects/zone/EgoZone";

export let graph: Graph<Attributes, Attributes, Attributes>;

export const CustomGraph: React.FunctionComponent = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    graph = new Graph();

    for (const key in networkStore.Network?.Nodes) {
      const element = networkStore.Network?.Nodes[key];
      switch (element?.isProminent()) {
        case NodeProminency.StronglyProminent:
          graph.addNode(element?.Id, { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100), size: 10, color: "red", label: element.Id });
          break;
        case NodeProminency.WeaklyProminent:
          graph.addNode(element?.Id, { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100), size: 10, color: "yellow", label: element.Id });
          break;
        case NodeProminency.NonProminent:
          graph.addNode(element?.Id, { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100), size: 10, color: "green", label: element.Id });
          break;

        default:
          break;
      }
    }

    for (const key in networkStore.Network?.Edges) {
      const element = networkStore.Network?.Edges[key];
      graph.addEdge(element?.GetNodeA().Id, element?.GetNodeB().Id);
    }

    const renderer = new Sigma(graph, container.current, {
      minCameraRatio: 0.1,
      maxCameraRatio: 10,
    });

    const camera = renderer.getCamera();
    renderer.on('clickNode', ({ node }) => {
      if (networkStore.Network) {
        const z = new EgoZone(

          networkStore.Network.Nodes[node]

        );
        zoneStore.AddZone(z);
      }
    });

    // return () => {
    //   cy.off("click mouseout mousein render cyCanvas.resize");
    //   cy.on("destroy", () => {
    //     networkStore.Network = undefined;

    //     cy.elements().remove()
    //     console.log("DESTROYED ", cy.nodes());


    //     console.log("Cy instance destroyed");
    //     })
    //   cy.destroy();

    // };
  }, []);

  return <div className="graph" ref={container}></div>;
};
