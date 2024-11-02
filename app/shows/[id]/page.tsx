// app/shows/[id]/page.tsx
import { getSemanticallySimilarPosts } from "@/actions/semanticSeachAction";
import PostModel from "@/models/postModel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Types } from "mongoose";

// Import correct types from Next.js
// import type { PageProps } from "next/types";

// Define the dynamic route params
interface PageParameters {
  id: string;
}

// Define proper Next.js page props type
type Props = {
  params: PageParameters;
  searchParams: Record<string, string | string[] | undefined>;
};

// Define the base document structure from MongoDB
interface MongoBaseDocument {
  _id: Types.ObjectId;
  id: number;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
}

// Frontend show interface
interface IShow {
  _id: string;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

// Interface for similar shows with similarity score
interface ISimilarShow extends IShow {
  similarity: number;
}

async function getShow(id: string): Promise<IShow> {
  const show = await PostModel.findById(id).lean();

  if (!show) notFound();

  // Safely cast the document and convert it to IShow format
  const showDoc = show as unknown as MongoBaseDocument;

  return {
    _id: showDoc._id.toString(),
    name: showDoc.name,
    original_name: showDoc.original_name,
    poster_path: showDoc.poster_path,
    overview: showDoc.overview,
    first_air_date: showDoc.first_air_date,
    vote_average: showDoc.vote_average,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const show = await getShow(params.id);

  return {
    title: show.name,
    description: show.overview,
  };
}

// Add proper Next.js page type annotation
const Page = async ({ params, searchParams }: Props) => {
  try {
    const show = await getShow(params.id);
    const { data: similarPosts, error } = await getSemanticallySimilarPosts(
      show.overview,
      params.id
    );

    return (
      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
          {/* Show Details */}
          <div>
            <img
              src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
              alt={show.name}
              className="rounded-lg shadow-lg w-full"
            />
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
                {similarPosts.map((post: ISimilarShow) => (
                  <div
                    key={post._id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="flex items-start p-4">
                      <img
                        src={`https://image.tmdb.org/t/p/w200${post.poster_path}`}
                        alt={post.name}
                        className="w-24 h-36 object-cover rounded mr-4"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <Link href={`/shows/${post._id}`}>
                            <h3 className="font-semibold text-lg hover:text-blue-600">
                              {post.name}
                            </h3>
                          </Link>
                          {/* Similarity Score Badge */}
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
                  </div>
                ))}
              </div>
            ) : (
              <p>No similar shows found</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in Page component:", error);
    return <div>Error loading show details</div>;
  }
};

export default Page;
