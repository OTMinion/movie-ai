"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchPosts, SearchResultType } from "@/actions/searchAction";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const { data, error } = await searchPosts(query);
        if (data) {
          setResults(data);
          setShowResults(true);
        }
        setIsLoading(false);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleResultClick = (id: string) => {
    router.push(`/shows/${id}`);
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search shows..."
          className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {query && (
          <button onClick={clearSearch} className="absolute right-3 top-2.5">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result._id}
                  onClick={() => handleResultClick(result._id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                      alt={result.name}
                      className="w-12 h-18 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.name}</h3>
                      <p className="text-sm text-gray-500">{result.original_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(result.first_air_date).getFullYear()} • ⭐{" "}
                        {result.vote_average.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.overview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
