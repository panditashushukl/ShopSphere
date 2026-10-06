"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  isUser = false,
}) => {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-subtle bg-canvas/40 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-canvas border-b border-subtle font-semibold text-foreground">{children}</thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-subtle">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-canvas/50 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 border-r border-subtle last:border-r-0 font-bold">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 border-r border-subtle last:border-r-0">{children}</td>,
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <pre className="bg-canvas border border-subtle rounded-xl p-3 text-xs font-mono overflow-x-auto my-2">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-canvas border border-subtle px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-primary" {...props}>
                {children}
              </code>
            );
          },
          strong: ({ children }) => <strong className="font-bold text-amber-primary">{children}</strong>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-primary underline hover:opacity-80 transition-opacity"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => <h1 className="text-base font-bold my-2 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold my-2 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold my-1 text-foreground">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-primary pl-3 my-2 text-text-muted italic bg-canvas/30 py-1 rounded-r-lg">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
