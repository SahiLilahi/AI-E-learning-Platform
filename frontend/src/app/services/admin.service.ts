import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // ✅ Generate Auth Headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("🚨 No auth token found!");
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ✅ Fetch all courses
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses`, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch all users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/users`, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch all assessments
  getAssessments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments`, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch all AI assessments
  getAIAssessments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ai/ai-assessments`, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch all student submissions
  getSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments/submissions`, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch all calendar events
  getCalendarEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/calendar`, { headers: this.getAuthHeaders() });
  }

  // ✅ Delete functions
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/users/${userId}`, { headers: this.getAuthHeaders() });
  }

  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/${courseId}`, { headers: this.getAuthHeaders() });
  }

  deleteAssessment(assessmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assessments/${assessmentId}`, { headers: this.getAuthHeaders() });
  }

  deleteAIAssessment(assessmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ai/assessments/${assessmentId}`, { headers: this.getAuthHeaders() });
  }

  deleteSubmission(submissionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assessments/submissions/${submissionId}`, { headers: this.getAuthHeaders() });
  }

  deleteCalendarEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/calendar/${eventId}`, { headers: this.getAuthHeaders() });
  }
}
