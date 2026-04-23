export const CLIENT_DOCUMENT_CATEGORIES = [
  "workout",
  "nutrition",
  "resource",
  "other",
] as const;

export type ClientDocumentCategory = (typeof CLIENT_DOCUMENT_CATEGORIES)[number];

export function isClientDocumentCategory(value: string): value is ClientDocumentCategory {
  return CLIENT_DOCUMENT_CATEGORIES.includes(value as ClientDocumentCategory);
}

export function getClientDocumentCategoryLabel(category: string) {
  switch (category) {
    case "workout":
      return "Workout";
    case "nutrition":
      return "Nutrition";
    case "resource":
      return "Resource";
    case "other":
      return "Other";
    default:
      return category;
  }
}

export function getClientDocumentSectionHeading(category: string) {
  switch (category) {
    case "workout":
      return "Your Workouts";
    case "nutrition":
      return "Nutrition";
    case "resource":
      return "Resources";
    case "other":
      return "Other";
    default:
      return category;
  }
}
