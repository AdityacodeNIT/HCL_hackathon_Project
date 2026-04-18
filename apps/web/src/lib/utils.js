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

export function formatCurrencyInr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDateLabel(value) {
  if (!value) {
    return "";
  }

  try {
    const date = new Date(`${value}T00:00:00`);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', value);
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (error) {
    console.warn('Error formatting date:', value, error);
    return "";
  }
}

export function formatTimeLabel(value) {
  if (!value) {
    return "";
  }

  try {
    const [hours = "00", minutes = "00"] = String(value).split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid time value:', value);
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.warn('Error formatting time:', value, error);
    return "";
  }
}

export function getTodayDateInputValue() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
