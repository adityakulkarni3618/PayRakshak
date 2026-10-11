"use client";

import { fmtDate, money, pretty } from "@/lib/api";

interface DossierProps {
  caseData: any;
  timeline?: any[];
}

export function generatePrintDossier({ caseData, timeline }: DossierProps) {
  const d = caseData;
  const t = d.transaction;
  const a = d.analysis;
  const rec = d.recommendation;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download or print your Dispute Dossier.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>PayRakshak Dispute Dossier - ${d.case_id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; margin: 0; background: #fff; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          .meta-item { font-size: 12px; }
          .meta-label { color: #64748b; text-transform: uppercase; font-size: 10px; font-weight: 600; margin-bottom: 2px; }
          .meta-val { font-size: 14px; font-weight: bold; color: #0f172a; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
          .table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
          .table th { text-align: left; background: #f1f5f9; padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 600; color: #334155; }
          .table td { padding: 8px 12px; border: 1px solid #cbd5e1; color: #1e293b; }
          .disclaimer { border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 11px; color: #475569; margin-top: 30px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <h1 class="title">PayRakshak • Official Dispute Dossier</h1>
            <div class="subtitle">UPIResolve AI Platform • Banking Dispute Documentation</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #64748b;">Report Generated:</div>
            <div style="font-size: 13px; font-weight: bold;">${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div class="meta-box">
          <div class="meta-item">
            <div class="meta-label">Dispute Reference ID</div>
            <div class="meta-val" style="font-family: monospace;">${d.case_id}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Current Case Status</div>
            <div class="meta-val">${d.status}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Dispute Category</div>
            <div class="meta-val">${pretty(d.effective_category) || "Under Evaluation"}</div>
          </div>
        </div>

        ${
          t
            ? `
        <div class="section">
          <div class="section-title">1. Disputed Transaction Details</div>
          <table class="table">
            <tr>
              <th width="25%">Amount</th>
              <td width="25%"><b>${money(t.amount)}</b></td>
              <th width="25%">Ledger Status</th>
              <td width="25%"><b>${t.status}</b></td>
            </tr>
            <tr>
              <th>Counterparty / VPA</th>
              <td>${t.counterparty}</td>
              <th>Transaction Timestamp</th>
              <td>${fmtDate(t.occurred_at)}</td>
            </tr>
            <tr>
              <th>External RRN / Ref</th>
              <td style="font-family: monospace;">${t.external_ref}</td>
              <th>Reversal Status</th>
              <td>${pretty(t.reversal_status)}</td>
            </tr>
          </table>
        </div>
        `
            : ""
        }

        <div class="section">
          <div class="section-title">2. Customer Complaint Statement</div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px; font-style: italic;">
            "${d.description}"
          </div>
        </div>

        ${
          d.findings && d.findings.length > 0
            ? `
        <div class="section">
          <div class="section-title">3. Ledger Consistency Verification Findings</div>
          <table class="table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Rule Verification Finding</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              ${d.findings
                .map(
                  (f: any) => `
                <tr>
                  <td><b>${f.severity}</b></td>
                  <td>${f.explanation}</td>
                  <td>${f.next_step}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          rec
            ? `
        <div class="section">
          <div class="section-title">4. Advisory Decision & Next Step</div>
          <div style="border: 1px solid #bae6fd; background: #f0f9ff; padding: 14px; border-radius: 6px;">
            <div style="font-weight: bold; color: #0369a1; font-size: 14px; margin-bottom: 4px;">
              Action: ${pretty(rec.action)}
            </div>
            <div style="font-size: 13px; color: #0f172a;">
              ${rec.explanation}
            </div>
            ${
              rec.missing_information && rec.missing_information.length > 0
                ? `
              <div style="margin-top: 8px; font-size: 12px; color: #b45309;">
                <b>Required documentation:</b> ${rec.missing_information.join("; ")}
              </div>
            `
                : ""
            }
          </div>
        </div>
        `
            : ""
        }

        ${
          timeline && timeline.length > 0
            ? `
        <div class="section">
          <div class="section-title">5. Immutable Audit Event Trail</div>
          <table class="table">
            <thead>
              <tr>
                <th width="30%">Timestamp</th>
                <th width="35%">Action Recorded</th>
                <th width="35%">Details</th>
              </tr>
            </thead>
            <tbody>
              ${timeline
                .map(
                  (item: any) => `
                <tr>
                  <td style="font-size: 11px;">${fmtDate(item.created_at)}</td>
                  <td><b>${pretty(item.action)}</b></td>
                  <td>${item.detail?.to ? `Status: ${item.detail.to}` : item.detail?.note || "—"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="disclaimer">
          <b>Official Advisory Notice:</b> PayRakshak (UPIResolve AI) provides decision support and transaction ledger consistency evaluations. It does not independently initiate funds transfers, execute reversals, or replace official banking ombudsman processes. This document contains verifiable audit references intended for submission to the disputed bank or NPCI dispute mechanism.
        </div>

        <div class="footer">
          Generated via PayRakshak UPI Dispute Resolution System • Reference: ${d.case_id}
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
