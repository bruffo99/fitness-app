export type OnboardingStatusValue =
  | "draft"
  | "intake_sent"
  | "intake_complete"
  | "active";

export function onboardingStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "draft":
      return "Draft";
    case "intake_sent":
      return "Intake sent";
    case "intake_complete":
      return "Intake complete";
    case "active":
      return "Active";
    default:
      return "Unknown";
  }
}

export function canAccessOnboardingForm(status: string | null | undefined) {
  return status === "intake_sent" || status === "intake_complete";
}
