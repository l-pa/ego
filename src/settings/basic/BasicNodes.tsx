import { Checkbox } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { settingsStore } from "../..";

export function BasicNodes() {
  useEffect(() => {
    console.log(settingsStore.HideOutsideZones);
  });
  return (
    <div>
      <Checkbox
        defaultChecked={settingsStore.HideOutsideZones}
        onChange={(e) => {
          settingsStore.HideOutsideZones = e.target.checked;
        }}
      >
        Hide except zones
      </Checkbox>
    </div>
  );
}
