import { Button, Divider, Heading, Select, Stack } from "@chakra-ui/react";
import { action, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../../..";
import EgoZone from "../../../objects/zone/EgoZone";
import Zone from "../../../objects/zone/Zone";
import { ZoneItem } from "../../ZoneItem";

export function ZonesSuperzone() {
  // useEffect(() => {
  //   // zoneStore.Zones.forEach((z) => z.ClearZone());
  //   return () => {
  //     // zoneStore.Zones.forEach((z) => z.SetAlpha("80"));
  //     // zoneStore.Zones.forEach((z) => z.DrawZone());
  //     // zoneStore.ColorNodesInZones(zoneStore.Zones);
  //   };
  // });

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
      {/* {zoneStore
        .Filter(zoneStore.TmpZones).zones
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
        })} */}

      {
        zoneStore.Difference(zoneStore.Filter(zoneStore.TmpZones).zones, zoneStore.Zones).sort((b: Zone, a: Zone) =>
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
            // zoneStore.FindZone(e.target.value).DrawZone();
            // zoneStore.FindZone(e.target.value).SetAlpha("ff");
            zoneStore
              .SuperzoneOfZone(
                zoneStore.Zones.filter(
                  (z) => z.Id.toString() === e.target.value
                )[0] as EgoZone
              )
              .then((res) => {
                const filtered = zoneStore.Difference(res, zoneStore.Zones);

                if (res.length > 0) {
                  zoneStore.AddTmpZone(filtered, true);
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
      {zoneStore.Filter(zoneStore.TmpZones).zones.length > 0 && (
        <Button
          isFullWidth={true}
          onClick={() => {
            zoneStore.AddZones(zoneStore.Filter(zoneStore.TmpZones).zones);
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
