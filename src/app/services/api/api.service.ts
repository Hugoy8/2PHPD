import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {Router, UrlTree} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * L'url de l'api.
   */
  private readonly _urlApi: string = environment.apiUrl;

  /**
   * La date d'aujourd'hui. Sous le format 'YYYY-MM-DD'.
   */
  private dateToday!: string;

  constructor() {
    this.dateToday = new Date().toISOString().split('T')[0];
  }

  /**
   * Permet de récupérer l'url de l'api.
   */
  public get getUrlApi(): string {
    return this._urlApi;
  }

  /**
   * Permet de récupérer la date d'aujourd'hui.
   * Sous le format 'YYYY-MM-DD'.
   */
  public get getDateToday(): string {
    return this.dateToday;
  }

}
