import { ReactNode } from "react";

/**
 * Extract text content from React nodes
 */
export const extractText = (node: ReactNode): string => {
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

    // Handle Fragments (symbol type)
    if (typeof type === "symbol" || !type) {
      return props.children ? nodeToHTML(props.children) : "";
    }

    // Get tag name
    let tagName = "div";
    if (typeof type === "string") {
      tagName = type;
    } else if (typeof type === "function") {
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
  body?: (rowData: T, options?: { rowIndex?: number }) => ReactNode;
  footer?: () => ReactNode;
}

export interface PrintTableOptions<T = any> {
  data: T[];
  columns: PrintTableColumn<T>[];
  printTitle?: string;
  printSubTitle?: string;
  printHeaderContent?: ReactNode;
  landscape?: boolean;
}

export interface PrintGroupedTableOptions<T = any> {
  data: T[];
  columns: PrintTableColumn<T>[];
  groupBy: keyof T | string;
  printTitle?: string;
  printSubTitle?: string;
  printHeaderContent?: string | ReactNode;
  landscape?: boolean;
}

/**
 * Prints a table with the given data and columns
 */
export const printTable = <T extends Record<string, any>>({
  data,
  columns,
  printTitle,
  printHeaderContent,
  landscape,
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
        const bodyResult = col.body(row, { rowIndex: data.indexOf(row) });
        cellValue = nodeToHTML(bodyResult);
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
          return nodeToHTML(footerResult);
        }
        return "";
      })
    : null;

  // Get column headers
  const headers = columns.map((col) => col.header);

  // Get column alignments
  const alignments = columns.map((col) => col.align || "left");

  // Calculate column widths to fit on page
  const totalColumns = headers.length;
  const columnWidthPercent = Math.floor(100 / totalColumns);

  // Generate HTML
  const tableHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: auto;">
      <thead>
        <tr>
          ${headers
            .map((header, idx) => {
              const minWidth = columns[idx].style?.minWidth;
              const widthStyle = minWidth
                ? `min-width: ${minWidth};`
                : `width: ${columnWidthPercent}%;`;
              return `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f3f4f6; font-weight: bold; text-align: ${alignments[idx]}; ${widthStyle} white-space: nowrap;">${header}</th>`;
            })
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${tableRows
          .map(
            (row) =>
              `<tr>${row
                .map((cell, idx) => {
                  const minWidth = columns[idx].style?.minWidth;
                  const widthStyle = minWidth
                    ? `min-width: ${minWidth};`
                    : `width: ${columnWidthPercent}%;`;
                  return `<td style="border: 1px solid #ddd; padding: 8px; text-align: ${alignments[idx]}; ${widthStyle} word-wrap: break-word; overflow-wrap: break-word;">${cell}</td>`;
                })
                .join("")}</tr>`
          )
          .join("")}
      </tbody>
      ${
        footerRow
          ? `<tfoot><tr>${footerRow
              .map((cell, idx) => {
                const minWidth = columns[idx].style?.minWidth;
                const widthStyle = minWidth
                  ? `min-width: ${minWidth};`
                  : `width: ${columnWidthPercent}%;`;
                return `<td style="border: 1px solid #ddd; padding: 8px; background-color: #f3f4f6; font-weight: bold; text-align: ${alignments[idx]}; ${widthStyle}">${cell}</td>`;
              })
              .join("")}</tr></tfoot>`
          : ""
      }
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
              size: ${landscape ? "A4 landscape" : "A4"};
              margin: 0.5cm;
            }
            body {
              padding: 10px;
            }
            table {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 10px;
            }
            th, td {
              padding: 4px 6px !important;
              font-size: 10px;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .print-header-content {
              page-break-after: avoid;
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

/**
 * Prints multiple tables grouped by a specific field
 * Each group is printed as a separate table with its own header
 */
export const printGroupedTable = <T extends Record<string, any>>({
  data,
  columns,
  groupBy,
  printTitle,
  printSubTitle,
  printHeaderContent,
  landscape,
}: PrintGroupedTableOptions<T>) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  // Group data by the specified field
  const groupedData = data.reduce(
    (acc, entry) => {
      const groupValue = (entry as any)[groupBy];
      const groupKey = String(groupValue);
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(entry);
      return acc;
    },
    {} as Record<string, T[]>
  );

  const groups = Object.keys(groupedData);

  // Get shared column headers and alignments
  const headers = columns.map((col) => col.header);
  const alignments = columns.map((col) => col.align || "left");
  const columnWidthPercent = Math.floor(100 / headers.length);

  // Generate Table Body with Group Headers
  const tableContentHTML = groups
    .map((group, index) => {
      const groupData = groupedData[group];

      // Group Header Row
      const groupHeaderRow = `
      <tr>
        <td colspan="${headers.length}" class="group-header-row" style="background-color: #f3f4f6; padding: 10px 12px; font-weight: 700; font-size: 13px; text-transform: uppercase; border: 1px solid #ddd;">
          ${group} ~ (${groupData.length})
        </td>
      </tr>
    `;

      // Data Rows
      const dataRows = groupData
        .map((row, rowIndex) => {
          // Explicitly pass group-relative index
          const cells = columns
            .map((col, idx) => {
              const field = col.field as string;
              let cellValue = "";

              if (col.body) {
                // IMPORTANT: We override groupSerial for the print columns that check it
                // to ensure sequencing starts from 1 per group
                const rowWithGroupIndex = { ...row, groupSerial: rowIndex + 1 };
                const bodyResult = col.body(rowWithGroupIndex, {
                  rowIndex: rowIndex,
                });
                cellValue = nodeToHTML(bodyResult);
              } else {
                const value = (row as any)[field];
                if (value !== null && value !== undefined) {
                  cellValue =
                    typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value);
                }
              }

              const minWidth = columns[idx].style?.minWidth;
              const widthStyle = minWidth
                ? `min-width: ${minWidth};`
                : `width: ${columnWidthPercent}%;`;

              return `<td style="border: 1px solid #ddd; padding: 6px 8px; text-align: ${alignments[idx]}; ${widthStyle} word-wrap: break-word; overflow-wrap: break-word; font-size: 11px;">${cellValue}</td>`;
            })
            .join("");

          return `<tr>${cells}</tr>`;
        })
        .join("");

      // Spacer Row (only if not the last group)
      const spacerRow =
        index < groups.length - 1
          ? `
      <tr>
        <td colspan="${headers.length}" style="border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; height: 15px;"></td>
      </tr>
    `
          : "";

      return groupHeaderRow + dataRows + spacerRow;
    })
    .join("");

  const tableHTML = `
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; table-layout: auto;">
      <thead>
        <tr>
          ${headers
            .map((header, idx) => {
              const minWidth = columns[idx].style?.minWidth;
              const widthStyle = minWidth
                ? `min-width: ${minWidth};`
                : `width: ${columnWidthPercent}%;`;
              return `<th style="border: 1px solid #ddd; padding: 6px 8px; background-color: #f8fafc; font-weight: bold; text-align: ${alignments[idx]}; ${widthStyle} white-space: nowrap; font-size: 11px;">${header}</th>`;
            })
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${tableContentHTML}
      </tbody>
    </table>
  `;

  // Generate header content HTML
  let headerHTML = "";
  if (printHeaderContent) {
    const content =
      typeof printHeaderContent === "string"
        ? `<span style="font-weight: 600;">${printHeaderContent}</span>`
        : nodeToHTML(printHeaderContent);

    headerHTML = `<div style="display: flex; width: 100%; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: #f5f5f5;">
      ${content}
    </div>`;
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${printTitle || "Print"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          .print-header {
            width: 100%;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
            text-align: center;
          }
          .print-header h1 { font-size: 18px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          
          @media print {
            @page {
              size: ${landscape ? "A4 landscape" : "A4"};
              margin: 0.5cm;
            }
            body { padding: 10px; }
            table { width: 100% !important; max-width: 100% !important; font-size: 10px; }
            th, td { padding: 4px 6px !important; font-size: 10px; word-wrap: break-word; overflow-wrap: break-word; }
            .group-header-row {
              background-color: #f3f4f6 !important;
              -webkit-print-color-adjust: exact;
              page-break-after: avoid;
              break-after: avoid;
            }
            tr { page-break-inside: avoid; break-inside: avoid; }
            thead { display: table-header-group; }
          }
        </style>
      </head>
      <body>
        ${
          printTitle
            ? `<div class="print-header">
                <h1>${printTitle}</h1>
                ${!!printSubTitle ? `<p style="color: #6b7280; font-size: 14px; margin-top: 5px;">${printSubTitle}</p>` : ""}
              </div>`
            : ""
        }
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
