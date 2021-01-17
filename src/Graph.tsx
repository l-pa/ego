import cytoscape, { ElementDefinition } from "cytoscape";
import React, { useRef, useEffect } from "react";
import "./style.css";

import Zone from "./objects/Zone";

import { networkStore, zoneStore } from ".";
import Cytoscape, { cy } from "./objects/graph/Cytoscape";


export const Graph: React.FunctionComponent = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aa = new Cytoscape(container.current);

    return () => {
      cy.off("click mouseout mousein render cyCanvas.resize");
      cy.destroy();

      networkStore.Network = undefined;
    };
  }, []);

  return <div className="graph" ref={container}></div>;
};
