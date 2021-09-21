import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../..";
import EgoZone from "../../objects/zone/EgoZone";
import Zone from "../../objects/zone/Zone";
import { ZoneItem } from "../../components/ZoneItem";

export function ZonesSubzone() {
  useEffect(() => {
    // zoneStore.Zones.forEach((z) => z.ClearZone());
    return () => {
      clearZone()
      // zoneStore.Zones.forEach((z) => z.DrawZone());
      // zoneStore.ColorNodesInZones(zoneStore.Zones);
    };
  }, []);

  const Zones = observer(() => (
    <div>
      {zoneStore
        .Filter(zoneStore.TmpZones)[0]
        .filter((z) => z instanceof EgoZone && !zoneStore.Zones.includes(z))
        .sort(
          (b: Zone, a: Zone) =>
            a.AllCollection().length - b.AllCollection().length
        )
        .map((z, i) => {
          z.DrawZone();
          if (zoneStore.Zones.some((zone) => zone.GetId() === z.GetId())) {
          } else {
            return (
              <ZoneItem addButton={true} zone={z as EgoZone} key={i}></ZoneItem>
            );
          }
        })}

      {zoneStore
        .Filter(zoneStore.TmpZones)[1]
        .filter((z) => z instanceof EgoZone && !zoneStore.Zones.includes(z))
        .sort(
          (b: Zone, a: Zone) =>
            a.AllCollection().length - b.AllCollection().length
        )
        .map((z, i) => {
          z.ClearZone();
          if (zoneStore.Zones.some((zone) => zone.GetId() === z.GetId())) {
          } else {
            return (
              <ZoneItem
                addButton={true}
                greyed={true}
                zone={z as EgoZone}
                key={z.GetId()}
              ></ZoneItem>
            );
          }
        })}
    </div>
  ));

  const addZone = action((zone: Zone[]) => {
    zoneStore.AddTmpZone(zone, true);
    // zone.SetAlpha("25");
    // zoneStore.ColorNodesInZones(zoneStore.TmpZones);
  });

  const clearZone = action(() => {

    // zoneStore.Zones.forEach((z) => z.ClearZone());

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
            // zoneStore.FindZone(e.target.value).DrawZone();
            // zoneStore.FindZone(e.target.value).SetAlpha("ff");
            zoneStore
              .SubzonesOfZone([
                zoneStore.Zones.filter(
                  (z) => z.GetId().toString() === e.target.value
                )[0]]
              )
              .then((res) => {
                console.log(res);
                const filtered = zoneStore.Filter(res)
                if (res.length > 0) {
                  addZone(filtered[0])
                  addZone(filtered[1])
                }
              });
          }
        }}
      >
        {zoneStore.Zones.map((z, i) => {
          return <option key={i} value={z.GetId()}>{z.GetId()}</option>;
        })}
      </Select>
      {zoneStore.Filter(zoneStore.TmpZones)[0].length > 0 && (
        <Button
          isFullWidth={true}
          onClick={() => {
            zoneStore.Filter(zoneStore.TmpZones)[0].forEach((z) => zoneStore.AddZone(z));
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
