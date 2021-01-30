import { Button, Heading, Stack } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { settingsStore } from "..";

export const LeftPanel: React.FunctionComponent = () => {
  
  const [activeButton, setActiveButton] = useState<string>("basicZones");

  return (
    <Stack p={5} w={"10em"}>
      <Heading as="h5" size="sm">
        Basic
      </Heading>
      <Button
        isActive={activeButton === "basicZones"}
        isFullWidth={true}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("basicZones");
          settingsStore.SelectedOption = "basicZones"
        }}
      >
        Zones
      </Button>
      <Button
        isActive={activeButton === "basicNodes"}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("basicNodes");
          settingsStore.SelectedOption = "basicNodes"

        }}
      >
        Nodes
      </Button>
      <Button
        isActive={activeButton === "basicEdges"}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("basicEdges");
          settingsStore.SelectedOption = "basicEdges"

        }}
      >
        Edges
      </Button>
      <Button
        isActive={activeButton === "basicLayout"}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("basicLayout");
          settingsStore.SelectedOption = "basicLayout"

        }}
      >
        Layout
      </Button>

      <Heading as="h5" size="sm">
        Set operations
      </Heading>
      <Button
        isActive={activeButton === "zonesMax"}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("zonesMax");
          settingsStore.SelectedOption = "zonesMax"

        }}
      >
        Max
      </Button>

      <Button
        isActive={activeButton === "zonesSubzone"}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("zonesSubzone");
          settingsStore.SelectedOption = "zonesSubzone"

        }}
      >
        Subzone
      </Button>
      <Button
        isActive={activeButton === "zonesSuperzone"}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("zonesSuperzone");
          settingsStore.SelectedOption = "zonesSuperzone"

        }}
      >
        Superzone
      </Button>
      <Button
        isActive={activeButton === "zonesIntersect"}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton("zonesIntersect");
          settingsStore.SelectedOption = "zonesIntersect"

        }}
      >
        Intersect
      </Button>
    </Stack>
  );
};
