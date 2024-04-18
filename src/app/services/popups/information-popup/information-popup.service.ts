import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InformationPopupService{
  // Texte par défaut
  public message: string = "Aucune information à afficher. Veuillez ignorer ce message.";

  // Statut par défaut
  private statutPopup: boolean = false;
  private typePopup: "success" | "error" | "warning" | "information" = "information";

  // TimeOut Element
  private timeoutElement: any;
  private readonly TIMEOUT_DURATION: number = 4000;

  constructor() {}

  // Getters and setters statut popup
  public get getStatut(): boolean {
    return this.statutPopup;
  }
  public setStatut(newStatut: boolean): void {
    this.statutPopup = newStatut;
    if (!newStatut){
      this.stopTimeout();
    }
  }

  // Getters and setters type
  public get getType(): "success" | "error" | "warning" | "information" {
    return this.typePopup;
  }
  public setType(newType: "success" | "error" | "warning" | "information"): void {
    this.typePopup = newType;
  }

  // Getters and setters message
  public get getMessage(): string {
    return this.message;
  }

  /**
   * Elle permet d'affficher un message du type qu'on souhaite pendant 4 secondes.
   * @param newMessage Le contenue du message.
   * @param newType Le type de popup à afficher entre un succès, une erreur, un warning et une information.
   */
  public displayPopup(newMessage: string, newType: "success" | "error" | "warning" | "information"): void {
    if (newMessage == "" || newMessage == null){
      if (newType == "success"){
        newMessage = "Une action a été réalisé avec succès. Aucune information à afficher.";
      } else if (newType == "error"){
        newMessage = "Une erreur inconnue est survenue. Veuillez réssayer plus tard !";
      } else if (newType == "warning"){
        newMessage = "Une action a été réalisé avec des erreurs. Veuillez vérifier les informations / actions saisies.";
      } else {
        newMessage = "Aucune information à afficher. Veuillez ignorer ce message.";
      }
    }

    this.message = newMessage;
    this.setType(newType);

    this.setStatut(true);
    this.launchTimeout();
  }

  /**
   * Permet de lancer le timer pour fermer la popup.
   */
  public launchTimeout(): void {
    this.stopTimeout();
    this.setTimeout();
  }

  /**
   * Permet de créer un TIMEOUT pour fermer la popup. Le temps est en fonction de la constante TIMEOUT_DURATION.
   */
  private setTimeout(): void {
    this.timeoutElement = setTimeout((): void => {
      this.statutPopup = false;
    }, this.TIMEOUT_DURATION);
  }

  /**
   * Permet de stopper le TIMEOUT pour fermer la popup. Il clear le timeout.
   */
  private stopTimeout(): void {
    if (this.timeoutElement) {
      clearTimeout(this.timeoutElement);
      this.timeoutElement = undefined;
    }
  }
}
