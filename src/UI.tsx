import React, { useContext } from "react";
import Zone from "./objects/Zone";
import { Stack, Button, Checkbox, Select } from "@chakra-ui/react";
import { ZoneItem } from "./ZoneItem";
import { Context, networkStore, settingsStore, zoneStore } from ".";
import { observer } from "mobx-react-lite";

export const UI: React.FunctionComponent = () => {
  const context = useContext(Context);

  return (
    <Stack zIndex={1} mt={5}>
      <Stack isInline={true}>
        <Button
          onClick={() => {
            networkStore.Network?.Nodes.forEach((n) => {
              if (n.isProminent() === 0) {
                const z = new Zone(n);
                zoneStore.AddZone(z);
              }
            });
          }}
        >
          Strongly prominent nodes
        </Button>

        <Button
          onClick={() => {
            networkStore.Network?.Nodes.forEach((n) => {
              if (n.isProminent() === 1) {
                const z = new Zone(n);
                zoneStore.AddZone(z);
              }
            });
          }}
        >
          Weakly prominent nodes
        </Button>

        <Button
          onClick={() => {
            zoneStore.ClearZones();
          }}
        >
          Clear zones
        </Button>

        <Button
          onClick={() => {
            // layout
          }}
        >
          Layout
        </Button>

        <Select
          width={100}
          onChange={(e) => {
            settingsStore.Duplicates = e.target.value;
          }}
        >
          <option value="all">All</option>
          <option value="me">Mutli-ego</option>
          <option value="de">Duplicates</option>
        </Select>

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            settingsStore.Automove = e.target.checked;
          }}
        >
          Move zone
        </Checkbox>

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            if (e.target.checked) {
              settingsStore.ZIndex = 0;
            } else {
              settingsStore.ZIndex = -1;
            }
          }}
        >
          Z-index
        </Checkbox>
      </Stack>
    </Stack>
  );
};
