import { MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  loader: "dots",
  colorScheme: "dark",
  // https://mantine.dev/styles/responsive/#configure-breakpoints
  // Assuming 16px base font size
  //     xs: 500,
  //     sm: 800,
  //     md: 1000,
  //     lg: 1300,
  //     xl: 1800
  breakpoints: {
    xs: "31.25em",
    sm: "50em",
    md: "62.5em",
    lg: "81.25em",
    xl: "112.5em",
  },
};
