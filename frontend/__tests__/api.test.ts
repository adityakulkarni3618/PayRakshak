import { describe, it, expect } from "vitest";
import { fmtDate, money, pretty } from "../lib/api";

describe("Frontend API Helpers", () => {
  it("formats currency in INR correctly", () => {
    const formatted = money(1500);
    expect(formatted).toContain("1,500");
  });

  it("formats string labels to title case", () => {
    expect(pretty("FAILED_TRANSACTION")).toBe("Failed transaction");
    expect(pretty("UNAUTHORIZED_TRANSACTION")).toBe("Unauthorized transaction");
  });

  it("handles empty or null string gracefully", () => {
    expect(pretty(null)).toBe("");
    expect(pretty("")).toBe("");
  });

  it("formats dates into readable local strings", () => {
    const d = fmtDate("2026-10-10T10:00:00Z");
    expect(typeof d).toBe("string");
    expect(d.length).toBeGreaterThan(0);
  });
});
