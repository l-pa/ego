import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../..";
import EgoZone from "../../objects/EgoZone";
import Zone from "../../objects/Zone";
import { ZoneItem } from "../../ZoneItem";

export function ZonesSubzone() {
  useEffect(() => {
    return () => {
      zoneStore.Zones.forEach((z) => z.SetAlpha("80"));
      zoneStore.TmpZones.forEach((z) => zoneStore.RemoveTmpZone(z));
    };
  });

  const Zones = observer(() => (
    <div>
      {zoneStore.TmpZones.filter(z => z instanceof EgoZone && !zoneStore.Zones.includes(z)).map((z, i) => {
       return <ZoneItem addButton={true} zone={z as EgoZone} key={i}></ZoneItem>;
      })}
    </div>
  ));

  const addZone = action((zone: Zone) => {
    zoneStore.AddTmpZone(zone);
    zone.DrawZone();
    zone.SetAlpha("10");
  });

  const clearZone = action(() => {
    zoneStore.TmpZones.forEach(z=>z.ClearZone())
    zoneStore.TmpZones.length = 0
  });

  const ActiveZones = observer(() => (
    <Stack>
      <Select
        placeholder="None"
        onChange={(e) => {
          clearZone();
          if (e.target.value) {
            zoneStore.FindZone(e.target.value).SetAlpha("00");
            zoneStore.SubzonesOfZone(
              zoneStore.Zones.filter(
                (z) => z.GetId().toString() === e.target.value
              )[0]
            ).then((res) => {
              
              if (res.length > 0) {
                res.forEach((z) => addZone(z));
            }
            })
          }
        }}
      >
        {zoneStore.Zones.map((z, i) => {
          return <option value={z.GetId()}>{z.GetId()}</option>;
        })}
      </Select>
          </Stack>
  ));

  return (
    <Stack>
      <Heading as="h4" size="md" pb={5}>
        Subzones
      </Heading>
      <ActiveZones />
      
      <Button
        isFullWidth={true}
        onClick={() => {
          zoneStore.TmpZones.forEach((z) => zoneStore.AddZone(z));
          zoneStore.TmpZones.forEach((z) => zoneStore.RemoveTmpZone(z));
        }}
      >
        Add all subzones
      </Button>
      <Divider />
      <Zones />
    </Stack>
  );
}
