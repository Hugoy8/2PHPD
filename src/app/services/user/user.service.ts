import { Injectable } from '@angular/core';
import {ApiService} from "../api/api.service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {User, UserInformation} from "../../models/user/user.model";
import {lastValueFrom, Observable} from "rxjs";
import {CookieService} from "../cookie/cookie.service";
import {successRegister} from "../../models/auth/register.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Contient les informations de l'utilisateur connecté (Les informations sont récupérées une seule fois au moment de l'appel de la fonction 'user')
  private _userInformation: User | null = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly cookieService: CookieService,
    private readonly router: Router,
    private readonly http: HttpClient
  ) {}

  /**
   * Permet de récupérer les informations de l'utilisateur connecté.
   */
  public async user(): Promise<User | null> {
    if (this._userInformation === null) {
      if (this.cookieService.checkCookie('session')) {
        try {
          const userInformation: UserInformation = await lastValueFrom(this.getUserInformation(1));

          if (userInformation) {
            this._userInformation = userInformation.user;
          } else {
            await this.router.navigateByUrl('/login');
            this.cookieService.deleteCookie('session');
          }
        } catch (error: any){
          await this.router.navigateByUrl('/login');
          this.cookieService.deleteCookie('session');
        }
      } else {
        await this.router.navigateByUrl('/login');
        this.cookieService.deleteCookie('session');
      }
    }

    return this._userInformation;
  }

  /**
   * Permet de remettre à zéro les informations de l'utilisateur.
   */
  public deleteUser(): void {
    this._userInformation = null;
  }

  /**
   * Permet de définir les informations de l'utilisateur connecté.
   * @param userInformation Les informations de l'utilisateur connecté.
   */
  public setUserInformation(userInformation: User): void {
    this._userInformation = userInformation;
  }

  /**
   * Permet de récupérer les informations de l'utilisateur depuis l'api.
   * @param idUser L'id de l'utilisateur.
   */
  public getUserInformation(idUser: number): Observable<UserInformation> {
    return this.http.get<UserInformation>(this.apiService.getUrlApi + 'api/players/' + idUser);
  }
}

