import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LOCALE_ID, Inject } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { DatePipe } from '@angular/common';


registerLocaleData(localeRu, 'ru');

interface NewsImage {
  imageUrl: string;
}

interface NewsItem {
  newsID: number;
  title: string;
  content: string;
  datePublished: string;
  newsImages: NewsImage[];
}

@Component({
  selector: 'app-news-page',
  standalone: true,
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css'],
  providers: [DatePipe],
  imports: [CommonModule]
})
export class NewsPageComponent implements OnInit {
  news: NewsItem = { newsID: 0, title: '', content: '', datePublished: '', newsImages: [] };
  isLoading = true;
  errorMessage: string | null = null;
  private apiUrl = "https://localhost:5001/api/News";
private baseUrl = "https://localhost:5001";
  isModalOpen = false;
  selectedImageUrl = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, @Inject(LOCALE_ID) public locale: string) {}

  openModal(imageUrl: string) {
    if (imageUrl) {
      this.selectedImageUrl = imageUrl;
      this.isModalOpen = true;
    }
  }
  

  closeModal() {
    this.isModalOpen = false;
  }

  ngOnInit() {
    console.log("NewsPageComponent инициализирован");
    const newsID = this.route.snapshot.paramMap.get('id');
    
    if (newsID) {
      this.loadNewsDetail(+newsID); // ✅ Преобразуем в число
    } else {
      this.errorMessage = "Новость не найдена.";
      this.isLoading = false;
    }
  }

  async loadNewsDetail(newsID: number) {
    console.log("Запрос новости с ID:", newsID);
    try {
      const data = await firstValueFrom(this.http.get<NewsItem>(`${this.apiUrl}/${newsID}`));
      console.log("Ответ API:", data);

      // Разворачиваем `$values`, если он есть
      let processedNewsImages: NewsImage[] = [];
      if (data.newsImages && (data.newsImages as any).$values) {
        processedNewsImages = (data.newsImages as any).$values;
      } else if (Array.isArray(data.newsImages)) {
        processedNewsImages = data.newsImages;
      }

      // Проверяем, что ссылки на изображения полные
      processedNewsImages = processedNewsImages.map(img => ({
        imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${this.baseUrl}${img.imageUrl}`
      }));

      this.news = { ...data, newsImages: processedNewsImages };
      console.log("Загруженные данные в this.news:", this.news);
    } catch (error) {
      console.error("Ошибка при загрузке новости:", error);
      this.errorMessage = "Ошибка загрузки новости. Возможно, она была удалена.";
    } finally {
      this.isLoading = false;
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      console.warn('Ошибка загрузки изображения, заменяем на заглушку:', imgElement.src);
      imgElement.src = '/assets/default-placeholder.webp';
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  goBack() {
    this.router.navigate(['/']);
  }

}
