import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit {
  courses: any[] = [];
  users: any[] = [];
  assessments: any[] = [];
  aiAssessments: any[] = [];
  submissions: any[] = [];
  events: any[] = [];
  notifications: string[] = [];
  activeSection: string = 'users'; // ✅ Default section
  showNotifications = false;
  showCalendar = false;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadCourses();
    this.loadUsers();
    this.loadAssessments();
    this.loadAIAssessments();
    this.loadSubmissions();
    this.loadCalendarEvents();
     this.loadNotifications();
  }

  // ✅ Load courses
  loadCourses() {
    this.adminService.getCourses().subscribe({
      next: (data) => (this.courses = data),
      error: (err) => console.error('Error loading courses', err),
    });
  }

  // ✅ Load users
  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error('Error loading users', err),
    });
  }

  // ✅ Load manual assessments
  loadAssessments() {
    this.adminService.getAssessments().subscribe({
      next: (data) => (this.assessments = data),
      error: (err) => console.error('Error loading assessments', err),
    });
  }

  // ✅ Load AI assessments
  loadAIAssessments() {
    this.adminService.getAIAssessments().subscribe({
      next: (data) => (this.aiAssessments = data),
      error: (err) => console.error('Error loading AI assessments', err),
    });
  }

  // ✅ Load student submissions
  loadSubmissions() {
    this.adminService.getSubmissions().subscribe({
      next: (data) => (this.submissions = data),
      error: (err) => console.error('Error loading submissions', err),
    });
  }

  // ✅ Load calendar events
  loadCalendarEvents() {
    this.adminService.getCalendarEvents().subscribe({
      next: (data) => (this.events = data),
      error: (err) => console.error('Error loading calendar events', err),
    });
  }

  // ✅ Delete functions
  deleteCourse(courseId: number) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.adminService.deleteCourse(courseId).subscribe(() => this.loadCourses());
    }
  }

  deleteUser(userId: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe(() => this.loadUsers());
    }
  }

  deleteAssessment(assessmentId: number) {
    if (confirm('Are you sure you want to delete this assessment?')) {
      this.adminService.deleteAssessment(assessmentId).subscribe(() => this.loadAssessments());
    }
  }

  deleteAIAssessment(assessmentId: number) {
    if (confirm('Are you sure you want to delete this AI assessment?')) {
      this.adminService.deleteAIAssessment(assessmentId).subscribe(() => this.loadAIAssessments());
    }
  }

  deleteSubmission(submissionId: number) {
    if (confirm('Are you sure you want to delete this submission?')) {
      this.adminService.deleteSubmission(submissionId).subscribe(() => this.loadSubmissions());
    }
  }

  deleteCalendarEvent(eventId: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.adminService.deleteCalendarEvent(eventId).subscribe(() => this.loadCalendarEvents());
    }
  }
  loadNotifications() {
    this.notifications = [
      '📌 New user registered!',
      '📢 Course updated!',
      '📝 AI assessment generated!',
      '📅 New event scheduled!'
    ];
  }
  navigateTo(section: string) {
    this.activeSection = section;
  }

  // ✅ Toggle Notifications
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  // ✅ Toggle Calendar
  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }


}
