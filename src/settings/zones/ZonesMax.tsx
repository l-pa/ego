import {
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { networkStore, zoneStore } from "../..";
import EgoZone from "../../objects/EgoZone";
import { ZoneItem } from "../../components/ZoneItem";
import { action, observable } from "mobx";
import Zone from "../../objects/Zone";

export function ZonesMax() {
  useEffect(() => {
    console.log("idk");
    
    return () => {
      
      clearTmpZone()
      zoneStore.Zones.forEach((z) => {
        z.DrawZone();
      });

    };
  });

  let onlyExistingZones = observable({ idk: true });
  
  let largestEgoZone: EgoZone;

  const addTmpZone = action((z:Zone)=> {
    if (zoneStore.Zones.some(zo=> zo.GetId() === z.GetId())) {    
    } else { 
      zoneStore.AddTmpZone(z)
      z.DrawZone()
    }
  })
  

  const clearTmpZone = action(()=> {
    zoneStore.TmpZones.forEach((z) => z.ClearZone());
    zoneStore.TmpZones.length = 0
  })

  const color = action((z: Zone[]) => {
    zoneStore.ColorNodesInZones(z);
  });
  
  

  const LargestZone = observer(() => {    
    zoneStore.HideAllZones()
    
    if (onlyExistingZones.idk) {  
      clearTmpZone()
      if (zoneStore.Zones.length > 0) {
        let largestZone = [...zoneStore.Zones].filter(
          (z) => z instanceof EgoZone
        );

        largestEgoZone = largestZone.sort(
          (a, b) => b.AllCollection().length - a.AllCollection().length
        )[0] as EgoZone;

        const tmp = largestZone.filter(
          (z) =>
            z.AllCollection().length === largestZone[0].AllCollection().length
        );

        color(tmp);

        return (
          <Stack>
            {tmp.map((z) => {
              z.DrawZone();
              return <ZoneItem zone={z as EgoZone}></ZoneItem>;
            })}
          </Stack>
        );
      } else {
        return (
          <Heading p={5} size="sm">
            Select at least one zone
          </Heading>
        );
      }
    } else {
      clearTmpZone()
      let tmp: EgoZone[] = [];

      networkStore.Network?.Nodes.forEach((n) => {
        tmp.push(new EgoZone(n));
      });

      largestEgoZone = tmp.sort(
        (a: EgoZone, b: EgoZone) =>
          b.AllCollection().length - a.AllCollection().length
      )[0];

      tmp = tmp.filter(
        (z) =>
          z.AllCollection().length === largestEgoZone.AllCollection().length
      );
        color(tmp)
      return (
        <Stack>
          {tmp.map((zone) => {
            
            addTmpZone(zone)
            if (!zoneStore.Zones.some((z) => z.GetId() === zone.GetId())) {
              return (
                <ZoneItem
                  addButton={true}
                  zone={zone}
                ></ZoneItem>
              );
            } else {
              return (
                <ZoneItem
                  addButton={false}
                  zone={
                    zoneStore.Zones.filter(
                      (z) => z.GetId() === zone.GetId()
                    )[0] as EgoZone
                  }
                ></ZoneItem>
              );
            }
          }
          )

          }
        </Stack>
      );
    }
  });

  const changeSwitch = action((v: boolean) => {
    onlyExistingZones.idk = v;
  });

  return (
    <Stack>
      <Stack p={5}>
        <Heading as="h4" size="md" pb={5}>
          Max zone
        </Heading>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="all-zones" mb="0">
            Only existing zones
          </FormLabel>
          <Switch
            id={"all-zones"}
            onChange={(e) => {
              changeSwitch(e.target.checked);
            }}
            defaultChecked={onlyExistingZones.idk}
          />
        </FormControl>
      </Stack>
      <LargestZone />
    </Stack>
  );
}
