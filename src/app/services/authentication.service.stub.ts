import { Moment } from 'moment';

export class AuthenticationServiceStub {
    public authenticated = false;
    public accessTokenExpiration: Moment = null;
    public idTokenExpiration: Moment = null;
    public idTokenExpired = true;
    public accessTokenExpired = true;
    public idTokenExpiresIn: number = null;
    public accessTokenExpiresIn: number = null;
    public idTokenClaims: Object = null;
    public accessTokenClaims: Object = null;
}
