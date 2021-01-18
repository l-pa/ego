import { Heading, Select, Stack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React from "react";
import { zoneStore } from "../..";

export function ZonesSuperzone() {
  const ActiveZones = observer(() => (
    <Select
      placeholder="None"
      onChange={(e) => {
        zoneStore.SuperzoneOfZone(
          zoneStore.Zones.filter(
            (z) => z.Ego.Id.toString() === e.target.value
          )[0]
        );
      }}
    >
      {zoneStore.Zones.map((z, i) => {
        return (
          <option key={i} value={z.Ego.Id}>
            {z.Ego.Id}
          </option>
        );
      })}
    </Select>
  ));

  return (
    <Stack>
      <Heading as="h4" size="md" pb={5}>
        Superzone
      </Heading>
      <ActiveZones />
    </Stack>
  );
}
