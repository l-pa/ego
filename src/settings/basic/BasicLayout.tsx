import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import React, { useRef } from "react";
import { cy } from "../../objects/graph/Cytoscape";

export function BasicLayout() {
  const layoutRef = useRef<HTMLSelectElement>(null);
  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Layout
      </Heading>
      <Select ref={layoutRef} mb={5} placeholder="Select layout">
        <option value="cola">Cola</option>
        <option value="random">Random</option>
      </Select>

      <Button
        isFullWidth={true}
        onClick={() => {
          switch (layoutRef.current?.value) {
            case "cola":
              cy.layout({ name: "cola" }).run();
              break;
            case "random":
              cy.layout({ name: "random" }).run();
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
