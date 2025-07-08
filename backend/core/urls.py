from django.urls import path
from .views import BookListCreate, BookRetrieveUpdateDestroy, PageLinkListCreate, PageLinkRetrieveUpdateDestroy

urlpatterns = [
    path('books/', BookListCreate.as_view(), name='book-list-create'),
    path('books/<int:pk>/', BookRetrieveUpdateDestroy.as_view(), name='book-retrieve-update-destroy'),
    path('pagelink/', PageLinkListCreate.as_view(), name='pagelink-list-create'),
    path('pagelink/<int:pk>/', PageLinkRetrieveUpdateDestroy.as_view(), name='pagelink-retrieve-update-destroy'),
]