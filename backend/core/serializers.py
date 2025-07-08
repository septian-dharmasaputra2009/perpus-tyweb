from rest_framework import serializers
from .models import Book, PageLink

class PageLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageLink
        fields = ['id', 'page_number_start', 'page_number_end', 'file_url']

class BookSerializer(serializers.ModelSerializer):
    # page_links adalah field khusus yang akan diserialisasi menggunakan PageLinkSerializer
    # many=True karena satu buku bisa punya banyak PageLink
    # read_only=True karena PageLink akan dibuat/diupdate melalui metode kustom BookSerializer
    page_links = PageLinkSerializer(many=True) 

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'description', 'cover_link', 'created_at', 'updated_at', 'page_links']
        read_only_fields = ['created_at', 'updated_at'] # Bidang ini akan diisi otomatis oleh Django

    # Metode create() kustom untuk menangani PageLink bersarang
    # Ini penting agar saat POST Book, PageLink juga bisa disimpan
    def create(self, validated_data):
        page_links_data = validated_data.pop('page_links', [])
        book = Book.objects.create(**validated_data)
        for page_link_data in page_links_data:
            PageLink.objects.create(book=book, **page_link_data)
        return book

    # Metode update() kustom untuk menangani PageLink bersarang
    # Ini penting agar saat PUT/PATCH Book, PageLink juga bisa diperbarui/dihapus
    def update(self, instance, validated_data):
        # Pop page_links_data sebelum update instance Book itu sendiri
        page_links_data = validated_data.pop('page_links', None)

        # Update field Book itu sendiri
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if page_links_data is not None: # Hanya proses jika page_links dikirim
            # Dapatkan ID page_links yang sudah ada untuk buku ini
            existing_page_links = {pl.id: pl for pl in instance.page_links.all()}
            incoming_page_link_ids = []

            for page_link_data in page_links_data:
                page_link_id = page_link_data.get('id', None)

                if page_link_id and page_link_id in existing_page_links:
                    # Update page link yang sudah ada
                    page_link = existing_page_links[page_link_id]
                    for attr, value in page_link_data.items():
                        setattr(page_link, attr, value)
                    page_link.save()
                    incoming_page_link_ids.append(page_link_id)
                else:
                    # Buat page link baru (ID null atau tidak ada ID)
                    PageLink.objects.create(book=instance, **page_link_data)

            # Hapus page link yang tidak lagi ada di data yang masuk
            for existing_id, existing_page_link_obj in existing_page_links.items():
                if existing_id not in incoming_page_link_ids:
                    existing_page_link_obj.delete()

        return instance