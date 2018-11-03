import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalWindowComponent } from '@browninglogic/ng-modal';
import { Subscription } from 'rxjs';
import { AppError } from 'src/app/models/app-error';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';

@Component({
  selector: 'error-window',
  templateUrl: './error-window.component.html',
  styleUrls: ['./error-window.component.css']
})
export class ErrorWindowComponent implements OnInit, OnDestroy {
  constructor(private errorHandlingService: ErrorHandlingService) {}

  @ViewChild('errorModal') errorModal: ModalWindowComponent;
  private subErrorCaught: Subscription;
  public appError: AppError;

  ngOnInit() {
    // Listen for any errors emitted by the global error handling service
    this.subErrorCaught = this.errorHandlingService.appError
      .subscribe(error => this.onErrorCaught(error));
  }

  ngOnDestroy() {
    if (this.subErrorCaught) { this.subErrorCaught.unsubscribe(); }
  }

  /** Store the error for access within the template and show the error modal */
  private onErrorCaught(error: AppError) {
    this.appError = error;
    this.errorModal.show();
  }

  /** Reload the application by request when something really bad happens */
  restartApplication() {
    window.location.replace(location.origin);
  }
}
