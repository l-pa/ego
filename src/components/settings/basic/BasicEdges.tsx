import {
  Heading,
  Stack,
  Switch,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { settingsStore, zoneStore } from "../../..";

export function BasicEdges() {

  useEffect(() => {
    zoneStore.Update()
  }, [])

  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Properties
      </Heading>

      <Switch defaultChecked={settingsStore.ShowEdgeWeight} onChange={(v) => {
        settingsStore.ShowEdgeWeight = v.target.checked
      }}>Show edges weight</Switch>

    </Stack>
  );
}
