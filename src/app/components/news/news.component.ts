import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ImageUrlPipe } from '../../pipes/imageUrl.pipe';
import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { formatDistanceToNow } from 'date-fns';
import { formatDistanceToNowStrict } from 'date-fns'; // Импортируем новую функцию


interface NewsItem {
  newsID: number;
  title: string;
  content: string;
  datePublished: string;  // Для отображения
  originalDate: Date;     // Для сортировки
  newsImages?: { imageUrl: string }[];
}

@Component({
  selector: 'app-news',
  standalone: true,
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  imports: [CommonModule, FormsModule, ImageUrlPipe, DatePipe]
})

export class NewsComponent {
  isAdmin: boolean = false;
  activeRowIndex: number | null = null;
  floatingLineStyle: { left: string; width: string; top: string; opacity: string; transform: string } = {
    left: "0px",
    width: "0px",
    top: "0px",
    opacity: "0",
    transform: "translateY(10px) scaleY(0.5)" // ✅ По умолчанию скрыта
  };

  editingNewsImages: { imageUrl: string }[] = []; // Храним старые изображения
  selectedNewImages: File[] = []; // Храним новые изображения
  errorMessage: string | null = null;
  isEditModalOpen = false; // Открыто ли модальное окно
  editingNews: { newsID: number; title: string; content: string; datePublished: string } = { 
    newsID: 0, 
    title: '', 
    content: '', 
    datePublished: new Date().toISOString() // ✅ Добавляем datePublished
  };
  
  

  constructor(
    private http: HttpClient,
    private authService: AuthService, // ✅ Добавляем AuthService в конструктор
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  

  private apiUrl = "http://localhost:5169/api/News";
  newsList: NewsItem[] = [];
  isModalOpen = false;
  newNews: { title: string; content: string; images: File[] } = { title: '', content: '', images: [] };

  // ✅ Группируем новости по 3 без лишних проверок
  get groupedNews() {
    const rows: NewsItem[][] = [];
    for (let i = 0; i < this.newsList.length; i += 3) {
      rows.push(this.newsList.slice(i, i + 3));
    }
    return rows;
  }

  goToNewsPage(newsID: number) {
    console.log("Переход на новость с ID:", newsID); // ✅ Логируем
    this.router.navigate(['/news', newsID]);
  }
  

  moveFloatingLine(event: MouseEvent, index: number) {
    this.activeRowIndex = index;
    const element = (event.target as HTMLElement).closest(".news-card") as HTMLElement;
  
    if (element) {
      requestAnimationFrame(() => {
        this.floatingLineStyle = {
          left: `${element.offsetLeft}px`,
          width: `${element.offsetWidth}px`,
          top: `${element.offsetTop + element.offsetHeight}px`, // ✅ Теперь линия под карточкой
          transform: "translateY(0) scaleY(1)", // ✅ Плавное появление
          opacity: "1"
        };
      });
    }
  }

  hideFloatingLine() {
    this.floatingLineStyle = {
      ...this.floatingLineStyle,
      transform: "translateY(10px) scaleY(0.5)", // ✅ Анимация исчезновения
      opacity: "0"
    };
  }

  openModal() {
    this.isModalOpen = true;
  }

  /** Закрытие модального окна */
  closeModal() {
    this.isModalOpen = false;
    this.newNews = { title: '', content: '', images: [] };
  }

  /** Обработка загруженных файлов (изображений) */
  onFileSelected(event: any) {
    if (this.newNews.images.length >= 3) {
      alert("Можно загрузить не более 3 изображений.");
      return;
    }

    const file = event.target.files[0];
    if (file) {
      this.newNews.images.push(file);
    }
  }

  /** Удаление выбранного изображения */
  removeImage(index: number) {
    this.newNews.images.splice(index, 1);
  }

  /** Формирование заголовков с авторизацией */
  private getAuthHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem("auth-token");
      let headers = new HttpHeaders();
      if (token) {
        headers = headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
    return new HttpHeaders();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Дата недоступна';  // Возвращаем дефолтное значение
    }
    
    const now = new Date();
    const diffInMillis = now.getTime() - date.getTime();
    
    // Если прошло меньше 24 часов
    if (diffInMillis < 86400000) {  // 86400000 - это 24 часа в миллисекундах
      return formatDistanceToNowStrict(date, { addSuffix: true }); // Точное отображение времени
    } else {
      return date.toLocaleDateString("ru-RU");  // Возвращаем дату в формате "дд.мм.гггг"
    }
  }
  
