import { Component, Inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle'; 

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class SliderComponent {
  isBrowser: boolean;
  slides = [
    { image: '14.jpeg', text: 'КАЖДЫЙ<br>километр<br>под<br>контролем' },
    { image: '5.jpeg', text: 'ГРАНИЦЫ для нас –<br>лишь формальность' },
    { image: '10.jpeg', text: 'НИ ОДНОГО шрама<br>на вашем грузе' },
    { image: '8.jpeg', text: 'Ваш ТОВАР<br>в надёжных руках' },
    { image: '15.jpeg', text: 'Там, где другие ОСТАНАВЛИВАЮТСЯ,<br>мы НАЧИНАЕМ' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      register(); 
    }
  }
}
