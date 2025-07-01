import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TutorService } from '../../services/tutor.service';

@Component({
  selector: 'app-tutor-assessments',
  standalone: true,
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class AssessmentsComponent implements OnInit {
  assessments: any[] = [];
  aiAssessments: any[] = [];
  students: any[] = [];
  submissions: any[] = [];
  aiSubmissions: any[] = [];
  selectedAssessment: any | null = null;
  selectedAssessmentId: number | null = null;
  selectedStudentIds: number[] = [];
  selectedAIAssessmentId:any | null = null;
  activeTab: string = 'createAssessment';
  newAssessment = { title: '', description: '' };
  aiAssessmentTopic: string = ''; // Separate input for AI assessment
  generatedAssessment: string = '';
 aiAssessmentDescription: string = '';
  selectedSubmission: any = null;
  selectedFile!: File;
selectedSubmissionId: number = 1; // This will hold the selected submission ID
  
  isModalOpen: boolean = false;
  
  grading = { grade: '', feedback: '' };

  constructor(private tutorService: TutorService, private http: HttpClient) {}


  ngOnInit() {
    
    this.loadAssessments();
    this.loadStudents();
    this.loadSubmissions();
    this.loadAIAssessments();
    this.assignAIAssessment();
     this.loadAISubmissions();
    
  
  }

  loadAISubmissions() {
    this.tutorService.getAISubmissions().subscribe({
      next: (data) => (this.aiSubmissions = data),
      error: (err) => console.error('Error loading AI submissions', err),
    });
  }

 

uploadAndGenerateAssessment() {
  const formData = new FormData();
  formData.append("file", this.selectedFile);
  formData.append("description", this.aiAssessmentDescription);

  this.http.post<any>('http://localhost:5000/api/ai/generate-from-file', formData).subscribe({
    next: (res) => {
      console.log(res);
      alert("AI assessment generated successfully!");
    },
    error: (err) => {
      console.error(err);
      alert("Failed to generate AI assessment.");
    }
  });
}


  // ✅ Grade submission with AI
  gradeWithAI() {
    if (!this.selectedSubmissionId) {
      alert('Please select a submission for AI grading.');
      return;
    }

    this.tutorService.gradeWithAI(this.selectedSubmissionId).subscribe({
      next: () => {
        alert('AI grading completed!');
        this.loadAISubmissions(); // Refresh AI submissions after grading
      },
      error: (err) => console.error('Error grading with AI', err),
    });
  }

  // ✅ Evaluate submission with AI (Detailed evaluation)
  evaluateWithAI() {
    if (!this.selectedSubmissionId) {
      alert('Please select a submission to evaluate with AI.');
      return;
    }

    this.tutorService.gradeWithAI(this.selectedSubmissionId).subscribe({
      next: (evaluation) => {
        alert('AI Evaluation completed!');
        this.loadAISubmissions(); // Refresh after evaluation
        this.selectedSubmission.evaluation = evaluation;
      },
      error: (err) => console.error('Error evaluating with AI', err),
    });
  }

  // ✅ Parse JSON questions correctly
  parseAIQuestions(questionsJson: string) {
    try {
      return JSON.parse(questionsJson).map((q: any) => ({
        question: q.question,
        options: q.options,
      }));
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  }
  // ✅ Load existing assessments
  loadAssessments() {
    this.tutorService.getAssessments().subscribe({
      next: (data) => this.assessments = data,
      error: (err) => console.error('Error loading assessments', err)
    });
  }

  // ✅ Load students
  loadStudents() {
    this.tutorService.getStudents().subscribe({
      next: (data) => this.students = data,
      error: (err) => console.error('Error loading students', err)
    });
  }

  // ✅ Load submissions
  loadSubmissions() {
    this.tutorService.getSubmissions().subscribe({
      next: (data) => this.submissions = data,
      error: (err) => console.error('Error loading submissions', err)
    });
  }

  // ✅ Handle file selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // ✅ Add a manual assessment
  addAssessment() {
    if (!this.newAssessment.title || !this.newAssessment.description || !this.selectedFile) {
      alert('Please fill in all fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newAssessment.title);
    formData.append('description', this.newAssessment.description);
    formData.append('file', this.selectedFile);

    this.tutorService.addAssessment(formData).subscribe({
      next: () => {
        alert('Assessment added successfully!');
        this.loadAssessments();
        this.newAssessment = { title: '', description: '' };
      },
      error: (err) => console.error('Error adding assessment', err),
    });
  }

 

  
  
  // ✅ Assign assessment to students
  assignAssessment() {
    if (!this.selectedAssessmentId || this.selectedStudentIds.length === 0) {
      alert('Please select an assessment and at least one student.');
      return;
    }

    this.tutorService.assignAssessment(this.selectedAssessmentId, this.selectedStudentIds).subscribe({
      next: () => alert('Assessment assigned successfully!'),
      error: (err) => console.error('Error assigning assessment', err),
    });
  }

  // ✅ Grade manually
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

  
  

  // ✅ Delete an assessment
  deleteAssessment(id: number) {
    if (confirm("Are you sure you want to delete this assessment?")) {
      this.tutorService.deleteAssessment(id).subscribe(() => {
        alert("Assessment deleted successfully!");
        this.loadAssessments();
      });
    }
  }



  // ✅ Load students
  

  // ✅ Toggle AI-generated assessment details
   toggleAIAssessment(assessment: any) {
    this.selectedAssessment = this.selectedAssessment === assessment ? null : assessment;
  }

   toggleAISubmission(submissionId: number) {
  const found = this.aiSubmissions.find(sub => sub.id === submissionId);
  if (found) {
    // 💡 Ensure questions_responses is a proper array
    if (typeof found.questions_responses === 'string') {
      try {
        found.questions_responses = JSON.parse(found.questions_responses);
      } catch (error) {
        console.error('Failed to parse questions_responses:', error);
        found.questions_responses = [];
      }
    }
    this.selectedSubmission = found;
    this.isModalOpen = true;
  }
}


  // Close the modal
  closeModal() {
    this.isModalOpen = false;
  }

  loadAIAssessments() {
    this.tutorService.getAIAssessments().subscribe({
      next: (data) => this.aiAssessments = data, // Fetch only AI-generated assessments
      error: (err) => console.error('Error loading AI assessments', err),
    });
  }

  
  generateAIAssessment() {
    if (!this.aiAssessmentTopic.trim()) {
      alert('Enter a topic for the AI-generated assessment.');
      return;
    }

    this.generatedAssessment = 'Generating AI assessment...';

    this.tutorService.generateAssessmentWithAI(this.aiAssessmentTopic).subscribe({
      next: (data) => {
        this.generatedAssessment = data.generatedText || '';
        alert('AI assessment generated successfully!');
        this.saveAIAssessment();
      },
      error: (err) => {
        console.error('Error generating AI assessment', err);
        alert('Failed to generate AI assessment.');
      },
    });
  }

  // ✅ Save AI-generated assessment to DB
  saveAIAssessment() {
    if (!this.generatedAssessment.trim()) {
      alert('No AI-generated assessment available.');
      return;
    }

    const assessmentData = {
      title: this.aiAssessmentTopic,
      description: this.generatedAssessment,
    };

    this.tutorService.saveAIAssessment(assessmentData).subscribe({
      next: () => {
        alert('AI assessment saved successfully!');
        this.loadAIAssessments();
      },
      error: (err) => console.error('Error saving AI assessment', err),
    });
  }

  // ✅ Assign AI-generated assessment
  assignAIAssessment() {
    if (!this.selectedAIAssessmentId || this.selectedStudentIds.length === 0) {
     
      return;
    }

    this.tutorService.assignAIAssessment(this.selectedAIAssessmentId, this.selectedStudentIds).subscribe({
      next: () => alert('AI assessment assigned successfully!'),
      error: (err) => console.error('Error assigning AI assessment', err),
    });
  }

  // ✅ Parse JSON to show questions correctly
  parseQuestions(questionsJson: string) {
    try {
      return JSON.parse(questionsJson).map((q: any) => ({
        question: q.question,
        options: q.options,
      }));
    } catch (error) {
      console.error('Error parsing questions:', error);
      return [];
    }
  }

 

}
