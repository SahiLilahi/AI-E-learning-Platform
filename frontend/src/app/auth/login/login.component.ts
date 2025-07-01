import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,  
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword: boolean = false;

 
  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.storeToken(res.token);

  localStorage.setItem('studentId', res.user.id); // only store if student

        this.router.navigate([`/${res.user.role}`]);
      },
      error: (err) => alert(err.error.message)
    });
  }

   togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
