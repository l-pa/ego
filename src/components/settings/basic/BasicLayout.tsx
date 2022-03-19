import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { zoneStore } from "../../..";
import { cy } from "../../../objects/graph/Cytoscape";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { graph } from "../../CustomGraph";

export function BasicLayout() {

  const sensibleSettings = forceAtlas2.inferSettings(graph);
  const fa2Layout = new FA2Layout(graph, {
    settings: sensibleSettings,
  });

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
        <option value="FA2">Force atlas 2</option>
        <option value="stop">Stop</option>

      </Select>
      <Button
        isFullWidth={true}
        onClick={() => {
          switch (layoutRef.current?.value) {
            case "FA2":
              fa2Layout.start();
              break;
            case "stop":
              fa2Layout.stop();
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
