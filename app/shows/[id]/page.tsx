// app/shows/[id]/page.tsx
import {
  getSemanticallySimilarPosts,
  type IShow,
  type ISimilarShow,
} from "@/actions/semanticSeachAction";
import PostModel from "@/models/postModel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Types } from "mongoose";
import Image from "next/image";

interface PageProps {
  params: { id: string };
}

// MongoDB document type
interface MongoBaseDocument {
  _id: Types.ObjectId;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

// Data validation functions
function validateShowData(show: any): show is IShow {
  return (
    show &&
    typeof show._id === "string" &&
    typeof show.name === "string" &&
    typeof show.original_name === "string" &&
    typeof show.poster_path === "string" &&
    typeof show.overview === "string" &&
    typeof show.first_air_date === "string" &&
    typeof show.vote_average === "number"
  );
}

async function getShow(id: string): Promise<IShow> {
  try {
    const show = await PostModel.findById(id).lean();

    if (!show) notFound();

    const showData: IShow = {
      _id: show._id.toString(),
      name: String(show.name || ""),
      original_name: String(show.original_name || ""),
      poster_path: String(show.poster_path || ""),
      overview: String(show.overview || ""),
      first_air_date: String(show.first_air_date || ""),
      vote_average: Number(show.vote_average || 0),
    };

    if (!validateShowData(showData)) {
      throw new Error("Invalid show data structure");
    }

    return showData;
  } catch (error) {
    console.error("Error fetching show:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const show = await getShow(params.id);
    return {
      title: show.name || "Show Details",
      description: show.overview || "No description available",
    };
  } catch {
    return {
      title: "Show Details",
      description: "Show information",
    };
  }
}

// Safe image URL function
function getSafeImageUrl(path: string | null | undefined, size: string = "w500"): string {
  if (!path) return "/placeholder-image.jpg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Safe date formatter
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() || "No date available";
  } catch {
    return "No date available";
  }
}

export default async function ShowPage({ params }: PageProps) {
  try {
    const show = await getShow(params.id);
    const { data: similarPosts = [], error } = await getSemanticallySimilarPosts(
      show.overview,
      params.id
    );

    return (
      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
          {/* Show Details */}
          <div>
            <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden">
              <Image
                src={getSafeImageUrl(show.poster_path)}
                alt={show.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold mt-4">{show.name}</h1>
            {show.original_name !== show.name && (
              <p className="text-gray-600">{show.original_name}</p>
            )}
            <div className="mt-4">
              <p>First Air Date: {formatDate(show.first_air_date)}</p>
              <p>Rating: ⭐ {show.vote_average.toFixed(1)}</p>
            </div>
            <p className="mt-4 whitespace-pre-line">{show.overview || "No overview available"}</p>
          </div>

          {/* Similar Shows */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Similar Shows</h2>
            {error ? (
              <p className="text-red-500">Error loading similar shows</p>
            ) : similarPosts && similarPosts.length > 0 ? (
              <div className="space-y-6">
                {similarPosts.map((post) => (
                  <div
                    key={post._id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="flex items-start p-4">
                      <div className="relative w-24 h-36">
                        <Image
                          src={getSafeImageUrl(post.poster_path, "w200")}
                          alt={post.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex justify-between items-start">
                          <Link href={`/shows/${post._id}`}>
                            <h3 className="font-semibold text-lg hover:text-blue-600">
                              {post.name || "Untitled Show"}
                            </h3>
                          </Link>
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
                        {post.original_name !== post.name && (
                          <p className="text-sm text-gray-600">{post.original_name}</p>
                        )}
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span>{formatDate(post.first_air_date)}</span>
                          <span className="mx-2">•</span>
                          <span>⭐ {post.vote_average.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {post.overview || "No overview available"}
                        </p>
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
    console.error("Error in ShowPage:", error);
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">Error loading show details. Please try again later.</p>
      </div>
    );
  }
}
