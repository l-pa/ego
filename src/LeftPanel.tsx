import {
  Button,
  Heading,
  ListItem,
  Stack,
  UnorderedList,
} from "@chakra-ui/react";
import react from "react";
import { Flex, Spacer, Box } from "@chakra-ui/react";
import React from "react";

export const LeftPanel: React.FunctionComponent = () => {
  return (
    <Stack p={5} w={"10em"}>
      <Heading as="h5" size="sm">
        Basic
      </Heading>
      <Button isFullWidth={true} colorScheme="teal" variant="ghost">
        Groups
      </Button>
      <Button isFullWidth={true} colorScheme="teal" variant="ghost">
        Nodes
      </Button>
      <Button isFullWidth={true} colorScheme="teal" variant="ghost">
        Edges
      </Button>

      <Heading as="h5" size="sm">
        Zones
      </Heading>
      <Button isFullWidth={true} colorScheme="teal" variant="ghost">
        Groups
      </Button>
      <Button isFullWidth={true} colorScheme="teal" variant="ghost">
        Nodes
      </Button>
      <Button isFullWidth={true} colorScheme="teal" variant="ghost">
        Edges
      </Button>
    </Stack>
  );
};
