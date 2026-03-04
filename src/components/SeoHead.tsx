import { Helmet } from "react-helmet-async";

interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  articlePublishedTime?: string;
  articleAuthor?: string;
  noIndex?: boolean;
  jsonLd?: object;
}

const SeoHead = ({
  title,
  description,
  canonicalPath,
  keywords,
  ogImage = "/og-image-axiva.png",
  ogType = "website",
  articlePublishedTime,
  articleAuthor,
  noIndex = false,
  jsonLd,
}: SeoHeadProps) => {
  const baseUrl = "https://axiva.ai";
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;

  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "AXIVA",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon.png`,
      },
      founder: {
        "@type": "Person",
        name: "Jag Mariappan",
        url: `${baseUrl}/founder`,
      },
    },
  };

  const mergedJsonLd = jsonLd ? { ...defaultJsonLd, ...jsonLd } : defaultJsonLd;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="AXIVA" />

      {/* Article metadata */}
      {ogType === "article" && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === "article" && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Indexing */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(mergedJsonLd)}</script>
    </Helmet>
  );
};

export default SeoHead;
