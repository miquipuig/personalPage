import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BlogService } from '../../../services/blog.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  errorMessage = '';
  loading = false;

  private authSubscription: Subscription | null = null;

  constructor(
    private socialAuthService: SocialAuthService,
    private auth: AuthService,
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.socialAuthService.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      // Prevent the social session from auto re-triggering this flow.
      this.socialAuthService.signOut().catch(() => {});
      this.handleLogin(user.idToken);
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private handleLogin(idToken?: string): void {
    this.errorMessage = '';
    this.loading = true;
    this.auth
      .login({}, idToken)
      .then(() => {
        this.blogService.checkAdmin().subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/admin']);
          },
          error: () => {
            this.loading = false;
            this.errorMessage = 'This account is not authorized to manage the blog';
            this.auth.logout();
          }
        });
      })
      .catch(() => {
        this.loading = false;
        this.errorMessage = 'This account is not authorized to manage the blog';
        this.auth.logout();
      });
  }
}
