import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { OidcInfoDisplayComponent } from './components/oidc-info-display/oidc-info-display.component';
import { NgLoadingIndicatorModule, LoadingIndicatorService } from '@browninglogic/ng-loading-indicator';
import { ModalManagerModule } from '@browninglogic/ng-modal';
import { ErrorWindowComponent } from './components/error-window/error-window.component';
import { AuthenticationService } from './services/authentication.service';
import { ErrorHandlingService } from './services/error-handling.service';
import { MatToolbarModule, MatIconModule, MatCardModule } from '@angular/material';
import { ToasterComponent } from './components/toaster/toaster.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthenticationServiceStub } from './services/authentication.service.stub';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let appComponent: AppComponent;
  let loadingIndicatorService: LoadingIndicatorService;
  let errorHandlingService: ErrorHandlingService;
  let messageService: MessageService;
  let showLoadingIndicatorSpy: jasmine.Spy;
  let hideLoadingIndicatorSpy: jasmine.Spy;
  let silentRefreshSpy: jasmine.Spy;
  let initImplicitFlowSpy: jasmine.Spy;
  let logOutSpy: jasmine.Spy;
  let handleErrorSpy: jasmine.Spy;
  let messageServiceAddSpy: jasmine.Spy;
  let authenticationService: AuthenticationServiceStub;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgLoadingIndicatorModule,
        ModalManagerModule,
        MatToolbarModule,
        MatIconModule,
        MatCardModule,
        ToastModule
      ],
      declarations: [
        AppComponent,
        OidcInfoDisplayComponent,
        ErrorWindowComponent,
        ToasterComponent
      ],
      providers: [
        { provide: AuthenticationService, useClass: AuthenticationServiceStub },
        ErrorHandlingService,
        MessageService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    appComponent = fixture.debugElement.componentInstance;
    authenticationService = TestBed.get(AuthenticationService);
    loadingIndicatorService = TestBed.get(LoadingIndicatorService);
    errorHandlingService = TestBed.get(ErrorHandlingService);
    messageService = TestBed.get(MessageService);
    showLoadingIndicatorSpy = spyOn(loadingIndicatorService, 'showLoadingIndicator');
    hideLoadingIndicatorSpy = spyOn(loadingIndicatorService, 'hideLoadingIndicator');
    silentRefreshSpy = spyOn(authenticationService, 'silentRefresh').and.callThrough();
    initImplicitFlowSpy = spyOn(authenticationService, 'initImplicitFlow').and.callThrough();
    logOutSpy = spyOn(authenticationService, 'logOut').and.callThrough();
    messageServiceAddSpy = spyOn(messageService, 'add');
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
    expect(fixture.debugElement.nativeElement.querySelector('h1').textContent).toContain('OIDC Test Client');
  });

  it('should properly perform an explicit silent refresh', (done: DoneFn) => {
    // Tell the auth service spy to resolve the promise on silent refresh to teset the success behavior

    /* We'll override the callback of the last function that we expect to be called
    with our assertions and our done in order to ensure that we're waiting for the
    promise to resolve before running assertions. */
    hideLoadingIndicatorSpy.and.callFake(() => {
      // Expect that everything was called as expected
      expect(showLoadingIndicatorSpy).toHaveBeenCalledTimes(1);
      expect(showLoadingIndicatorSpy.calls.mostRecent().args).toEqual(['Performing Silent Refresh']);
      expect(silentRefreshSpy).toHaveBeenCalledTimes(1);
      expect(messageServiceAddSpy).toHaveBeenCalledTimes(1);
      expect(messageServiceAddSpy.calls.mostRecent().args).toEqual([{ severity: 'success', summary: 'Silent Refresh Successful' }]);
      expect(handleErrorSpy).not.toHaveBeenCalled();

      done();
    });

    // Trigger the silent refresh test
    appComponent.silentRefresh();
  });

  it('should properly handle a silent refresh failure', (done: DoneFn) => {
    // Tell the auth service spy to resolve the promise on silent refresh to teset the success behavior
    silentRefreshSpy.and.returnValue(Promise.reject('failure test'));

    // We expect the operation to call hideLoadingIndicator at the end for failure as well
    hideLoadingIndicatorSpy.and.callFake(() => {
      // Expect that everything was called as expected
      expect(showLoadingIndicatorSpy).toHaveBeenCalledTimes(1);
      expect(showLoadingIndicatorSpy.calls.mostRecent().args).toEqual(['Performing Silent Refresh']);
      expect(silentRefreshSpy).toHaveBeenCalledTimes(1);
      expect(messageServiceAddSpy).not.toHaveBeenCalled();
      expect(handleErrorSpy).toHaveBeenCalledTimes(1);
      expect(handleErrorSpy.calls.mostRecent().args).toEqual(['failure test', 'Silent Refresh Failed']);

      done();
    });

    // Trigger the silent refresh test
    appComponent.silentRefresh();
  });

  it('should call initImplicitFlow', () => {
    appComponent.logIn();

    expect(initImplicitFlowSpy).toHaveBeenCalledTimes(1);
  });

  it('should call logOut', () => {
    appComponent.logOut();

    expect(logOutSpy).toHaveBeenCalledTimes(1);
  });
});
