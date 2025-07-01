import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}
   private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      return new HttpHeaders(); // Avoid sending an empty 'Bearer' token
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
  
    // ✅ Fetch all courses (Send Token)
    getCourses(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/courses`, { headers: this.getAuthHeaders() });
    }

    getAIGrades(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ai/submissions/${studentId}`, {
      headers: this.getAuthHeaders(),
    });
  }

 getAssignedAssessments(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/assessments/student/assigned`, { headers: this.getAuthHeaders() });
}

getSubmissions(studentId: string): Observable<any> {
    return this.http.get(`http://localhost:5000/api/submissions/${studentId}`);
  }
// ✅ Submit assessment (Correct API route)
submitAssessment(assessmentId: number, formData: FormData): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/assessments/submissions`, formData, { headers: this.getAuthHeaders() });
}
  

  // ✅ Fetch calendar events (exams and schedules)
  getCalendarEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/calendar`, { headers: this.getAuthHeaders() });
  }

  addCalendarEvent(eventData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calendar`, eventData, { headers: this.getAuthHeaders() });
  }
  getGrades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments/student/grades`, { headers: this.getAuthHeaders() });
  }

  getAssignedAIAssessments(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/ai/student-assigned`, { headers: this.getAuthHeaders() });
}

submitAIAssessment(submissionData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/ai/submit`, submissionData, { headers: this.getAuthHeaders() });
}


  
}
