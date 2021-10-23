import {
  Checkbox,
  Divider,
  Heading,
  ListItem,
  Stack,
  UnorderedList,
} from "@chakra-ui/react";
import { action, observable, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../../..";
import { cy } from "../../../objects/graph/Cytoscape";
import CustomZone from "../../../objects/zone/CustomZone";
import Zone from "../../../objects/zone/Zone";
import EgoZone from "../../../objects/zone/EgoZone";

export function ZonesIntersect() {
  const zonesToIntersert: Zone[] = observable([]);

  let intersect: cytoscape.Collection = cy.collection();

  let customZone: CustomZone;

  let id: string[] = [];

  const r = reaction(
    () => zonesToIntersert.map((a) => a),
    (arr) => {
      zoneStore.Zones.forEach((z) => z.ClearZone());
      if (arr.length > 1) {
        intersect = cy.collection();
        const firstZone = arr[0];
        if (firstZone instanceof EgoZone || firstZone instanceof CustomZone)
          intersect = intersect.union(firstZone.AllCollection);
        for (let i = 1; i < arr.length; i++) {
          const element = arr[i];
          if (element instanceof EgoZone || element instanceof CustomZone)
            intersect = intersect.intersect(element.AllCollection);
        }
      } else {
        console.log("< 2");
      }
      console.log(arr);
      zoneStore.ColorNodesInZones(arr);
    }
  );

  const addZone = action((zone: Zone) => {
    zonesToIntersert.push(zone);
    // zone.DrawZone();
    id.push(zone.Id);
    // zone.DrawZone();
  });
  const removeZone = action((zone: Zone) => {
    zonesToIntersert.splice(zonesToIntersert.indexOf(zone), 1);
    id = id.filter((i) => i !== zone.Id);
    // zone.ClearZone();
  });

  useEffect(() => {
    // zoneStore.Zones.forEach((z) => {
    //   z.ClearZone();
    // });

    return () => {
      // zonesToIntersert.forEach((z) => z.ClearZone());
      if (customZone) {
        customZone.ClearZone();
      }
      // zoneStore.Zones.forEach((z) => {
      //   z.DrawZone();
      // });

      r();
    };
  });
  const Zones = observer(() => (
    <Stack>
      {zoneStore.Zones.map((z, i) => {
        return (
          <Checkbox
            borderColor={z instanceof EgoZone ? z.StringColorRGB() : ""}
            key={z.Id}
            value={z.Id}
            onChange={(v) => {
              if (v.target.checked) {
                addZone(
                  zoneStore.Zones.filter((z) => z.Id === v.target.value)[0]
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
              if (zonesToIntersert.length > 1) {
                customZone = new CustomZone(intersect, `i${id.join("_")}`);
                customZone.DrawZone();
                zoneStore.ColorNodesInZone(customZone);
                zoneStore.AddTmpZone([customZone]);
              }
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
            {intersect.length === 0 ? (
              <Stack p={5}>
                <Heading as="h4" size="sm" pb={5}>
                  Nothing
                </Heading>
              </Stack>
            ) : (
              <Stack p={5}>
                <Heading as="h4" size="md" pb={5}>
                  {intersect.length} nodes
                </Heading>
                <UnorderedList>
                  {intersect.nodes().map((e) => {
                    return <ListItem>{e.id()}</ListItem>;
                  })}
                </UnorderedList>

                {/* <Button
                  isFullWidth={true}
                  onClick={() => {
                    id = [];
                    zoneStore.AddZone(customZone);
                  }}
                >
                  Add intersect
                </Button> */}
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
