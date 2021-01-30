import React, { useRef, useEffect } from "react";
import "./style.css";

import { networkStore } from "..";
import Cytoscape, { cy } from "../objects/graph/Cytoscape";

export const Graph: React.FunctionComponent = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const aa = new Cytoscape(container.current);

    return () => {
      cy.off("click mouseout mousein render cyCanvas.resize");
      console.log("Cy instance destroyed");
      cy.destroy();

      networkStore.Network = undefined;
    };
  }, []);

  return <div className="graph" ref={container}></div>;
};
