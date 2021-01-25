import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Select,
  Stack,
} from "@chakra-ui/react";
import { action } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { networkStore, zoneStore } from "../..";
import EgoZone from "../../objects/EgoZone";
import Zone from "../../objects/Zone";
import { ZoneItem } from "../../components/ZoneItem";

export function ZonesSubzone() {
  useEffect(() => {
    zoneStore.Zones.forEach((z) => z.ClearZone());
    return () => {
      zoneStore.Zones.forEach((z) => z.SetAlpha("80"));
      zoneStore.TmpZones.forEach((z) => z.ClearZone());
      zoneStore.TmpZones.length = 0;
    };
  });

  let checked : string[] = []

  const Zones = observer(() => (
    <div>
      {zoneStore.TmpZones.filter(
        (z) => z instanceof EgoZone && !zoneStore.Zones.includes(z)
      )
        .sort(
          (b: Zone, a: Zone) =>
            a.AllCollection().length - b.AllCollection().length
        )
        .map((z, i) => {
          if (!zoneStore.Zones.some(zone => zone.GetId() === z.GetId()))
          return (
            <ZoneItem addButton={true} zone={z as EgoZone} key={i}></ZoneItem>
          );
        })}
    </div>
  ));
  

  const addZone = action((z:Zone) => {
    zoneStore.AddTmpZone(z)
  })

  const update = action(() => {

    const z: EgoZone[] = [];

    checked.forEach((z) => {
      const n = networkStore.Network?.Nodes.filter(n => n.Id === z)[0]
      if (n){
        zoneStore.AddTmpZone(new EgoZone(n))
      }
    })

    zoneStore.TmpZones.forEach((zo) => {
      if (zo instanceof EgoZone) {
        z.push(zo);
      }
    });

    zoneStore.SubzonesOfZone(z).then((zones) => {
      zones.forEach((z) => {
        if (
          !zoneStore.Zones.some(
            (zone) => z.GetId() === zone.GetId() && zone.IsDrawn() === false
          )
        ) {
          zoneStore.AddTmpZone(z);
          z.DrawZone();
        }
      });
    });
  });

  const clear = action(() => {
    zoneStore.TmpZones.forEach((z) => {
      z.ClearZone()
    })
    zoneStore.TmpZones.length = 0
  })

  const ActiveZones = observer(() => (
    <Stack>
      {zoneStore.Zones.map((z, i) => {
        return (
          <Checkbox
            value={z.GetId()}
            onChange={(e) => {
              console.log(checked);
              
              if (e.target.checked) {
                checked.push(e.target.value)
                if (
                  !zoneStore.TmpZones.some((zo) => z.GetId() === zo.GetId())
                ) {
                  addZone(z)
                  z.DrawZone();
                  z.SetAlpha("70");
              
                  update();
                }
              } else {
                console.log(e.target.value, checked.indexOf(e.target.value));
                
                checked = checked.filter(v => v !== e.target.value)
                console.log(checked);
                
                zoneStore.TmpZones.forEach((z) => {
                  if (
                    !zoneStore.Zones.some((zone) => zone.GetId() === z.GetId())
                  ) {
                    clear()
                    update()
                  }
                });
              }
            }}
          >
            {z.GetId()}
          </Checkbox>
        );
      })}

      {zoneStore.TmpZones.length > 0 && (
        <Button
          isFullWidth={true}
          onClick={() => {
            zoneStore.TmpZones.forEach((z) => zoneStore.AddZone(z));
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
          Subzones
        </Heading>
        <ActiveZones />

        <Divider />
      </Stack>
      <Zones />
    </Stack>
  );
}
