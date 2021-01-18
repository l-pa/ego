import { Select, Stack } from "@chakra-ui/react";
import React from "react";
import { zoneStore } from "../..";

export function ZonesIntersect() {
  return (
    <Stack>
      <Select placeholder="None" onChange={(e) => {}}>
        {zoneStore.Zones.map((z, i) => {
          return <option value={i}>{z.Ego.Id}</option>;
        })}
      </Select>
    </Stack>
  );
}
