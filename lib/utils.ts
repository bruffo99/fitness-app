export type ProspectStatusValue =
  | "NEW_LEAD"
  | "CONTACTED"
  | "QUALIFIED"
  | "CLIENT_ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

export function statusLabel(status: ProspectStatusValue): string {
  switch (status) {
    case "NEW_LEAD":      return "New lead";
    case "CONTACTED":     return "Contacted";
    case "QUALIFIED":     return "Qualified";
    case "CLIENT_ACTIVE": return "Client active";
    case "INACTIVE":      return "Inactive";
    case "ARCHIVED":      return "Archived";
  }
}

export function statusClass(status: ProspectStatusValue): string {
  switch (status) {
    case "NEW_LEAD":      return "new";
    case "CONTACTED":     return "contacted";
    case "QUALIFIED":     return "qualified";
    case "CLIENT_ACTIVE": return "active";
    case "INACTIVE":      return "inactive";
    case "ARCHIVED":      return "archived";
  }
}
