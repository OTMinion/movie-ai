"use server";
import PostModel from "@/models/postModel";
import connectDB from "@/config/database";
import { generateEmbedding } from "@/utils/embedding";
import mongoose from "mongoose";

interface SimilarPost {
  _id: string;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  similarity: number;
}

export async function getSemanticallySimilarPosts(query: string, postId: string) {
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

    return { data: similarPosts };
  } catch (error) {
    console.error("Error in semantic search:", error);
    return { error };
  }
}
