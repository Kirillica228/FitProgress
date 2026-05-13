from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from ..models import Article
from ..serializers.article_serializers import ArticleSerializer


class ArticleListView(APIView):
    """Список опубликованных статей. Публичный доступ."""
    permission_classes = [AllowAny]

    def get(self, request):
        articles = Article.objects.filter(is_published=True)
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)


class ArticleDetailView(APIView):
    """Одна статья по slug. Публичный доступ."""
    permission_classes = [AllowAny]

    def get(self, request, slug: str):
        try:
            article = Article.objects.get(slug=slug, is_published=True)
        except Article.DoesNotExist:
            return Response({'detail': 'Статья не найдена.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ArticleSerializer(article)
        return Response(serializer.data)
