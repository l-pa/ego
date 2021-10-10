import React, { useRef, useEffect } from "react";
import "./style.css";

import { networkStore } from "..";
import Cytoscape, { cy } from "../objects/graph/Cytoscape";

export const Graph: React.FunctionComponent = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const aa = new Cytoscape(container.current);
    console.log("CREATED", cy.nodes());

    return () => {
      cy.off("click mouseout mousein render cyCanvas.resize");
      cy.on("destroy", () => {
        networkStore.Network = undefined;

        cy.elements().remove()
        console.log("DESTROYED ", cy.nodes());


        console.log("Cy instance destroyed");
        })
      cy.destroy();

    };
  }, []);

  return <div className="graph" ref={container}></div>;
};
