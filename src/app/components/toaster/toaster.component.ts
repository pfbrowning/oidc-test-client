import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Subscription } from 'rxjs';
import { OAuthEvent } from 'angular-oauth2-oidc';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
  selector: 'toaster',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.css']
})
export class ToasterComponent implements OnInit, OnDestroy {
  constructor(private messageService: MessageService, private authenticationService: AuthenticationService) {}

  private oAuthEventsSub: Subscription;

  ngOnInit() {
    this.oAuthEventsSub = this.authenticationService.oAuthEvents.subscribe(event => this.onOauthEvent(event));
  }

  ngOnDestroy() {
    if (this.oAuthEventsSub) { this.oAuthEventsSub.unsubscribe(); }
  }

  private onOauthEvent(event: OAuthEvent) {
    this.messageService.add({severity: 'info', summary: event.type});
  }
}
