import cytoscape, { ElementDefinition } from "cytoscape";
import React, { useRef, useEffect, useContext, useState } from "react";
import "./style.css";
import { Network } from "../objects/Network";
import { Zone } from "../objects/Zone";
import { AppContext } from "../context/ZoneContext";

import { Types } from "../reducers";
import { GraphContext } from "../context/GraphContext";

const cola = require("cytoscape-cola");
const cise = require("cytoscape-cise");
const cose = require("cytoscape-cose-bilkent");
const fcose = require("cytoscape-fcose");

const automove = require("cytoscape-automove");


const iwanthue = require("iwanthue");

const cycanvas = require("cytoscape-canvas");

cytoscape.use(cola);
cytoscape.use(cise);
cytoscape.use(cose);
cytoscape.use(fcose);

cytoscape.use(automove);
cytoscape.use(cycanvas);


export const Graph: React.FunctionComponent<{
  network: Network;
}> = ({ network }) => {
  
  const {dispatch, state} = useContext(AppContext)
  const {graphDispatch,graphState} = useContext(GraphContext)

  
  const graph = useRef<cytoscape.Core>();
  const container = useRef<HTMLDivElement>(null);

//  const [zones, setZones] = useState<Zone[]>([]);

  const alpha = useRef<string>();

  const nodes = useRef<ElementDefinition[]>([]);
  const edges = useRef<ElementDefinition[]>([]);

  useEffect(() => {
    network.Nodes.forEach((node) => {
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

      edges.current.forEach(e => {

        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === 1 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === 1) {
          e.classes = e.classes + " wptowp"
        }

        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === 0 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === 0) {
          e.classes = e.classes + " sptosp"
        }

        
        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === -1 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === -1) {
          e.classes = e.classes + " nptonp"
        }
        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === 0 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === 1) {
          e.classes = e.classes + " sptowp"
        }

        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === 1 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === 0) {
          e.classes = e.classes + " sptowp"
        }

        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === -1 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === 1) {
          e.classes = e.classes + " wptonp"
        }

        
        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === 1 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === -1) {
          e.classes = e.classes + " wptonp"
        }

        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === -1 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === 0) {
          e.classes = e.classes + " sptonp"
        }

        if (network.Nodes.filter(n => n.Id === e.data.source)[0].isProminent() === 0 && network.Nodes.filter(n => n.Id === e.data.target)[0].isProminent() === -1) {
          e.classes = e.classes + " sptonp"
        }



        
      })

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
          selector: ".hide",
          style: {
            display: "none"
          },
        },

        {
          selector: ".show",
          style: {
            display: "displayed"
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

    graphDispatch({
      type:Types.Add,
      payload:{
        graph:graph.current
      }
    })
    
    graph.current
      .elements()
      .makeLayout({ name: "cose-bilkent" })
      .start();

    graph.current.on("mouseover", "node", (event) => {
      
      if (graph.current) {
        const z = new Zone(
          network.Nodes.filter(
            (e) => e.Id.toString() === event.target._private.data.id
          )[0]
        );

        graph.current.elements("node").forEach((element) => {
          element.classes("");
        });

        for (let i = 1; i < z.innerZoneNodes.length; i++) {
          const node = z.innerZoneNodes[i];

          graph.current
            .elements(`[id ='${node.Id.toString()}']`)
            .addClass("weaklyProminent");
        }

        for (let i = 0; i < z.outerZoneNodes[0].length; i++) {
          const node = z.outerZoneNodes[0][i];
          graph.current
            .elements(`[id ='${node.Id.toString()}']`)
            .addClass("liaisons");
        }
        for (let i = 0; i < z.outerZoneNodes[1].length; i++) {
          const node = z.outerZoneNodes[1][i];
          graph.current
            .elements(`[id ='${node.Id.toString()}']`)
            .addClass("coliaisons");
        }

        graph.current.elements("node").forEach((element) => {
          if (element.classes().length === 0) {
            element.classes("nonProminent");
          }
        });
      }
    });

    graph.current.on("mouseout", "node", (event) => {
      if (graph.current) {
        
        graph.current.elements("node").forEach((element) => {
          element.classes(element.data().nodeType);
        });
        
      }
    });

    graph.current.on("click", "node", function (event) {      
      const z = new Zone(network.Nodes.filter(
        (e) => e.Id === event.target._private.data.id
      )[0], graph.current
      )
      
      dispatch({
        type: Types.Add,
        payload: {
          zone: z 
      }
      })
      z.drawZone()
     
/*

      zoneContext.setZones((a) => {
        if (
          a.filter((e) => e.Ego.Id === event.target._private.data.id).length < 1
        ) {
          return [
            ...a,
            new Zone(
              network.Nodes.filter(
                (e) => e.Id === event.target._private.data.id
              )[0]
            ),
          ];
        } else {
          return a;
        }
      });*/
    });

    return () => {
      if (graph.current) {
        graph.current.off('click mouseout mousein')
        graph.current.destroy();
      }
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
