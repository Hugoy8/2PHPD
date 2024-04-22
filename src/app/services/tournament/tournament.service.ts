import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../api/api.service";
import {responseAllTournament, responseTournament} from "../../models/tournaments/tournament.model";
import {responseStandard} from "../../models/response.model";

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  constructor(
    private readonly apiService: ApiService,
    private readonly http: HttpClient
  ) { }

  /**
   * Permet de récupérer tous les tournois de l'application.
   */
  public getAllTournaments(): Observable<responseAllTournament> {
    return this.http.get<responseAllTournament>(this.apiService.getUrlApi + 'api/tournaments');
  }

  /**
   * Permet de récupérer toutes les informations d'un tournoi à partir de son id.
   * @param idTournament L'id du tournoi.
   */
  public getTournamentById(idTournament: number): Observable<responseTournament> {
    return this.http.get<responseTournament>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament);
  }

  /**
   * Permet de créer une inscription sur un tournoi pour un joueur.
   * @param idTournament L'id du tournoi.
   * @param idUser L'id de l'utilisateur.
   */
  public createRegistrationTournament(idTournament: number, idUser: number): Observable<responseStandard> {
    console.log(idUser);
    return this.http.post<responseStandard>(
      this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/registrations',
      {
        player : idUser
      })
  }

  /**
   * Permet de créer un tournoi.
   * @param name Le nom du tournoi.
   * @param description La description du tournoi.
   * @param startDate La date de début du tournoi.
   * @param endDate La date de fin du tournoi.
   * @param maxPlayers Le nombre maximum de joueurs.
   * @param sport Le sport du tournoi.
   * @param location L'emplacement du tournoi. Le lieu.
   */
  public createTournament(name: string, description: string, startDate: string, endDate: string, maxPlayers: number, sport: string, location: string): Observable<any> {
    return this.http.post<any>(
      this.apiService.getUrlApi + 'api/tournaments',
      {
        tournamentName: name,
        startDate: startDate,
        endDate: endDate,
        description: description,
        maxParticipants: maxPlayers,
        sport: sport,
        Location: location
      }
    )
  }
}
