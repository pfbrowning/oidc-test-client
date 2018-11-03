import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppComponent } from './app.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HttpClientModule } from '@angular/common/http';
import { NgLoadingIndicatorModule } from '@browninglogic/ng-loading-indicator';
import { ModalManagerModule } from '@browninglogic/ng-modal';
import { ErrorWindowComponent } from './components/error-window/error-window.component';
import { UnhandledErrorCatcher } from './services/unhandled-error-catcher.service';
import { OidcInfoDisplayComponent } from './components/oidc-info-display/oidc-info-display.component';

@NgModule({
  declarations: [
    AppComponent,
    ErrorWindowComponent,
    OidcInfoDisplayComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ModalManagerModule,
    NgLoadingIndicatorModule,
    OAuthModule.forRoot()
  ],
  providers: [
    { provide: ErrorHandler, useClass: UnhandledErrorCatcher }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

