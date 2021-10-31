import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import { action, autorun, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../../..";
import EgoZone from "../../../objects/zone/EgoZone";
import Zone from "../../../objects/zone/Zone";
import { ZoneItem } from "../../ZoneItem";

export function ZonesSubzone() {
  useEffect(() => {
    zoneStore.HideAllZones()

    const r = reaction(() => zoneStore.Zones.slice(), () => {
      zoneStore.HideZones()
    })

    return () => {
      zoneStore.ClearTmpZones()
      r()
    };
  }, []);

  const Zones = observer(() => (
    <div>
      {
        zoneStore.Difference(zoneStore.Filter(zoneStore.TmpZones.concat(zoneStore.Zones)).zones, zoneStore.Zones).sort((b: Zone, a: Zone) =>
            a.AllCollection.length - b.AllCollection.length
        ).map((z) => {
          return (<ZoneItem zone={z as EgoZone}></ZoneItem>)

        })}
    </div>
  ));



  const ActiveZones = observer(() => (
    <Stack>
      <Select
        placeholder="None"
        onChange={(e) => {
          zoneStore.ClearTmpZones()
          if (e.target.value) {
            zoneStore
              .SubzonesOfZone([
                zoneStore.Zones.filter(
                  (z) => z.Id.toString() === e.target.value
                )[0],
              ])
              .then((res) => {
                console.log(res);
                const filtered = zoneStore.Difference(zoneStore.Filter(res).zones, zoneStore.Zones);
                if (res.length > 0) {
                  zoneStore.AddTmpZone(filtered, true);
                  // addZone(filtered[1]);
                }
              });
          }
        }}
      >
        {zoneStore.Zones.map((z, i) => {
          return (
            <option key={i} value={z.Id}>
              {z.Id}
            </option>
          );
        })}
      </Select>
      {zoneStore.Filter(zoneStore.TmpZones).zones.length > 0 && (
        <Button
          isFullWidth={true}
          onClick={() => {
            zoneStore.AddZones(zoneStore.Filter(zoneStore.TmpZones).zones);
            zoneStore.TmpZones.forEach((z) => zoneStore.RemoveTmpZone(z));
          }}
        >
          Add all subzones
        </Button>
      )}

      {zoneStore.TmpZones.length === 0 && <Heading size="md">Nothing</Heading>}
    </Stack>
  ));

  return (
    <Stack>
      <Stack p={5}>
        <Heading as="h4" size="md" pb={5}>
          Sub zones
        </Heading>
        <ActiveZones />

        <Divider />
      </Stack>
      <Zones />
    </Stack>
  );
}
