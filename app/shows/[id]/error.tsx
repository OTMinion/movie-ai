// app/shows/[id]/error.tsx
"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error | null | unknown;
  reset: () => void;
}

function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";

  // Check if it's an Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Check if it's an object with a message property
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  // If it's a string, return it directly
  if (typeof error === "string") {
    return error;
  }

  // For any other type, stringify it if possible
  try {
    return JSON.stringify(error);
  } catch {
    return "An unknown error occurred";
  }
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error
    console.error("Page Error:", error);
  }, [error]);

  const errorMessage = getErrorMessage(error);

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
