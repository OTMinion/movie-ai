// app/shows/[id]/page.tsx
import { getSemanticallySimilarPosts } from "@/actions/semanticSeachAction";
import PostModel from "@/models/postModel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

async function getShow(id: string) {
  const show = await PostModel.findById(id).lean();
  if (!show) notFound();
  return show;
}

// Type for show data
interface IShow {
  _id: string;
  name: string;
  original_name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

// Generate metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const show = await getShow(params.id);
  return {
    title: show.name,
    description: show.overview,
  };
}

// Main page component
async function ShowDetails() {
  return <div>Loading...</div>;
}

// Export the page component
export default ShowDetails;
