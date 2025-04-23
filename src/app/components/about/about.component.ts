import { Component, Inject, PLATFORM_ID, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: object, private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const sections: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('.animate-fade-in');

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => { 
              this.renderer.addClass(entry.target, 'fade-in-active');
            }, 200);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      sections.forEach(section => {
        if (section) observer.observe(section);
      });
    }
  }
}
