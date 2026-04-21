import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default async function ArticleDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await api.getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <Link href="/articles" className="text-sm text-sky-300">
        Back to articles
      </Link>
      <Card className="mt-6">
        <p className="text-sm text-slate-400">
          {article.category} · {article.readTime}
        </p>
        <h1 className="mt-3 text-4xl font-semibold">{article.title}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">{article.content}</p>
      </Card>
    </main>
  );
}
