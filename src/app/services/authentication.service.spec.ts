import { AuthenticationService } from './authentication.service';
import * as moment from 'moment';
import { of, empty, Subject, Subscription } from 'rxjs';
import { OAuthInfoEvent, OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { OAuthServiceStub } from './oauth.service.stub';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let oauthService: any;
  let errorHandlingServiceSpy: any;
  let currentDate: jasmine.Spy;
  let configureSpy: jasmine.Spy;
  let loadDiscoAndTrySpy: jasmine.Spy;
  let setupSilentRefreshSpy: jasmine.Spy;
  let initImplicitFlowSpy: jasmine.Spy;
  let logOutSpy: jasmine.Spy;
  let silentRefreshSpy: jasmine.Spy;
  let hasValidIdTokenSpy: jasmine.Spy;
  let hasValidAccessTokenSpy: jasmine.Spy;
  let getIdentityClaimsSpy: jasmine.Spy;
  let getAccessTokenSpy: jasmine.Spy;
  let getAccessTokenExpirationSpy: jasmine.Spy;
  let getIdTokenExpirationSpy: jasmine.Spy;
  let oAuthEventCatcher: any;
  let oauthEventsSubscription: Subscription;

  beforeEach(() => {
    oAuthEventCatcher = jasmine.createSpyObj('OAuthEventCatcher', ['emit', 'error', 'complete']);
    errorHandlingServiceSpy = jasmine.createSpyObj('errorHandlingServiceSpy', ['handleError']);
    oauthService = new OAuthServiceStub();
    currentDate = spyOnProperty(AuthenticationService.prototype, 'currentDate');
    configureSpy = spyOn(oauthService, 'configure');
    loadDiscoAndTrySpy = spyOn(oauthService, 'loadDiscoveryDocumentAndTryLogin').and.callThrough();
    initImplicitFlowSpy = spyOn(oauthService, 'initImplicitFlow');
    logOutSpy = spyOn(oauthService, 'logOut');
    setupSilentRefreshSpy = spyOn(oauthService, 'setupAutomaticSilentRefresh');
    silentRefreshSpy = spyOn(oauthService, 'silentRefresh');
    hasValidIdTokenSpy = spyOn(oauthService, 'hasValidIdToken');
    hasValidAccessTokenSpy = spyOn(oauthService, 'hasValidAccessToken');
    getIdentityClaimsSpy = spyOn(oauthService, 'getIdentityClaims');
    getAccessTokenSpy = spyOn(oauthService, 'getAccessToken');
    getAccessTokenExpirationSpy = spyOn(oauthService, 'getAccessTokenExpiration');
    getIdTokenExpirationSpy = spyOn(oauthService, 'getIdTokenExpiration');
  });

  it('should properly construct', (done: DoneFn) => {
    // Initialize the service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    /* Check that the corresponding spies have been called
    in the expected fashion */
    expect(configureSpy).toHaveBeenCalledTimes(1);
    expect(loadDiscoAndTrySpy).toHaveBeenCalledTimes(1);
    expect(setupSilentRefreshSpy).toHaveBeenCalledTimes(1);
    expect(errorHandlingServiceSpy.handleError).not.toHaveBeenCalled();

    // Expect that the tokenProcessed observable emits before completing the test
    authenticationService.tokenProcessed().subscribe(() => done());
  });

  it('should properly handle an error during loadDiscoveryDocumentAndTryLogin', (done: DoneFn) => {
    // Tell the loadDiscoveryDocumentAndTryLogin spy to reject the promise
    loadDiscoAndTrySpy.and.returnValue(Promise.reject('Test Promise Rejection'));
    // When handleError gets called, test that the params are what we expect
    errorHandlingServiceSpy.handleError.and.callFake((caughtError, errorComment) => {
      expect(caughtError).toBe('Test Promise Rejection');
      expect(errorComment).toBe('Failed to load discovery document: Is your OIDC provider configured and running?');
      // require handleError to be called before completing the test
      done();
    });

    // Initialize the service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    // Expect that the standard functions were called
    expect(configureSpy).toHaveBeenCalledTimes(1);
    expect(loadDiscoAndTrySpy).toHaveBeenCalledTimes(1);
    expect(setupSilentRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should properly call initImplicitFlow', () => {
    // Arrange: Initialize the service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    // Act: Call initImplicitFlow
    authenticationService.initImplicitFlow();

    // Assert: Expect that initImplicitFlow in the underlying OAuthService has been called
    expect(initImplicitFlowSpy).toHaveBeenCalledTimes(1);
  });

  it('should properly call logOut', () => {
    // Arrange: Initialize the service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    // Act: Call logOut
    authenticationService.logOut();

    // Assert: Expect that logOut in the underlying OAuthService has been called
    expect(logOutSpy).toHaveBeenCalledTimes(1);
  });

  it('should properly call silentRefresh', () => {
    // Arrange: Initialize the service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    // Act: Call silentRefresh
    authenticationService.silentRefresh();

    // Assert: Expect that silentRefresh in the underlying OAuthService has been called
    expect(silentRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it('should properly determine authenticated', () => {
    // Arrange: Initialize the service & declare test data
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    const testEntries = [
      { validId: true, validAccess: true, expected: true },
      { validId: true, validAccess: false, expected: false },
      { validId: false, validAccess: true, expected: false },
      { validId: false, validAccess: false, expected: false }
    ];

    testEntries.forEach(testEntry => {
      // Arrange: configure the spy to return test entry values for valid id & access tokens
      hasValidIdTokenSpy.and.returnValue(testEntry.validId);
      hasValidAccessTokenSpy.and.returnValue(testEntry.validAccess);

      // Act & Assert: expect that the authenticated property matches the expected value
      expect(authenticationService.authenticated).toBe(testEntry.expected);
    });
  });

  it('should properly pass through id token claims', () => {
    // Arrange: Initialize the service & declare test data
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);
    const testObject = {
      'property1': 'value1',
      'property2': 2
    };
    getIdentityClaimsSpy.and.returnValue(testObject);

    // Act & Assert: The object should be passed through
    expect(authenticationService.idTokenClaims).toBe(testObject);
  });

  it('should properly decode the access token', () => {
    // Arrange: Initialize the service & declare test data
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);
    const testEntries = [
      { token: null, expected: null },
      { token: '', expected: null },
      { token: '               ', expected: null },
      {
        token: `eyJhbGciOiJSUzI1NiIsImtpZCI6ImViMDJkYzM3OGQ5OWU0OTU5Mzg0ZGZlM2Y0YzcxZTA5IiwidHlwIjoiSldUIn0.eyJuYmYiOjE1NDE
        xMTkxNjMsImV4cCI6MTU0MTEyMjc2MywiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAwIiwiYXVkIjpbImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMC9yZX
        NvdXJjZXMiLCJJZGVudGl0eVNlcnZlclNhbXBsZS5BUEkiXSwiY2xpZW50X2lkIjoiaW1wbGljaXQiLCJzdWIiOiIyIiwiYXV0aF90aW1lIjoxNTQxM
        TE5MTUxLCJpZHAiOiJsb2NhbCIsIm5hbWUiOiJib2IiLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIiwiZW1haWwiLCJhcGkiXSwiYW1yIjpbInB3
        ZCJdfQ.XO0x83CK_LSKKdXIslP7bL9fa--VLiD_UiLFGp768CbFXqcSi6-zVF_Vhk-xVmgZzz1HeiBiRV91PwdgRg9OqrgbPkeH8BCyPYfmQsCJfVmW
        T37isfGtQkvLmmOzH4Ltsu7jcAHTuTEtdB7Z_NZJ_bgriv6PYC5B1jd1Ydbixb5cnw0zEmTV-4wnCmlaHfUboRUJrMmokCKF8wiqV_WOQyACH14yroT
        Fl2oMek1QlWPBnTsjh2zHoZrl2gZCT4rZQObJeNPuVsHn2ytDjQcJWvDM4I5wRotSoRhDuUgClr96ISSFZDF_GgSIoh3fqoiVGLFZsSFEIuewaACSqt
        DFWw'`,
        expected: {
          'nbf': 1541119163,
          'exp': 1541122763,
          'iss': 'http://localhost:5000',
          'aud': [
            'http://localhost:5000/resources',
            'IdentityServerSample.API'
          ],
          'client_id': 'implicit',
          'sub': '2',
          'auth_time': 1541119151,
          'idp': 'local',
          'name': 'bob',
          'scope': [
            'openid',
            'profile',
            'email',
            'api'
          ],
          'amr': [
            'pwd'
          ]
        }
      }
    ];

    testEntries.forEach(testEntry => {
      // Arrange: return the test token value from the getAccessToken spy
      getAccessTokenSpy.and.returnValue(testEntry.token);

      // Act & Assert: expect that the accessTokenClaims property returns the expected result
      expect(authenticationService.accessTokenClaims).toEqual(testEntry.expected);
    });
  });

  it('should properly perform the token expiration & validity comparisons', () => {
    // Initialize the authentication service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    testExpirationData.forEach(testEntry => {
      // Arrange: configure the spies to return the values specified in the test entry
      getAccessTokenExpirationSpy.and.returnValue(testEntry.expMil);
      getIdTokenExpirationSpy.and.returnValue(testEntry.expMil);
      currentDate.and.returnValue(testEntry.currentDate);

      /* Act & Assert: Perform the expiration date calculations on both the access token expiration
      and the id token expiration.*/
      expect(authenticationService.accessTokenExpiration).toEqual(testEntry.expectExpMoment);
      expect(authenticationService.accessTokenExpired).toBe(testEntry.expectExpired,
        `Expected access token expired to be ${testEntry.expectExpired}, but it's ${authenticationService.accessTokenExpired}`);
      expect(authenticationService.accessTokenExpiresIn).toBe(testEntry.expectExpiresIn);
      expect(authenticationService.idTokenExpiration).toEqual(testEntry.expectExpMoment);
      expect(authenticationService.idTokenExpired).toBe(testEntry.expectExpired,
        `Expected id token expired to be ${testEntry.expectExpired}, but it's ${authenticationService.idTokenExpired}`);
      expect(authenticationService.idTokenExpiresIn).toBe(testEntry.expectExpiresIn);
    });
  });

  it('should properly calculate access token expiration independently of id token expiration', () => {
    // Initialize the authentication service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    testExpirationData.forEach(testEntry => {
      // Arrange: configure the spies to return the values specified in the test entry
      getAccessTokenExpirationSpy.and.returnValue(testEntry.expMil);
      getIdTokenExpirationSpy.and.returnValue(testEntry.currentDate);
      currentDate.and.returnValue(testEntry.currentDate);

      /* Act & Assert: Perform the expiration calculations for the access token expiring
      at the provided test expiration date and the id token expiring at the current date
      (in other words, with separate inputs), in order to confirm that they're working
      independently of each other. */
      expect(authenticationService.accessTokenExpiration).toEqual(testEntry.expectExpMoment);
      expect(authenticationService.accessTokenExpired).toBe(testEntry.expectExpired,
        `Expected access token expired to be ${testEntry.expectExpired}, but it's ${authenticationService.accessTokenExpired}`);
      expect(authenticationService.accessTokenExpiresIn).toBe(testEntry.expectExpiresIn);
      expect(authenticationService.idTokenExpiration).toEqual(testEntry.currentDate);
      expect(authenticationService.idTokenExpired).toBe(false,
        `Expected id token expired to be ${testEntry.expectExpired}, but it's ${authenticationService.idTokenExpired}`);
      expect(authenticationService.idTokenExpiresIn).toBe(0);
    });
  });

  it('should properly calculate id token expiration independently of access token expiration', () => {
    // Initialize the authentication service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    testExpirationData.forEach(testEntry => {
      // Arrange: configure the spies to return the values specified in the test entry
      getAccessTokenExpirationSpy.and.returnValue(testEntry.currentDate);
      getIdTokenExpirationSpy.and.returnValue(testEntry.expMil);
      currentDate.and.returnValue(testEntry.currentDate);

      /* Act & Assert: Perform the expiration calculations for the id token expiring
      at the provided test expiration date and the access token expiring at the current date
      (in other words, with separate inputs), in order to confirm that they're working
      independently of each other. */
      expect(authenticationService.accessTokenExpiration).toEqual(testEntry.currentDate);
      expect(authenticationService.accessTokenExpired).toBe(false,
        `Expected access token expired to be ${testEntry.expectExpired}, but it's ${authenticationService.accessTokenExpired}`);
      expect(authenticationService.accessTokenExpiresIn).toBe(0);
      expect(authenticationService.idTokenExpiration).toEqual(testEntry.expectExpMoment);
      expect(authenticationService.idTokenExpired).toBe(testEntry.expectExpired,
        `Expected id token expired to be ${testEntry.expectExpired}, but it's ${authenticationService.idTokenExpired}`);
      expect(authenticationService.idTokenExpiresIn).toBe(testEntry.expectExpiresIn);
    });
  });

  it('should emit oauth events', () => {
    // Initialize the authentication service
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);
    oauthEventsSubscription = authenticationService.oAuthEvents.subscribe(
      event => oAuthEventCatcher.emit(event),
      error => oAuthEventCatcher.error(error),
      () => oAuthEventCatcher()
    );
    expect(oAuthEventCatcher.emit).not.toHaveBeenCalled();

    // Emit one OAuth event and epect that it was passed through AuthenticationService
    oauthService.emitOAuthEvent(new OAuthInfoEvent('discovery_document_loaded'));
    expect(oAuthEventCatcher.emit).toHaveBeenCalledTimes(1);
    expect(oAuthEventCatcher.emit.calls.mostRecent().args).toEqual([new OAuthInfoEvent('discovery_document_loaded')])

    // Emit a second oauth event and ensure that it was handled properly as well
    oauthService.emitOAuthEvent(new OAuthInfoEvent('user_profile_loaded'));
    expect(oAuthEventCatcher.emit).toHaveBeenCalledTimes(2);
    expect(oAuthEventCatcher.emit.calls.mostRecent().args).toEqual([new OAuthInfoEvent('user_profile_loaded')])

    // Unsubscribe and clean up
    oauthEventsSubscription.unsubscribe();
    expect(oauthEventsSubscription.closed).toBe(true);
    expect(oAuthEventCatcher.emit).toHaveBeenCalledTimes(2);
    expect(oAuthEventCatcher.error).not.toHaveBeenCalled();
    expect(oAuthEventCatcher.complete).not.toHaveBeenCalled();
  })

  it('should replay up to 10 previous oauth events on initial subscription', () => {
    authenticationService = new AuthenticationService(oauthService, errorHandlingServiceSpy);

    // Emit 15 oauth events before subscription
    for(let i = 0; i < 15; i++) {
      oauthService.emitOAuthEvent(new OAuthInfoEvent('user_profile_loaded'));
    }
    oauthEventsSubscription = authenticationService.oAuthEvents.subscribe(
      event => oAuthEventCatcher.emit(event),
      error => oAuthEventCatcher.error(error),
      () => oAuthEventCatcher()
    );

    oauthEventsSubscription.unsubscribe();
    // Expect that 10 values were emitted from the replaysubject buffer
    expect(oAuthEventCatcher.emit).toHaveBeenCalledTimes(10);
    expect(oauthEventsSubscription.closed).toBe(true);
    expect(oAuthEventCatcher.error).not.toHaveBeenCalled();
    expect(oAuthEventCatcher.complete).not.toHaveBeenCalled();
  })

  const testExpirationData = [
    { expMil: 1541121712, currentDate: moment(1541121712), expectExpMoment: moment(1541121712), expectExpired: false, expectExpiresIn: 0 },
    { expMil: 1541121712, currentDate: moment(1541121713), expectExpMoment: moment(1541121712), expectExpired: true, expectExpiresIn: 0 },
    { expMil: 1541121712, currentDate: moment(1541121711), expectExpMoment: moment(1541121712), expectExpired: false, expectExpiresIn: 0 },
    { expMil: 1541121712, currentDate: moment(1541120712), expectExpMoment: moment(1541121712), expectExpired: false, expectExpiresIn: 1 },
    { expMil: 1541121712, currentDate: moment(1541122712), expectExpMoment: moment(1541121712), expectExpired: true, expectExpiresIn: -1 },
  ];
});
