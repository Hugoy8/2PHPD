import { Injectable } from '@angular/core';
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  constructor() { }

  /**
   * Permet de décoder un token JWT.
   * @param token Le token à décoder.
   */
  public decodeToken(token: string): any | null {
    try {
      return jwtDecode(token);
    } catch (Error) {
      return null;
    }
  }
}
