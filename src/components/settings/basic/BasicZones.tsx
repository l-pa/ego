import React, { useEffect } from "react";
import { Stack, Button, Checkbox, Divider, Heading, Select } from "@chakra-ui/react";
import { ZoneItem } from "../../ZoneItem";
import { networkStore, settingsStore, zoneStore } from "../../..";
import { observer } from "mobx-react-lite";
import EgoZone from "../../../objects/zone/EgoZone";
import CustomZone from "../../../objects/zone/CustomZone";
import { ZoneItemCustom } from "../../ZoneItemCustom";
import { reaction } from "mobx";
import { SortByEnum } from "../../../stores/SettingsStore";
import { NodeProminency } from "../../../objects/network/Node";

export const BasicZones: React.FunctionComponent = () => {

  useEffect(() => {
    zoneStore.Update()
    return (() => {
      zoneStore.HideZones()
    })
  }, [])

  const ZonesCount = observer(() => {
    return (<Heading as="h4" size="md" pb={5} pt={5}>Zones - {zoneStore.Zones.length}</Heading>)
  }
  )

  const Zones = observer(() => (
    <Stack>
      <Stack p={5}>

        <Heading as="h4" size="sm" pt={5}>
          Sort by
        </Heading>
        <Select defaultValue={settingsStore.SortBy} onChange={(e) => {
          settingsStore.SortBy = Number.parseInt(e.target.value)
        }}>
          <option value={SortByEnum.TotalSize}>Total size</option>
          <option value={SortByEnum.InnerSize}>Inner size</option>
          <option value={SortByEnum.OuterSize}>Outer size</option>
        </Select>
      </Stack>
      {zoneStore
        .Filter(zoneStore.Zones.filter((z) => z instanceof EgoZone)).zones
        .map((z, i) => {
          return (
            <ZoneItem
              greyed={!z.IsDrawn}
              zone={z as EgoZone}
              key={i}
            ></ZoneItem>
          );
        })}

      {zoneStore
        .Filter(zoneStore.Zones.filter((z) => z instanceof EgoZone)).filtered
        .map((z, i) => {
          return (
            <ZoneItem
              greyed={!z.IsDrawn}
              zone={z as EgoZone}
              key={i}
            ></ZoneItem>
          );
        })}
    </Stack>
  ));

  const CustomZones = observer(() => (
    <div>
      {zoneStore.Zones.filter((z) => z instanceof CustomZone).map((z, i) => {
        return <ZoneItemCustom zone={z as CustomZone} key={i}></ZoneItemCustom>;
      })}
    </div>
  ));

  return (
    <Stack>
      <Stack p={5}>
        <Heading as="h4" size="md" pb={5}>
          Add zones
        </Heading>

        <Button
          colorScheme={"red"}
          onClick={() => {
            const zones: EgoZone[] = [];
            Object.keys(networkStore.Network!!.Nodes).forEach(function (key) {
              const n = networkStore.Network!!.Nodes[key]
              if (n.isProminent() === NodeProminency.StronglyProminent) {
                zones.push(new EgoZone(n));
              }
            })
            zoneStore.AddZones(zones);
          }}
        >
          Strongly prominent
        </Button>

        <Button
          onClick={() => {
            const zones: EgoZone[] = [];
            Object.keys(networkStore.Network!!.Nodes).forEach(function (key) {
              const n = networkStore.Network!!.Nodes[key]
              if (n.isProminent() === NodeProminency.WeaklyProminent) {
                zones.push(new EgoZone(n));
              }
            });
            zoneStore.AddZones(zones);
          }}
          colorScheme={"yellow"}
        >
          Weakly prominent
        </Button>
        <Heading as="h4" size="md" pb={5} pt={5}>
          Remove zones
        </Heading>
        <Button
          colorScheme={"red"}
          onClick={() => {
            zoneStore.RemoveAllZones();
          }}
        >
          All zones
        </Button>

        <Heading as="h4" size="md" pb={5} pt={5}>
          Options
        </Heading>
        <Checkbox
          key={"showInZonesCheckbox"}
          defaultIsChecked={settingsStore.HideOutsideZones}
          onChange={(e) => {
            settingsStore.HideOutsideZones = e.target.checked;
          }}
        >
          Show nodes only in zones
        </Checkbox>
        <Checkbox
          defaultIsChecked={settingsStore.Automove}
          onChange={(e) => {
            settingsStore.Automove = e.target.checked;
          }}
        >
          Move zone
        </Checkbox>
        {/* <Checkbox
        defaultIsChecked={true}
        onChange={(e) => {
          if (e.target.checked) {
            settingsStore.ZIndex = 0;
          } else {
            settingsStore.ZIndex = -1;
          }
        }}
        >
        Z-index
      </Checkbox> */}

        <ZonesCount />
      </Stack>
      <Zones />
      <Divider />
      {/* <Heading p={5} as="h4" size="md" pb={5} pt={5}>
        Custom zones
      </Heading> */}
      <CustomZones />
    </Stack>
  );
};
