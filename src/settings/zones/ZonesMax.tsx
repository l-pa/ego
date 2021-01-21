import { Heading, Stack } from "@chakra-ui/react";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../..";
import EgoZone from "../../objects/EgoZone";
import { ZoneItem } from "../../components/ZoneItem";

export function ZonesMax() {
  useEffect(() => {
    return () => {
      zoneStore.Zones.forEach((z) => {
        z.DrawZone()
      })
    };
  });

  autorun(() => {
    console.log(zoneStore.Zones);
  });

  const LargestZone = observer(() => {
    if (zoneStore.Zones.length > 0) {
      let largestZone = [...zoneStore.Zones].filter(
        (z) => z instanceof EgoZone
      );
      const largestEgoZone = largestZone.sort(
        (a, b) => b.AllCollection().length - a.AllCollection().length
      )[0] as EgoZone;
      zoneStore.HideAllZones()

      largestEgoZone.DrawZone()
      
      return <ZoneItem zone={largestEgoZone}></ZoneItem>;
    } else {
      return <Heading size="sm">Select at least one zone</Heading>;;
    }
  });

  return (
    <Stack>
      <Heading as="h4" size="md" pb={5}>
        Max zone
      </Heading>
      <LargestZone />
    </Stack>
  );
}
