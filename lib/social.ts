// Single source of truth for Brian's social accounts. Update handles here and
// they propagate to the footer icons and the /links page.
export type SocialPlatform = {
  key: string;
  label: string;
  handle: string;
  url: string;
};

export const socialLinks: SocialPlatform[] = [
  {
    key: "instagram",
    label: "Instagram",
    handle: "@brianruffo",
    url: "https://www.instagram.com/brianruffo/",
  },
  {
    key: "tiktok",
    label: "TikTok",
    handle: "@briangruffo",
    url: "https://www.tiktok.com/@briangruffo",
  },
  {
    key: "youtube",
    label: "YouTube",
    handle: "@BrianRuffo",
    url: "https://www.youtube.com/@BrianRuffo",
  },
  {
    key: "facebook",
    label: "Facebook",
    handle: "brian.ruffo",
    url: "https://www.facebook.com/brian.ruffo",
  },
];
