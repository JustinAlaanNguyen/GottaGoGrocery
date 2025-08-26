// frontend/theme.ts
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "var(--font-kugile), sans-serif",
    body: "var(--font-kugile), sans-serif",
  },
});

export default theme;
