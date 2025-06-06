import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl',
  standalone: true,
})
export class ImageUrlPipe implements PipeTransform {
  transform(image: File | string): string {
    if (typeof image === 'string') {
     
      return image;
    }
    return URL.createObjectURL(image); 
  }
}
