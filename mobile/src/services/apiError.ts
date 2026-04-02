import { isAxiosError } from "axios";
import { Alert } from "react-native";

/**
 * Shape of the ErrorResponse returned by the backend's GlobalExceptionHandler.
 *
 *  {
 *    status: 400,
 *    error: "Validation Error",
 *    message: "Validation error in fields",
 *    path: "/books",
 *    timestamp: "...",
 *    fieldErrors: {
 *      isbn: "ISBN must be a valid format (10 or 13 digits)",
 *      title: "Book title is required"
 *    }
 *  }
 */
interface ApiErrorBody {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Extracts a human-readable error message from any caught value.
 *
 * Priority:
 * 1. `fieldErrors` map from the backend (validation errors) — formatted as sentences
 * 2. `message` from the backend error body
 * 3. Axios network error message (no response — timeout, offline, etc.)
 * 4. Generic fallback
 */
export function extractApiError(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;

    // 1. Validation fieldErrors — build one message per field, joined by newlines
    if (body?.fieldErrors && Object.keys(body.fieldErrors).length > 0) {
      return Object.entries(body.fieldErrors)
        .map(([field, msg]) => {
          const label = field.charAt(0).toUpperCase() + field.slice(1);
          const sentence = msg.endsWith(".") ? msg : `${msg}.`;
          return `${label}: ${sentence}`;
        })
        .join("\n");
    }

    // 2. Single message from the backend
    if (body?.message) {
      return body.message.endsWith(".") ? body.message : `${body.message}.`;
    }

    // 3. Network-level error (no response received)
    if (!err.response) {
      return "Could not reach the server. Check your connection and try again.";
    }

    // 4. HTTP error with no structured body
    return `Server error (${err.response.status}). Please try again.`;
  }

  // Non-Axios error (unexpected JS exception)
  if (err instanceof Error) {
    return err.message || "An unexpected error occurred.";
  }

  return "An unexpected error occurred.";
}

/**
 * Shows a native Alert with the extracted API error message.
 *
 * @param title  Alert title (e.g. "Failed to add book")
 * @param err    The caught error from a try/catch block
 */
export function showApiError(title: string, err: unknown): void {
  Alert.alert(title, extractApiError(err));
}
