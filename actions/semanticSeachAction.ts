// actions/semanticSeachAction.ts
"use server";
import PostModel from "@/models/postModel";
import connectDB from "@/config/database";
import { generateEmbedding } from "@/utils/embedding";
import mongoose from "mongoose";

// Interface for base show data
export interface IShow {
  _id: string;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

// Interface for similar shows with similarity score
export interface ISimilarShow extends IShow {
  similarity: number;
}

// Type for the response
export interface SearchResponse {
  data?: ISimilarShow[];
  error?: any;
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
            $multiply: [
              { $meta: "vectorSearchScore" },
              100, // Convert to percentage
            ],
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

    // Transform the MongoDB documents to ensure proper typing
    const typedSimilarPosts: ISimilarShow[] = similarPosts.map((post) => ({
      _id: post._id.toString(),
      name: post.name,
      original_name: post.original_name,
      poster_path: post.poster_path,
      overview: post.overview,
      first_air_date: post.first_air_date,
      vote_average: post.vote_average,
      similarity: post.similarity,
    }));

    return { data: typedSimilarPosts };
  } catch (error) {
    console.error("Error in semantic search:", error);
    return { error };
  }
}
