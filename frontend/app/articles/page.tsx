"use client";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticlesData } from "@/hooks/use-articles-data";

export default function ArticlesPage() {
  const { data, isLoading } = useArticlesData();

  if (isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No articles yet"
        description="This section is ready for backend-powered editorial content."
      />
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Articles</p>
        <h1 className="mt-3 text-4xl font-semibold">Training and nutrition insights</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {data.map((article) => (
          <Link key={article.slug} href={`/articles/${article.slug}`}>
            <Card className="h-full">
              <p className="text-sm text-slate-400">{article.category}</p>
              <h2 className="mt-3 text-2xl font-semibold">{article.title}</h2>
              <p className="mt-3 text-sm text-slate-400">{article.excerpt}</p>
              <p className="mt-5 text-sm text-sky-300">{article.readTime}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
