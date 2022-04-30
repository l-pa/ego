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
    let tmp: Zone[] = [];
    Object.keys(networkStore.Network!!.Nodes).forEach(function (key) {
      const n = networkStore.Network!!.Nodes[key]
      tmp.push(new EgoZone(n));
    });

    if (!localObserverable.s) {
      tmp = zoneStore.Difference(tmp, zoneStore.Zones)
    }

    largestEgoZone = tmp.sort(
      (a: Zone, b: Zone) =>
        b.AllCollection.length - a.AllCollection.length
    )[0] as EgoZone;


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
      const diff = zoneStore.Difference(zoneStore.TmpZones, zoneStore.Zones)
      zoneStore.ClearTmpZones()

      if (localObserverable.s) {
        setZones(maxExisting())
      } else {
        // zoneStore.AddTmpZone(diff, true)
        // setZones(zoneStore.TmpZones)

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
    if (localObserverable.s) {
      localObserverable.zones = z;
    } else {
      localObserverable.zones = zoneStore.Difference(z, zoneStore.Zones);
    }
  });



  const MaxZone = observer(() => {
    return (<Stack>{localObserverable.zones.map((z) => <ZoneItem zone={z as EgoZone}></ZoneItem>)}</Stack>
    )
  }
  )

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
      <MaxZone />
    </Stack>
  );
}
