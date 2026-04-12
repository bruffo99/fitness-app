import { statusClass, statusLabel, type ProspectStatusValue } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProspectStatusValue;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge badge--${statusClass(status)}`}>
      {statusLabel(status)}
    </span>
  );
}
