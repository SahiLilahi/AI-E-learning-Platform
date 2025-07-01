import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TutorService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // ✅ Generate Auth Headers (For Secured API Calls)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  // ✅ Fetch all courses
  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/courses`, { headers: this.getAuthHeaders() });
  }

  // ✅ Add a new course (Supports File Uploads)
  addCourse(courseData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/courses`, courseData, { headers: this.getAuthHeaders() });
  }

  // ✅ Upload study material separately
  uploadStudyMaterial(courseId: number, fileData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/courses/upload/${courseId}`, fileData, { headers: this.getAuthHeaders() });
  }

  // ✅ Update an existing course
  updateCourse(courseId: number, courseData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/courses/${courseId}`, courseData, { headers: this.getAuthHeaders() });
  }

  // ✅ Delete a course
  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/courses/delete/${courseId}`, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch all students
  getStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/students`, { headers: this.getAuthHeaders() });
  }

  // ✅ Generate an MCQ-based assessment using OpenAI (Fixed: Added Headers)
  generateAssessmentWithAI(title: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/ai/generate`,
      { title },
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Fetch all assessments
  getAssessments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments`, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch AI-Generated Assessments



  // ✅ Add a new AI-generated assessment
  addAssessment(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/assessments`, formData, { headers: this.getAuthHeaders() });
  }

  // ✅ Assign AI-generated assessment to students
  assignAssessment(assessmentId: number, studentIds: number[]): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/assessments/assign`,
      { assessmentId, studentIds },
      { headers: this.getAuthHeaders() }
    );
  }

  


  // ✅ Fetch all student submissions
  getSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments/submissions`, { headers: this.getAuthHeaders() });
  }

  // ✅ Grade a submission manually
  gradeSubmission(submissionId: number, grading: { grade: string; feedback: string }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/assessments/grade`,
      { submissionId, grade: grading.grade, feedback: grading.feedback },
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Grade student submission using AI (Fixed: Added Headers)
  gradeWithAI(submissionId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/ai/evaluate`,
      { submissionId },
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ Delete an assessment
  deleteAssessment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/assessments/${id}`, { headers: this.getAuthHeaders() });
  }

  // ✅ Add Calendar Event
  addCalendarEvent(eventData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calendar`, eventData, { headers: this.getAuthHeaders() });
  }

  // ✅ Get Calendar Events
  getCalendarEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/calendar`, { headers: this.getAuthHeaders() });
  }

  

  // ✅ Submit grade and feedback for a student response
  gradeAISubmission(submissionId: number, grade: string, feedback: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/ai/evaluate`,
      { submissionId, grade, feedback },
      { headers: this.getAuthHeaders() }
    );
  }

  


  // ✅ Save AI-generated assessment to database
  saveAIAssessment(assessmentData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai/save`, assessmentData, { headers: this.getAuthHeaders() });
  }

  // ✅ Assign AI-generated assessment to students
  assignAIAssessment(assessmentId: number, studentIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ai/assign`, { assessmentId, studentIds }, { headers: this.getAuthHeaders() });
  }

  // ✅ Fetch all AI assessment submissions
getAISubmissions(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/ai/all-submissions`, { headers: this.getAuthHeaders() });
}

generateAssessmentFromFile(formData: FormData) {
  return this.http.post<any>("http://localhost:5000/api/ai/generate-from-file", formData);
}


  // ✅ Fetch AI assessments from backend
getAIAssessments(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/ai/assessments`, { headers: this.getAuthHeaders() });
}

}

