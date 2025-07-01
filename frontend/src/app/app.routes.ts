import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, provideRouter } from '@angular/router';
import { DashboardComponent as AdminDashboard } from './admin/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { DashboardComponent as StudentDashboard } from './student/dashboard/dashboard.component';
import { AssessmentsComponent } from './tutor/assessments/assessments.component';
import { CoursesComponent } from './tutor/courses/courses.component';
import { DashboardComponent as TutorDashboard } from './tutor/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },  // Login Page
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminDashboard },
  { path: 'tutor', component: TutorDashboard },
  { path: 'student', component: StudentDashboard },
  { path: 'tutor/assessments', component: AssessmentsComponent }, // ✅ Correct Route
  
  { path: 'tutor/courses', component: CoursesComponent, canActivate: [AuthGuard], data: { roles: ['tutor'] } },
  { path: 'student/dashboard', component: StudentDashboard },
  { path: '**', redirectTo: 'student/dashboard' },
];

export const appConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
