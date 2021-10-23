import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import { action, autorun } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../../..";
import EgoZone from "../../../objects/zone/EgoZone";
import Zone from "../../../objects/zone/Zone";
import { ZoneItem } from "../../ZoneItem";

export function ZonesSubzone() {
  useEffect(() => {
    zoneStore.HideAllZones()
    return () => {
      clearZone();
    };
  }, []);

  const Zones = observer(() => (
    <div>
      {zoneStore
        .Filter(zoneStore.TmpZones)[0]
        .filter((z) => z instanceof EgoZone && !zoneStore.Zones.includes(z))
        .sort(
          (b: Zone, a: Zone) =>
            a.AllCollection.length - b.AllCollection.length
        )
        .forEach((z) => {
          z.DrawZone();
          if (zoneStore.Zones.some((zone) => zone.Id === z.Id)) {
          } else {
            return <ZoneItem addButton={true} zone={z as EgoZone}></ZoneItem>;
          }
        })}

      {zoneStore
        .Filter(zoneStore.TmpZones)[1]
        .filter((z) => z instanceof EgoZone && !zoneStore.Zones.includes(z))
        .sort(
          (b: Zone, a: Zone) =>
            a.AllCollection.length - b.AllCollection.length
        )
        .forEach((z) => {
          z.ClearZone();
          if (zoneStore.Zones.some((zone) => zone.Id === z.Id)) {
          } else {
            return (
              <ZoneItem
                addButton={true}
                greyed={true}
                zone={z as EgoZone}
                key={z.Id}
              ></ZoneItem>
            );
          }
        })}
    </div>
  ));

  const addZone = action((zone: Zone[]) => {
    zoneStore.AddTmpZone(zone, true);
  });

  const clearZone = action(() => {
    zoneStore.TmpZones.forEach((z) => z.ClearZone());
    zoneStore.TmpZones.length = 0;
  });

  const ActiveZones = observer(() => (
    <Stack>
      <Select
        placeholder="None"
        onChange={(e) => {
          clearZone();
          if (e.target.value) {
            zoneStore
              .SubzonesOfZone([
                zoneStore.Zones.filter(
                  (z) => z.Id.toString() === e.target.value
                )[0],
              ])
              .then((res) => {
                console.log(res);
                const filtered = zoneStore.Filter(res, [], true);
                if (res.length > 0) {
                  addZone(filtered[0]);
                  addZone(filtered[1]);
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
      {zoneStore.Filter(zoneStore.TmpZones)[0].length > 0 && (
        <Button
          isFullWidth={true}
          onClick={() => {
            zoneStore.AddZones(zoneStore.Filter(zoneStore.TmpZones)[0]);
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
