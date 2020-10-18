import cytoscape, { ElementDefinition } from "cytoscape";
import React, { useRef, useEffect, useContext } from "react";
import "./style.css";
import { Network } from "../objects/Network";
import { Zone } from "../objects/Zone";
import { ZoneContext } from "../context/ZoneContext";
import {
  BubbleSetPath,
  bubbleSets,
  BubbleSetsPlugin,
} from "cytoscape-bubblesets";

import {
  Button,
  Stack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Box,
} from "@chakra-ui/core";

const cola = require("cytoscape-cola");

const iwanthue = require("iwanthue");

cytoscape.use(cola);

export const Graph: React.FunctionComponent<{
  network: Network;
}> = ({ network }) => {
  const graph = useRef<cytoscape.Core>();
  const container = useRef<HTMLDivElement>(null);

  const alpha = useRef<string>();

  const nodes = useRef<ElementDefinition[]>([]);
  const edges = useRef<ElementDefinition[]>([]);

  const bubbleSetPlugin = useRef<BubbleSetsPlugin>();

  const zoneContext = useContext(ZoneContext);

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

    graph.current
      .elements()
      .makeLayout({ name: "cola", randomize: true, padding: 30 })
      .start();

    bubbleSetPlugin.current = new BubbleSetsPlugin(graph.current);

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
      if (
        zoneContext.zones.filter(
          (e) => e.Ego.Id === event.target._private.data.id
        ).length < 1
      ) {
        zoneContext.zones.push(
          new Zone(
            network.Nodes.filter(
              (e) => e.Id === event.target._private.data.id
            )[0],
            graph.current,
            bubbleSetPlugin.current,
            iwanthue(nodes.current.length)[event.target._private.data.id]
          )
        );
      }
    });

    return () => {
      if (graph.current) {
        graph.current.destroy();
      }
      nodes.current = [];
      edges.current = [];
    };
  }, [network]);

  return (
    <div>
      <Stack align="center" isInline={true} spacing="10" justify="center">
        <Button
          onClick={() => {
            zoneContext.zones.forEach((z) => {
              z.clearPath();
            });
            zoneContext.zones = [];
            network.Nodes.forEach((n) => {
              if (n.isProminent() === 0 || n.isProminent() === 1) {
                zoneContext.zones.push(
                  new Zone(
                    n,
                    graph.current,
                    bubbleSetPlugin.current,
                    iwanthue(nodes.current.length)[n.Id - 1],
                    alpha.current
                  )
                );
              }
            });
          }}
        >
          Prominent zones
        </Button>

        <Button
          onClick={() => {
            zoneContext.zones.forEach((z) => {
              z.clearPath();
            });
            zoneContext.zones = [];
          }}
        >
          Clear zones
        </Button>
        <Slider
          color="pink"
          defaultValue={50}
          width={250}
          onChange={(val) => {
            alpha.current = Number.parseInt(
              (255 * (val / 100)).toString()
            ).toString(16);

            zoneContext.zones.forEach((z) => {
              if (alpha.current) {
                z.Alpha = alpha.current;
                z.updatePath();
              }
            });
          }}
        >
          <SliderTrack />
          <SliderFilledTrack />
          <SliderThumb />
        </Slider>
      </Stack>
      <div className="graph" ref={container}></div>
    </div>
  );
};
