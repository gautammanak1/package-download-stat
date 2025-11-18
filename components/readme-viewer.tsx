"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";

interface ReadmeViewerProps {
  readme: string;
  packageName?: string;
  repositoryUrl?: string;
}

export function ReadmeViewer({ readme, packageName, repositoryUrl }: ReadmeViewerProps) {
  // Process markdown to fix image URLs
  const processedReadme = useMemo(() => {
    if (!readme) return readme;

    let processed = readme;

    // Fix relative image URLs
    if (repositoryUrl) {
      // Extract base URL from repository URL
      let baseUrl = "";

      // Handle GitHub URLs (handle both https://github.com and git+https://github.com formats)
      const githubMatch = repositoryUrl.match(
        /(?:github\.com|git\+https:\/\/github\.com)\/([^\/]+\/[^\/]+?)(?:\.git)?/
      );
      if (githubMatch) {
        baseUrl = `https://raw.githubusercontent.com/${githubMatch[1]}/HEAD`;
      }
      // Handle GitLab URLs
      else if (repositoryUrl.includes("gitlab.com")) {
        const match = repositoryUrl.match(/gitlab\.com\/([^\/]+\/[^\/]+)/);
        if (match) {
          baseUrl = `https://gitlab.com/${match[1]}/-/raw/HEAD`;
        }
      }
      // Handle Bitbucket URLs
      else if (repositoryUrl.includes("bitbucket.org")) {
        const match = repositoryUrl.match(/bitbucket\.org\/([^\/]+\/[^\/]+)/);
        if (match) {
          baseUrl = `https://bitbucket.org/${match[1]}/raw/HEAD`;
        }
      }

      if (baseUrl) {
        // Replace relative image URLs with absolute URLs
        processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
          // If already absolute URL, keep as is
          if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) {
            return match;
          }
          // If relative URL, convert to absolute
          const absoluteSrc = src.startsWith("/") ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
          return `![${alt}](${absoluteSrc})`;
        });

        // Also handle HTML img tags
        processed = processed.replace(
          /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
          (match, before, src, after) => {
            if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) {
              return match;
            }
            const absoluteSrc = src.startsWith("/") ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
            return `<img${before}src="${absoluteSrc}"${after}>`;
          }
        );
      }
    }

    // Also try to fix common npm package image patterns
    if (packageName) {
      // Fix npm package badge URLs
      processed = processed.replace(
        /!\[([^\]]*)\]\(https:\/\/img\.shields\.io\/([^)]+)\)/g,
        (match) => match // Keep shields.io URLs as is
      );
    }

    return processed;
  }, [readme, repositoryUrl, packageName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">README</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ({ node, ...props }) => (
                  <img
                    {...props}
                    alt={props.alt || "Image"}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback for broken images
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                    className="max-w-full rounded-lg my-4"
                  />
                ),
              }}
            >
              {processedReadme}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
