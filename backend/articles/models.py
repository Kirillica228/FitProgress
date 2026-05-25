from django.db import models


class Article(models.Model):
    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=300)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    published_at = models.DateField(null=True, blank=True)
    read_time = models.CharField(max_length=50, blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title
