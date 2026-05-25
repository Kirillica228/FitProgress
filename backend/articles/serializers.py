from rest_framework import serializers
from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    publishedAt = serializers.DateField(source='published_at')
    readTime = serializers.CharField(source='read_time')

    class Meta:
        model = Article
        fields = ['id', 'slug', 'title', 'excerpt', 'content', 'category', 'publishedAt', 'readTime']
