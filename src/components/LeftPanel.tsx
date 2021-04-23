import { Button, Heading, Stack } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { networkStore, settingsStore, zoneStore } from "..";

export const LeftPanel: React.FunctionComponent = () => {
  
  const [activeButton, setActiveButton] = useState<number>(0);

  useEffect(() => {
    settingsStore.ActiveCategory = activeButton
  }, [activeButton])

  return (
    <Stack p={5} w={"10em"}>
      <Button
        isFullWidth={true}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          networkStore.Desctructor()
          zoneStore.Desctructor()
          settingsStore.Desctructor()
        }}
      >
        ❌
      </Button>
      <Heading as="h5" size="sm">
        Basic
      </Heading>
      <Button
        isActive={activeButton === 0}
        isFullWidth={true}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(0);
        }}
      >
        Zones
      </Button>
      <Button
        isActive={activeButton === 1}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(1);
        }}
      >
        Nodes
      </Button>
      <Button
        isActive={activeButton === 2}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(2);
        }}
      >
        Edges
      </Button>
      <Button
        isActive={activeButton === 3}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(3);
        }}
      >
        Layout
      </Button>

      <Heading as="h5" size="sm">
        Set operations
      </Heading>
      <Button
        isActive={activeButton === 4}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(4);
        }}
      >
        Max
      </Button>

      <Button
        isActive={activeButton === 5}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(5);
        }}
      >
        Subzone
      </Button>
      <Button
        isActive={activeButton === 6}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(6);
        }}
      >
        Superzone
      </Button>
      <Button
        isActive={activeButton === 7}
        colorScheme="primary"
        variant="ghost"
        onClick={() => {
          setActiveButton(7);
        }}
      >
        Intersect
      </Button>
    </Stack>
  );
};
