import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { OidcInfoDisplayComponent } from './components/oidc-info-display/oidc-info-display.component';
import { NgLoadingIndicatorModule, LoadingIndicatorService } from '@browninglogic/ng-loading-indicator';
import { ModalManagerModule } from '@browninglogic/ng-modal';
import { ErrorWindowComponent } from './components/error-window/error-window.component';
import { AuthenticationService } from './services/authentication.service';
import { ErrorHandlingService } from './services/error-handling.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let appComponent: AppComponent;
  let loadingIndicatorService: LoadingIndicatorService;
  let errorHandlingService: ErrorHandlingService;
  let showLoadingIndicatorSpy: jasmine.Spy;
  let hideLoadingIndicatorSpy: jasmine.Spy;
  let handleErrorSpy: jasmine.Spy;
  let alertSpy: jasmine.Spy;
  let authenticationService: any;

  beforeEach(async(() => {
    authenticationService = jasmine.createSpyObj('authenticationServiceSpy', [
      'silentRefresh',
      'logOut',
      'initImplicitFlow'
    ]);

    TestBed.configureTestingModule({
      imports: [
        NgLoadingIndicatorModule,
        ModalManagerModule
      ],
      declarations: [
        AppComponent,
        OidcInfoDisplayComponent,
        ErrorWindowComponent
      ],
      providers: [
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: ErrorHandlingService, useClass: ErrorHandlingService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    appComponent = fixture.debugElement.componentInstance;
    loadingIndicatorService = TestBed.get(LoadingIndicatorService);
    errorHandlingService = TestBed.get(ErrorHandlingService);
    showLoadingIndicatorSpy = spyOn(loadingIndicatorService, 'showLoadingIndicator');
    hideLoadingIndicatorSpy = spyOn(loadingIndicatorService, 'hideLoadingIndicator');
    alertSpy = spyOn(appComponent, 'alert');
    handleErrorSpy = spyOn(errorHandlingService, 'handleError');
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(appComponent).toBeTruthy();
  });

  it(`should have as title 'OIDC Test Client'`, () => {
    expect(appComponent.title).toEqual('OIDC Test Client');
  });

  it('should render title in a h1 tag', () => {
    expect(fixture.debugElement.nativeElement.querySelector('h1').textContent).toContain('Welcome to OIDC Test Client!');
  });

  it('should properly perform an explicit silent refresh', (done: DoneFn) => {
    // Tell the auth service spy to resolve the promise on silent refresh to teset the success behavior
    authenticationService.silentRefresh.and.returnValue(Promise.resolve());

    /* We'll override the callback of the last function that we expect to be called
    with our assertions and our done in order to ensure that we're waiting for the
    promise to resolve before running assertions. */
    hideLoadingIndicatorSpy.and.callFake(() => {
      // Expect that everything was called as expected
      expect(showLoadingIndicatorSpy).toHaveBeenCalledTimes(1);
      expect(showLoadingIndicatorSpy.calls.mostRecent().args).toEqual(['Performing Silent Refresh']);
      expect(authenticationService.silentRefresh).toHaveBeenCalledTimes(1);
      expect(alertSpy).toHaveBeenCalledTimes(1);
      expect(alertSpy.calls.mostRecent().args).toEqual(['Silent Refresh Successful']);
      expect(handleErrorSpy).not.toHaveBeenCalled();

      done();
    });

    // Trigger the silent refresh test
    appComponent.silentRefresh();
  });

  it('should properly handle a silent refresh failure', (done: DoneFn) => {
    // Tell the auth service spy to resolve the promise on silent refresh to teset the success behavior
    authenticationService.silentRefresh.and.returnValue(Promise.reject('failure test'));

    // We expect the operation to call hideLoadingIndicator at the end for failure as well
    hideLoadingIndicatorSpy.and.callFake(() => {
      // Expect that everything was called as expected
      expect(showLoadingIndicatorSpy).toHaveBeenCalledTimes(1);
      expect(showLoadingIndicatorSpy.calls.mostRecent().args).toEqual(['Performing Silent Refresh']);
      expect(authenticationService.silentRefresh).toHaveBeenCalledTimes(1);
      expect(alertSpy).not.toHaveBeenCalled();
      expect(handleErrorSpy).toHaveBeenCalledTimes(1);
      expect(handleErrorSpy.calls.mostRecent().args).toEqual(['failure test', 'Silent Refresh Failed']);

      done();
    });

    // Trigger the silent refresh test
    appComponent.silentRefresh();
  });

  it('should call initImplicitFlow', () => {
    appComponent.logIn();

    expect(authenticationService.initImplicitFlow).toHaveBeenCalledTimes(1);
  });

  it('should call logOut', () => {
    appComponent.logOut();

    expect(authenticationService.logOut).toHaveBeenCalledTimes(1);
  });
});
