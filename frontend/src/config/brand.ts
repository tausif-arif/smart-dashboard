// White-label configuration — change this file to rebrand for a different client.
// All client-specific values must come from here, never scattered in components.

export const BRAND_CONFIG = {
  name: "Global Electronics",
  shortName: "GE Analytics",
  logo: null,  // Set to a URL or import for custom logo
  favicon: null,

  colors: {
    primary: "#171717",
    onPrimary: "#ffffff",
    accent: "#0070f3",
    accentSoft: "#d3e5ff",
    canvas: "#fafafa",
    canvasElevated: "#ffffff",
    ink: "#171717",
    body: "#4d4d4d",
    mute: "#8f8f8f",
    faint: "#a1a1a1",
    hairline: "#ebebeb",
    hairlineSoft: "#f2f2f2",
    error: "#ee0000",
    warning: "#f5a623",
    success: "#0070f3",
  },

  currency: "USD",
  currencySymbol: "$",
  locale: "en-US",

  dateFormat: "MMM D, YYYY",

  font: {
    sans: "'Lato', 'Inter', Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Mono', monospace",
  },

  borderRadius: {
    sm: "6px",
    md: "12px",
    lg: "16px",
    pill: "100px",
    full: "9999px",
  },

  // Dashboard terminology — customize for each client
  terms: {
    revenue: "Revenue",
    orders: "Orders",
    customers: "Customers",
    products: "Products",
    locations: "Locations",
  },

  // Default period shown on first load
  defaultPeriod: "this_year",
};

export type BrandConfig = typeof BRAND_CONFIG;
