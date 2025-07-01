import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TutorService } from '../../services/tutor.service';

@Component({
  selector: 'app-tutor-courses',
  standalone: true,
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CoursesComponent implements OnInit {
  courses: any[] = [];
  newCourse = { title: '', description: '' };
  selectedImage!: File;
  selectedStudyMaterial!: File;
  selectedCourse: any = null;
selectedTab: string = 'add';
  constructor(private tutorService: TutorService) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.tutorService.getCourses().subscribe({
      next: (data) => (this.courses = data),
      error: (err) => console.error('Error loading courses', err),
    });
  }

  

  addCourse() {
    if (!this.newCourse.title || !this.newCourse.description || !this.selectedImage || !this.selectedStudyMaterial) {
      alert('Please fill in all fields and upload both image and study material.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newCourse.title);
    formData.append('description', this.newCourse.description);
    formData.append('image', this.selectedImage);
    formData.append('studyMaterial', this.selectedStudyMaterial);

    this.tutorService.addCourse(formData).subscribe(() => {
      alert('Course added successfully!');
      this.loadCourses();
      this.newCourse = { title: '', description: '' };
      this.selectedImage = null!;
      this.selectedStudyMaterial = null!;
    });
  }

  deleteCourse(courseId: number) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.tutorService.deleteCourse(courseId).subscribe(() => this.loadCourses());
    }
  }

 // ✅ Open Update Modal
  openUpdateModal(course: any) {
    this.selectedCourse = { ...course }; // Copy the course data
  }

  // ✅ Handle File Selection
  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  onStudyMaterialSelected(event: any) {
    this.selectedStudyMaterial = event.target.files[0];
  }

  // ✅ Update Course Function
  updateCourse() {
    if (!this.selectedCourse.title || !this.selectedCourse.description) {
      alert('Please provide a title and description.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.selectedCourse.title);
    formData.append('description', this.selectedCourse.description);

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
    if (this.selectedStudyMaterial) {
      formData.append('studyMaterial', this.selectedStudyMaterial);
    }

    this.tutorService.updateCourse(this.selectedCourse.id, formData).subscribe({
      next: (updatedCourse) => {
        alert('Course updated successfully!');
        this.loadCourses(); // Refresh course list
        this.selectedCourse = null; // Close modal
      },
      error: (err) => console.error('Error updating course', err),
    });
  }

  // ✅ Close Update Modal
  closeUpdateModal() {
    this.selectedCourse = null;
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

generateAssessment(course: any) {
  const files = this.parseStudyMaterial(course.studyMaterial);

  if (!files || files.length === 0) {
    alert("No study materials found to generate assessment.");
    return;
  }

  const formData = new FormData();

  files.forEach((fileUrl: string, index: number) => {
    const fileName = fileUrl.split("/").pop();
    const filePath = `http://localhost:5000${fileUrl}`;

    // Use fetch to get the file blob
    fetch(filePath)
      .then((res) => res.blob())
      .then((blob) => {
        formData.append("file", blob, fileName);

        // Optionally include course description or custom text
        formData.append("description", course.description || "");

        // Call your tutorService to generate assessment
        this.tutorService.generateAssessmentFromFile(formData).subscribe({
          next: (res) => {
            alert("Assessment generated successfully!");
            console.log("Generated Assessment:", res.assessment);
          },
          error: (err) => {
            console.error("Error generating assessment:", err);
            alert("Failed to generate assessment.");
          },
        });
      })
      .catch((err) => {
        console.error("Error fetching file blob:", err);
        alert("Failed to fetch file for assessment.");
      });
  });
}


}
