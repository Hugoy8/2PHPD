import { Injectable } from '@angular/core';
import {ApiService} from "../api/api.service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {AllUserInformation, UpdateUser, User, UserInformation} from "../../models/user/user.model";
import {lastValueFrom, Observable} from "rxjs";
import {CookieService} from "../cookie/cookie.service";
import {responseStandard} from "../../models/response.model";
import {JwtService} from "../jwt/jwt.service";

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
    private readonly http: HttpClient,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Permet de récupérer les informations de l'utilisateur connecté.
   */
  public async user(): Promise<User | null> {
    if (this._userInformation === null) {
      if (this.cookieService.checkCookie('session')) {
        try {
          const userInformation: UserInformation = await lastValueFrom(this.getUserInformation(this.jwtService.decodeToken(this.cookieService.getCookie('session')).id));

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
   * Permet de rafraichir les informations de l'utilisateur.
   * Possible que les informations soit null.
   */
  public async refreshUserInformation(): Promise<void> {
    this._userInformation = await this.user();
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

  /**
   * Permet de savoir si l'utilisateur est un administrateur.
   * @returns {boolean} Retourne true si l'utilisateur est un administrateur.
   */
  public async isAdmin(): Promise<boolean> {
    this._userInformation = await this.user();
    if (this._userInformation){
      return this._userInformation?.roles[0] == 'ROLE_ADMIN';
    } else {
      return false;
    }
  }

  /**
   * Permet de récupérer la liste de tous les utilisateurs de l'application
   */
  public getAllUser(): Observable<AllUserInformation> {
    return this.http.get<AllUserInformation>(this.apiService.getUrlApi + 'api/players');
  }

  /**
   * Permet de mettre a jour les informations de l'utilisateur
   * @param idUser L'id de l'utilisateur
   * @param data Les données à mettre à jour
   */
  public updateUser(idUser: number, data: UpdateUser): Observable<responseStandard> {
    return this.http.put<responseStandard>(
      this.apiService.getUrlApi + 'api/players/' + idUser,
      data
    )
  }

  /**
   * Permet de mettre a jour le mot de passe de l'utilisateur
   * @param idUser L'id de l'utilisateur
   * @param newPassword Le nouveau mot de passe
   */
  public updatePasswordUser(idUser: number, newPassword: string): Observable<responseStandard> {
    return this.http.put<responseStandard>(
      this.apiService.getUrlApi + 'api/players/' + idUser,
      {
        password: newPassword
      }
    )
  }

  /**
   * Permet de supprimer un utilisateur
   * @param idUser L'id de l'utilisateur
   */
  public deleteUserById(idUser: number) : Observable<responseStandard> {
    return this.http.delete<responseStandard>(this.apiService.getUrlApi + 'api/players/' + idUser);
  }
}

