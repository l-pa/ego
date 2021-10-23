import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../../..";
import EgoZone from "../../../objects/zone/EgoZone";
import Zone from "../../../objects/zone/Zone";
import { ZoneItem } from "../../ZoneItem";

export function ZonesSuperzone() {
  useEffect(() => {
    // zoneStore.Zones.forEach((z) => z.ClearZone());
    return () => {
      // zoneStore.Zones.forEach((z) => z.SetAlpha("80"));
      // zoneStore.Zones.forEach((z) => z.DrawZone());
      zoneStore.TmpZones.forEach((z) => z.ClearZone());
      zoneStore.TmpZones.length = 0;
      // zoneStore.ColorNodesInZones(zoneStore.Zones);
    };
  });

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
              ></ZoneItem>
            );
          }
        })}
    </div>
  ));

  const addZone = action((zone: Zone) => {
    zoneStore.AddTmpZone([zone], true);
    zone.Alpha = 0.25;
    zoneStore.ColorNodesInZones(zoneStore.TmpZones);
  });

  const clearZone = action(() => {
    // zoneStore.Zones.forEach((z) => z.ClearZone());

    zoneStore.TmpZones.forEach((z) => z.ClearZone());
    zoneStore.TmpZones.length = 0;
    zoneStore.ColorNodesInZones(zoneStore.TmpZones);
  });

  const ActiveZones = observer(() => (
    <Stack>
      <Select
        placeholder="None"
        onChange={(e) => {
          clearZone();
          if (e.target.value) {
            // zoneStore.FindZone(e.target.value).DrawZone();
            // zoneStore.FindZone(e.target.value).SetAlpha("ff");
            zoneStore
              .SuperzoneOfZone(
                zoneStore.Zones.filter(
                  (z) => z.Id.toString() === e.target.value
                )[0]
              )
              .then((res) => {
                console.log(res);

                if (res.length > 0) {
                  res[0].forEach((z) => addZone(z));
                  //res[1].forEach((z) => addZone(z));
                }
              });
          }
        }}
      >
        {zoneStore.Zones.map((z, i) => {
          return <option value={z.Id}>{z.Id}</option>;
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
          Add all superzones
        </Button>
      )}

      {zoneStore.TmpZones.length === 0 && <Heading size="md">Nothing</Heading>}
    </Stack>
  ));

  return (
    <Stack>
      <Stack p={5}>
        <Heading as="h4" size="md" pb={5}>
          Super zones
        </Heading>
        <ActiveZones />

        <Divider />
      </Stack>
      <Zones />
    </Stack>
  );
}
