// theme.js
// 1. import `extendTheme` function
import { extendTheme } from "@chakra-ui/react";
// 2. Add your color mode config
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
  colors: {
    primary: {
      50: "#f2e6ff",
      100: "#d4b8fc",
      200: "#b68af6",
      300: "#995cf0",
      400: "#7c2eeb",
      500: "#6314d1",
      600: "#4d0fa4",
      700: "#370976",
      800: "#210549",
      900: "#0d001d",
    },
  },
};
// 3. extend the theme
const theme = extendTheme(config);
export default theme;
