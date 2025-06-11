import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  // Type safety for simple properties
  readonly isLoading: boolean = false;
  readonly userName: string = 'Usuario';
  readonly containerWidth: number = 1116;
  readonly containerHeight: number = 720;

  // Type safety for methods
  onImageLoad(): void {
    console.log('Image loaded successfully');
  }

  onImageError(event: Event): void {
    console.error('Failed to load image:', event);
  }

  // Type safety for computed properties
  get welcomeMessage(): string {
    return `¡Bienvenido, ${this.userName}!`;
  }
}
