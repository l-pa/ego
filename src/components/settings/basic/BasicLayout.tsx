import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { zoneStore } from "../../..";
import { cy } from "../../../objects/graph/Cytoscape";

export function BasicLayout() {

  useEffect(() => {
    zoneStore.Update()
  }, [])

  const layoutRef = useRef<HTMLSelectElement>(null);
  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Layout
      </Heading>
      <Select ref={layoutRef} mb={5} placeholder="Select layout">
        <option value="cola">Cola</option>
        <option value="random">Random</option>
        <option value="stack">Stack</option>
        <option value="cise">Cise</option>
        <option value="fcose">Fcose</option>
        <option value="euler">Euler</option>
        <option value="cose-bilkent">Cose-bilkent</option>
        <option value="concentric">concentric</option>
        <option value="avsdf">avsdf </option>



      </Select>
      <Button
        isFullWidth={true}
        onClick={() => {
          switch (layoutRef.current?.value) {
            case "cola":
              //@ts-ignore
              cy.layout({ name: "cola", nodeSpacing: function (node) { return 25; }, edgeLength: function (e) { return 5; } }).run();
              break;
            case "avsdf":
              //@ts-ignore
              cy.layout({ name: "avsdf", nodeSeparation: 60 }).run();
              break;
            case "concentric":
              //@ts-ignore
              cy.layout({ name: "concentric" }).run();
              break;
            case "cose-bilkent":
              cy.layout({
                //@ts-ignore
                name: "cose-bilkent", nodeRepulsion: 4500, idealEdgeLength: 300, edgeElasticity: 0.4, nestingFactor: 0.5, numIter: 5000, gravityRange: 10,
                initialEnergyOnIncremental: 0.1
              }).run();
              break;
            case "random":
              cy.layout({ name: "random" }).run();
              break;
            case "cise":
              //@ts-ignore
              cy.layout({ name: "cise", animate: true, idealEdgeLength: 500, animationDuration: 1, nodeSeparation: 15, idealInterClusterEdgeLengthCoefficient: 2, allowNodesInsideCircle: false, maxRatioOfNodesInsideCircle: 0.1, springCoeff: 0.15, nodeRepulsion: 3000, gravity: 0.1, gravityRange: 3.8 }).run();
              break;

            case "fcose":
              cy.layout({
                // @ts-ignore
                name: "fcose", quality: "proof", nodeRepulsion: node => 5500, idealEdgeLength: edge => 100, edgeElasticity: edge => 0.5, numIter: 4000
              }).run();
              break;

            case "euler":
              // @ts-ignore
              cy.layout({ name: "euler", springCoeff: edge => 0.0005, springLength: edge => 120, gravity: -2 }).run();
              break;
            case "stack":
              cy.nodes().forEach((n, i) => {
                n.position("x", i * 5)
                n.position("y", i * 5)
              })
              break;

            default:
              break;
          }
        }}
      >
        Apply
      </Button>

      <Divider></Divider>
      <Button
        mt={5}
        isFullWidth={true}
        onClick={() => {
          cy.fit();
        }}
      >
        Reset view
      </Button>
    </Stack>
  );
}
