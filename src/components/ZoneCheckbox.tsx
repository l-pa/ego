import { Checkbox, Stack, Box, Text } from "@chakra-ui/react"
import { FunctionComponent, useRef } from "react"
import EgoZone from "../objects/zone/EgoZone"
import Zone from "../objects/zone/Zone"

export const ZoneCheckbox: FunctionComponent<{ zone: Zone, isChecked?: boolean, onChange?: Function }> = ({ zone, isChecked, onChange }) => {

    const checkboxRef = useRef<HTMLInputElement>(null)

    return (<Stack>
        <Checkbox borderColor={zone instanceof EgoZone ? zone.StringColorRGB() : ""} ref={checkboxRef}>
            <Stack display="flex" flexDirection="row" justifyContent="space-around">
                <Text>
                    {zone.Id}
                </Text>
                {/* {zone instanceof EgoZone ? <Box bgColor={zone.Color} width="5" height="5"></Box> : <Box>?</Box>} */}
            </Stack>
        </Checkbox>

    </Stack >)
}