import {
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { networkStore, zoneStore } from "../../..";
import EgoZone from "../../../objects/zone/EgoZone";
import { ZoneItem } from "../../ZoneItem";
import { action, observable } from "mobx";

export function ZonesMax() {

  useEffect(() => {
    zoneStore.HideAllZones()

    return () => {
      zoneStore.ClearTmpZones()
    };
  }, []);


  const changeSwitch = action((v: boolean) => {
    onlyExistingZones.idk = v;
  });

  let onlyExistingZones = observable({ idk: true });
  let largestEgoZone: EgoZone;

  const LargestZone = observer(() => {
    zoneStore.HideAllZones()

    if (onlyExistingZones.idk) {
      if (zoneStore.Zones.length > 0) {
        let largestZone = [...zoneStore.Zones].filter(
          (z) => z instanceof EgoZone
        );

        largestEgoZone = largestZone.sort(
          (a, b) => b.AllCollection.length - a.AllCollection.length
        )[0] as EgoZone;

        const tmp = largestZone.filter(
          (z) =>
            z.AllCollection.length === largestZone[0].AllCollection.length
        );

        return (
          <Stack>
            {tmp.map((z) => {
              z.IsDrawn = true
              return <ZoneItem key={z.Id} zone={z as EgoZone}></ZoneItem>;
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
      let tmp: EgoZone[] = [];

      networkStore.Network?.Nodes.forEach((n) => {
        tmp.push(new EgoZone(n));
      });

      largestEgoZone = tmp.sort(
        (a: EgoZone, b: EgoZone) =>
          b.AllCollection.length - a.AllCollection.length
      )[0];

      tmp = tmp.filter(
        (z) =>
          z.AllCollection.length === largestEgoZone.AllCollection.length
      );


      return (
        <Stack>
          {tmp.map((zone) => {
            if (!zoneStore.Zones.some((z) => z.Id === zone.Id)) {
              return (
                <ZoneItem
                  key={zone.Id}
                  addButton={true}
                  zone={zone}
                ></ZoneItem>
              );
            } else {
              return (
                <ZoneItem
                  key={zone.Id}
                  addButton={false}
                  zone={
                    zoneStore.Zones.filter(
                      (z) => z.Id === zone.Id
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
