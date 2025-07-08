from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    cover_link = models.URLField(max_length=500, blank=True, null=True) # Link ke gambar sampul
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class PageLink(models.Model):
    book = models.ForeignKey(Book, related_name='page_links', on_delete=models.CASCADE)
    page_number_start = models.IntegerField()
    page_number_end = models.IntegerField()
    file_url = models.URLField(max_length=500) # Link ke file PDF untuk rentang halaman ini

    class Meta:
        unique_together = ('book', 'page_number_start') # Pastikan tidak ada duplikasi page_number_start untuk buku yang sama
        ordering = ['page_number_start'] # Urutkan berdasarkan nomor halaman

    def __str__(self):
        return f"{self.book.title} - Pages {self.page_number_start}-{self.page_number_end}"