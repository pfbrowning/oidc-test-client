import { async, ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { OidcInfoDisplayComponent } from './oidc-info-display.component';
import { OAuthServiceStub } from 'src/app/services/oauth.service.stub';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AuthenticationServiceStub } from 'src/app/services/authentication.service.stub';
import * as moment from 'moment';
import { Subscription, interval } from 'rxjs';
import { TestHelpers } from 'src/test-helpers';
import { Utils } from 'src/app/utils/utils';
import { MatCardModule } from '@angular/material';

describe('OidcInfoDisplayComponent', () => {
  let component: OidcInfoDisplayComponent;
  let fixture: ComponentFixture<OidcInfoDisplayComponent>;
  let authenticationService: AuthenticationServiceStub;
  let updateExpirationInfoSpy: jasmine.Spy;
  let ngOnInitSpy: jasmine.Spy;
  let ngOnDestroySpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule
      ],
      declarations: [ OidcInfoDisplayComponent ],
      providers: [
        { provide: AuthenticationService, useClass: AuthenticationServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OidcInfoDisplayComponent);
    component = fixture.componentInstance;
    authenticationService = TestBed.get(AuthenticationService);
    updateExpirationInfoSpy = spyOn(component, 'updateExpirationInfo').and.callThrough();
    ngOnInitSpy = spyOn(component, 'ngOnInit').and.callThrough();
    ngOnDestroySpy = spyOn(component, 'ngOnDestroy').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateExpirationInfo with updated values each second', fakeAsync(() => {
    // Detect changes to initialize the component
    fixture.detectChanges();

    // Iterate through each test data and perform our Arrange / Act / Assert per each iteration
    let iterationCounter = 0;
    testExpirationData.forEach(testEntry => {
      /* Arrange: increment the iteration counter and assign the dummy test
      values to our authentication service stub. */
      iterationCounter++;
      authenticationService.idTokenExpiration = testEntry.idExpDate;
      authenticationService.idTokenExpired = testEntry.idExpired;
      authenticationService.idTokenExpiresIn = testEntry.idExpiresIn;
      authenticationService.accessTokenExpiration = testEntry.accessExpDate;
      authenticationService.accessTokenExpired = testEntry.accessExpired;
      authenticationService.accessTokenExpiresIn = testEntry.accessExpiresIn;

      // Act: Simulate waiting 1 second
      tick(1000);

      /* Assert: Expect that update expiration info was most recently called with
      the data for the current iteration and that it's been called once per iteration
      thus far. */
      expect(updateExpirationInfoSpy.calls.mostRecent().args).toEqual([
        testEntry.idExpDate,
        testEntry.idExpired,
        testEntry.idExpiresIn,
        testEntry.accessExpDate,
        testEntry.accessExpired,
        testEntry.accessExpiresIn
      ]);
      expect(updateExpirationInfoSpy).toHaveBeenCalledTimes(iterationCounter);
    });

    // updateExpirationInfo should have been called 6 times because we have 6 dummy data entries
    expect(updateExpirationInfoSpy).toHaveBeenCalledTimes(6);

    // Destroy the component to unsubscribe the interval
    fixture.destroy();

    // Expect that the interval has been unsubscribed
    expect(ngOnDestroySpy).toHaveBeenCalledTimes(1);
    expect(component.secondInterval.closed).toBe(true);
  }));

  it('should properly bind the provided expiration data to the component and template', fakeAsync(() => {
    // Detect changes to initialize the component
    fixture.detectChanges();
    /* Unsubscribe from the second interval so that we can test the template binding
    in isolation. */
    component.secondInterval.unsubscribe();
    expect(component.secondInterval.closed).toBe(true);

    testExpirationData.forEach(testEntry => {
      /* Arrange & Act: Pass the test data to updateExpirationInfo and detect
      changes to update the template binding. */
      component.updateExpirationInfo(
        testEntry.idExpDate,
        testEntry.idExpired,
        testEntry.idExpiresIn,
        testEntry.accessExpDate,
        testEntry.accessExpired,
        testEntry.accessExpiresIn
      );

      fixture.detectChanges();

      // Assert: Ensure that the dummy data has been bound properly
      // Expect that each token expiration info field was properly bound to the component's model fields
      expect(component.identityTokenExpirationInfo.expiration).toBe(testEntry.idExpDate);
      expect(component.identityTokenExpirationInfo.expired).toBe(testEntry.idExpired);
      expect(component.identityTokenExpirationInfo.expiresIn).toBe(testEntry.idExpiresIn);
      expect(component.accessTokenExpirationInfo.expiration).toBe(testEntry.accessExpDate);
      expect(component.accessTokenExpirationInfo.expired).toBe(testEntry.accessExpired);
      expect(component.accessTokenExpirationInfo.expiresIn).toBe(testEntry.accessExpiresIn);
      // Expect that the model data was properly bound to the template.
      TestHelpers.expectStringsToMatchIgnoringSpaceAndLineBreaks(
        TestHelpers.getElementTextBySelector<OidcInfoDisplayComponent>(fixture, '.idTokenExpirationInfo'),
        JSON.stringify(component.identityTokenExpirationInfo));
      TestHelpers.expectStringsToMatchIgnoringSpaceAndLineBreaks(
        TestHelpers.getElementTextBySelector<OidcInfoDisplayComponent>(fixture, '.accessTokenExpirationInfo'),
        JSON.stringify(component.accessTokenExpirationInfo));
    });

    // updateExpirationInfo should have been called 6 times because we have 6 dummy data entries
    expect(updateExpirationInfoSpy).toHaveBeenCalledTimes(6);
  }));

  it('should bind identity token claims & access token claims to the template', () => {
    // Arrange: Configure claims on authentication service stub
    fixture.detectChanges();
    const identityClaims = {
      'testKey1': 'identity test value 1',
      'testKey2': 'identity test value 2'
    };
    const accessClaims = {
      'testKey3': 'access test value 3',
      'testKey4': 'access test value 4'
    };
    authenticationService.idTokenClaims = identityClaims;
    authenticationService.accessTokenClaims = accessClaims;

    // Act: detect changes to trigger template binding
    fixture.detectChanges();

    // Assert that the claims were bound to the component and the template as expected
    expect(component.identityTokenClaims).toBe(authenticationService.idTokenClaims);
    expect(component.accessTokenClaims).toBe(authenticationService.accessTokenClaims);
    const boundIdentityClaims = TestHelpers.getElementTextBySelector<OidcInfoDisplayComponent>(fixture, '.identityTokenClaims');
    const boundAccessTokenClaims = TestHelpers.getElementTextBySelector<OidcInfoDisplayComponent>(fixture, '.accessTokenClaims');
    TestHelpers.expectStringsToMatchIgnoringSpaceAndLineBreaks(boundAccessTokenClaims, JSON.stringify(component.accessTokenClaims));
    TestHelpers.expectStringsToMatchIgnoringSpaceAndLineBreaks(boundIdentityClaims, JSON.stringify(component.identityTokenClaims));
  });

  /* Mock up some test data to test a sequence of differing values.  It doesn't matter if this
  data is semantically accurate: we're just testing the interval and the model / template binding,
  rather than the data itself. */
  const testExpirationData = [
    {authenticated: true, idExpDate: moment('2013-02-08 09:30:26'), idExpired: false, idExpiresIn: 3,
      accessExpDate: moment('2014-01-01 01:30:24'), accessExpired: true, accessExpiresIn: 17 },
    {authenticated: true, idExpDate: moment('1999-03-09 04:28:31'), idExpired: true, idExpiresIn: -1983,
      accessExpDate: moment('2022-12-12 02:01:03'), accessExpired: false, accessExpiresIn: -946 },
    {authenticated: false, idExpDate: moment('1234-05-06 07:08:09'), idExpired: true, idExpiresIn: 2,
      accessExpDate: moment('9876-01-01 09:08:13'), accessExpired: false, accessExpiresIn: 8 },
    {authenticated: true, idExpDate: moment('2999-07-08 01:02:03'), idExpired: false, idExpiresIn: 1234,
      accessExpDate: moment('1941-12-07 04:05:06'), accessExpired: true, accessExpiresIn: 5678 },
    {authenticated: false, idExpDate: null, idExpired: null, idExpiresIn: null,
      accessExpDate: null, accessExpired: null, accessExpiresIn: null },
    {authenticated: true, idExpDate: moment('1914-06-28 01:01:01'), idExpired: false, idExpiresIn: 1234,
      accessExpDate: moment('1918-11-11 23:59:59'), accessExpired: true, accessExpiresIn: 804359894 },
  ];
});
