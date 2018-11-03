import { AuthConfig } from 'angular-oauth2-oidc';

export class OAuthServiceStub {
    public configure(authConfig: AuthConfig): void {}
    public loadDiscoveryDocumentAndTryLogin(): Promise<void> {
        return Promise.resolve();
    }
    public hasValidIdToken(): boolean {
        return true;
    }
    public hasValidAccessToken(): boolean {
        return true;
    }
    public getIdentityClaims(): object {
        return {};
    }
    public getAccessToken(): string {
        return null;
    }
    public setupAutomaticSilentRefresh(): Promise<void> {
        return Promise.resolve();
    }
}
