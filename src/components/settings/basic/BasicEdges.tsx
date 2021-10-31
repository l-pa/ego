import {
  Heading,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { zoneStore } from "../../..";

export function BasicEdges() {

  useEffect(() => {
    zoneStore.Update()
  }, [])

  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Properties
      </Heading>

    </Stack>
  );
}
