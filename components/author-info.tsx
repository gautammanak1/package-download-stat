"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { User, Mail, Globe, Github } from "lucide-react";

interface Author {
  name?: string;
  email?: string;
  url?: string;
}

interface AuthorInfoProps {
  author: Author | Author[] | string | undefined;
}

export function AuthorInfo({ author }: AuthorInfoProps) {
  if (!author) {
    return null;
  }

  // Handle different author formats
  let authors: Author[] = [];

  if (typeof author === "string") {
    // Simple string format
    authors = [{ name: author }];
  } else if (Array.isArray(author)) {
    authors = author;
  } else {
    authors = [author];
  }

  if (authors.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-primary" />
            Author{authors.length > 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {authors.map((author, index) => (
              <div key={index} className="space-y-2">
                {author.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{author.name}</span>
                  </div>
                )}
                {author.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${author.email}`} className="text-primary hover:underline">
                      {author.email}
                    </a>
                  </div>
                )}
                {author.url && (
                  <div className="flex items-center gap-2">
                    {author.url.includes("github.com") ? (
                      <Github className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                    <a
                      href={author.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {author.url}
                    </a>
                  </div>
                )}
                {index < authors.length - 1 && <div className="border-t border-border pt-4 mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
