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

  // Extract fenced code blocks before other processing
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const langLabel = lang ? `<div class="px-3 py-1 text-xs text-muted-foreground border-b border-border">${lang}</div>` : "";
    const block = `<div class="my-2 overflow-x-auto rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900">${langLabel}<pre class="p-3 text-xs font-mono text-zinc-100 overflow-x-auto"><code>${code.replace(/\n$/, "")}</code></pre></div>`;
    codeBlocks.push(block);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold font-[family-name:var(--font-heading)] mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold font-[family-name:var(--font-heading)] mt-3 mb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold font-[family-name:var(--font-heading)] mt-3 mb-1">$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/`([^`]+?)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary/80">$1</a>');

  const lines = html.split("\n");
  const result: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let olCounter = 0;
  let inTable = false;
  let tableRows: string[] = [];

  function flushList() {
    if (!listType) return;
    result.push(listType === "ul" ? "</ul>" : "</ol>");
    listType = null;
    olCounter = 0;
  }

  function flushTable() {
    if (!inTable) return;
    const cells = tableRows.map((row) =>
      row
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
    );
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
    // Restore code blocks
    const codeBlockMatch = line.trim().match(/^__CODE_BLOCK_(\d+)__$/);
    if (codeBlockMatch) {
      flushList();
      if (inTable) flushTable();
      result.push(codeBlocks[parseInt(codeBlockMatch[1])]);
      continue;
    }

    const isTableRow =
      line.trim().startsWith("|") && line.trim().endsWith("|");

    if (isTableRow) {
      flushList();
      inTable = true;
      tableRows.push(line.trim());
      continue;
    }

    if (inTable) {
      flushTable();
    }

    if (/^---+$/.test(line.trim())) {
      flushList();
      result.push('<hr class="my-3 border-border" />');
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    const orderedMatch = line.match(/^\d+\.\s+(.+)/);

    if (bulletMatch) {
      if (listType !== "ul") {
        flushList();
        result.push('<ul class="my-1.5 ml-1 flex flex-col gap-1">');
        listType = "ul";
      }
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40"></span><span>${bulletMatch[1]}</span></li>`);
    } else if (orderedMatch) {
      if (listType !== "ol") {
        flushList();
        result.push('<ol class="my-1.5 ml-1 flex flex-col gap-1 list-none counter-reset-item">');
        listType = "ol";
      }
      olCounter++;
      result.push(`<li class="flex items-start gap-2 text-sm"><span class="shrink-0 min-w-[1.25rem] text-foreground/60 font-medium">${olCounter}.</span><span>${orderedMatch[1]}</span></li>`);
    } else {
      flushList();
      if (line.trim() === "") {
        result.push("<br />");
      } else {
        result.push(line);
      }
    }
  }
  if (inTable) flushTable();
  flushList();

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
