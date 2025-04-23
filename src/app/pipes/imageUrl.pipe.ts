import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl',
  standalone: true, // Для standalone компонентов
})
export class ImageUrlPipe implements PipeTransform {
  transform(image: File | string): string {
    if (typeof image === 'string') {
      // Если уже строка (URL), просто возвращаем её
      return image;
    }
    return URL.createObjectURL(image); // Генерация локального URL для загруженных файлов
  }
}
