import {
  Button,
  ButtonGroup,
  Divider,
  Heading,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { networkStore, settingsStore, zoneStore } from "..";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";

export const LeftPanel: React.FunctionComponent = () => {
  const [activeButton, setActiveButton] = useState<number>(0);

  useEffect(() => {
    settingsStore.ActiveCategory = activeButton;
  }, [activeButton]);

  const LatestRedo = observer(() => (
    <ButtonGroup>
      <IconButton
        aria-label="Undo"
        onClick={() => {
          settingsStore.IsLatestRedo = !settingsStore.IsLatestRedo;
        }}
        icon={<ArrowBackIcon />}
      />
      <IconButton
        isDisabled={settingsStore.IsLatestRedo}
        aria-label="Redo"
        icon={<ArrowForwardIcon />}
      />
    </ButtonGroup>
  ));

  return (
    <Stack w={"10em"}>
      <Stack p={5}>
        <Button
          isFullWidth={true}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            networkStore.Desctructor();
            zoneStore.Desctructor();
            settingsStore.Desctructor();
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

        <Divider />

        <Button
          isActive={activeButton === 8}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(8);
          }}
        >
          Export
        </Button>
      </Stack>
      <Stack
        display="flex"
        flexDirection="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <LatestRedo />
      </Stack>
    </Stack>
  );
};
