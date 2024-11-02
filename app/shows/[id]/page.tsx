// app/shows/[id]/page.tsx
import { getSemanticallySimilarPosts } from "@/actions/semanticSeachAction";
import PostModel, { IPostLean } from "@/models/postModel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";

interface PageProps {
  params: { id: string };
}

// Custom error class for better error handling
class ShowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowError";
  }
}

async function getShow(id: string): Promise<IPostLean> {
  try {
    const show = await PostModel.findById(id).lean();

    if (!show) {
      throw new ShowError("Show not found");
    }

    return {
      _id: show._id.toString(),
      adult: Boolean(show.adult),
      backdrop_path: String(show.backdrop_path || ""),
      genre_ids: Array.isArray(show.genre_ids) ? show.genre_ids : [],
      id: Number(show.id || 0),
      origin_country: Array.isArray(show.origin_country) ? show.origin_country : [],
      original_language: String(show.original_language || ""),
      original_name: String(show.original_name || ""),
      overview: String(show.overview || ""),
      popularity: Number(show.popularity || 0),
      poster_path: String(show.poster_path || ""),
      first_air_date: String(show.first_air_date || ""),
      name: String(show.name || ""),
      vote_average: Number(show.vote_average || 0),
      vote_count: Number(show.vote_count || 0),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new ShowError(error.message);
    }
    throw new ShowError("Failed to fetch show");
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const show = await getShow(params.id);
    return {
      title: show.name,
      description: show.overview,
    };
  } catch (error) {
    return {
      title: "Show Details",
      description: "Show information",
    };
  }
}

// Safe stringify function for debugging
function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return "[Unable to stringify object]";
  }
}

export default async function ShowPage({ params }: PageProps) {
  try {
    if (!params.id) {
      throw new ShowError("Show ID is required");
    }

    const show = await getShow(params.id);

    return (
      <div className="p-6">
        <div className="mb-4">
          <pre className="text-xs text-gray-500">{safeStringify({ id: params.id })}</pre>
        </div>
        <h1 className="text-2xl font-bold mb-2">{show.name}</h1>
        <p className="text-gray-600 mb-2">{show.original_name}</p>
        <p className="text-gray-800">{show.overview}</p>
      </div>
    );
  } catch (error) {
    console.error("Error in ShowPage:", error);

    if (error instanceof ShowError) {
      throw error; // Let the error boundary handle ShowErrors
    }

    // For other errors, provide a generic message
    throw new ShowError("Failed to load show details");
  }
}
