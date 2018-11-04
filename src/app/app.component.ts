import { Component } from '@angular/core';
import { LoadingIndicatorService } from '@browninglogic/ng-loading-indicator';
import { AuthenticationService } from './services/authentication.service';
import { ErrorHandlingService } from './services/error-handling.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'OIDC Test Client';

  constructor(private authenticationService: AuthenticationService,
    private loadingIndicatorService: LoadingIndicatorService,
    private errorHandlingService: ErrorHandlingService,
    private messageService: MessageService) {}

  public get userAuthenticated(): boolean {
    return this.authenticationService.authenticated;
  }

  public logIn() {
    this.authenticationService.initImplicitFlow();
  }

  public logOut() {
    this.authenticationService.logOut();
  }

  public silentRefresh() {
    // Explicitly trigger silent refresh to demonstrate the functionality.
    this.loadingIndicatorService.showLoadingIndicator('Performing Silent Refresh');
    this.authenticationService.silentRefresh()
      .then(() => this.messageService.add({severity: 'success', summary: 'Silent Refresh Successful'}))
      .catch(error => this.errorHandlingService.handleError(error, 'Silent Refresh Failed'))
      .then(() => this.loadingIndicatorService.hideLoadingIndicator());
  }
}
