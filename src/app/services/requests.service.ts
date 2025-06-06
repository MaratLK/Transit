import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IRequest {
  id?: number;
  name: string;
  phoneNumber: string;
  comment?: string;
  status?: number;
  createdAt?: string;
  userID?: number;
}

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private apiUrl = 'https://localhost:5001/api/Requests';

  constructor(private http: HttpClient) {}

  create(dto: { name: string; phoneNumber: string; comment?: string }): Observable<IRequest> {
    return this.http.post<IRequest>(this.apiUrl, dto);
  }

  getAll(): Observable<IRequest[]> {
    return this.http.get<IRequest[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateComment(id: number, comment: string): Observable<IRequest> {
    return this.http.put<IRequest>(
      `${this.apiUrl}/${id}`,
      { comment }  // DTO { comment: "...", status: null }
    );
  }

  updateStatus(id: number, status: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}/status`,
      status,  // <— просто число
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
}