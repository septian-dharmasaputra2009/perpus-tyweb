from django.contrib import admin
from .models import Book, PageLink

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'updated_at') # Kolom yang akan ditampilkan di daftar
    search_fields = ('title', 'author') # Bisa mencari berdasarkan judul dan penulis
    list_filter = ('author', 'created_at') # Filter di sidebar admin

@admin.register(PageLink)
class PageLinkAdmin(admin.ModelAdmin):
    list_display = ('book', 'page_number_start', 'page_number_end', 'file_url')
    list_filter = ('book',) # Filter berdasarkan buku
    search_fields = ('book__title', 'file_url') # Cari berdasarkan judul buku atau URL file
    raw_id_fields = ('book',) # Memudahkan memilih buku jika ada banyak