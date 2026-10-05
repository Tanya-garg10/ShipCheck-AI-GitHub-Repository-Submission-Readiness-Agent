import { useState } from 'react';
import { Download, FileJson, FileText, Printer } from 'lucide-react';
import { ReadinessReport } from '../types';

interface ExportMenuProps {
  report: ReadinessReport;
}

export function ExportMenu({ report }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  function exportAsJSON() {
    const data = {
      repository: report.metadata.fullName,
      analysisDate: new Date().toISOString(),
      score: report.score,
      findings: report.findings,
      aiRecommendations: report.aiRecommendations,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipcheck-${report.metadata.fullName.replace('/', '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  }

  function exportAsMarkdown() {
    const markdown = generateMarkdown(report);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipcheck-${report.metadata.fullName.replace('/', '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  }

  function printReport() {
    const markdown = generateMarkdown(report);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ShipCheck Report - ${report.metadata.fullName}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #333; }
              h2 { color: #555; margin-top: 24px; }
              pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
              code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
              .score { font-size: 48px; font-weight: bold; color: #6366f1; }
              .grade { display: inline-block; padding: 8px 16px; border-radius: 8px; margin: 16px 0; }
              .finding { margin: 12px 0; padding: 12px; border-left: 4px solid #ccc; }
              .critical { border-left-color: #ef4444; }
              .warning { border-left-color: #f59e0b; }
              .info { border-left-color: #3b82f6; }
              .pass { border-left-color: #10b981; }
            </style>
          </head>
          <body>
            ${markdownToHTML(markdown)}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
        aria-label="Export options"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-xl z-20 overflow-hidden">
            <button
              onClick={exportAsJSON}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <FileJson className="w-4 h-4" />
              Export as JSON
            </button>
            <button
              onClick={exportAsMarkdown}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export as Markdown
            </button>
            <button
              onClick={printReport}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function generateMarkdown(report: ReadinessReport): string {
  const criticalCount = report.findings.filter(f => f.severity === 'critical').length;
  const warningCount = report.findings.filter(f => f.severity === 'warning').length;
  const passCount = report.findings.filter(f => f.severity === 'pass').length;

  let md = `# ShipCheck Report\n\n`;
  md += `**Repository:** ${report.metadata.fullName}\n`;
  md += `**Analysis Date:** ${new Date().toLocaleDateString()}\n\n`;

  md += `## Score\n\n`;
  md += `**${report.score.total} / 100**\n\n`;
  md += `Grade: **${report.score.grade}**\n\n`;
  md += `- ${passCount} Passed\n`;
  md += `- ${warningCount} Warnings\n`;
  md += `- ${criticalCount} Critical\n\n`;

  md += `## Category Breakdown\n\n`;
  Object.entries(report.score.breakdown).forEach(([cat, score]) => {
    md += `- **${cat}:** ${score}\n`;
  });
  md += `\n`;

  md += `## Findings\n\n`;
  report.findings.forEach(finding => {
    md += `### ${finding.title}\n\n`;
    md += `**Severity:** ${finding.severity}\n`;
    md += `**Category:** ${finding.category}\n\n`;
    md += `${finding.description}\n\n`;
    if (finding.evidence) {
      md += `**Evidence:**\n\`\`\`\n${finding.evidence}\n\`\`\`\n\n`;
    }
    if (finding.suggestion) {
      md += `**Recommendation:** ${finding.suggestion}\n\n`;
    }
    md += `---\n\n`;
  });

  if (report.aiRecommendations) {
    md += `## AI Recommendations\n\n`;
    md += `${report.aiRecommendations.summary}\n\n`;

    if (report.aiRecommendations.prioritized.length > 0) {
      md += `### Prioritized Actions\n\n`;
      report.aiRecommendations.prioritized.forEach((fix, i) => {
        md += `${i + 1}. **${fix.title}**\n`;
        md += `   ${fix.explanation}\n`;
        md += `   → ${fix.suggestedAction}\n\n`;
      });
    }

    if (report.aiRecommendations.overallAdvice) {
      md += `### Overall Advice\n\n`;
      md += `${report.aiRecommendations.overallAdvice}\n\n`;
    }
  }

  return md;
}

function markdownToHTML(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}
