import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const brandColors = {
  primary: "#3B82F6",
  secondary: "#10B981", 
  accent: "#F59E0B",
  background: "#F8FAFC",
  text: "#1F2937",
  border: "#E5E7EB",
} as const;