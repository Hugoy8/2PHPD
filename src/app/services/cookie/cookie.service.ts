import {Injectable} from '@angular/core';
import {CookieService as NgxCookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor(
    private ngxCookieService: NgxCookieService
  ) { }

  /**
   * Crée ou met à jour un cookie avec les paramètres spécifiés.
   * @param name Le nom du cookie.
   * @param value La valeur du cookie.
   * @param expires La date d'expiration du cookie (en jours ou date spécifique).
   * @param path Le chemin d'accès où le cookie est accessible.
   * @param domain Le domaine pour lequel le cookie est valide.
   * @param secure Indique si le cookie doit être sécurisé (transmis uniquement via HTTPS).
   * @param sameSite Stratégie de restriction de l'envoi du cookie avec les requêtes cross-site (Lax, Strict, None).
   */
  public setCookie(name: nameCookie, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'Strict' | 'None' = 'Lax'): void {
    this.ngxCookieService.set(name, value, {expires, path, domain, secure, sameSite});
  }

  /**
   * Vérifie si un cookie spécifique existe.
   * @param name Le nom du cookie à vérifier.
   * @returns True si le cookie existe, false sinon.
   */
  public checkCookie(name: nameCookie): boolean {
    return this.ngxCookieService.check(name);
  }

  /**
   * Récupère la valeur d'un cookie.
   * @param name Le nom du cookie dont on souhaite récupérer la valeur.
   * @returns La valeur du cookie si trouvé, une chaîne vide sinon.
   */
  public getCookie(name: nameCookie): string {
    return this.ngxCookieService.get(name);
  }

  /**
   * Supprime un cookie spécifique.
   * @param name Le nom du cookie à supprimer.
   * @param path Le chemin d'accès du cookie (doit correspondre à celui spécifié lors de la création du cookie).
   * @param domain Le domaine du cookie (doit correspondre à celui spécifié lors de la création du cookie).
   */
  public deleteCookie(name: nameCookie, path?: string, domain?: string): void {
    this.ngxCookieService.delete(name, path, domain);
  }

  /**
   * Supprime tous les cookies du domaine. Si aucun paramètre n'est spécifié, tous les cookies actuel seront supprimés.
   * @param path Le chemin d'accès des cookies à supprimer.
   * @param domain Le domaine des cookies à supprimer.
   */
  public deleteAllCookies(path?: string, domain?: string): void {
    this.ngxCookieService.deleteAll(path, domain);
  }
}

/**
 * Type de données pour le nom du cookie.
 */
type nameCookie = 'session' | string;
