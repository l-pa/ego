import { Button, Divider, Heading, Stack } from "@chakra-ui/react";
import React from "react";
import { cy } from "../../objects/graph/Cytoscape";

export function Export() {
  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Export
      </Heading>
      <Divider />
      <Button
        isFullWidth={true}
        onClick={() => {
          document.write('<img src="' + cy.png({}) + '"/>');
        }}
      >
        PNG
      </Button>
    </Stack>
  );
}
