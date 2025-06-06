import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestsService, IRequest } from '../../services/requests.service';
import { AuthService } from '../../services/auth.service';
import { map, finalize, catchError } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-requests-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-requests-modal.component.html',
  styleUrls: ['./my-requests-modal.component.css']
})
export class MyRequestsModalComponent implements OnInit {
  @Input() isAdmin = false;
  @Output() close = new EventEmitter<void>();

  requests: IRequest[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private reqSvc: RequestsService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  private loadRequests() {
    this.loading = true;
    const profile = this.auth.getUser() || {};
    const myPhone = (profile.phoneNumber ?? profile.PhoneNumber ?? '').trim();

    this.reqSvc.getAll().pipe(
      map((res: any) => Array.isArray(res) ? res : (res.$values || [])),
      map((all: IRequest[]) =>
        this.isAdmin
          ? all
          : all.filter(r => r.phoneNumber === myPhone)
      ),
      finalize(() => this.loading = false)
    ).subscribe({
      next: list => this.requests = list,
      error: () => {
        this.error = 'Не удалось загрузить заявки';
      }
    });
  }

  deleteRequest(id: number) {
    if (!confirm(`Удалить заявку №${id}?`)) return;
    this.reqSvc.delete(id).subscribe({
      next: () => this.requests = this.requests.filter(r => r.id !== id),
      error: () => alert('Ошибка при удалении')
    });
  }

  saveChanges(r: IRequest) {
    forkJoin([
      this.reqSvc.updateComment(r.id!, r.comment || ''),
      this.reqSvc.updateStatus(r.id!, r.status!)
    ]).subscribe({
      next: () => alert('Изменения сохранены'),
      error: () => alert('Ошибка при сохранении изменений')
    });
  }

  onClose() {
    this.close.emit();
  }
}
