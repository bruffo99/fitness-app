// Affiliate products mentioned in videos. Update the list here and it flows to
// the /links page. `key` is used for GA click attribution, so keep it stable.
export type AffiliateProduct = {
  key: string;
  name: string;
  url: string;
  description?: string;
};

export const affiliateProducts: AffiliateProduct[] = [
  {
    key: "ninja-creami",
    name: "Ninja Creami",
    url: "https://amzn.to/4pSG96n",
  },
  {
    key: "bochasweet",
    name: "BochaSweet",
    url: "https://amzn.to/4fyFTGl",
  },
  {
    key: "pescience-protein",
    name: "PEScience Protein Powder",
    url: "https://amzn.to/4h96E5f",
  },
];

// Shown near the affiliate links to satisfy FTC disclosure requirements.
export const affiliateDisclosure =
  "Some links below are affiliate links — I may earn a commission at no extra cost to you.";
