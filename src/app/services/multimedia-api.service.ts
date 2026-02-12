import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DiaryEntry } from '../entries/entry-card/entry-card.component';

@Injectable({ providedIn: 'root' })
export class MultimediaApiService {
  // Endpoint base del backend para entradas multimedia.
  private readonly baseUrl = '/api/multimedia';

  constructor(private readonly http: HttpClient) {}

  // Obtiene todas las entradas persistidas.
  async listEntries(): Promise<DiaryEntry[]> {
    return firstValueFrom(this.http.get<DiaryEntry[]>(this.baseUrl));
  }

  // Crea una nueva entrada en la base de datos.
  async createEntry(entry: DiaryEntry): Promise<DiaryEntry> {
    return firstValueFrom(this.http.post<DiaryEntry>(this.baseUrl, entry));
  }
}
