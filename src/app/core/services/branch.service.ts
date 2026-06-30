import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Branch } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }

  getBranchById(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  searchBranches(query: string, city?: string): Observable<Branch[]> {
    let params = `?query=${query}`;
    if (city) params += `&city=${city}`;
    return this.http.get<Branch[]>(`${this.apiUrl}/search${params}`);
  }

  // Admin methods
  getAllBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/all`);
  }

  createBranch(data: any): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, data);
  }

  updateBranch(id: number, data: any): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, data);
  }

  activateBranch(id: number): Observable<Branch> {
    return this.http.patch<Branch>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateBranch(id: number): Observable<Branch> {
    return this.http.patch<Branch>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  // Image methods
  uploadBranchImage(branchId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', 'true');
    formData.append('displayOrder', '0');
    return this.http.post(`${this.apiUrl}/${branchId}/images/upload`, formData);
  }

  addBranchImage(branchId: number, imageUrl: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${branchId}/images`, {
      url: imageUrl,
      isPrimary: true,
      displayOrder: 0
    });
  }

  getBranchImages(branchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${branchId}/images`);
  }

  setBranchPrimaryImage(imageId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/images/${imageId}/set-primary`, {});
  }

  deleteBranchImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/images/${imageId}`);
  }

  getBranchByIdAdmin(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/admin/${id}`);
  }

  // Amenities
  getAmenities(branchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${branchId}/amenities`);
  }

  addAmenity(branchId: number, data: { name: string; description?: string; iconName?: string; available?: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${branchId}/amenities`, data);
  }

  updateAmenity(amenityId: number, data: { name: string; description?: string; iconName?: string; available?: boolean }): Observable<any> {
    return this.http.put(`${this.apiUrl}/amenities/${amenityId}`, data);
  }

  deleteAmenity(amenityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/amenities/${amenityId}`);
  }

  // Membership Plans
  getMembershipPlans(branchId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${branchId}/membership-plans/all`);
  }

  createMembershipPlan(branchId: number, data: { name: string; description?: string; price: number; durationMonths: number; isPopular?: boolean; displayOrder?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${branchId}/membership-plans`, data);
  }

  updateMembershipPlan(planId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/membership-plans/${planId}`, data);
  }

  deleteMembershipPlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/membership-plans/${planId}`);
  }
}
