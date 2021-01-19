import { Checkbox, Stack } from "@chakra-ui/react";
import { action, autorun, observable, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { zoneStore } from "../..";
import { cy } from "../../objects/graph/Cytoscape";
import Zone from "../../objects/Zone";

export function ZonesIntersect() {
  const zonesToIntersert: Zone[] = observable([]);

  let intersect: cytoscape.Collection = cy.collection();

  const r = reaction(
    () => zonesToIntersert.map((a) => a),
    (arr) => {
      console.log(arr);

      if (arr.length > 1) {
        intersect = intersect.union(arr[0].AllCollection);
        for (let i = 1; i < arr.length; i++) {
          const element = arr[i];
          intersect = intersect.intersect(element.AllCollection);
        }
        console.log(intersect);
      } else {
        console.log("< 2");
      }
    }
  );

  const addZone = action((zone: Zone) => {
    zonesToIntersert.push(zone);
  });
  const removeZone = action((zone: Zone) => {
    zonesToIntersert.splice(zonesToIntersert.indexOf(zone), 1);
  });

  useEffect(() => {
    return () => {
      r();
    };
  });
  const Zones = observer(() => (
    <Stack>
      {zoneStore.Zones.map((z, i) => {
        return (
          <Checkbox
            key={z.Ego.Id}
            value={z.Ego.Id}
            onChange={(v) => {
              if (v.target.checked) {
                addZone(
                  zoneStore.Zones.filter(
                    (z) => z.Ego.Id.toString() === v.target.value
                  )[0]
                );
              } else {
                removeZone(
                  zonesToIntersert.filter(
                    (z) => z.Ego.Id.toString() === v.target.value
                  )[0]
                );
              }
            }}
          >
            {z.Ego.Id}
          </Checkbox>
        );
      })}
    </Stack>
  ));

  return (
    <Stack>
      <Zones />
    </Stack>
  );
}
