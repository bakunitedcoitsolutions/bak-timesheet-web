import { MenuItem, getSetupItemBySlug, menuItems } from "./user.utility";

export type AppBreadcrumbItem = {
  label: string;
  href?: string;
};

type GetBreadcrumbOptions = {
  lastLabel?: string;
};

const dashboardCrumb = (): AppBreadcrumbItem => ({
  label: "Dashboard",
  href: "/",
});

const formatSegmentLabel = (segment: string) =>
  segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const normalizePath = (pathname: string) => {
  const path = pathname.split("?")[0] || "/";

  if (path !== "/" && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path || "/";
};

const isExactOrChild = (path: string, href: string) => {
  if (href === "/") {
    return path === "/";
  }

  return path === href || path.startsWith(`${href}/`);
};

const getParentDefaultHref = (parent: MenuItem) =>
  parent.href ||
  parent.subMenuItems?.find((item) => item.href)?.href ||
  parent.items?.find((item) => item.href)?.href;

const isMainSectionPage = (parent: MenuItem, match: any) =>
  Boolean(match.href && match.href === getParentDefaultHref(parent));

const singularize = (word: string) => {
  if (!word) return "";
  if (word === "Users Mgmt.") return "User Mgmt.";
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses") || word.endsWith("ches") || word.endsWith("shes") || word.endsWith("xes")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
};

const getDynamicSegmentLabel = (path: string) => {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "";

  const lastPart = parts[parts.length - 1];
  const parentPart = parts.length > 1 ? parts[parts.length - 2] : parts[0];

  if (lastPart === "new") {
    const formattedSection = formatSegmentLabel(singularize(parentPart));
    return formattedSection ? `Create ${formattedSection}` : "Create";
  }

  if (lastPart && (/^\d+$/.test(lastPart) || /^[0-9a-fA-F-]+$/.test(lastPart))) {
    const formattedSection = formatSegmentLabel(singularize(parentPart));
    return formattedSection ? `Edit ${formattedSection}` : "Edit";
  }

  return formatSegmentLabel(lastPart);
};

const findBestMenuMatch = (path: string) => {
  let best: { parent: MenuItem | null; match: any; score: number } | null =
    null;

  for (const item of menuItems) {
    if (item.divider) {
      continue;
    }

    const subs = item.subMenuItems || item.items || [];
    
    if (subs.length) {
      for (const subItem of subs) {
        if (!subItem.href || !isExactOrChild(path, subItem.href)) {
          continue;
        }

        const score = subItem.href.length;

        if (!best || score > best.score) {
          best = { parent: item, match: subItem, score };
        }
      }
    }

    if (item.href && isExactOrChild(path, item.href)) {
      const score = item.href.length;

      if (!best || score > best.score) {
        best = { parent: null, match: item, score };
      }
    }
  }

  return best;
};

const getSetupBreadcrumbs = (
  path: string,
  lastLabel?: string
): AppBreadcrumbItem[] => {
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 1) {
    return [dashboardCrumb(), { label: "Setup" }];
  }

  const sectionSlug = parts[1];
  const setupItem = getSetupItemBySlug(sectionSlug);

  if (!setupItem) {
    return [
      dashboardCrumb(),
      { label: "Setup", href: "/setup" },
      { label: lastLabel ?? formatSegmentLabel(sectionSlug) },
    ];
  }

  if (parts.length === 2) {
    return [
      dashboardCrumb(),
      { label: "Setup", href: "/setup" },
      { label: setupItem.label },
    ];
  }

  return [
    dashboardCrumb(),
    { label: "Setup", href: "/setup" },
    { label: setupItem.label, href: setupItem.href },
    {
      label: lastLabel ?? getDynamicSegmentLabel(path),
    },
  ];
};

const getFallbackBreadcrumbs = (
  path: string,
  lastLabel?: string
): AppBreadcrumbItem[] => {
  const parts = path.split("/").filter(Boolean);
  const crumbs: AppBreadcrumbItem[] = [dashboardCrumb()];

  parts.forEach((segment, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    const isLast = index === parts.length - 1;

    crumbs.push({
      label:
        isLast && lastLabel
          ? lastLabel
          : isLast
            ? getDynamicSegmentLabel(path)
            : formatSegmentLabel(segment),
      href: isLast ? undefined : href,
    });
  });

  return crumbs;
};

const getSubmenuBreadcrumbs = (
  parent: MenuItem,
  match: any,
  path: string,
  options?: GetBreadcrumbOptions
): AppBreadcrumbItem[] => {
  const matchHref = match.href || "";
  const isExactMatch = path === matchHref;
  const hasExtraSegments =
    Boolean(matchHref) &&
    path.startsWith(`${matchHref}/`) &&
    path !== matchHref;
  const parentHref = getParentDefaultHref(parent);

  if (isExactMatch && isMainSectionPage(parent, match)) {
    return [dashboardCrumb(), { label: options?.lastLabel ?? match.label }];
  }

  if (isExactMatch) {
    return [
      dashboardCrumb(),
      { label: parent.label, href: parentHref },
      { label: options?.lastLabel ?? match.label },
    ];
  }

  if (!hasExtraSegments) {
    return [
      dashboardCrumb(),
      { label: parent.label, href: parentHref },
      { label: options?.lastLabel ?? match.label },
    ];
  }

  return [
    dashboardCrumb(),
    { label: parent.label, href: parentHref },
    { label: match.label, href: match.href },
    {
      label: options?.lastLabel ?? getDynamicSegmentLabel(path),
    },
  ];
};

export const getBreadcrumbItems = (
  pathname: string,
  options?: GetBreadcrumbOptions
): AppBreadcrumbItem[] => {
  const path = normalizePath(pathname);

  let crumbs: AppBreadcrumbItem[];

  if (path === "/") {
    crumbs = [{ label: "Dashboard" }];
  } else if (path.startsWith("/setup")) {
    crumbs = getSetupBreadcrumbs(path, options?.lastLabel);
  } else {
    const menuMatch = findBestMenuMatch(path);

    if (!menuMatch) {
      crumbs = getFallbackBreadcrumbs(path, options?.lastLabel);
    } else {
      const { parent, match } = menuMatch;
      const matchHref = match.href || "";
      const hasExtraSegments =
        Boolean(matchHref) &&
        path.startsWith(`${matchHref}/`) &&
        path !== matchHref;

      if (parent) {
        crumbs = getSubmenuBreadcrumbs(parent, match, path, options);
      } else if (!hasExtraSegments) {
        crumbs = [dashboardCrumb(), { label: options?.lastLabel ?? match.label }];
      } else {
        crumbs = [
          dashboardCrumb(),
          { label: match.label, href: match.href },
          { label: options?.lastLabel ?? getDynamicSegmentLabel(path) },
        ];
      }
    }
  }

  return crumbs.map((crumb) => ({
    ...crumb,
    label: singularize(crumb.label),
  }));
};
