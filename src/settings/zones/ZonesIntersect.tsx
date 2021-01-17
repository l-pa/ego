import { Button, Select, Stack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { zoneStore } from "../..";

export function ZonesIntersect() {
  const [z, setZ] = useState([]);
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
