"use client";
import { useMemo, type ReactNode } from "react";

export default function DashboardLegalContent({ content }: { content: string }) {
  const parsedContent = useMemo(() => {
    const lines = content.split("\n");
    const elements: ReactNode[] = [];
    let key = 0;
    let inList = false;
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key++} className="ml-6 mb-4 space-y-1.5 list-disc text-[var(--foreground)]/80">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) flushList();
        else elements.push(<div key={key++} className="h-3" />);
        return;
      }
      if (trimmed.startsWith("# ")) {
        flushList();
        elements.push(<h1 key={key++} className="text-3xl font-bold mb-5 mt-6 text-[var(--foreground)]">{trimmed.substring(2)}</h1>);
      } else if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(<h2 key={key++} className="text-xl font-semibold mb-3 mt-5 text-[var(--foreground)]">{trimmed.substring(3)}</h2>);
      } else if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(<h3 key={key++} className="text-lg font-semibold mb-2 mt-4 text-[var(--foreground)]">{trimmed.substring(4)}</h3>);
      } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        flushList();
        elements.push(<p key={key++} className="font-semibold mb-2 text-[var(--foreground)]">{trimmed.substring(2, trimmed.length - 2)}</p>);
      } else if (trimmed.startsWith("- ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
      } else {
        flushList();
        elements.push(<p key={key++} className="mb-3 text-sm leading-relaxed text-[var(--muted-text)]">{trimmed}</p>);
      }
    });
    flushList();
    return elements;
  }, [content]);

  return <div className="space-y-1">{parsedContent}</div>;
}