  loadNews() {
    this.http.get<any>(`${this.apiUrl}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error("Ошибка при загрузке новостей:", error);
        this.errorMessage = "Ошибка при загрузке новостей!";
        return throwError(() => new Error("Ошибка при загрузке новостей!"));
      })
    ).subscribe((response) => {
      console.log("Ответ API:", response);
  
      // Приводим к массиву, если данные приходят в $values
      const newsArray: any[] = response?.$values && Array.isArray(response.$values)
        ? response.$values
        : (Array.isArray(response) ? response : []);
  
      // Обрабатываем новости и изображения
      this.newsList = newsArray.map((n: any) => {
        const originalDate = new Date(n.datePublished); // Сохраняем оригинальную дату
        const formattedDate = this.formatDate(n.datePublished); // Форматируем только для отображения
      
        return {
          newsID: n.newsID,
          title: n.title,
          content: n.content,
          datePublished: formattedDate,  // Отображаем форматированную дату
          originalDate: originalDate,   // Сохраняем для сортировки
          newsImages: Array.isArray(n.newsImages) 
            ? n.newsImages.map((img: any) => ({ imageUrl: img.imageUrl })) 
            : (n.newsImages?.$values ? n.newsImages.$values.map((img: any) => ({ imageUrl: img.imageUrl })) : [])
        };
      });
      
  
      // Сортируем новости по дате от самой новой до самой старой
      this.newsList = this.newsList.sort((a, b) => b.originalDate.getTime() - a.originalDate.getTime()); // Сортировка по времени
  
      // Ограничиваем количество новостей до 9
      this.newsList = this.newsList.slice(0, 9);
  
      console.log("Загруженные новости:", this.newsList);
    });
  }
  
  submitNews() {
    if (!this.newNews.title.trim() || !this.newNews.content.trim()) {
      alert("Заполните все поля!");
      return;
    }
  
    const formData = new FormData();
    formData.append("Title", this.newNews.title);
    formData.append("Content", this.newNews.content);
    formData.append("DatePublished", new Date().toISOString());
  
    this.newNews.images.forEach((file) => {
      formData.append("Images", file);
    });
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem("auth-token") || ''}`
    });
  
