import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateSeoTitle, generateSeoDescription, getCurrentDateInfo, FormattedDateInfo } from '../lib/seoHelper';

interface SEOHeadProps {
  title?: string;
  toolSlug?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  schemaJson?: object | object[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  toolSlug,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  schemaJson
}) => {
  const dateInfo: FormattedDateInfo = getCurrentDateInfo();
  
  // Compute dynamic title with today's date
  const finalTitle = toolSlug 
    ? generateSeoTitle(toolSlug, title)
    : title 
      ? `Latest ${dateInfo.formattedDayMonthYear}: ${title}`
      : `Latest ${dateInfo.formattedDayMonthYear}: Free Tech Tools & Verified WhatsApp Group Links 2026`;

  // Compute rich description
  const finalDescription = toolSlug 
    ? generateSeoDescription(toolSlug, description)
    : description 
      ? `${description} - Updated for ${dateInfo.formattedMonthYear} with latest features.`
      : `Access 20+ free online tech utilities, calculators, generators, and verified WhatsApp group links updated daily for ${dateInfo.formattedMonthYear}.`;

  const finalKeywords = keywords || 
    'free online tools, latest tech tools 2026, whatsapp group links, qr code generator, ai content detector, plagiarism checker, text repeater, short url generator, online utilities without signup';

  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://linkshare.tools');
  const defaultImage = ogImage || 'https://ai.google.dev/static/site-assets/images/share-ais-513315318.png';

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="title" content={finalTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="revisit-after" content="1 days" />
      <meta name="language" content="English" />
      <meta name="author" content="LinkShare Tools" />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:site_name" content="LinkShare" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={defaultImage} />

      {/* Schema.org Structured Data */}
      {schemaJson && (
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
