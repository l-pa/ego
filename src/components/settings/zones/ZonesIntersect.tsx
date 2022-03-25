import {
  Button,
  Checkbox,
  createStandaloneToast,
  Divider,
  Heading,
  Stack,
} from "@chakra-ui/react";
import { action, observable, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { zoneStore } from "../../..";
import EgoZone from "../../../objects/zone/EgoZone";
import { ZoneItem } from "../../ZoneItem";

export function ZonesIntersect() {

  useEffect(() => {
    zoneStore.ClearTmpZones()
    zoneStore.HideAllZones()
    return (() => {
      zoneStore.ClearTmpZones()
    })
  }, [])

  const zonesToIntersert: EgoZone[] = observable([]);
  const toast = createStandaloneToast();

  let customZone: EgoZone;

  let id: string[] = [];

  const r = reaction(
    () => zonesToIntersert.map((a) => a),
    (arr) => {
      zoneStore.Zones.forEach((z) => z.HideZone());

      if (arr.length > 1) {
        zoneStore.ClearTmpZones()
        const overlap = zoneStore.OverlapZones(zonesToIntersert)
        if (overlap) {
          const a = zoneStore.Filter(overlap).zones as EgoZone[]
          zoneStore.AddTmpZone(zoneStore.Difference(a, zoneStore.Zones), true)
        }
      }
    }
  );


  const addZone = action((zone: EgoZone) => {
    zonesToIntersert.push(zone);
    id.push(zone.Id);
  });
  const removeZone = action((zone: EgoZone) => {
    zonesToIntersert.splice(zonesToIntersert.indexOf(zone), 1);
    id = id.filter((i) => i !== zone.Id);
  });

  useEffect(() => {
    return () => {
      if (customZone) {
        customZone.ClearZone();
      }
      r();
    };
  });
  const Zones = observer(() => (
    <Stack>
      <Button onClick={() => {
        let c = 0
        let z: EgoZone | undefined = undefined

        let fromZ1
        let fromZ2 

        const tmpZones = zoneStore.GetAllZones()

        for (let i = 0; i < tmpZones.length; i++) {
          const z1 = tmpZones[i];

          for (let j = i + 1; j < tmpZones.length; j++) {
            const z2 = tmpZones[j];

            const a = zoneStore.OverlapZones([z1, z2])

            if (a && a.length > 0 && a[0].AllCollection.length > c) {
              c = a[0].AllCollection.length
              z = a[0]
              fromZ1 = z1
              fromZ2 = z2
            }

          }

        }

        if (z) {
          zoneStore.AddZone(z, true, false)

          toast({
            title: "Max. overlap found",
            description: `From Ego ${fromZ1?.Ego.Id} and ${fromZ2?.Ego.Id}`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });

        }

      }}>
        Add max. overlap
      </Button>
      <Divider paddingBottom={5} />
      {zoneStore.Zones.map((z, i) => {
        return (
          <Checkbox
            borderColor={z instanceof EgoZone ? z.StringColorRGB() : ""}
            key={z.Id}
            value={z.Id}
            onChange={(v) => {
              zoneStore.ClearTmpZones()
              if (v.target.checked) {
                addZone(
                  zoneStore.Zones.filter((z) => z.Id === v.target.value)[0] as EgoZone
                );
              } else {
                removeZone(
                  zonesToIntersert.filter(
                    (z) => z.Id === v.target.value
                  )[0]
                );
              }

              if (customZone) {
                zoneStore.RemoveTmpZone(customZone);
              }
              zoneStore.ColorNodesInZones(zoneStore.Zones);
            }}
          >
            {z.IsDrawn && (
              <Heading as="h5" size="sm">
                {z.Id}
              </Heading>
            )}

            {!z.IsDrawn && z.Id}
          </Checkbox>
        );
      })}
    </Stack>
  ));

  const ZonesToAdd = observer(() => {
    const f = zoneStore.Filter(zoneStore.TmpZones)

    zoneStore.ColorNodesInZones(f.zones)

    return (

    zonesToIntersert.length === 0 ? (
        <Stack p={5}>
          <Heading as="h4" size="sm" pb={5}>
          Nothing
        </Heading>
      </Stack>
    ) : (
      <Stack>
        {zonesToIntersert.length === 1 ? (
          <Stack>
            <Heading p={5} as="h4" size="sm" pb={5}>
              Select 1 more
            </Heading>
          </Stack>
        ) : (
          <Stack>
                  {zoneStore.TmpZones.length === 0 ? (
              <Stack p={5}>
                <Heading as="h4" size="sm" pb={5}>
                  Nothing
                </Heading>
              </Stack>
            ) : (
                    <Stack>
                        <Stack p={5}>
                <Heading as="h4" size="md" pb={5}>
                            {zoneStore.TmpZones.length} zones
                </Heading>
                        </Stack>
                      {
                          f.zones.map(z => {
                            return <ZoneItem zone={z as EgoZone}></ZoneItem>
                          })
                        }

                        {
                          f.filtered.map(z => {
                            return <ZoneItem greyed={true} zone={z as EgoZone}></ZoneItem>
                          })
                        }

              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    )
    )
  })

  return (
    <Stack>
      <Stack p={5}>

      <Heading as="h4" size="md" pb={5}>
          Overlaps
      </Heading>
      <Zones />
      <Divider mb={5} mt={5} />
      </Stack>
      <ZonesToAdd />
    </Stack>
  );
}
