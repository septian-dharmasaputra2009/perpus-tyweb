from rest_framework import generics
from .models import Book, PageLink
from .serializers import BookSerializer, PageLinkSerializer
from django.db.models import Q

# View untuk daftar semua buku dan membuat buku baru
class BookListCreate(generics.ListCreateAPIView):
    queryset = Book.objects.all() # Queryset dasar
    serializer_class = BookSerializer # Serializer yang akan digunakan

    # Override get_queryset untuk menambahkan fungsionalitas pencarian
    def get_queryset(self):
        queryset = Book.objects.all().order_by('-created_at') # Ambil semua buku, diurutkan terbaru
        
        # Dapatkan parameter 'q' dari URL query
        search_query = self.request.query_params.get('q', None)

        if search_query:
            # Filter queryset berdasarkan judul BUKU atau penulis
            # Q() memungkinkan Anda menggunakan operator OR (|) di filter
            queryset = queryset.filter(
                Q(title__icontains=search_query) | # Cari di judul (case-insensitive)
                Q(author__icontains=search_query) # Cari di penulis (case-insensitive)
            )
        
        return queryset

# View untuk mengambil detail satu buku, memperbarui, atau menghapus buku
class BookRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all() # Queryset dasar
    serializer_class = BookSerializer # Serializer yang akan digunakan
    lookup_field = 'pk' # Menggunakan primary key default Django untuk lookup

# View untuk daftar semua PageLink dan membuat PageLink baru (jika diakses terpisah)
class PageLinkListCreate(generics.ListCreateAPIView):
    queryset = PageLink.objects.all()
    serializer_class = PageLinkSerializer

# View untuk mengambil detail satu PageLink, memperbarui, atau menghapus PageLink
class PageLinkRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = PageLink.objects.all()
    serializer_class = PageLinkSerializer
    lookup_field = 'pk' # Menggunakan primary key default Django untuk lookup