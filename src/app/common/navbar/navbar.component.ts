import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
const GRAPH_ENDPOINT_PICTURE = 'https://graph.microsoft.com/v1.0/me/photo/$value';

type ProfileType = {
  givenName?: string,
  surname?: string,
  userPrincipalName?: string,
  id?: string
};

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  title = 'TO-DO-task_manager';
  profile!: ProfileType;
  isIframe = false;
  loginDisplay = false;
  imageUrl: string | undefined;
  defaultImageURL = '/assets/115-1150152_default-profile-picture-avatar-png-green.png'
  private readonly _destroying$ = new Subject<void>();

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, private broadcastService: MsalBroadcastService, private authService: MsalService,private http: HttpClient,private el: ElementRef) {}

  ngOnInit(): void {
    // this.getProfile();
    this.isIframe = window !== window.parent && !window.opener;

    // this.login()

    this.broadcastService.inProgress$
    .pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      takeUntil(this._destroying$)
    )
    .subscribe(() => {
      this.setLoginDisplay();
      
      this.authService.instance.handleRedirectPromise().then(() => {
        // Check if the user is authenticated after a redirect
        const accounts = this.authService.instance.getAllAccounts();
  
        if (accounts.length > 0) {
          // Set the first account as the active account (you might have logic to choose the appropriate account)
          this.authService.instance.setActiveAccount(accounts[0]);
  
          // User is authenticated
          this.getToken();
          this.fetchImage()
          this.getProfile()
        }
        else {
          console.error('No accounts available.');
          // Handle the case where there are no accounts available
        }
      });
    })
    
  }

  login() {
    console.log("start")
    if (this.msalGuardConfig.authRequest){
      this.authService.loginPopup({...this.msalGuardConfig.authRequest} as RedirectRequest);
      console.log("logged in")
    } else {
      this.authService.loginPopup();
      // this.getToken()
    }
    // location.reload()
  }

  getToken() {
    console.log("token")
    this.authService.acquireTokenSilent({
      scopes: ["user.read"],
    }).subscribe({
      next: (response) => {
        // Use the acquired token as needed
        console.log('Access Token:', response.accessToken);
        // const headers = new HttpHeaders({
        //   'Authorization': `Bearer ${response.accessToken}`,
        // });

        // Store the token in local storage
        localStorage.setItem('access_token', response.accessToken);
      },
      error: (error) => {
        console.error('Error acquiring token:', error);
      },
    });
  }

  logout() { // Add log out function here
    this.authService.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:4200'
    });
    localStorage.clear()
  }

  getProfile() {
    this.http.get(GRAPH_ENDPOINT)
      .subscribe(resp => {
        // localStorage.setItem('access_token', resp.givenName);
        this.profile = resp;
        // localStorage.setItem('access_token', profile.givenName);
        console.log(this.profile.givenName)
        localStorage.setItem("name", this.profile.givenName + " " + this.profile.surname )
      });
  }

  fetchImage() {
    console.log('picture')
    const access_Token =localStorage.getItem('access_token');
    // const access_Token = "EwCIA8l6BAAUTTy6dbu0OLf3Lzl3R/vfUXxq8g8AARTCoVDew/q5RyVKyDk8YTRhLIheTNxzasrel4nuqs5zS2j1IJPdhHCAidJzAiCAlKxSW8zz+wEMgJvpCRBKIxCguKhNEb9UjVof9q8NlWymWBfotpO50PROiEvRFxbERqqWl3kpJtfkyqOS7ZD/ErBwoZNHI0Ih6svDcOMXPcjOcSUnNg+ySSHyhISaCxflLu+xcGnY3UWvVEdQ9Ovp2wwxuYeHUiIyB+2FGjvKUF2NPjA5qdScqlbhzEsU029WZlOMnuPHjwDu7iqPHdUsUaxGzhPjC3UzxzUhEg99qHw2KZcJFgjgFLvaiSLvAUQAx4Icfz/lM2xQuRGrNZEAyOoDZgAACKe/DGHZVFtfWAKjv05lxVxbbiwiWTZuFeso/nYdRpvJYzDKInjbDsx7u8xeE6rx5ECNr/VSlTbOUrQNOYVEFfou6qQJsuSXtHtOpgoIQHjMHM2GJCf4vEGEqsmqUyHNjcrl9aP30jfGs06bqHDu8Pce8HiOymQjI0FSoJxe5iHs2PHb16lidDMjxJgWO6AYUSDLRhtnD5gDXIgEsrOjweSrOMM3Y380+sdFhRoxMHbKpD2m0CpAk3QUn4WkTp9DS47HWekobhUJ1M1phyZxKtY1VElP193Ha917EedviiQ2K1wtOq4pgwkOML7hXMX+TFOjHozAwZ6nvjEk4OYyQG1cvllT3HfszOQi7IME9djMde4hu9TeG1uMUQj/MQ81x/Ll/YKxFaj3PO9vd2xBxivtvnF9kIQpWZ8Dpoy6iZ2WqQFo/2MhYShfDna2Gu9dwERyEhfM6TYUOHk9Fs2AGHj5jeSNGw7kYN+SjnxS0GEFLGxuReqi3honI4KHmC56h53SBXBy0XtuOgwsm8rj6+JQf8Klf561FuKWRt/zatg1AK2ghJeb4P+9cCsRSp8r36CVVzWfLfFVYo0WxleOn6rZDWqdpPArUEMO50VRyDs4LrYRg1G2e5BUBNOP0W5NWnR9bQwcqGUCg8VHVhsSVRjKmlWVVCaM7pvu/4v5+Eu1NLlcMzHbVEKIAfuUMZheykl24h2l0gN/4URhaIvsXi/ydfnK4jmR5N1K5j/hzrg3EovNVY5gw4440qTiCloSlZ1mlwXd5Q+QopUCND99oWM/A8xEel9iejvc65s1bFJXvZyNAg=="
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${access_Token}`,
    });

    this.http.get(GRAPH_ENDPOINT_PICTURE, { headers, responseType: 'arraybuffer' }).subscribe(
      (data) => {
        const blob = new Blob([data], { type: 'image/jpeg' });
        const userPhoto = URL.createObjectURL(blob);
        this.imageUrl = userPhoto; // Display fetched image
      },
      (error) => {
        if (error.status === 404) {
          this.imageUrl = this.defaultImageURL; // Display default image
        }
      }
    );
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
