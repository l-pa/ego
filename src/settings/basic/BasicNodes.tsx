import { Checkbox, Heading } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { settingsStore } from "../..";

export function BasicNodes() {
  useEffect(() => {
    console.log(settingsStore.HideOutsideZones);
  });
  return (
    <div>
      <Heading as="h4" size="md" pb={5}>
        Show
      </Heading>

      <Checkbox
        defaultChecked={settingsStore.HideOutsideZones}
        onChange={(e) => {
          settingsStore.HideOutsideZones = e.target.checked;
        }}
      >
        In zones
      </Checkbox>
    </div>
  );
}
