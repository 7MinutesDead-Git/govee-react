import { MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  loader: "dots",
  colorScheme: "dark",
  // https://mantine.dev/styles/responsive/#configure-breakpoints
  breakpoints: {
    xs: 500,
    sm: 800,
    md: 1000,
    lg: 1300,
    xl: 1800,
  },
};
