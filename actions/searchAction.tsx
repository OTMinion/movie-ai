"use server";
import PostModel from "@/models/postModel";
import connectDB from "@/config/database";
import { Document } from "mongoose";

// Define the return type for our search results
export interface SearchResultType {
  _id: string;
  id: number;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

export async function searchPosts(
  query: string
): Promise<{ data?: SearchResultType[]; error?: any }> {
  try {
    await connectDB();

    if (!query) {
      return { data: [] };
    }

    const searchRegex = new RegExp(query, "i");

    // Transform MongoDB documents to our expected type
    const results = await PostModel.find({
      $or: [{ name: searchRegex }, { original_name: searchRegex }, { overview: searchRegex }],
    })
      .select("id name original_name poster_path overview first_air_date vote_average")
      .limit(10)
      .lean();

    // Transform the results to match our interface
    const data = results.map((doc: any) => ({
      _id: doc._id.toString(), // Convert ObjectId to string
      id: doc.id,
      name: doc.name,
      original_name: doc.original_name,
      poster_path: doc.poster_path,
      overview: doc.overview,
      first_air_date: doc.first_air_date,
      vote_average: doc.vote_average,
    }));

    return { data };
  } catch (error) {
    console.error("Error in searchPosts:", error);
    return { error };
  }
}
