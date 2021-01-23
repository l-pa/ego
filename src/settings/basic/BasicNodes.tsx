import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { settingsStore } from "../..";

export function BasicNodes() {
  useEffect(() => {
    console.log(settingsStore.HideOutsideZones);
    return () => {
      console.log(settingsStore.HideOutsideZones);
    };
  });

  const DegreeSize = observer(() => (
    <Button
      isFullWidth={true}
      onClick={() => {
        if (settingsStore.GetNodeSize() === "fixed") {
          settingsStore.SetNodeSize("degree");
        } else {
          settingsStore.SetNodeSize("fixed");
        }
      }}
    >
      {settingsStore.GetNodeSize() === "fixed" ? "Degree" : "Fixed"}
    </Button>
  ));
  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Properties
      </Heading>
      <Checkbox
        defaultIsChecked={settingsStore.HideOutsideZones}
        onChange={(e) => {}}
      >
        Hide labels
      </Checkbox>
      <Text mt={5} fontSize="md">
        Size
      </Text>

      <DegreeSize />
      <Divider paddingBottom={5} marginBottom={5} />
      <Heading as="h4" size="md" pb={5}>
        Show
      </Heading>
      <Checkbox
        key={"showInZonesCheckbox"}
        defaultIsChecked={settingsStore.HideOutsideZones}
        onChange={(e) => {
          settingsStore.HideOutsideZones = e.target.checked;
        }}
      >
        In zones
      </Checkbox>
    </Stack>
  );
}
