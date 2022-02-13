import { Button, CheckboxGroup, Stack, Switch } from "@chakra-ui/react";
import { useEffect } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import { NMI, OmegaIndex } from "../../../objects/utility/Metrics";

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

        <Button onClick={() => {
            console.log(networkStore.Network?.GetCurrentZonesParticipation());
            const omega = new OmegaIndex().CalcMetric(networkStore.Network!!.GetCurrentZonesParticipation(), networkStore.Network!!.GetCurrentZonesParticipation())
            console.log(omega);
            new NMI().CalcMetric(networkStore.Network!!.GetCurrentZonesParticipation(), networkStore.Network!!.GetCurrentZonesParticipation())
        }}>Load ground-truth</Button>

    </Stack>
    )
}