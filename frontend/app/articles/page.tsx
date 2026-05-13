"use client";

import Link from "next/link";
import { useState } from "react";

import { MarketingShell } from "@/components/layout/marketing-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticlesData } from "@/hooks/use-articles-data";

export default function ArticlesPage() {
  const { data, isLoading } = useArticlesData();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredArticles =
    !data || !normalizedQuery
      ? data ?? []
      : data.filter((article) =>
          [article.title, article.excerpt, article.category].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          ),
        );

  if (isLoading) {
    return (
      <MarketingShell
        accentLabel="Knowledge Base"
        title="Articles and practical guidance"
        description="A clean editorial space for training, recovery, nutrition, and health progress."
      >
        <Skeleton className="h-80" />
      </MarketingShell>
    );
  }

  if (!data || data.length === 0) {
    return (
      <MarketingShell
        accentLabel="База знаний"
        title="Статьи и практические рекомендации"
        description="Чистое редакционное пространство для тренировок, восстановления сил, правильного питания и улучшения здоровья"
      >
        <EmptyState
          title="Статей пока нет"
          description="Пока что статей нет, но мы уже работаем над их созданием. Скоро здесь появится много полезного контента!"
        />
      </MarketingShell>
    );
  }

  return (
    <MarketingShell
      accentLabel="База знаний"
      title="Статьи и практические рекомендации"
      description="Просматривайте короткие, легко читаемые статьи о тренировках, питании, восстановлении и устойчивом прогрессе"
      actions={
        <div className="w-full sm:w-80">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск статей..."
          />
        </div>
      }
    >
      <section className="grid gap-5 lg:grid-cols-2">
        {filteredArticles.map((article) => (
          <Card key={article.slug} className="flex h-full flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span>{article.category}</span>
                <span>{article.publishedAt}</span>
                <span>{article.readTime}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{article.excerpt}</p>
            </div>
            <div className="mt-6">
              <Link
                href={`/articles/${article.slug}`}
                className="inline-flex rounded-2xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Прочитать статью
              </Link>
            </div>
          </Card>
        ))}
      </section>
      {filteredArticles.length === 0 ? (
        <div className="pt-5">
          <EmptyState
            title="По вашему запросу ничего не найдено"
            description="Попробуйте использовать более широкое ключевое слово или просмотрите полный список тем."
          />
        </div>
      ) : null}
    </MarketingShell>
  );
}
