import { getPosts } from "@/actions/postAction";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import React from "react";

export default async function Home() {
  const { data, error } = await getPosts();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Korean TV Series</h1>
      <div className="mb-8">
        <SearchBar />
      </div>
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((post) => (
            <Link
              href={`/shows/${post._id}`}
              key={post.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <img
                src={`https://image.tmdb.org/t/p/w200${post.poster_path}`}
                alt={post.name}
                className="w-full h-auto object-cover rounded mb-2"
              />

              <h3 className="font-semibold text-lg hover:text-blue-600">{post.name}</h3>

              <p>{post.popularity}</p>
              <p className="text-gray-600 text-sm">{post.original_name}</p>
              <div className="mt-2 text-sm">
                ⭐ {post.vote_average.toFixed(1)} • {new Date(post.first_air_date).getFullYear()}
              </div>
            </Link>
          ))}
        </div>
      )}
      {data && data.length === 0 && <p>No posts found</p>}
    </main>
  );
}
