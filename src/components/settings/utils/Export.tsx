import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Switch,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import { ImageType } from "../../../objects/export/ExportImage";
import { cy } from "../../../objects/graph/Cytoscape";
import Louvain from "../../../objects/utility/Modularity";

export function Export() {
  const ShowTrackOptions = observer(() =>
    settingsStore.TrackZonesExport ? (
      <Stack>
        <Checkbox
          defaultChecked={settingsStore.PdfExportOptions.firstPage}
          onChange={(v) => {
            const a = settingsStore.PdfExportOptions
            a.firstPage = v.target.checked
            settingsStore.PdfExportOptions = a
          }}
        >
          Add network summary (1st page)
        </Checkbox>
        <Stack pl={6} mt={1} spacing={1}>
          <Checkbox
            defaultChecked={settingsStore.PdfExportOptions.firstPageOptions.title}
            isDisabled={!settingsStore.PdfExportOptions.firstPage}
            onChange={(v) => {
              const a = settingsStore.PdfExportOptions
              a.firstPageOptions.title = v.target.checked
              settingsStore.PdfExportOptions = a
            }}
          >
            Title
          </Checkbox>
          <Checkbox
            defaultChecked={settingsStore.PdfExportOptions.firstPageOptions.image}
            isDisabled={!settingsStore.PdfExportOptions.firstPage}
            onChange={(v) => {
              const a = settingsStore.PdfExportOptions
              a.firstPageOptions.image = v.target.checked
              settingsStore.PdfExportOptions = a
            }}
          >
            Image
          </Checkbox>
          <Checkbox
            defaultChecked={settingsStore.PdfExportOptions.firstPageOptions.summary}
            isDisabled={!settingsStore.PdfExportOptions.firstPage}
            onChange={(v) => {
              const a = settingsStore.PdfExportOptions
              a.firstPageOptions.summary = v.target.checked
              settingsStore.PdfExportOptions = a
            }}
          >
            Summary
          </Checkbox>
        </Stack>


        <Checkbox
          defaultChecked={settingsStore.PdfExportOptions.zonesPage}
          onChange={(v) => {
            const a = settingsStore.PdfExportOptions
            a.zonesPage = v.target.checked
            settingsStore.PdfExportOptions = a
          }}
        >
          Zones
        </Checkbox>
        <Stack pl={6} mt={1} spacing={1}>
          <Checkbox onChange={(v) => {
            const a = settingsStore.PdfExportOptions
            a.zonesPageOptions.image = v.target.checked
            settingsStore.PdfExportOptions = a
          }} isDisabled={!settingsStore.PdfExportOptions.zonesPage} defaultChecked={settingsStore.PdfExportOptions.zonesPageOptions.image}>
            Image
          </Checkbox>
          <Checkbox onChange={(v) => {
            const a = settingsStore.PdfExportOptions
            a.zonesPageOptions.summary = v.target.checked
            settingsStore.PdfExportOptions = a
          }} isDisabled={!settingsStore.PdfExportOptions.zonesPage} defaultChecked={settingsStore.PdfExportOptions.zonesPageOptions.summary}>
            Summary
          </Checkbox>
        </Stack>
        <Heading as="h4" size="sm" pt={5}>
          Zones per page
        </Heading>
        <NumberInput onChange={(v) => {
          settingsStore.PdfExportOptions.zonesPerPage = Number.parseInt(v)
        }} defaultValue={0} min={1} max={zoneStore.Zones.length}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>      </Stack>
    ) : (
      <p></p>
    )
  );

  const PdfButton = observer(() => (
    <Button
      isLoading={isExportingPdf}
      isDisabled={!settingsStore.TrackZonesExport || (!settingsStore.PdfExportOptions.firstPage && !settingsStore.PdfExportOptions.zonesPage)}
      isFullWidth={true}
      onClick={() => {
        setSsExportingPdf(true)
        settingsStore.ExportSnapshot.getPdf().then(async (blob) => {
          const options = {
            suggestedName: `Ego-Report-${new Date().toLocaleString()}.pdf`,
            startIn: 'desktop',
            types: [
              {
                description: 'PDF',
                accept: {
                  'application/pdf': ['.pdf'],
                },
              },
            ],
          };
          try {


            // @ts-ignore
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();

            await writable.write(blob);
            await writable.close();
            setSsExportingPdf(false)
          } catch (error) {
            setSsExportingPdf(false)
          }
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

          settingsStore.ExportSnapshot.GetImageData(ImageType.PNG, true, true).then(async (res) => {
            // settingsStore.ExportSnapshot.getImageToNewTab(ImageType.PNG, false);
            const options = {
              suggestedName: `Ego-${new Date().toLocaleString()}.png`,
              startIn: 'desktop',
              types: [
                {
                  description: 'Image file',
                  accept: {
                    'image/png': ['.png'],
                  },
                },
              ],
            };
            fetch(res.getAttribute("src") as string)
              .then(res => res.blob())
              .then(async (res) => {
                // @ts-ignore
                const handle = await window.showSaveFilePicker(options);
                const writable = await handle.createWritable();

                await writable.write(res);
                await writable.close();
              })

          })
        }}
      >
        PNG
      </Button>

      <Button
        isFullWidth={true}
        onClick={() => {

          settingsStore.ExportSnapshot.GetImageData(ImageType.SVG, true, false).then(async (res) => {
            // settingsStore.ExportSnapshot.getImageToNewTab(ImageType.PNG, false);
            const options = {
              suggestedName: `Ego-${new Date().toLocaleString()}.svg`,
              startIn: 'desktop',
              types: [
                {
                  description: 'Image file',
                  accept: {
                    'image/svg': ['.svg'],
                  },
                },
              ],
            };

            // @ts-ignore
            const handle = await window.showSaveFilePicker(options);
            const writable = await handle.createWritable();
            await writable.write(new XMLSerializer().serializeToString(res));
            await writable.close();

          })

        }}
      >
        SVG
      </Button>
      <Divider />


      <Switch defaultChecked={settingsStore.TrackZonesExport} paddingTop={5} placeContent="flex-end" flexDirection="row-reverse" paddingBottom={5} display="flex" onChange={((v) => {
          settingsStore.TrackZonesExport = v.target.checked;

      })}>      <Heading marginRight={5} as="h4" size="sm">
          Track zones
        </Heading></Switch>


      <PdfButton />

      <Divider />
      <Heading as="h4" size="md" pt={5}>
        PDF options
      </Heading>
      <Divider />
      <ShowTrackOptions />


    </Stack>
  );
}
