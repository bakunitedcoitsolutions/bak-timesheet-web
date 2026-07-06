export const COLORS = {
  primary: "#ff3d32",
};

export const FORM_FIELD_WIDTHS = {
  "2": "max-w-full md:max-w-68 md:max-w-none md:min-w-60 xl:min-w-72 w-full",
  "3": "max-w-68 2xl:max-w-none md:min-w-56 2xl:min-w-64 w-full",
  "4": "max-w-full md:max-w-72 xl:max-w-none md:min-w-60 xl:min-w-40 2xl:min-w-56 w-full",
  full: "w-full",
};

export const STATUS_OPTIONS = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

export * from "./permissions";
export * from "./reports";
export * from "./storage";

export const COMMON_QUERY_INPUT = {
  page: 1,
  limit: 1000,
  sortBy: "displayOrderKey" as const,
  sortOrder: "asc" as const,
};

export const BANK_OPTIONS = [
  { label: "Saudi National Bank", value: "Saudi National Bank" },
  { label: "Al Rajhi Bank", value: "Al Rajhi Bank" },
  { label: "Alinma Bank", value: "Alinma Bank" },
  { label: "Saudi British Bank", value: "Saudi British Bank" },
  { label: "Saudi British Bank (SABB)", value: "Saudi British Bank (SABB)" },
  { label: "Al Jazira Bank", value: "Al Jazira Bank" },
  { label: "Arab National Bank", value: "Arab National Bank" },
  { label: "Bank Al Jazira", value: "Bank Al Jazira" },
  { label: "Banque Saudi Fransi", value: "Banque Saudi Fransi" },
  {
    label: "National Commercial Bank (NCB)",
    value: "National Commercial Bank (NCB)",
  },
  {
    label: "Saudi Investment Bank (SAIB)",
    value: "Saudi Investment Bank (SAIB)",
  },
  { label: "Other", value: "Other" },
];

export const SITE_WISE_PAYROLL_SECTION_IDS = {
  "1": "Office Staff",
  "2": "Formans (Construction)",
  "7": "Drivers (Construction)",
  "8": "Steel Fixers (Construction)",
  "9": "Carpenters (Construction)",
  "10": "BD, Labour (Construction)",
  "11": "OS, Labour (Construction)",
  "12": "Masons (Construction)",
  "13": "Electrician (Construction)",
  "16": "Scaffolder (Construction)",
  "19": "Al Barkah Development",
  "20": "OS, Establishments",
};

export const SITE_WISE_PAYROLL_SECTION_IDS_ARRAY = Object.keys(
  SITE_WISE_PAYROLL_SECTION_IDS
).map((id) => Number(id));
