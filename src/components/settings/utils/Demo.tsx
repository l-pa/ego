import { Button, CheckboxGroup, Stack, Switch } from "@chakra-ui/react";
import { useEffect } from "react";
import { settingsStore, zoneStore } from "../../..";
import { cy } from "../../../objects/graph/Cytoscape";

export default function Export() {
    useEffect(() => {
        zoneStore.Update()
    }, [])
    return (<Stack>
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

        <Button>Load ground-truth</Button>

    </Stack>
    )
}