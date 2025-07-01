import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private baseUrl = 'http://localhost:5000/api/assessments'; // Adjust if needed

  constructor(private http: HttpClient) {}

  // Get all assessments
  getAssessments(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  // Get assessment submissions
  getSubmissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/submissions`);
  }

  // Create a new assessment (Tutor Only)
  createAssessment(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}`, formData);
  }

  // Assign assessment to students (Tutor Only)
  assignAssessment(data: { assessmentId: number; studentIds: number[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/assign`, data);
  }

  // Student submits an assessment solution
  submitAssessment(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/submissions`, formData);
  }

  // Tutor grades a submission
  gradeSubmission(data: { submissionId: number; grade: number; feedback: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/grade`, data);
  }

  // Delete an assessment (Tutor Only)
  deleteAssessment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
