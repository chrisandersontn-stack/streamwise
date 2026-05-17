import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site-url";

type MarketingMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function marketingMetadata({
  title,
  description,
  path,
}: MarketingMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes("StreamWise") ? title : `${title} | StreamWise`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: "StreamWise",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}
