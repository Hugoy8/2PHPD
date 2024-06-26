import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../api/api.service";
import {Observable} from "rxjs";
import {successLogin} from "../../models/auth/login.model";
import {successRegister} from "../../models/auth/register.model";
import {CookieService} from "../cookie/cookie.service";
import {UserService} from "../user/user.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private readonly http: HttpClient,
    private readonly apiService: ApiService,
    private readonly cookieService: CookieService,
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  /**
   * La route API qui permet de se connexion.
   * @param email L'email de l'utilisateur.
   * @param password Le mot de passe de l'utilisateur.
   */
  public login(email: string, password: string): Observable<successLogin> {
    return this.http.post<successLogin>(
      this.apiService.getUrlApi + "api/login_check",
      {
        username: email,
        password: password
      });
  }

  /**
   * Permet de se déconnecter.
   */
  public logout(): void {
    this.userService.deleteUser();
    this.cookieService.deleteAllCookies();
    this.router.navigateByUrl('/login');
  }

  /**
   * La route API qui permet de s'inscrire.
   * @param firstname Le prénom de l'utilisateur.
   * @param lastName Le nom de l'utilisateur.
   * @param pseudo Le pseudo de l'utilisateur.
   * @param email L'email de l'utilisateur.
   * @param password Le mot de passe de l'utilisateur.
   */
  public register(firstname: string, lastName: string, pseudo: string, email: string, password: string): Observable<successRegister> {
    return this.http.post<successRegister>(
      this.apiService.getUrlApi + "api/register",
      {
        firstName: firstname,
        lastName: lastName,
        username: pseudo,
        emailAddress: email,
        password: password
      }
    )
  }

  /**
   * Permet de vérifier si l'utilisateur est connecté. Et qu'un cookie de session est présent.
   * Effectue les redirections requis si necessaire.
   */
  public checkIfLoginIsValid(): void {
    if (!this.cookieService.checkCookie('session') && this.cookieService.getCookie('session') == ''){
      this.cookieService.deleteAllCookies();
      this.router.navigateByUrl('/login');
    };
  }
}
