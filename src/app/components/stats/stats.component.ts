import { Component, AfterViewInit, ElementRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  imports: [CommonModule]
})
export class StatsComponent implements AfterViewInit {
  stats = [
    { icon: 'fas fa-chart-line', target: 17, text: 'лет на рынке' },
    { icon: 'fas fa-box', target: 5000, text: 'выполненных заказов' },
    { icon: 'fas fa-weight-hanging', target: 8000, text: 'единиц техники перевезено' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateNumbers();
            observer.disconnect(); // Отключаем после первого появления
          }
        });
      }, { threshold: 0.5 }); // Запуск анимации при 50% видимости

      observer.observe(this.el.nativeElement);
    }
  }

  animateNumbers() {
    const elements = this.el.nativeElement.querySelectorAll('.stat-number');
    const duration = 2000; // Общая длительность анимации (в мс)
    const maxTarget = Math.max(...this.stats.map(stat => stat.target)); // Наибольшее число (8000)

    elements.forEach((element: HTMLElement) => {
      let target = +element.getAttribute('data-target')!;
      let count = 0;
      let step = Math.max(1, Math.ceil(target / (maxTarget / 100))); // Шаг зависит от максимального числа
      let intervalTime = duration / (target / step); // Рассчитываем интервал, чтобы все числа завершались одновременно

      const updateCount = () => {
        if (count < target) {
          count += step;
          element.textContent = count.toString();
          setTimeout(updateCount, intervalTime);
        } else {
          element.textContent = target.toString();
        }
      };

      updateCount();
    });
  }
}
