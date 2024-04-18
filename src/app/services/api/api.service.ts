import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {Router, UrlTree} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly _urlApi: string = environment.apiUrl;

  constructor() { }

  /**
   * Permet de récupérer l'url de l'api.
   */
  public get getUrlApi(): string {
    return this._urlApi;
  }

}
