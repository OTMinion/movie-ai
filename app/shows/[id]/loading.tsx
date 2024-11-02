export default function Loading() {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-[1fr_2fr] gap-8">
            <div>
              <div className="bg-gray-200 rounded-lg w-full h-[600px]" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mt-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mt-4" />
              <div className="h-20 bg-gray-200 rounded w-full mt-4" />
            </div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 mb-6">
                  <div className="flex gap-4">
                    <div className="bg-gray-200 rounded w-24 h-36" />
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
                      <div className="h-16 bg-gray-200 rounded w-full mt-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }