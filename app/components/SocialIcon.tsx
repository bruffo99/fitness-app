type SocialIconProps = {
  platform: string;
  className?: string;
};

// Inline SVG paths keep icons self-contained (no external icon library or
// network requests). currentColor lets CSS control the color on hover.
const PATHS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path
      d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.7c-1.3.1-2.5-.2-3.6-.8v5.6c0 3.2-2.4 5.6-5.4 5.6-3 0-5.2-2.2-5.2-5.1 0-3 2.4-5.2 5.6-5v2.9c-.4-.1-.8-.2-1.2-.2-1.3 0-2.4 1-2.4 2.3 0 1.4 1 2.4 2.3 2.4 1.4 0 2.5-1 2.5-2.7V3h3.9z"
      fill="currentColor"
      stroke="none"
    />
  ),
  youtube: (
    <>
      <path
        d="M22 12c0-2.3-.2-3.5-.5-4.2a2.6 2.6 0 0 0-1.8-1.8C18.4 5.6 12 5.6 12 5.6s-6.4 0-7.7.4A2.6 2.6 0 0 0 2.5 7.8C2.2 8.5 2 9.7 2 12s.2 3.5.5 4.2a2.6 2.6 0 0 0 1.8 1.8c1.3.4 7.7.4 7.7.4s6.4 0 7.7-.4a2.6 2.6 0 0 0 1.8-1.8c.3-.7.5-1.9.5-4.2z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M10 9.5v5l4.3-2.5z" fill="var(--bg, #080808)" stroke="none" />
    </>
  ),
  facebook: (
    <path
      d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"
      fill="currentColor"
      stroke="none"
    />
  ),
};

export function SocialIcon({ platform, className }: SocialIconProps) {
  const path = PATHS[platform];
  if (!path) return null;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}
