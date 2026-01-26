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
