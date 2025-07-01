import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  courses: any[] = [];
  activeTab: string = 'courses';
  selectedAssessment: any = null;
  selectedAnswers: { [key: number]: string } = {};
  selectedCourse: any = null;
  assignedAssessments: any[] = [];
  aiAssignedAssessments: any[] = [];
  calendarEvents: any[] = [];
  grades: any[] = [];
  selectedFiles: { [assessmentId: number]: File } = {}; // ✅ Store files by assessment ID
notifications: string[] = [];
  showNotifications = false;
  showCalendar = false;
  activeSection: string = 'courses'; 
  studentId: string = '';  
  aiGrades: any[] = [];
  selectedTab: 'manual' | 'ai' = 'manual';

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    // Fetch studentId from localStorage or token (assumed to be stored during login)
    const studentIdFromStorage = localStorage.getItem('studentId');
    if (studentIdFromStorage) {
      this.studentId = studentIdFromStorage;  // Set the studentId dynamically
    } else {
      console.error('Student ID not found in localStorage.');
      // Handle the case where studentId is missing (redirect to login, etc.)
    }
  
    this.loadAllCourses();
    this.loadAssignedAssessments();
    this.loadAssignedAIAssessments();
    this.loadCalendarEvents();
    this.loadGrades();
    this.loadNotifications();
    this.fetchAIGrades();
  }

  
  navigateTo(section: string) {
    this.activeSection = section;
  }

  fetchAIGrades(): void {
    if (!this.studentId) {
      console.error('Student ID is required to fetch AI grades.');
      return;
    }

    this.studentService.getAIGrades(this.studentId).subscribe(
      (data) => {
        this.aiGrades = data;
      },
      (error) => {
        console.error('Error fetching AI grades:', error);
      }
    );
  }
  
  // ✅ Toggle Calendar visibility
  openCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  // ✅ Toggle Notifications visibility
  openNotifications() {
    this.showNotifications = !this.showNotifications;
  }
  // ✅ Load Courses
  loadAllCourses() {
    this.studentService.getCourses().subscribe({
      next: (data) => (this.courses = data),
      error: (err) => console.error('Error loading courses', err),
    });
  }

  // ✅ Open Course Modal
  openCourseModal(course: any) {
    this.selectedCourse = { ...course};
  }

  // ✅ Close Course Modal
  closeCourseModal(event?: Event) {
    if (!event || (event.target as HTMLElement).classList.contains('modal')) {
      this.selectedCourse = null;
    }
  }

  // ✅ Fetch Assigned Assessments
  loadAssignedAssessments() {
    this.studentService.getAssignedAssessments().subscribe({
      next: (data) => (this.assignedAssessments = data),
      error: (err) => console.error('Error loading assessments', err),
    });
  }

  // ✅ Fetch Calendar Events
  loadCalendarEvents() {
    this.studentService.getCalendarEvents().subscribe({
      next: (data) => (this.calendarEvents = data),
      error: (err) => console.error('Error loading calendar events', err),
    });
  }

  // ✅ Fetch Grades
   loadGrades() {
    this.studentService.getGrades().subscribe({
      next: (data) => {
        this.grades = data;
        console.log("Grades loaded:", this.grades); // ✅ Debugging check
      },
      error: (err) => console.error('Error loading grades', err),
    });
  }

  // ✅ Store Selected File (By Assessment ID)
  onFileSelected(event: any, assessmentId: number) {
    if (event.target.files.length > 0) {
      this.selectedFiles[assessmentId] = event.target.files[0]; // ✅ Map file to specific assessment
    }
  }

  // ✅ Submit Assessment Solution
  submitAssessment(assessmentId: number) {
    const file = this.selectedFiles[assessmentId];
    if (!file) {
      alert('Please select a file before submitting!');
      return;
    }

    const formData = new FormData();
    formData.append('assessmentId', assessmentId.toString());
    formData.append('file', file);

    this.studentService.submitAssessment(assessmentId, formData).subscribe({
      next: () => {
        alert('Solution submitted successfully!');
      },
      error: (err) => {
        console.error('Error submitting assessment', err);
      },
    });
  
  }

  
loadAssignedAIAssessments() {
  this.studentService.getAssignedAIAssessments().subscribe({
    next: (data) => {
      console.log("🔹 AI Assessments Received:", data); // ✅ Debugging output
      this.aiAssignedAssessments = data;
    },
    error: (err) => console.error("❌ Error loading AI assessments", err),
  });
  
}
openAssessmentModal(assessment: any) {
  this.selectedAssessment = {
    ...assessment,
    questions: typeof assessment.questions === 'string' ? JSON.parse(assessment.questions) : assessment.questions
  };
  this.selectedAnswers = {}; // Reset answers when opening a new assessment
}

  // ✅ Close AI Assessment Modal
  closeAssessmentModal(event?: Event) {
    if (!event || (event.target as HTMLElement).classList.contains("modal")) {
      this.selectedAssessment = null;
    }
  }

  // ✅ Submit AI Assessment
 submitAIAssessment(assessmentId: number) {
  if (!this.selectedAnswers || Object.keys(this.selectedAnswers).length === 0) {
    alert("Please select answers before submitting!");
    return;
  }

  const submissionData = {
    studentId: localStorage.getItem("studentId"), // ✅ Ensure studentId is included
    assessmentId: assessmentId,
    responses: Object.values(this.selectedAnswers), // ✅ Convert object to array
  };

  console.log("🚀 Submitting assessment:", submissionData); // ✅ Debugging output

  this.studentService.submitAIAssessment(submissionData).subscribe({
    next: (res) => {
      console.log("✅ Response received from server:", res);
      alert("Assessment submitted successfully!");
      this.closeAssessmentModal();
    },
    error: (err) => console.error("❌ Error submitting assessment", err),
  });
}


loadNotifications() {
    this.notifications = [
      '📌 New assessment assigned!',
      '📢 Course update available!',
      '📝 Your grade has been updated!'
    ];
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }


  openModal(modalId: string) {
    document.getElementById(modalId)!.style.display = "block";
  }

  closeModal(modalId: string) {
    document.getElementById(modalId)!.style.display = "none";
  }
  parseStudyMaterial(studyMaterial: any): string[] {
  if (!studyMaterial) return [];

  try {
    const parsed = typeof studyMaterial === 'string' ? JSON.parse(studyMaterial) : studyMaterial;
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing studyMaterial:", error);
    return [];
  }
}

}