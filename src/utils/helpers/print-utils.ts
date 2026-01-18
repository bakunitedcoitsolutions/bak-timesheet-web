import { ReactNode } from "react";

/**
 * Extract text content from React nodes
 */
const extractText = (node: ReactNode): string => {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (
    node &&
    typeof node === "object" &&
    "props" in node &&
    (node as { props?: { children?: ReactNode } }).props &&
    "children" in (node as { props: { children?: ReactNode } }).props
  ) {
    return extractText(
      (node as { props: { children?: ReactNode } }).props.children
    );
  }
  return "";
};

/**
 * Converts a React node to HTML string with inline styles
 * Handles Tailwind CSS classes and converts them to inline styles
 */
export const nodeToHTML = (node: ReactNode): string => {
  if (typeof node === "string")
    return node.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToHTML).join("");

  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: any }).props;
    const type = (node as { type?: string | React.ComponentType }).type;

    if (!props) return "";

    // Get tag name
    let tagName = "div";
    if (typeof type === "string") {
      tagName = type;
    } else if (type && typeof type === "function") {
      // For custom components, default to div
      tagName = "div";
    }

    // Convert className to inline styles (basic Tailwind to CSS mapping)
    const styleMap: Record<string, string> = {};
    const className = props.className || "";

    // Basic Tailwind class to inline style conversion
    if (className.includes("flex")) styleMap.display = "flex";
    if (className.includes("flex-col")) styleMap.flexDirection = "column";
    if (className.includes("flex-row")) styleMap.flexDirection = "row";
    if (className.includes("flex-1")) styleMap.flex = "1";
    if (className.includes("justify-between"))
      styleMap.justifyContent = "space-between";
    if (className.includes("justify-end")) styleMap.justifyContent = "flex-end";
    if (className.includes("justify-start"))
      styleMap.justifyContent = "flex-start";
    if (className.includes("items-center")) styleMap.alignItems = "center";
    if (className.includes("items-start")) styleMap.alignItems = "flex-start";
    if (className.includes("gap-2")) styleMap.gap = "0.5rem";
    if (className.includes("gap-3")) styleMap.gap = "0.75rem";
    if (className.includes("gap-x-2")) styleMap.columnGap = "0.5rem";
    if (className.includes("gap-y-1")) styleMap.rowGap = "0.25rem";
    if (className.includes("w-full")) styleMap.width = "100%";
    if (className.includes("text-right")) styleMap.textAlign = "right";
    if (className.includes("text-center")) styleMap.textAlign = "center";
    if (className.includes("text-left")) styleMap.textAlign = "left";
    if (className.includes("font-semibold")) styleMap.fontWeight = "600";
    if (className.includes("font-bold")) styleMap.fontWeight = "700";
    if (className.includes("font-medium")) styleMap.fontWeight = "500";
    if (className.includes("text-xs")) styleMap.fontSize = "0.75rem";
    if (className.includes("text-sm")) styleMap.fontSize = "0.875rem";
    if (className.includes("text-gray-400")) styleMap.color = "#9ca3af";
    if (className.includes("text-gray-600")) styleMap.color = "#4b5563";
    if (className.includes("hidden")) styleMap.display = "none";

    // Convert style object to string
    const style = Object.entries(styleMap)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join("; ");

    // Get children HTML
    const children = props.children ? nodeToHTML(props.children) : "";

    // Build HTML
    const styleAttr = style ? ` style="${style}"` : "";
    return `<${tagName}${styleAttr}>${children}</${tagName}>`;
  }

  return "";
};

export interface PrintTableColumn<T = any> {
  field: keyof T | string;
  header: string;
  align?: "left" | "center" | "right";
  style?: { minWidth?: number | string; width?: number | string };
  body?: (rowData: T) => ReactNode;
  footer?: () => ReactNode;
}

export interface PrintTableOptions<T = any> {
  data: T[];
  columns: PrintTableColumn<T>[];
  printTitle?: string;
  printHeaderContent?: ReactNode;
}

/**
 * Prints a table with the given data and columns
 */
export const printTable = <T extends Record<string, any>>({
  data,
  columns,
  printTitle,
  printHeaderContent,
}: PrintTableOptions<T>) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // Generate table rows
  const tableRows = data.map((row) => {
    return columns.map((col) => {
      const field = col.field as string;
      let cellValue = "";

      if (col.body) {
        const bodyResult = col.body(row);
        cellValue = extractText(bodyResult);
      } else {
        const value = (row as any)[field];
        if (value !== null && value !== undefined) {
          if (typeof value === "object") {
            cellValue = JSON.stringify(value);
          } else {
            cellValue = String(value);
          }
        }
      }

      return cellValue;
    });
  });

  // Generate footer row if any column has footer
  const hasFooter = columns.some((col) => col.footer);
  const footerRow = hasFooter
    ? columns.map((col) => {
        if (col.footer) {
          const footerResult = col.footer();
          return extractText(footerResult);
        }
        return "";
      })
    : null;

  // Get column headers
  const headers = columns.map((col) => col.header);

  // Get column alignments
  const alignments = columns.map((col) => col.align || "left");

  // Generate HTML
  const tableHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr>
          ${headers
            .map(
              (header, idx) =>
                `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f3f4f6; font-weight: bold; text-align: ${alignments[idx]}; min-width: ${columns[idx].style?.minWidth || "auto"}">${header}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${tableRows
          .map(
            (row) =>
              `<tr>${row
                .map(
                  (cell, idx) =>
                    `<td style="border: 1px solid #ddd; padding: 8px; text-align: ${alignments[idx]}">${cell}</td>`
                )
                .join("")}</tr>`
          )
          .join("")}
      </tbody>
      ${footerRow ? `<tfoot><tr>${footerRow.map((cell, idx) => `<td style="border: 1px solid #ddd; padding: 8px; background-color: #f3f4f6; font-weight: bold; text-align: ${alignments[idx]}">${cell}</td>`).join("")}</tr></tfoot>` : ""}
    </table>
  `;

  // Generate header content HTML
  let headerHTML = "";
  if (printHeaderContent) {
    // Convert React node to HTML with proper styling
    const headerContentHTML = nodeToHTML(printHeaderContent);
    headerHTML = `<div class="print-header-content">${headerContentHTML}</div>`;
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${printTitle || "Print"}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            font-size: 12px;
          }
          .print-header {
            width: 100%;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          .print-header h1 {
            font-size: 18px;
            margin-bottom: 10px;
            text-align: center;
          }
          .print-header-content {
            display: flex;
            width: 100%;
            justify-content: space-between;
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f5f5f5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          tfoot td {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          @media print {
            @page {
              size: A4;
              margin: 0.5cm;
            }
            body {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        ${printTitle ? `<div class="print-header"><h1>${printTitle}</h1></div>` : ""}
        ${headerHTML}
        ${tableHTML}
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
