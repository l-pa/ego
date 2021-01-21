import { Button, Heading, Stack } from "@chakra-ui/react";
import React from "react";
import { settingsStore } from "..";

export const LeftPanel: React.FunctionComponent = () => {
  return (
    <Stack p={5} w={"10em"}>
      <Heading as="h5" size="sm">
        Basic
      </Heading>
      <Button
        isActive={true}
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={(e) => {
          settingsStore.SelectedOption = "basicZones";
        }}
      >
        Zones
      </Button>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "basicNodes";
        }}
      >
        Nodes
      </Button>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "basicEdges";
        }}
      >
        Edges
      </Button>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "basicLayout";
        }}
      >
        Layout
      </Button>

      <Heading as="h5" size="sm">
        Zones
      </Heading>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "zonesMax";
        }}
      >
        Max
      </Button>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "zonesMin";
        }}
      >
        Min
      </Button>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "zonesSubzone";
        }}
      >
        Subzone
      </Button>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "zonesSuperzone";
        }}
      >
        Superzone
      </Button>
      <Button
        isFullWidth={true}
        colorScheme="teal"
        variant="ghost"
        onClick={() => {
          settingsStore.SelectedOption = "zonesIntersect";
        }}
      >
        Intersect
      </Button>
    </Stack>
  );
};