    this.http.post(`${this.apiUrl}`, formData, { headers }).pipe(
      catchError(error => {
        console.error("Ошибка при добавлении новости:", error);
        return throwError(() => new Error("Ошибка при добавлении новости! Возможно, недостаточно прав."));
      })
    ).subscribe(
      (response: any) => {
        console.log("Новость добавлена:", response);
  
        // Добавляем новость в начало списка
        const originalDate = new Date();  // Добавляем оригинальную дату (текущее время)
        this.newsList.unshift({
          newsID: response.newsID,
          title: this.newNews.title,
          content: this.newNews.content,
          newsImages: Array.isArray(response.newsImages) 
            ? response.newsImages.map((img: any) => ({ imageUrl: img.imageUrl })) 
            : response.newsImages?.$values 
              ? response.newsImages.$values.map((img: any) => ({ imageUrl: img.imageUrl })) 
              : [],
          datePublished: new Date().toLocaleDateString("ru-RU"),  // Отображаем дату в нужном формате
          originalDate: originalDate  // Сохраняем оригинальную дату для сортировки
        });
  
        // Перезагружаем новости
        this.loadNews();
  
        // Закрываем модальное окно
        this.closeModal();
      }
    );
  }  

  /** Удаление новости */
  deleteNews(newsID: number) {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${newsID}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error("Ошибка при удалении новости:", error);
        return throwError(() => new Error("Ошибка при удалении новости!"));
      })
    ).subscribe(
      () => {
        console.log("Новость удалена:", newsID);
        this.newsList = this.newsList.filter(news => news.newsID !== newsID);
      }
    );
  }

  updateNews(newsID: number, updatedTitle: string, updatedContent: string, selectedImages: FileList | null, existingImages: string[]) {
    const token = this.authService.getToken();
    if (!token) {
      console.error("❌ Ошибка: Токен отсутствует, невозможно выполнить запрос!");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", updatedTitle);
    formData.append("content", updatedContent);
    formData.append("datePublished", new Date().toISOString());
  
    // 🔹 Передаем ссылки на старые изображения
    existingImages.forEach(img => {
      formData.append("ExistingImages", img);
    });
  
    // 🔹 Загружаем новые файлы
    if (selectedImages) {
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append("Images", selectedImages[i]);
      }
    }
  
    console.log("🔄 Отправляем данные:", formData);
  
    this.http.put(`${this.apiUrl}/${newsID}`, formData, { 
      headers: this.getAuthHeadersWithoutJson() // ❗ Не указываем Content-Type!
    }).pipe(
      catchError(error => {
        console.error("❌ Ошибка при обновлении новости:", error);
        return throwError(() => new Error("Ошибка при обновлении новости!"));
      })
    ).subscribe(() => {
      console.log("✅ Новость обновлена:", newsID);
      this.loadNews(); // 🔄 Обновляем список новостей
    });
  }
  

  getAuthHeadersWithoutJson(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error("❌ Ошибка: Токен отсутствует!");
    }
  
    return new HttpHeaders({
      Authorization: `Bearer ${token}` // ❗ Без Content-Type, так как FormData сам его устанавливает!
    });
  }
  submitEditNews() {
    if (!this.editingNews) {
      console.error("❌ Ошибка: Нет данных для редактирования!");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", this.editingNews.title);
    formData.append("content", this.editingNews.content);
    formData.append("datePublished", this.editingNews.datePublished);
  
    // 🔹 Добавляем ссылки на существующие изображения
    this.editingNewsImages.forEach(img => {
      formData.append("ExistingImages", img.imageUrl);
    });
  
    // 🔹 Загружаем новые файлы (если есть)
    if (this.selectedNewImages && this.selectedNewImages.length > 0) {
      this.selectedNewImages.forEach(file => {
        formData.append("Images", file);
      });
    }
  
    console.log("🔄 Отправляем данные (редактирование):", formData);
  
    this.http.put(`${this.apiUrl}/${this.editingNews.newsID}`, formData, { 
      headers: this.getAuthHeadersWithoutJson() 
    }).pipe(
      catchError(error => {
        console.error("❌ Ошибка при обновлении новости:", error);
        return throwError(() => new Error("Ошибка при обновлении новости!"));
      })
    ).subscribe(() => {
      console.log("✅ Новость обновлена:", this.editingNews.newsID);
      this.isEditModalOpen = false;
      this.loadNews();
    });
  }
  

  openEditModal(news: NewsItem) {
    this.editingNews = { 
      newsID: news.newsID, 
      title: news.title, 
      content: news.content, 
      datePublished: news.datePublished // ✅ Добавляем дату публикации
    };
  
    this.editingNewsImages = news.newsImages ? [...news.newsImages] : []; // Копируем изображения
    this.isEditModalOpen = true;
  }
  

/** Удаление старого изображения */
removeExistingImage(index: number) {
  this.editingNewsImages.splice(index, 1);
}

/** Добавление новых изображений */
onNewImageSelected(event: any) {
  if (this.selectedNewImages.length >= 3) {
    alert("Можно загрузить не более 3 новых изображений.");
    return;
  }

  const file = event.target.files[0];
  if (file) {
    this.selectedNewImages.push(file);
  }
}

/** Удаление нового изображения */
removeNewImage(index: number) {
  this.selectedNewImages.splice(index, 1);
}

/** Закрывает модальное окно */
closeEditModal() {
  this.isEditModalOpen = false;
}

checkAdminStatus() {
  const userRole = this.authService.getUserRole(); // Получаем роль
  this.isAdmin = userRole === "Admin"; // Если админ, то true
}
    /** Инициализация */
    ngOnInit() {
      this.loadNews();
      this.checkAdminStatus();
    }
  }
