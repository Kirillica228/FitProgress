from django.contrib import admin

from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'published_at', 'read_time', 'is_published']
    list_filter = ['is_published', 'category']
    list_editable = ['is_published']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-published_at']
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'category', 'published_at', 'read_time', 'is_published')}),
        ('Контент', {'fields': ('excerpt', 'content')}),
    )
