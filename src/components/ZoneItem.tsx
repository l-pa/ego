import React from "react";
import { Zone } from "../objects/Zone";
import { Stack, Heading } from "@chakra-ui/core";

export const ZoneItem: React.FunctionComponent<{ zone: Zone }> = ({ zone }) => {
  return (
    <Stack>
      <Heading>{zone.Ego.Id}</Heading>
    </Stack>
  );
};
