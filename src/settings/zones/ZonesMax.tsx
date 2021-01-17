import { Button, Heading, Select, Stack, Text } from "@chakra-ui/react";
import { autorun, observe } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { zoneStore } from "../..";
import { ZoneItem } from "../../ZoneItem";

export function ZonesMax() {
  useEffect(() => {
    return () => {};
  });

  autorun(() => {
    console.log(zoneStore.Zones);
  });

  const LargestZone = observer(() => {
    return (
      <ZoneItem
        zone={
          [...zoneStore.Zones].sort(
            (a, b) => b.AllCollection.length - a.AllCollection.length
          )[0]
        }
      ></ZoneItem>
    );
  });

  return (
    <Stack>
      <Heading as="h4" size="md" pb={5}>
        Max zone
      </Heading>
      {zoneStore.Zones.length > 0 && <LargestZone />}
    </Stack>
  );
}
