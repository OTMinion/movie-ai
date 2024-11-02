// actions/semanticSeachAction.ts
"use server";
import PostModel, { IPostLean } from "@/models/postModel";
import connectDB from "@/config/database";
import { generateEmbedding } from "@/utils/embedding";
import mongoose from "mongoose";

export interface ISimilarShow extends IPostLean {
  similarity: number;
}

export interface SearchResponse {
  data?: ISimilarShow[];
  error?: string;
}

function sanitizeShow(post: any): ISimilarShow {
  return {
    _id: String(post._id || ""),
    adult: Boolean(post.adult),
    backdrop_path: String(post.backdrop_path || ""),
    genre_ids: Array.isArray(post.genre_ids) ? post.genre_ids : [],
    id: Number(post.id || 0),
    origin_country: Array.isArray(post.origin_country) ? post.origin_country : [],
    original_language: String(post.original_language || ""),
    original_name: String(post.original_name || ""),
    overview: String(post.overview || ""),
    popularity: Number(post.popularity || 0),
    poster_path: String(post.poster_path || ""),
    first_air_date: String(post.first_air_date || ""),
    name: String(post.name || ""),
    vote_average: Number(post.vote_average || 0),
    vote_count: Number(post.vote_count || 0),
    similarity: Number(post.similarity || 0),
  };
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
          _id: 1,
          adult: 1,
          backdrop_path: 1,
          genre_ids: 1,
          id: 1,
          origin_country: 1,
          original_language: 1,
          original_name: 1,
          overview: 1,
          popularity: 1,
          poster_path: 1,
          first_air_date: 1,
          name: 1,
          vote_average: 1,
          vote_count: 1,
          similarity: 1,
        },
      },
    ]);

    const sanitizedPosts = similarPosts.map(sanitizeShow);
    return { data: sanitizedPosts };
  } catch (error) {
    console.error("Error in semantic search:", error);
    return { error: "Failed to fetch similar shows" };
  }
}
