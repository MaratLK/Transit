import { Component, OnInit } from '@angular/core';
import { CommonModule }            from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router }    from '@angular/router';
import { AuthService }             from '../../services/auth.service';
import { RequestsService, IRequest }       from '../../services/requests.service';

@Component({
  selector: 'app-social-icons',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './social-icons.component.html',
  styleUrls: ['./social-icons.component.css'],
})
export class SocialIconsComponent implements OnInit {
  showForm = false;
  loginPrompt = false;
  requestForm: FormGroup;
  isLoggedIn = false;
  user!: { firstName: string; phoneNumber: string };
  toastMessage = '';
  showToast     = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private requests: RequestsService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.minLength(5)]],
      comment: ['']
    });
  }

  ngOnInit() {
    this.auth.user$.subscribe(u => {
      console.log('User data:', u);
      this.isLoggedIn = !!u?.email;
      if (this.isLoggedIn && u) {
        this.requestForm.patchValue({
          name:         u.firstName  || '',
          phoneNumber: u.phoneNumber || u.PhoneNumber || ''
        });
        ['name','phoneNumber'].forEach(ctrl => {
          this.requestForm.get(ctrl)?.clearValidators();
          this.requestForm.get(ctrl)?.updateValueAndValidity();
        });
      }
    });
  }
  

  onRequestClick() {
    if (!this.isLoggedIn) {
      this.loginPrompt = true;
      return;
    }
    this.showForm = true;
  }

  closeLoginPrompt() {
    this.loginPrompt = false;
    this.router.navigate(['/auth']);
  }

  closeForm() {
    this.showForm = false;
    this.requestForm.reset();
  }

  submit() {
    if (this.requestForm.invalid) return;

    const dto: IRequest = {
      name: this.requestForm.get('name')!.value.trim(),
      phoneNumber: this.requestForm.get('phoneNumber')!.value.trim(),
      comment: this.requestForm.get('comment')!.value?.trim() || undefined,
      id: 0,
      status: 0,
      createdAt: ''
    };

    this.requests.create(dto).subscribe({
      next: () => {
        this.showCustomToast('✅ Заявка успешно отправлена');
        this.closeForm();
      },
      error: () => {
        this.showCustomToast('❌ Не удалось отправить заявку');
      }
    });
  }
  private showCustomToast(msg: string) {
    this.toastMessage = msg;
    this.showToast     = true;
    setTimeout(() => this.showToast = false, 4500);
  }
}
