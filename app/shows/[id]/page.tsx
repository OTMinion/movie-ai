// app/shows/[id]/page.tsx
import { Metadata } from "next";

interface Props {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Show ${params.id}`,
  };
}

export default function Page() {
  return <div>Show Details Page</div>;
}
