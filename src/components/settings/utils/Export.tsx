import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Select,
  Stack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { settingsStore } from "../../..";
import { ImageType } from "../../../objects/export/ExportImage";

export function Export() {
  const ShowTrackOptions = observer(() =>
    settingsStore.TrackZonesExport ? (
      <Stack>
        <p></p>
      </Stack>
    ) : (
      <p></p>
    )
  );

  const PdfButton = observer(() => (
    <Button
      isLoading={isExportingPdf}
      isDisabled={!settingsStore.TrackZonesExport}
      isFullWidth={true}
      onClick={() => {
        setSsExportingPdf(true)
        settingsStore.ExportSnapshot.getPdf().then(() => {
          setSsExportingPdf(false)
        })
      }}
    >
      PDF
    </Button>
  ))

  const [isExportingPdf, setSsExportingPdf] = useState(false)

  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Export
      </Heading>
      <Divider />
      <Heading as="h4" size="md" pt={5}>
        Image
      </Heading>
      <Button
        isFullWidth={true}
        onClick={() => {
          settingsStore.ExportSnapshot.getImageToNewTab(ImageType.PNG, false);
        }}
      >
        PNG
      </Button>

      <Button
        isFullWidth={true}
        onClick={() => {
          settingsStore.ExportSnapshot.getImageToNewTab(ImageType.SVG, false);
        }}
      >
        SVG
      </Button>
      <Divider />

      <Checkbox
        defaultChecked={settingsStore.TrackZonesExport}
        onChange={(v) => {
          settingsStore.TrackZonesExport = v.target.checked;
        }}
      >
        Track zones
      </Checkbox>

      <PdfButton />

      <Divider />
      <Heading as="h4" size="md" pt={5}>
        Options
      </Heading>
      <Divider />
      {/* <Select onChange={(v) => {
        const settings = settingsStore.ExportOptions
        settings.imageFormat = Number.parseInt(v.target.value)
        settingsStore.ExportOptions = settings
      }} defaultValue={settingsStore.ExportOptions.imageFormat}>
        <option value={ImageType.PNG}>PNG</option>
        <option value={ImageType.SVG}>SVG</option>
      </Select> */}

      <ShowTrackOptions />
    </Stack>
  );
}
