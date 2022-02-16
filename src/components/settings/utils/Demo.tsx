import { Button, CheckboxGroup, Stack, Switch } from "@chakra-ui/react";
import { useEffect } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import parse from "csv-parse/lib/sync";
import { NMI, OmegaIndex } from "../../../objects/utility/Metrics";
import EgoZone from "../../../objects/zone/EgoZone";
import { DuplicatesByEgo } from "../../../objects/zone/Filter";
import { NodeProminency } from "../../../objects/network/Node";

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
            console.log({ ...networkStore.GroundTruth });

            console.log(networkStore.Network?.GetCurrentZonesParticipation());
            const omega = new OmegaIndex().CalcMetric(networkStore.Network!!.GetCurrentZonesParticipation(), networkStore.Network!!.GetCurrentZonesParticipation())
            console.log("Omega " + omega);
            const nmi = new NMI().CalcMetric(networkStore.Network!!.GetCurrentZonesParticipation(), networkStore.Network!!.GetCurrentZonesParticipation())
            console.log("NMI " + nmi);

        }}>Overlap metrics</Button>

        <Button onClick={async () => {
            const tmpZone: EgoZone[] = []

            for (const key in networkStore.Network?.Nodes) {
                const node = networkStore.Network?.Nodes[key];
                if (node)
                    tmpZone.push(new EgoZone(node))
            }

            const zonesLength = tmpZone.length
            let maxZoneSize = -1
            let minZoneSize = 9999999
            let avgZoneSize = 0

            let maxZoneInnerSize = -1
            let minZoneInnerSize = 999999
            let avgZoneInnerSize = 0

            let maxZoneOuterSize = -1
            let minZoneOuterSize = 99999999999
            let avgZoneOuterSize = 0

            let maxZoneOuterLiasonsSize = -1
            let minZoneOuterLiasonsSize = 999999999
            let avgZoneOuterLiasonsSize = 0

            let maxZoneOuterCoLiasonsSize = -1
            let minZoneOuterCoLiasonsSize = 9999999999
            let avgZoneOuterCoLiasonsSize = 0

            let maxSubzoneSize = -1
            let minSubzoneSize = 999999
            let avgSubzoneSize = 0

            let maxSuperzoneSize = -1
            let minSuperzoneSize = 999999
            let avgSuperzoneSize = 0

            let simpleZoneLength = 0
            let dyadZoneLength = 0
            let tryadZoneLength = 0

            let maxEmbededdness = -1
            let minEmbededdness = 999999
            let avgEmbededdness = 0

            tmpZone.forEach(z => {
                if (z.AllCollection.length > maxZoneSize)
                    maxZoneSize = z.AllCollection.length
                if (z.AllCollection.length < minZoneSize)
                    minZoneSize = z.AllCollection.length
                avgZoneSize += z.AllCollection.length

                if (z.InnerCollection.length > maxZoneInnerSize)
                    maxZoneInnerSize = z.InnerCollection.length
                if (z.InnerCollection.length < minZoneInnerSize)
                    minZoneInnerSize = z.InnerCollection.length
                avgZoneInnerSize += z.InnerCollection.length

                if (z.OutsideCollection.length > maxZoneOuterSize)
                    maxZoneOuterSize = z.OutsideCollection.length
                if (z.OutsideCollection.length < minZoneOuterSize)
                    minZoneOuterSize = z.OutsideCollection.length
                avgZoneOuterSize += z.OutsideCollection.length


                if (z.OutsideNodes[0].length > maxZoneOuterLiasonsSize)
                    maxZoneOuterLiasonsSize = z.OutsideNodes[0].length
                if (z.OutsideNodes[0].length < minZoneOuterLiasonsSize)
                    minZoneOuterLiasonsSize = z.OutsideNodes[0].length
                avgZoneOuterLiasonsSize += z.OutsideNodes[0].length

                if (z.OutsideNodes[1].length > maxZoneOuterCoLiasonsSize)
                    maxZoneOuterCoLiasonsSize = z.OutsideNodes[1].length
                if (z.OutsideNodes[1].length < minZoneOuterCoLiasonsSize)
                    minZoneOuterCoLiasonsSize = z.OutsideNodes[1].length
                avgZoneOuterCoLiasonsSize += z.OutsideNodes[1].length


                zoneStore.SubzonesOfZone([z]).then(zones => {
                    const sorted = zones.sort((b: EgoZone, a: EgoZone) =>
                        a.AllCollection.length - b.AllCollection.length
                    )
                    if (sorted.length > 0) {
                        if (maxSubzoneSize < sorted[0].AllCollection.length) {

                            maxSubzoneSize = sorted[0].AllCollection.length
                        }
                        maxSubzoneSize = 88
                        if (minSubzoneSize > sorted[0].AllCollection.length)
                            minSubzoneSize = sorted[sorted.length - 1].AllCollection.length

                        sorted.forEach(sortedZone => {
                            avgSubzoneSize += sortedZone.AllCollection.length
                        })
                        avgSubzoneSize /= sorted.length
                    }

                })

                zoneStore.SuperzoneOfZone(z).then(zones => {
                    const sorted = zones.sort((b: EgoZone, a: EgoZone) =>
                        a.AllCollection.length - b.AllCollection.length
                    )

                    if (sorted.length > 0) {
                        if (maxSuperzoneSize < sorted[0].AllCollection.length)
                            maxSuperzoneSize = sorted[0].AllCollection.length
                        if (minSuperzoneSize > sorted[sorted.length - 1].AllCollection.length)
                            minSuperzoneSize = sorted[sorted.length - 1].AllCollection.length

                        sorted.forEach(sortedZone => {
                            avgSuperzoneSize += sortedZone.AllCollection.length
                        })
                        avgSuperzoneSize /= sorted.length
                    }


                })

                if (z.AllCollection.length === 1)
                    simpleZoneLength++
                if (z.AllCollection.length === 2)
                    dyadZoneLength++
                if (z.AllCollection.length === 3)
                    tryadZoneLength++


                if (z.Embeddedness > maxEmbededdness)
                    maxEmbededdness = z.Embeddedness
                if (z.Embeddedness < minEmbededdness)
                    minEmbededdness = z.Embeddedness
                avgEmbededdness += z.Embeddedness

            })

            const duplicates = new DuplicatesByEgo().FilterWithParams(tmpZone, { duplicates: "de" })
            const multiego = new DuplicatesByEgo().FilterWithParams(tmpZone, { duplicates: "me" })

            let maxDuplicateZoneSize = -1
            let minDuplicateZoneSize = 9999999999
            let avgDuplicateZoneSize = 0

            duplicates.forEach(d => {
                if (d.AllCollection.length > maxDuplicateZoneSize) {
                    maxDuplicateZoneSize = d.AllCollection.length
                }
                if (d.AllCollection.length < minDuplicateZoneSize) {
                    minDuplicateZoneSize = d.AllCollection.length
                }
                avgDuplicateZoneSize += d.AllCollection.length
            })

            avgDuplicateZoneSize /= duplicates.length


            let maxEgoZoneSize = -1
            let minEgoZoneSize = 999999999
            let avgEgoZoneSize = 0

            multiego.forEach(d => {
                if (d.AllCollection.length > maxEgoZoneSize) {
                    maxEgoZoneSize = d.AllCollection.length
                }
                if (d.AllCollection.length < minEgoZoneSize) {
                    minEgoZoneSize = d.AllCollection.length
                }
                avgEgoZoneSize += d.AllCollection.length
            })

            avgEgoZoneSize /= multiego.length



            let globalWeaklyProminentLength = 0
            let globalStronglyProminentLength = 0
            let globalProminentLength = 0

            for (const key in networkStore.Network?.Nodes) {
                const node = networkStore.Network?.Nodes[key];
                const p = node?.isProminent()
                if (p === NodeProminency.StronglyProminent)
                    globalStronglyProminentLength++

                if (p === NodeProminency.WeaklyProminent)
                    globalWeaklyProminentLength++

                if (p === NodeProminency.NonProminent)
                    globalProminentLength++
            }

            let maxZoneOverlapSize = -1
            let minZoneOverlapSize = 99999
            let avgZoneOverlapSize = 0

            tmpZone.forEach(z1 => {
                tmpZone.forEach(z2 => {
                    if (z1 !== z2) {
                        const i = z1.AllCollection.intersect(z2.AllCollection).length

                        if (i > maxZoneOverlapSize)
                            maxZoneOverlapSize = i
                        if (i < minZoneOverlapSize)
                            minZoneOverlapSize = i
                        avgZoneOverlapSize += i

                    }
                })
            });

            avgZoneOverlapSize /= tmpZone.length
            avgZoneSize /= tmpZone.length
            avgZoneInnerSize /= tmpZone.length
            avgZoneOuterSize /= tmpZone.length
            avgZoneOuterLiasonsSize /= tmpZone.length
            avgZoneOuterCoLiasonsSize /= tmpZone.length
            avgEmbededdness /= tmpZone.length


            const res = {
                maxZoneSize,
                minZoneSize,
                avgZoneSize,

                maxZoneInnerSize,
                minZoneInnerSize,
                avgZoneInnerSize,

                maxZoneOuterSize,
                minZoneOuterSize,
                avgZoneOuterSize,

                maxZoneOuterLiasonsSize,
                minZoneOuterLiasonsSize,
                avgZoneOuterLiasonsSize,

                maxZoneOuterCoLiasonsSize,
                minZoneOuterCoLiasonsSize,
                avgZoneOuterCoLiasonsSize
                ,
                maxSubzoneSize,
                minSubzoneSize,
                avgSubzoneSize,

                maxSuperzoneSize,
                minSuperzoneSize,
                avgSuperzoneSize,

                simpleZoneLength,
                dyadZoneLength,
                tryadZoneLength,

                maxEmbededdness,
                minEmbededdness,
                avgEmbededdness,

                maxDuplicateZoneSize,
                minDuplicateZoneSize,
                avgDuplicateZoneSize,

                maxEgoZoneSize,
                minEgoZoneSize,
                avgEgoZoneSize,

                globalWeaklyProminentLength,
                globalStronglyProminentLength,
                globalProminentLength,
                maxZoneOverlapSize,
                minZoneOverlapSize,
                avgZoneOverlapSize
            }

            console.log(res);


        }}>Calc zones</Button>

        <input type="file" onChange={(e) => {
            if (e.target.files) {
                const file = e.target.files[0]

                let reader = new FileReader();

                reader.readAsText(file);

                reader.onload = function () {
                    const parsed = parse(reader.result as string, {
                        delimiter: ",",
                        columns: false,
                        skip_empty_lines: true,
                    });

                    const participation: { [key: string]: Set<number> } = {};

                    parsed.forEach((row: string[]) => {

                        if (participation[row[1]]) {
                            participation[row[1]].add(parseInt(row[0]));
                        } else {
                            participation[row[1]] = new Set<number>([parseInt(row[0])]);
                        }

                    });

                    networkStore.GroundTruth = participation
                }
                reader.onerror = function () {
                    console.log(reader.error);
                };
            }
        }
        } />


    </Stack>
    )
}