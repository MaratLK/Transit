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
import { DatePipe } from '@angular/common';
import { formatDistanceToNowStrict } from 'date-fns'; 


interface NewsItem {
  newsID: number;
  title: string;
  content: string;
  datePublished: string;  
  originalDate: Date;     
  newsImages?: { imageUrl: string }[];
}

@Component({
  selector: 'app-news',
  standalone: true,
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'],
  imports: [CommonModule, FormsModule, ImageUrlPipe]
})

export class NewsComponent {
  isAdmin: boolean = false;
  activeRowIndex: number | null = null;
  floatingLineStyle: { left: string; width: string; top: string; opacity: string; transform: string } = {
    left: "0px",
    width: "0px",
    top: "0px",
    opacity: "0",
    transform: "translateY(10px) scaleY(0.5)"
  };

  editingNewsImages: { imageUrl: string }[] = []; 
  selectedNewImages: File[] = []; 
  errorMessage: string | null = null;
  isEditModalOpen = false; 
  editingNews: { newsID: number; title: string; content: string; datePublished: string } = { 
    newsID: 0, 
    title: '', 
    content: '', 
    datePublished: new Date().toISOString() 
  };
  
  

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  

  private baseUrl = 'https://localhost:5001';
  private newsEndpoint = `${this.baseUrl}/api/News`;
  
  newsList: NewsItem[] = [];
  isModalOpen = false;
  newNews: { title: string; content: string; images: File[] } = { title: '', content: '', images: [] };

  get groupedNews() {
    const rows: NewsItem[][] = [];
    for (let i = 0; i < this.newsList.length; i += 3) {
      rows.push(this.newsList.slice(i, i + 3));
    }
    return rows;
  }

