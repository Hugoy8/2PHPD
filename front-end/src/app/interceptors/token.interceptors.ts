import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {CookieService} from "../services/cookie/cookie.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor{

  constructor(
    private readonly cookieService: CookieService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // La liste des routes à exclure.
    const excludedUrls: string[] = ['/api/login_check', '/api/register'];

    // Si la route est dans 'excludedUrls', ne fait rien et passe la requête originale.
    if (excludedUrls.some(url => req.url.includes(url))) {
      return next.handle(req);
    }

    if (this.cookieService.checkCookie('session')) {
      // Changement de l'authorization.
      let headers: HttpHeaders;
      let modifiedReq: HttpRequest<any>;

      headers = new HttpHeaders()
        .append('Authorization', `Bearer ${this.cookieService.getCookie('session')}`);
      modifiedReq = req.clone({ headers: headers, withCredentials: false });

      return next.handle(modifiedReq);
    } else {
      return next.handle(req);
    }
  }

}
