"use client";
import { createContext, useContext } from "react";
export type User = { id: string; email: string; full_name: string; role: "CUSTOMER" | "SUPPORT_AGENT" | "ADMIN" };
export const UserCtx = createContext<User | null>(null);
export const useUser = () => useContext(UserCtx)!;
