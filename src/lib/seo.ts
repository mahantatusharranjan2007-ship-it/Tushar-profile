import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function useSEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    // Dynamic document title
    document.title = `${title} | Tushar Ranjan Mahanta - Lead AI Systems & Full-Stack Architect`;

    // Helper to find or create meta tags
    const updateOrCreateMeta = (attrName: string, attrVal: string, contentVal: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${attrVal}"]` : `meta[name="${attrVal}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (isProperty) {
          el.setAttribute("property", attrVal);
        } else {
          el.setAttribute("name", attrVal);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", contentVal);
    };

    // Update standard SEO meta tags
    updateOrCreateMeta("name", "description", description);

    // Update OpenGraph tags
    const defaultImage = image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=600&q=80";
    const defaultUrl = url || window.location.href;

    updateOrCreateMeta("property", "og:title", `${title} | Tushar Ranjan Mahanta`, true);
    updateOrCreateMeta("property", "og:description", description, true);
    updateOrCreateMeta("property", "og:image", defaultImage, true);
    updateOrCreateMeta("property", "og:url", defaultUrl, true);
    updateOrCreateMeta("property", "og:type", "website", true);

    // Update Twitter Card tags
    updateOrCreateMeta("name", "twitter:card", "summary_large_image");
    updateOrCreateMeta("name", "twitter:title", `${title} | Tushar Ranjan Mahanta`);
    updateOrCreateMeta("name", "twitter:description", description);
    updateOrCreateMeta("name", "twitter:image", defaultImage);

    // Canonical link
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", defaultUrl);

    // Add structured data
    let script = document.querySelector("#structured-data-json") as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = "structured-data-json";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Tushar Ranjan Mahanta",
      "jobTitle": "Lead AI Systems & Full-Stack Architect",
      "url": "https://ais-dev-uaxhurlpjt7bm6pzodwmid-372904237253.asia-east1.run.app",
      "sameAs": [
        "https://linkedin.com/in/mahanta",
        "https://github.com/mahantapurna"
      ],
      "description": "Lead AI Systems & Full-Stack Architect designing autonomous agent orchestrations and polished react interfaces."
    };

    script.textContent = JSON.stringify(structuredData);

  }, [title, description, image, url]);
}
