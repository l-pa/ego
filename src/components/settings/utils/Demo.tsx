import { Button, CheckboxGroup, createStandaloneToast, Divider, Heading, Input, Stack, Switch, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import parse from "csv-parse/lib/sync";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { ExportGDF } from "../../../objects/export/ExportGDF";
import React from "react";
import { Column, TableOptions, useTable } from 'react-table'
import { Metrics, NMI, OmegaIndex, ZonesMetrics } from "../../../objects/utility/Metrics";
import Table from "./Table";
import Centrality from "../../../objects/utility/Centrality";


export default function Export() {
    const toast = createStandaloneToast();

    useEffect(() => {
        zoneStore.Update()
    }, [])

    const [overlapTable, setOverlapTable] = useState<Object>({})
    const [qualityTable, setQualityTable] = useState<Object>({})
    const [metricsTable, setMetricsTable] = useState<Object>({})


    const GroundTruthButton = observer(() =>
        <Stack>

            <Button disabled={Object.keys(toJS(networkStore.GroundTruth)).length === 0} colorScheme={Object.keys(toJS(networkStore.GroundTruth)).length > 0 ? "green" : "red"} onClick={() => {

                if (networkStore.Network && zoneStore.Zones.length > 0) {

                    const groundTruth = toJS(networkStore.GroundTruth)
                    const current = networkStore.Network.GetCurrentZonesParticipation()

                    const data = {
                        "NMI": new NMI().CalcMetric(current, groundTruth).toFixed(3),
                        "Omega index": new OmegaIndex().CalcMetric(current, groundTruth).toFixed(3)
                    }

                    setOverlapTable(data)
                } else {
                    toast({
                        title: "No zones",
                        description: "Create at least 1 zone",
                        status: "warning",
                        duration: 5000,
                        isClosable: true,
                    });
                }

            }}>Overlap metrics</Button>

            <Table data={overlapTable} />
        </Stack>
    )

    return (
        <Stack p={5}>
            <Heading as="h4" size="md" pb={5}>
                Demo
            </Heading>

            <Stack>
                <Switch defaultChecked={settingsStore.DemoSettings.showZoneNodeColors} onChange={(v) => {
                    const a = settingsStore.DemoSettings
                    a.showZoneNodeColors = v.target.checked
                    settingsStore.DemoSettings = a
                }}>Show inner / outer zone</Switch>
                <CheckboxGroup></CheckboxGroup>
                <Switch defaultChecked={settingsStore.DemoSettings.showEdgeArrows} onChange={(v) => {

                    const a = settingsStore.DemoSettings
                    a.showEdgeArrows = v.target.checked
                    settingsStore.DemoSettings = a

                }} >Show edges arrows</Switch>
                <Switch defaultChecked={settingsStore.DemoSettings.showDependencyValues} onChange={(v) => {

                    const a = settingsStore.DemoSettings
                    a.showDependencyValues = v.target.checked
                    settingsStore.DemoSettings = a

                }}>Show dependency value</Switch>

                <Switch defaultChecked={settingsStore.DemoSettings.showDependencyOnlyOnActive} onChange={(v) => {

                    const a = settingsStore.DemoSettings
                    a.showDependencyOnlyOnActive = v.target.checked
                    settingsStore.DemoSettings = a

                }}>Show dependency only on active edges</Switch>
                {/* <Button onClick={() => {
                    let str = "Source;Target;Weight\n"
                    for (const key in networkStore.Network!!.Edges) {
                        const edge = networkStore.Network!!.Edges[key];
                        str += `${edge.GetNodeA().Id};${edge.GetNodeB().Id};${edge.GetWeight()}\n`
                    }
                    // console.log(str);
                    console.log(new ExportGDF().Export());



                }}>Gephi export</Button> */}

                <Divider />
            </Stack>
        </Stack>
    )
}