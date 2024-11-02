// app/shows/layout.tsx
export default function ShowsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
}
