"use server";
import PostModel from "@/models/postModel";
import connectDB from "@/config/database";
import fs from "fs";
import path from "path";

export async function getPosts() {
  try {
    await connectDB();

    const filePath = path.join(process.cwd(), "korean_tv_series_in_english.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const posts = JSON.parse(jsonData);

    const existingPostCount = await PostModel.countDocuments();

    if (existingPostCount === 0) {
      // Your existing insertion code remains the same
      const plainPosts = posts.map((post: any) => ({
        adult: post.adult,
        backdrop_path: post.backdrop_path,
        genre_ids: post.genre_ids,
        id: post.id,
        origin_country: post.origin_country,
        original_language: post.original_language,
        original_name: post.original_name,
        overview: post.overview,
        popularity: post.popularity,
        poster_path: post.poster_path,
        first_air_date: post.first_air_date,
        name: post.name,
        vote_average: post.vote_average,
        vote_count: post.vote_count,
      }));

      await PostModel.insertMany(plainPosts, {
        ordered: false,
      });
    }

    // Modified to get top 20 by popularity
    const data = await PostModel.find().sort({ popularity: -1 }).limit(20).lean();

    return { data };
  } catch (error) {
    console.error("Error in getPosts:", error);
    return { error };
  }
}
