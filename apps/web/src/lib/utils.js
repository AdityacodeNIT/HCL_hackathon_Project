import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDefaultPathForRole(role) {
  if (role === "admin") {
    return "/admin";
  }

  return "/patient";
}
