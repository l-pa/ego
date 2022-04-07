import { Heading, Stack, Text } from "@chakra-ui/react"

type AppProps = {
    message: string;
    color: string;
    onMouseEnterF: Function,
    onMouseLeaveF: Function
};

export const Circle: React.FunctionComponent<AppProps> = ({ color, message, onMouseEnterF, onMouseLeaveF }: AppProps) => {
    return (<Stack
        backgroundColor={color}
        onMouseEnter={() => {
            onMouseEnterF()
        }}
        onMouseLeave={() => {
            onMouseLeaveF()
        }
        }
        style={{
            height: "3rem",
            width: "3rem",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignContent: "center"

        }}>
        <Text fontWeight={"bold"} overflowWrap={"normal"} fontSize={"100%"} textAlign={"center"}>{message.substring(0, 4)}</Text>
    </Stack >)
}