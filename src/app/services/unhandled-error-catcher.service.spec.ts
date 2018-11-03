import { TestBed } from '@angular/core/testing';

import { UnhandledErrorCatcher } from './unhandled-error-catcher.service';
import { ErrorHandlingService } from './error-handling.service';
import { Subscription } from 'rxjs';
import { AppError } from '../models/app-error';

describe('UnhandledErrorCatcherService', () => {
  let errorHandlingService: ErrorHandlingService;
  let unhandledErrorCatcher: UnhandledErrorCatcher;
  let appErrorSub: Subscription;
  let appErrorSpy: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ ErrorHandlingService ]
    });

    errorHandlingService = TestBed.get(ErrorHandlingService);
    unhandledErrorCatcher = TestBed.get(UnhandledErrorCatcher);
    appErrorSpy = jasmine.createSpyObj('appError', ['emit', 'error', 'complete']);
  });

  it('should be created', () => {
    expect(unhandledErrorCatcher).toBeTruthy();
  });

  it('should pass unhandled errors on to ErrorHandlingService', () => {
    // Subscribe to appError on errorHandling Service
    appErrorSub = errorHandlingService.appError.subscribe(
      appError => appErrorSpy.emit(appError),
      error => appErrorSpy.error(error),
      () => appErrorSpy.complete()
    );

    // Simulate catching an unhandled error
    unhandledErrorCatcher.handleError('Test Error');

    // Expect that the error was passed through and emitted from error handling service
    expect(appErrorSpy.emit).toHaveBeenCalledTimes(1);
    expect(appErrorSpy.emit.calls.mostRecent().args).toEqual([new AppError('Test Error', 'Unhandled Error Caught')]);

    // Unsubscribe and check that nothing unsuspected happened.
    appErrorSub.unsubscribe();
    expect(appErrorSub.closed).toBe(true);
    expect(appErrorSpy.emit).toHaveBeenCalledTimes(1);
    expect(appErrorSpy.complete).not.toHaveBeenCalled();
    expect(appErrorSpy.error).not.toHaveBeenCalled();
  });
});
