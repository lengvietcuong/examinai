"use client";

import RobotIcon from "@/components/icons/logo";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&lt;br\s*\/?&gt;/g, "<br />");

  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold font-[family-name:var(--font-heading)] mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold font-[family-name:var(--font-heading)] mt-3 mb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold font-[family-name:var(--font-heading)] mt-3 mb-1">$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/`([^`]+?)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">$1</code>');

  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[] = [];

  function flushTable() {
    if (!inTable) return;
    const cells = tableRows.map((row) =>
      row
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
    );
    // Detect and remove separator row (e.g. |---|---|)
    const separatorIdx = cells.findIndex((row) =>
      row.every((c) => /^[-:]+$/.test(c))
    );
    const headerRow = separatorIdx > 0 ? cells.slice(0, separatorIdx) : [];
    const bodyRows =
      separatorIdx >= 0 ? cells.slice(separatorIdx + 1) : cells;

    let tableHtml =
      '<div class="my-2 overflow-x-auto"><table class="w-full border-collapse text-sm">';
    if (headerRow.length > 0) {
      tableHtml += "<thead>";
      for (const row of headerRow) {
        tableHtml += "<tr>";
        for (const cell of row) {
          tableHtml += `<th class="border border-border bg-muted/50 px-3 py-1.5 text-left font-semibold">${cell}</th>`;
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</thead>";
    }
    tableHtml += "<tbody>";
    for (const row of bodyRows) {
      tableHtml += "<tr>";
      for (const cell of row) {
        tableHtml += `<td class="border border-border px-3 py-1.5">${cell}</td>`;
      }
      tableHtml += "</tr>";
    }
    tableHtml += "</tbody></table></div>";
    result.push(tableHtml);

    inTable = false;
    tableRows = [];
  }

  for (const line of lines) {
    const isTableRow =
      line.trim().startsWith("|") && line.trim().endsWith("|");

    if (isTableRow) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      inTable = true;
      tableRows.push(line.trim());
      continue;
    }

    if (inTable) {
      flushTable();
    }

    if (/^---+$/.test(line.trim())) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      result.push('<hr class="my-3 border-border" />');
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      if (!inList) {
        result.push('<ul class="my-1.5 ml-1 flex flex-col gap-1">');
        inList = true;
      }
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40"></span><span>${bulletMatch[1]}</span></li>`);
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      if (line.trim() === "") {
        result.push("<br />");
      } else if (!line.startsWith("<h")) {
        result.push(line);
      } else {
        result.push(line);
      }
    }
  }
  if (inTable) flushTable();
  if (inList) result.push("</ul>");

  return result.join("\n");
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl bg-primary/10 px-4 py-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
        <RobotIcon className="size-4 fill-foreground" />
      </div>
      <div className="max-w-[85%] rounded-xl bg-muted px-4 py-2">
        <div
          className="text-sm leading-relaxed [&>br+br]:hidden"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.trimStart()) }}
        />
        {isStreaming && (
          <span className="inline-flex gap-1 ml-1 align-middle">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  );
}
