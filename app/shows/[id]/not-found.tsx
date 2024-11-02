import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Show Not Found</h2>
      <p className="text-gray-600 mb-4">
        The show you're looking for doesn't exist or has been removed.
      </p>
      <Link href="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  );
}
