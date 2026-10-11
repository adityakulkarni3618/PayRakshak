export interface ParsedSmsResult {
  amount?: string;
  ref?: string;
  vpa?: string;
  type?: "DEBIT" | "CREDIT";
  date?: string;
  counterparty?: string;
  categorySuggestion?: string;
}

export function parseUpiSms(text: string): ParsedSmsResult | null {
  if (!text || text.trim().length < 10) return null;

  const result: ParsedSmsResult = {};

  // Detect Debit / Credit
  if (/debited|debit|sent|paid/i.test(text)) {
    result.type = "DEBIT";
  } else if (/credited|credit|received/i.test(text)) {
    result.type = "CREDIT";
  }

  // Extract Amount (e.g., Rs. 1,500.00, INR 850, Rs 500)
  const amountMatch = text.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    result.amount = amountMatch[1].replace(/,/g, "");
  }

  // Extract UPI Reference / RRN (e.g., UPI Ref 123456789012, Ref no 987654321, RRN 123456)
  const refMatch = text.match(/(?:UPI\s*Ref(?:\s*no)?|Ref\s*(?:no)?|RRN|Txn\s*ID)[:\s]*([a-zA-Z0-9]{6,25})/i);
  if (refMatch) {
    result.ref = refMatch[1];
  }

  // Extract VPA / merchant (e.g., to merchant@okaxis, to swiggy@icici)
  const vpaMatch = text.match(/(?:to|vpa|at)\s+([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/i);
  if (vpaMatch) {
    result.vpa = vpaMatch[1];
    result.counterparty = vpaMatch[1];
  } else {
    // Try extract counterparty name
    const cpMatch = text.match(/(?:to|at|paid to)\s+([A-Za-z0-9\s]{3,25})(?:\s+on|\s+ref|\s+upi|\.|\,|$)/i);
    if (cpMatch) {
      result.counterparty = cpMatch[1].trim();
    }
  }

  // Suggest issue category based on keywords
  if (/fail|failed|declined/i.test(text)) {
    result.categorySuggestion = "FAILED_TRANSACTION";
  } else if (/twice|duplicate|double/i.test(text)) {
    result.categorySuggestion = "DUPLICATE_PAYMENT";
  } else if (/unauthorized|fraud|unknown/i.test(text)) {
    result.categorySuggestion = "UNAUTHORIZED_TRANSACTION";
  } else if (/refund|delay/i.test(text)) {
    result.categorySuggestion = "REFUND_DELAY";
  }

  return Object.keys(result).length > 0 ? result : null;
}
