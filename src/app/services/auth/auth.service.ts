import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../api/api.service";
import {Observable} from "rxjs";
import {successLogin} from "../../models/auth/login.model";
import {successRegister} from "../../models/auth/register.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private readonly http: HttpClient,
    private readonly apiService: ApiService
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
}
