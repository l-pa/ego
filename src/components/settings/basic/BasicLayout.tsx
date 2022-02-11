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


      </Select>

      <Button
        isFullWidth={true}
        onClick={() => {
          switch (layoutRef.current?.value) {
            case "cola":
              //@ts-ignore
              cy.layout({ name: "cola", nodeSpacing: function (node) { return 20; }, }).run();
              break;
            case "random":
              cy.layout({ name: "random" }).run();
              break;
            case "cise":
              cy.layout({ name: "cise" }).run();
              break;

            case "fcose":
              cy.layout({
                // @ts-ignore
                name: "fcose", quality: "default", nodeRepulsion: node => 5500, idealEdgeLength: edge => 100, edgeElasticity: edge => 0.5, numIter: 4000
              }).run();
              break;

            case "euler":
              cy.layout({ name: "euler" }).run();
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
