import { Injectable } from '@angular/core';
import {ApiService} from "../api/api.service";
import {User} from "../../models/user/user.model";
import {UserService} from "../user/user.service";
import {InformationPopupService} from "../popups/information-popup/information-popup.service";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  /**
   * L'instance du WebSocket.
   */
  private socket: WebSocket | null = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly userService: UserService,
    private readonly informationPopupService: InformationPopupService
  ) {}

  /**
   * Permet de se connecter au WebSocket.
   */
  public async connect(): Promise<void> {
    const user: User | null = await this.userService.user();
    if (user){
      this.socket = new WebSocket(this.apiService.getUrlWebsocket + '?userId=' + user.id);

      this.socket.onmessage = (event) => {
        this.informationPopupService.displayPopup(event.data, 'success');
      };

      this.socket.onerror = (error) => {
       this.informationPopupService.displayPopup('Un erreur est survenue pendant une opération diverse avec le Websocket. Merci de vérifier votre connexion internet ou contacter le support !', 'error');
      };
    } else {
      throw new Error('User not found for connection to WebSocket');
    }
  }

  /**
   * Permet de se déconnecter du WebSocket.
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = null;
  }
}
