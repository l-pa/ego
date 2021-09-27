import { Button, Checkbox, Divider, Heading, Stack } from "@chakra-ui/react";
import React from "react";
import { zoneStore } from "../..";
import { mergeCanvas } from "../../objects/export/Export";
import { cy } from "../../objects/graph/Cytoscape";

export function Export() {
  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Export
      </Heading>
      <Divider />
      <Checkbox>Track zones</Checkbox>
      <Button
        isFullWidth={true}
        onClick={() => {
          mergeCanvas();
          // document.write('<img src="' + cy.png({}) + '"/>');
        }}
      >
        PNG
      </Button>
    </Stack>
  );
}
