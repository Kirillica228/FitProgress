import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingShell } from "@/components/layout/marketing-shell";
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
    <MarketingShell maxWidthClassName="max-w-5xl">
      <div className="px-1 pt-8">
        <Link href="/articles" className="text-sm text-sky-300">
          Вернуться к списку статей
        </Link>
        <Card className="mt-6">
          <p className="text-sm text-slate-400">
            {article.category} | {article.publishedAt} | {article.readTime}
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{article.title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">{article.content}</p>
        </Card>
      </div>
    </MarketingShell>
  );
}
