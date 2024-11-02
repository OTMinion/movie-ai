// app/shows/[id]/page.tsx
import {
  getSemanticallySimilarPosts,
  type IShow,
  type ISimilarShow,
} from "@/actions/semanticSeachAction";
import PostModel from "@/models/postModel";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

async function getShow(id: string): Promise<IShow> {
  try {
    const show = await PostModel.findById(id).lean();
    if (!show) notFound();

    // Sanitize and validate the data
    return {
      _id: show._id.toString(),
      name: String(show.name || "").replace(/[<>]/g, ""), // Remove potential HTML tags
      original_name: String(show.original_name || "").replace(/[<>]/g, ""),
      poster_path: String(show.poster_path || ""),
      overview: String(show.overview || "").replace(/[<>]/g, ""),
      first_air_date: String(show.first_air_date || ""),
      vote_average: Number(show.vote_average || 0),
    };
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

// Simplified component to test data rendering
export default async function ShowPage({ params }: PageProps) {
  try {
    // Step 1: Just render the basic show data first
    const show = await getShow(params.id);

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">{show.name}</h1>
        <p>{show.original_name}</p>
        <p>{show.overview}</p>
      </div>
    );

    // Step 2: If the above works, uncomment this section and test
    /*
    const { data: similarPosts = [], error } = await getSemanticallySimilarPosts(show.overview, params.id);

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">{show.name}</h1>
        <p>{show.original_name}</p>
        <p>{show.overview}</p>
        
        <div className="mt-6">
          <h2 className="text-xl font-bold">Similar Shows</h2>
          {similarPosts.map(post => (
            <div key={post._id} className="mt-4">
              <h3>{post.name}</h3>
              <p>{post.similarity.toFixed(1)}% match</p>
            </div>
          ))}
        </div>
      </div>
    );
    */

    // Step 3: If step 2 works, uncomment this section and test
    /*
    return (
      <div className="container mx-auto p-6">
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
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

          <div>
            <h2 className="text-2xl font-bold mb-6">Similar Shows</h2>
            {similarPosts.map(post => (
              <div key={post._id} className="mt-4">
                <h3>{post.name}</h3>
                <p>{post.similarity.toFixed(1)}% match</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    */
  } catch (error) {
    console.error("Error in ShowPage:", error);
    return (
      <div className="p-6">
        <p className="text-red-500">Error loading show details.</p>
      </div>
    );
  }
}
