import { Component } from '@angular/core';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  template: `
    <h2>Student Dashboard</h2>
    <p>Welcome, Student! Here you can access your courses and exams.</p>

    <button routerLink="/student/courses">View My Courses</button>
    <button routerLink="/student/materials">Study Materials</button>
    <button routerLink="/student/exams">Take Exams</button>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {}
