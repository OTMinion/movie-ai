// actions/semanticSeachAction.ts
"use server";
import PostModel from "@/models/postModel";
import connectDB from "@/config/database";
import { generateEmbedding } from "@/utils/embedding";
import mongoose from "mongoose";

export interface IShow {
  _id: string;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

export interface ISimilarShow extends IShow {
  similarity: number;
}

export interface SearchResponse {
  data?: ISimilarShow[];
  error?: any;
}

// Sanitize text to prevent XSS and invalid HTML
function sanitizeText(text: string): string {
  return String(text || "")
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function getSemanticallySimilarPosts(
  query: string,
  postId: string
): Promise<SearchResponse> {
  try {
    await connectDB();
    const queryEmbedding = await generateEmbedding(query);

    const similarPosts = await PostModel.aggregate([
      {
        $vectorSearch: {
          index: "overview_vector_index",
          queryVector: queryEmbedding,
          path: "overview_embedding",
          numCandidates: 100,
          limit: 5,
        },
      },
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(postId) },
        },
      },
      {
        $set: {
          similarity: {
            $multiply: [{ $meta: "vectorSearchScore" }, 100],
          },
        },
      },
      {
        $project: {
          name: 1,
          original_name: 1,
          poster_path: 1,
          overview: 1,
          first_air_date: 1,
          vote_average: 1,
          similarity: 1,
        },
      },
    ]);

    // Transform and sanitize the data
    const typedSimilarPosts: ISimilarShow[] = similarPosts.map((post) => ({
      _id: post._id.toString(),
      name: sanitizeText(post.name),
      original_name: sanitizeText(post.original_name),
      poster_path: String(post.poster_path || ""),
      overview: sanitizeText(post.overview),
      first_air_date: String(post.first_air_date || ""),
      vote_average: Number(post.vote_average || 0),
      similarity: Number(post.similarity || 0),
    }));

    return { data: typedSimilarPosts };
  } catch (error) {
    console.error("Error in semantic search:", error);
    return { error };
  }
}
