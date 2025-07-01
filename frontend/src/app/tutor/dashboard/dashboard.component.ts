import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TutorService } from '../../services/tutor.service';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  courses: any[] = [];
  aiAssessments: any[] = [];
   activeTab: string = 'courses';
  dashboardTab: string = 'courses';
  assessments: any[] = [];
  students: any[] = [];
  assignGradeTab: string = 'assign'; // Default to "assign" tab
aiSubmissions: any[] = [];
  selectedAISubmission: any = null;
  grading: any = { grade: '', feedback: '' };
  selectedAssessmentId: number | null = null;
  selectedStudentId: number | null = null;
selectedSubmissionId: number | null = null;
submissions: any[] = [];
selectedStudentIds: number[] = [];

  calendarEvents: any[] = [];
  newEvent = { title: '', date: '' }; 
  activeSection: string = 'dashboard';
openModals: { [key: string]: boolean } = {assignGradeModal: false, createEventModal: false};
selectedAIAssessmentId:any | null = null;
 isAssignGradeModalOpen = false;
  isCreateEventModalOpen = false;
  constructor(private tutorService: TutorService, private router: Router, private http: HttpClient) {}


  ngOnInit() {
    this.loadCourses();
    this.loadAssessments();
    this.loadStudents();
    this.loadCalendarEvents();
    this.loadSubmissions();
  this.loadCalendarEvents();
  this.loadAIAssessments();
   
   this.gradeWithAI();
    this.fetchAISubmissions();
  }

  fetchAISubmissions() {
  this.tutorService.getAISubmissions().subscribe({
    next: (data) => (this.aiSubmissions = data),
    error: (error) => console.error('Error fetching AI submissions:', error)
  });
}


  loadCourses() {
    this.tutorService.getCourses().subscribe({
      next: (data) => (this.courses = data),
      error: (err) => console.error('Error loading courses', err),
    });
  }

  gradeSelectedSubmission() { // New name
  if (!this.selectedSubmissionId) {
    alert('Please select a submission to grade.');
    return;
  }

  this.tutorService.gradeWithAI(this.selectedSubmissionId).subscribe({
    next: (response) => {
      console.log('AI Grading Response:', response);
      alert('Submission graded with AI successfully!');
      this.loadSubmissions(); // Refresh submissions
    },
    error: (error) => console.error('Error grading with AI:', error)
  });
}

  gradeWithAI() {
  if (!this.selectedSubmissionId) {
   
    return;
  }

  this.tutorService.gradeWithAI(this.selectedSubmissionId).subscribe({
    next: (response) => {
      console.log('AI Grading Response:', response);
      alert('Submission graded with AI successfully!');
      this.loadSubmissions(); // Refresh submissions
    },
    error: (error) => console.error('Error grading with AI:', error)
  });
}

loadAIAssessments() {
  this.tutorService.getAIAssessments().subscribe({
    next: (data) => {
      this.aiAssessments = data;
      console.log('AI Assessments:', this.aiAssessments);
    },
    error: (error) => console.error('Error fetching AI assessments:', error)
  });
}
  loadAssessments() {
    this.tutorService.getAssessments().subscribe({
      next: (data) => (this.assessments = data),
      error: (err) => console.error('Error loading assessments', err),
    });
  }
 
  loadStudents() {
    this.tutorService.getStudents().subscribe({
      next: (data) => (this.students = data),
      error: (err) => console.error('Error loading students', err),
    });
  }

  loadCalendarEvents() {
    this.tutorService.getCalendarEvents().subscribe({
      next: (data) => (this.calendarEvents = data),
      error: (err) => console.error('Error loading calendar events', err),
    });
  }

  assignAssessment() {
    if (!this.selectedAssessmentId || !this.selectedStudentId) {
      alert('Please select both an assessment and a student.');
      return;
    }

    this.tutorService.assignAssessment(this.selectedAssessmentId, [this.selectedStudentId]).subscribe({
      next: () => alert('Assessment assigned successfully!'),
      error: (err) => console.error('Error assigning assessment', err),
    });
  }

  addCalendarEvent() {
    if (!this.newEvent.title || !this.newEvent.date) {
      alert('Please provide event title and date.');
      return;
    }

    this.tutorService.addCalendarEvent(this.newEvent).subscribe(() => {
      this.loadCalendarEvents();
      this.newEvent = { title: '', date: '' };
      alert('Event added to calendar!');
    });
  }

createEvent() {
    if (!this.newEvent.title || !this.newEvent.date) {
      alert('Please enter event title and date.');
      return;
    }

    this.tutorService.addCalendarEvent(this.newEvent).subscribe(() => {
      alert('Event added successfully!');
      this.loadCalendarEvents();
      this.newEvent = { title: '', date: '' }; // Reset input fields
    });
  }

  // ✅ Navigation to Courses Page
  goToCourses() {
    this.router.navigate(['/tutor/courses']);
  }

  // ✅ Navigation to Assessments Page
  goToAssessments() {
    this.router.navigate(['/tutor/assessments']);
  }
loadSubmissions() {
  this.tutorService.getSubmissions().subscribe({
    next: (data) => (this.submissions = data),
    error: (err) => console.error('Error loading submissions', err),
  });
}


  
 selectTab(tab: string) {
    this.activeTab = tab;
  }
openModal(modalId: string) {
    document.getElementById(modalId)!.style.display = "block";
  }

  closeModal(modalId: string) {
    document.getElementById(modalId)!.style.display = "none";
  }

  logout() {
    alert('Logging out...');
    this.router.navigate(['/login']);
  }
  
  assignAIAssessment() {
  if (!this.selectedAIAssessmentId || this.selectedStudentIds.length === 0) {
    alert('Please select an AI assessment and at least one student.');
    return;
  }

  this.tutorService.assignAIAssessment(this.selectedAIAssessmentId, this.selectedStudentIds).subscribe({
    next: () => alert('AI assessment assigned successfully!'),
    error: (err) => console.error('Error assigning AI assessment', err),
  });
}

gradeSubmission() {
    if (!this.selectedSubmissionId || !this.grading.grade || !this.grading.feedback) {
      alert('Please select a submission and provide grade and feedback.');
      return;
    }

    this.tutorService.gradeSubmission(this.selectedSubmissionId, this.grading).subscribe({
      next: () => {
        alert('Submission graded successfully!');
        this.loadSubmissions();
      },
      error: (err) => console.error('Error grading submission', err),
    });
  }

}
