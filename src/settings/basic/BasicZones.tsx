import React, { useContext } from "react";
import Zone from "../../objects/Zone";
import {
  Stack,
  Button,
  Checkbox,
  Select,
  Spacer,
  Divider,
} from "@chakra-ui/react";
import { ZoneItem } from "../../ZoneItem";
import { Context, networkStore, settingsStore, zoneStore } from "../../.";
import { observer } from "mobx-react-lite";

export const BasicZones: React.FunctionComponent = () => {
  const context = useContext(Context);

  return (
    <Stack>
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
        Strongly prominent
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
        Weakly prominent
      </Button>
      <Button
        colorScheme={"red"}
        onClick={() => {
          zoneStore.ClearZones();
        }}
      >
        Clear zones
      </Button>
      <Select
        isFullWidth={true}
        onChange={(e) => {
          settingsStore.Duplicates = e.target.value;
        }}
      >
        <option value="all">All</option>
        <option value="me">Mutli-ego</option>
        <option value="de">Duplicates</option>
      </Select>

      <Checkbox
        defaultIsChecked={settingsStore.Automove}
        onChange={(e) => {
          settingsStore.Automove = e.target.checked;
        }}
      >
        Move zone
      </Checkbox>

      <Checkbox
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
      </Checkbox>

      <Checkbox
        defaultIsChecked={settingsStore.QuadraticCurves}
        onChange={(e) => {
          settingsStore.QuadraticCurves = e.target.checked;
        }}
      >
        Quadratic curves
      </Checkbox>
    </Stack>
  );
};
