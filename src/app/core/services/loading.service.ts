import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  setLoading(loading: boolean): void {
    this.isLoadingSubject.next(loading);
  }

  isLoading(): boolean {
    return this.isLoadingSubject.value;
  }
}