  goToNewsPage(newsID: number) {
    console.log("Переход на новость с ID:", newsID); 
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
          top: `${element.offsetTop + element.offsetHeight}px`, 
          transform: "translateY(0) scaleY(1)", 
          opacity: "1"
        };
      });
    }
  }

  hideFloatingLine() {
    this.floatingLineStyle = {
      ...this.floatingLineStyle,
      transform: "translateY(10px) scaleY(0.5)",
      opacity: "0"
    };
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.newNews = { title: '', content: '', images: [] };
  }

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

  removeImage(index: number) {
    this.newNews.images.splice(index, 1);
  }

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
      return 'Дата недоступна';  
    }
    
    const now = new Date();
    const diffInMillis = now.getTime() - date.getTime();
    
    if (diffInMillis < 86400000) {  
      return formatDistanceToNowStrict(date, { addSuffix: true }); 
    } else {
      return date.toLocaleDateString("ru-RU");
    }
  }
  
  loadNews() {
    this.http.get<any>(this.newsEndpoint, { headers: this.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error("Ошибка при загрузке новостей:", error);
        this.errorMessage = "Ошибка при загрузке новостей!";
        return throwError(() => new Error("Ошибка при загрузке новостей!"));
      })
    ).subscribe((response) => {
      console.log("Ответ API:", response);
  
      const newsArray: any[] = response?.$values && Array.isArray(response.$values)
        ? response.$values
        : (Array.isArray(response) ? response : []);
  
      this.newsList = newsArray.map((n: any) => {
        const originalDate = new Date(n.datePublished); 
        const formattedDate = this.formatDate(n.datePublished); 
      
        return {
          newsID: n.newsID,
          title: n.title,
          content: n.content,
          datePublished: formattedDate,  
          originalDate: originalDate,  
          newsImages: Array.isArray(n.newsImages) 
            ? n.newsImages.map((img: any) => ({ imageUrl: img.imageUrl })) 
            : (n.newsImages?.$values ? n.newsImages.$values.map((img: any) => ({ imageUrl: img.imageUrl })) : [])
        };
      });
    
      this.newsList = this.newsList.sort((a, b) => b.originalDate.getTime() - a.originalDate.getTime()); 

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
  
    this.http.post(this.newsEndpoint, formData, { headers }).pipe(
      catchError(error => {
        console.error("Ошибка при добавлении новости:", error);
        return throwError(() => new Error("Ошибка при добавлении новости! Возможно, недостаточно прав."));
      })
    ).subscribe(
      (response: any) => {
        console.log("Новость добавлена:", response);
        const originalDate = new Date(); 
        this.newsList.unshift({
          newsID: response.newsID,
          title: this.newNews.title,
          content: this.newNews.content,
          newsImages: Array.isArray(response.newsImages) 
            ? response.newsImages.map((img: any) => ({ imageUrl: img.imageUrl })) 
            : response.newsImages?.$values 
              ? response.newsImages.$values.map((img: any) => ({ imageUrl: img.imageUrl })) 
              : [],
          datePublished: new Date().toLocaleDateString("ru-RU"), 
          originalDate: originalDate 
        });
  
        this.loadNews();
  
        this.closeModal();
      }
    );
  }  

  deleteNews(newsID: number) {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) {
      return;
    }

    this.http.delete(`${this.newsEndpoint}/${newsID}`, { headers: this.getAuthHeaders() }).pipe(
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

  updateNews(
    newsID: number,
    updatedTitle: string,
    updatedContent: string,
    selectedImages: FileList | null,
    existingImages: string[]
  ) {
    const token = this.authService.getToken();
    if (!token) {
      console.error("❌ Ошибка: Токен отсутствует, невозможно выполнить запрос!");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", updatedTitle);
    formData.append("content", updatedContent);
    formData.append("datePublished", new Date().toISOString());
  
    existingImages.forEach(img => {
      formData.append("ExistingImages", img);
    });
  
    if (selectedImages !== null && selectedImages !== undefined && selectedImages.length > 0) {
      for (let i = 0; i < selectedImages.length; i++) {
        formData.append("Images", selectedImages[i]);
      }
    }
  
    console.log("🔄 Отправляем данные (обновление):", formData);
  
    this.http.put(`${this.newsEndpoint}/${newsID}`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).pipe(
      catchError(error => {
        console.error("❌ Ошибка при обновлении новости:", error);
        return throwError(() => new Error("Ошибка при обновлении новости!"));
      })
    ).subscribe(() => {
      console.log("✅ Новость обновлена:", newsID);
      this.loadNews();
    });
  }  

  getAuthHeadersWithoutJson(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error("❌ Ошибка: Токен отсутствует!");
    }
  
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  
  submitEditNews() {
    if (!this.editingNews) {
      console.error("❌ Ошибка: Нет данных для редактирования!");
      return;
    }
  
    const token = this.authService.getToken();
    if (!token) {
      console.error("❌ Ошибка: Токен отсутствует!");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", this.editingNews.title);
    formData.append("content", this.editingNews.content);
    formData.append("datePublished", this.editingNews.datePublished);
  
    this.editingNewsImages.forEach(img => {
      formData.append("ExistingImages", img.imageUrl);
    });
  
    if (this.selectedNewImages?.length > 0) {
      this.selectedNewImages.forEach(file => {
        formData.append("Images", file);
      });
    }
  
    console.log("🔄 Отправляем данные (редактирование):", formData);
  
    this.http.put(`${this.newsEndpoint}/${this.editingNews.newsID}`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
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
      datePublished: news.datePublished 
    };
  
    this.editingNewsImages = news.newsImages ? [...news.newsImages] : []; 
    this.isEditModalOpen = true;
  }
  

removeExistingImage(index: number) {
  this.editingNewsImages.splice(index, 1);
}
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

removeNewImage(index: number) {
  this.selectedNewImages.splice(index, 1);
}

closeEditModal() {
  this.isEditModalOpen = false;
}

checkAdminStatus() {
  const userRole = this.authService.getUserRole(); 
  this.isAdmin = userRole === "Admin"; 
}
    ngOnInit() {
      this.loadNews();
      this.checkAdminStatus();
    }
  }
