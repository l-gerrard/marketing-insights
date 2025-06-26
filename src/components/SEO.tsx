
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schema?: object;
}

const SEO = ({
  title = "AI Marketing Bestie - Smart AI Analytics Tools for Real People | Easy Marketing Insights",
  description = "The best AI analytics tools that actually make sense. Transform your Google Analytics data into clear, actionable insights with our user-friendly AI analytics platform designed for real people, not data scientists.",
  keywords = "AI analytics tools, best AI analytics tools, simple AI analytics tools, AI-powered analytics tools, easy AI analytics tools for small business, marketing analytics software, Google Analytics AI tools, business intelligence tools, data analysis platform, automated marketing insights",
  image = "https://aimarketingbestie.com/lovable-uploads/82061c48-568f-4d49-a2de-45b67235181e.png",
  url = "https://aimarketingbestie.com/",
  type = "website",
  schema
}: SEOProps) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
