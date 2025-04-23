import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider.component';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SliderComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      imports: [CommonModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Добавляем поддержку кастомных элементов
    }).compileComponents();

    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the slider component', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 slides', () => {
    expect(component.slides.length).toBe(5);
  });

  it('should detect platform as browser', () => {
    expect(isPlatformBrowser('browser')).toBeTrue();
  });

  it('should render Swiper container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const swiperContainer = compiled.querySelector('swiper-container');
    expect(swiperContainer).toBeTruthy();
  });

  it('should render correct number of swiper slides', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const slides = compiled.querySelectorAll('swiper-slide');
    expect(slides.length).toBe(5);
  });

  it('should apply correct classes to swiper elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const swiperContainer = compiled.querySelector('swiper-container');
    expect(swiperContainer?.classList.contains('w-full')).toBeTrue();
    expect(swiperContainer?.classList.contains('h-screen')).toBeTrue();

    const firstSlide = compiled.querySelector('swiper-slide');
    expect(firstSlide?.classList.contains('relative')).toBeTrue();
  });
});
