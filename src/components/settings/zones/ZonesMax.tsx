import {
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
} from "@chakra-ui/react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { useEffect } from "react";
import { networkStore, zoneStore } from "../../..";
import EgoZone from "../../../objects/zone/EgoZone";
import { ZoneItem } from "../../ZoneItem";
import { action, reaction } from "mobx";
import Zone from "../../../objects/zone/Zone";

export function ZonesMax() {

  let largestEgoZone: EgoZone;

  const maxExisting = () => {
    let largestZone = [...zoneStore.Zones].filter(
      (z) => z instanceof EgoZone
    );

    largestEgoZone = largestZone.sort(
      (a, b) => b.AllCollection.length - a.AllCollection.length
    )[0] as EgoZone;

    return (largestZone.filter(
      (z) =>
        z.AllCollection.length === largestZone[0].AllCollection.length
    ))
  }

  const maxAll = () => {
    let tmp: EgoZone[] = [];
    Object.keys(networkStore.Network!!.Nodes).forEach(function (key) {
      const n = networkStore.Network!!.Nodes[key]
      tmp.push(new EgoZone(n));
    });

    largestEgoZone = tmp.sort(
      (a: EgoZone, b: EgoZone) =>
        b.AllCollection.length - a.AllCollection.length
    )[0];

    return (tmp.filter(
      (z) =>
        z.AllCollection.length === largestEgoZone.AllCollection.length
    ))
  }


  useEffect(() => {
    zoneStore.HideAllZones()

    const a = reaction(
      () => localObserverable.s,
      () => {
        zoneStore.ClearTmpZones()
        if (localObserverable.s) {

          setZones(maxExisting())

        } else {
          setZones(maxAll())
        }
      }
    );

    const b = reaction(() => localObserverable.zones, () => {
      zoneStore.HideAllZones()

      zoneStore.AddTmpZone(localObserverable.zones, true)

      zoneStore.ColorNodesInZones(localObserverable.zones)
    })

    const c = reaction(() => zoneStore.Zones.slice(), () => {
      zoneStore.ClearTmpZones()
      if (localObserverable.s) {
        setZones(maxExisting())
      } else {
        setZones(maxAll())
      }
    })
    setZones(maxExisting())

    return () => {
      zoneStore.ClearTmpZones()
      a()
      b()
      c()
    };
  }, []);


  const localObserverable = useLocalObservable(() => ({
    s: true,
    zones: [] as Zone[]
  }));

  const changeSwitch = action((v: boolean) => {
    localObserverable.s = v;
  });

  const setZones = action((z: Zone[]) => {
    localObserverable.zones = z;
  });



  const Aaa = observer(() => {
    return (<Stack>{localObserverable.zones.map((z) => <ZoneItem zone={z as EgoZone} addButton={!zoneStore.Zones.some(zone => zone.Id === z.Id)}></ZoneItem>)}</Stack>
    )
  }
  )



  // let onlyExistingZones = observable({ idk: true });

  // const LargestZone = observer(() => {
  //   if (onlyExistingZones.idk) {
  //     if (zoneStore.Zones.length > 0) {
  //       let largestZone = [...zoneStore.Zones].filter(
  //         (z) => z instanceof EgoZone
  //       );

  //       largestEgoZone = largestZone.sort(
  //         (a, b) => b.AllCollection.length - a.AllCollection.length
  //       )[0] as EgoZone;

  //       const tmp = largestZone.filter(
  //         (z) =>
  //           z.AllCollection.length === largestZone[0].AllCollection.length
  //       );

  //       return (
  //         <Stack>
  //           {tmp.map((z) => {
  //             z.DrawZone()
  //             return <ZoneItem key={z.Id} zone={z as EgoZone}></ZoneItem>;
  //           })}
  //         </Stack>
  //       );
  //     } else {
  //       return (
  //         <Heading p={5} size="sm">
  //           Select at least one zone
  //         </Heading>
  //       );
  //     }
  //   } else {
  //     let tmp: EgoZone[] = [];
  //     Object.keys(networkStore.Network!!.Nodes).forEach(function (key) {
  //       const n = networkStore.Network!!.Nodes[key]
  //       tmp.push(new EgoZone(n));
  //     });

  //     largestEgoZone = tmp.sort(
  //       (a: EgoZone, b: EgoZone) =>
  //         b.AllCollection.length - a.AllCollection.length
  //     )[0];

  //     tmp = tmp.filter(
  //       (z) =>
  //         z.AllCollection.length === largestEgoZone.AllCollection.length
  //     );


  //     return (
  //       <Stack>
  //         {tmp.map((zone) => {
  //           if (!zoneStore.Zones.some((z) => z.Id === zone.Id)) {
  //             return (
  //               <ZoneItem
  //                 key={zone.Id}
  //                 addButton={true}
  //                 zone={zone}
  //               ></ZoneItem>
  //             );
  //           } else {
  //             return (
  //               <ZoneItem
  //                 key={zone.Id}
  //                 addButton={false}
  //                 zone={
  //                   zoneStore.Zones.filter(
  //                     (z) => z.Id === zone.Id
  //                   )[0] as EgoZone
  //                 }
  //               ></ZoneItem>
  //             );
  //           }
  //         }
  //         )

  //         }
  //       </Stack>
  //     );
  //   }
  // });

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
            defaultChecked={true}
          />
        </FormControl>
      </Stack>
      {/* <LargestZone /> */}
      <Aaa />
    </Stack>
  );
}
