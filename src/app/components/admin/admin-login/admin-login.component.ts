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
    // Already signed in with a valid admin session → skip the login screen.
    if (this.auth.token) {
      this.loading = true;
      this.blogService.checkAdmin().subscribe({
        next: () => this.router.navigate(['/admin']),
        error: () => { this.loading = false; }
      });
    }

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
    if (!idToken) {
      return;
    }
    this.errorMessage = '';
    this.loading = true;
    this.blogService.adminLogin(idToken).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.auth.setSession(res.token, res.user);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'This account is not authorized.';
        this.auth.logout();
      }
    });
  }
}
