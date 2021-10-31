import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Stack,
} from "@chakra-ui/react";
import { action, observable, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { zoneStore } from "../../..";
import { cy } from "../../../objects/graph/Cytoscape";
import EgoZone from "../../../objects/zone/EgoZone";
import { ZoneItem } from "../../ZoneItem";

export function ZonesIntersect() {

  useEffect(() => {
    zoneStore.ClearTmpZones()
    return (() => {
      zoneStore.ClearTmpZones()
    })
  })

  const zonesToIntersert: EgoZone[] = observable([]);
  const overlappingZones = observable.array<EgoZone>([], { deep: false });

  let customZone: EgoZone;

  let id: string[] = [];

  const r = reaction(
    () => zonesToIntersert.map((a) => a),
    (arr) => {
      zoneStore.Zones.forEach((z) => z.HideZone());

      if (arr.length > 1) {

        const a = zoneStore.Filter(zoneStore.OverlapZones(zonesToIntersert)).zones as EgoZone[]
        console.log(a);
        zoneStore.AddTmpZone(a)
        overlappingZones.clear()
        overlappingZones.replace(a)
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
        let tmpZone: EgoZone | undefined = undefined
        let size = 0


        const overlap = zoneStore.OverlapZones(zonesToIntersert);

        zoneStore.AddZones([(overlap[0] as EgoZone), (overlap[1] as EgoZone), tmpZone!!])

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
              // if (zonesToIntersert.length > 1) {
              //   customZone = new CustomZone(intersect, `i${id.join("_")}`);
              //   customZone.DrawZone();
              //   zoneStore.ColorNodesInZone(customZone);
              //   zoneStore.AddTmpZone([customZone]);
              // }
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

  const ZonesToAdd = observer(() =>
    zonesToIntersert.length === 0 ? (
      <Stack>
        <Heading p={5} as="h4" size="sm" pb={5}>
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
                {overlappingZones.length === 0 ? (
              <Stack p={5}>
                <Heading as="h4" size="sm" pb={5}>
                  Nothing
                </Heading>
              </Stack>
            ) : (
                    <Stack>
                <Heading as="h4" size="md" pb={5}>
                        {overlappingZones.length} zones
                </Heading>
                      {
                        overlappingZones.map(z => {
                          return <ZoneItem zone={z}></ZoneItem>
                        })
                      }
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    )
  );

  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Intersect
      </Heading>
      <Zones />
      <Divider mb={5} mt={5} />
      <ZonesToAdd />
    </Stack>
  );
}
