// app/shows/[id]/page.tsx
import type { Metadata } from "next";
import { getSemanticallySimilarPosts } from "@/actions/semanticSeachAction";
import PostModel from "@/models/postModel";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import connectDB from "@/config/database";
import SearchBar from "@/components/SearchBar";

async function getShow(id: string) {
  try {
    await connectDB();
    const show = await PostModel.findById(id).lean().exec();
    if (!show) return null;
    return show;
  } catch (error) {
    console.error("Error fetching show:", error);
    return null;
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getShow(id);

  if (!show) {
    return {
      title: "Show Not Found",
      description: "The requested show could not be found",
    };
  }

  return {
    title: show.name,
    description: show.overview,
  };
}

export default async function ShowPage({ params }: PageProps) {
  const { id } = await params;
  const show = await getShow(id);

  if (!show) {
    notFound();
  }

  const { data: similarPosts = [], error } = await getSemanticallySimilarPosts(show.overview, id);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex">
        <SearchBar />
        <Link href="/" className="ml-3 flex justify-center items-center">
          Home
        </Link>
      </div>

      <div className="grid md:grid-cols-[1fr_2fr] gap-8">
        {/* Show Details */}
        <div>
          <div className="relative w-full aspect-[2/3]">
            <Image
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <h1 className="text-3xl font-bold mt-4">{show.name}</h1>
          <p className="text-gray-600">{show.original_name}</p>
          <div className="mt-4">
            <p>First Air Date: {show.first_air_date}</p>
            <p>Rating: ⭐ {show.vote_average.toFixed(1)}</p>
          </div>
          <p className="mt-4">{show.overview}</p>
        </div>

        {/* Similar Shows */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Similar Shows</h2>
          {error ? (
            <p className="text-red-500">Error loading similar shows</p>
          ) : similarPosts && similarPosts.length > 0 ? (
            <div className="space-y-6">
              {similarPosts.map((post) => (
                <Link
                  href={`/shows/${post._id}`}
                  key={post._id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="flex items-start p-4">
                    <div className="relative w-24 h-36 flex-shrink-0">
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${post.poster_path}`}
                        alt={post.name}
                        fill
                        className="rounded object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg hover:text-blue-600">{post.name}</h3>

                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            post.similarity > 80
                              ? "bg-green-100 text-green-800"
                              : post.similarity > 60
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {post.similarity.toFixed(1)}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{post.original_name}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>{new Date(post.first_air_date).getFullYear()}</span>
                        <span className="mx-2">•</span>
                        <span>⭐ {post.vote_average.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.overview}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No similar shows found</p>
          )}
        </div>
      </div>
    </div>
  );
}
