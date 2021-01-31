// theme.js
// 1. import `extendTheme` function
import { extendTheme } from "@chakra-ui/react";
// 2. Add your color mode config
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
  colors: {
    primary: {
      50: "#dcf6ff",
      100: "#aedfff",
      200: "#7ec7ff",
      300: "#4db1ff",
      400: "#219bfe",
      500: "#0d82e5",
      600: "#0065b3",
      700: "#004881",
      800: "#002b50",
      900: "#000f20",
    },
  },
};
// 3. extend the theme
const theme = extendTheme(config);
export default theme;
