import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Moment } from 'moment';
import { TokenExpirationInfo } from 'src/app/models/token-expiration-info';
import { Token } from '@angular/compiler';

@Component({
  selector: 'oidc-info-display',
  templateUrl: './oidc-info-display.component.html',
  styleUrls: ['./oidc-info-display.component.css']
})
export class OidcInfoDisplayComponent implements OnInit, OnDestroy {
  public secondInterval: Subscription;
  public identityTokenExpirationInfo: TokenExpirationInfo;
  public accessTokenExpirationInfo: TokenExpirationInfo;

  constructor(private authenticationService: AuthenticationService) {}

  public ngOnInit() {
    /* Update the expiration info on a 1 second interval in order to keep
    the expiresIn values updated in the template. */
    this.secondInterval = interval(1000).subscribe(() => this.updateExpirationInfo(
      this.authenticationService.idTokenExpiration,
      this.authenticationService.idTokenExpired,
      this.authenticationService.idTokenExpiresIn,
      this.authenticationService.accessTokenExpiration,
      this.authenticationService.accessTokenExpired,
      this.authenticationService.accessTokenExpiresIn
    ));
  }

  public ngOnDestroy() {
    if (this.secondInterval) { this.secondInterval.unsubscribe(); }
  }

  public get identityTokenClaims(): Object {
    return this.authenticationService.idTokenClaims;
  }

  public get accessTokenClaims(): Object {
    return this.authenticationService.accessTokenClaims;
  }

  /** Updates the token expiration objects with the latest value
   * in order to be bound to the template */
  updateExpirationInfo(idtokenExpiration: Moment, idTokenExpired: boolean, idTokenExpiresIn: number,
    accessTokenExpiration: Moment, accessTokenExpired: boolean, accessTokenExpiresIn: number): void {
    this.identityTokenExpirationInfo = new TokenExpirationInfo(idtokenExpiration, idTokenExpired, idTokenExpiresIn);

    this.accessTokenExpirationInfo = new TokenExpirationInfo(accessTokenExpiration, accessTokenExpired, accessTokenExpiresIn);
  }
}
