"use client";
import { use } from "react";
import Shell from "@/components/Shell";
import CaseView from "@/components/CaseView";

export default function Page({ params }: { params: Promise<{ caseId: string }> | { caseId: string } }) {
  const { caseId } = (typeof (params as any).then === "function" ? use(params as Promise<{ caseId: string }>) : params) as { caseId: string };
  return <Shell roles={["CUSTOMER"]}><CaseView caseId={caseId} staff={false} /></Shell>;
}
