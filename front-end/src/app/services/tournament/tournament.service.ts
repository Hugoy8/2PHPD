import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../api/api.service";
import {responseAllTournament, responseTournament, UpdateTournament} from "../../models/tournaments/tournament.model";
import {responseStandard} from "../../models/response.model";
import {allMatchsTournament} from "../../models/tournaments/match.model";
import {allRegistrationsTournament} from "../../models/tournaments/registration.model";

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
   * Permet de supprimer un tournoi à partir de son id.
   * @param idTournament L'id du tournoi.
   */
  public deleteTournamentById(idTournament: number): Observable<responseStandard> {
    return this.http.delete<responseStandard>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament);
  }

  /**
   * Permet de modifier un tournoi.
   * @param idTournament L'id du tournoi.
   * @param data Les infos du tournoi.
   */
  public modifyTournament(idTournament: number, data: UpdateTournament): Observable<responseStandard> {
    return this.http.put<responseStandard>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament, data)
  }

  /**
   * Permet de modifier le score d'un match.
   * @param idMatch L'id du match.
   * @param idTournament L'id du tournoi.
   * @param data Les scores des joueurs.
   */
  public modifyMatch(idMatch: number, idTournament: number, data: {scorePlayer1: number, scorePlayer2: number}): Observable<responseStandard> {
    return this.http.put<responseStandard>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/sport-matchs/' + idMatch, data)
  }

  /**
   * Permet d'ajouter un match à un tournoi.
   * @param idTournament L'id du tournoi.
   * @param data Les infos du match.
   */
  public addMatch(idTournament: number, data: {matchDate: string, player1: number, player2: number}): Observable<responseStandard> {
    return this.http.post<responseStandard>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/sport-matchs', data)
  }

  /**
   * Permet de supprimer un match à partir de son id.
   * @param idMatch L'id du match.
   * @param idTournament L'id du tournoi.
   */
  public deleteMatch(idMatch: number, idTournament: number): Observable<responseStandard> {
    return this.http.delete<responseStandard>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/sport-matchs/' + idMatch)
  }

  /**
   * Permet de récupérer les inscriptions d'un tournoi.
   * @param idTournament L'id du tournoi.
   */
  public getALlRegistrationOfTournament(idTournament: number): Observable<allRegistrationsTournament> {
    return this.http.get<allRegistrationsTournament>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/registrations');
  }

  /**
   * Permet de supprimer une inscription d'un tournoi.
   * @param idTournament L'id du tournoi.
   * @param idRegistration L'id de l'inscription.
   */
  public deleteRegistration(idTournament: number, idRegistration: number): Observable<responseStandard> {
    return this.http.delete<responseStandard>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/registrations/' + idRegistration);
  }

  /**
   * Permet de modifier une inscription d'un tournoi.
   * @param idTournament L'id du tournoi
   * @param idRegistration L'id de l'inscription
   * @param data Les infos de l'inscription.
   */
  public modifyRegistration(idTournament: number, idRegistration: number, data: {status: 'pending' | 'registered' | 'refused'}): Observable<responseStandard> {
    return this.http.put<responseStandard>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/registrations/' + idRegistration, data)
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
  public createTournament(name: string, description: string, startDate: string, endDate: string, maxPlayers: number, sport: string, location: string): Observable<responseStandard> {
    return this.http.post<responseStandard>(
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

  /**
   * Permet de récupérer tous les matchs d'un tournoi en particulier.
   * @param idTournament L'id du tournoi.
   */
  public getAllMatchsOfTournamentById(idTournament: number): Observable<allMatchsTournament> {
    return this.http.get<allMatchsTournament>(this.apiService.getUrlApi + 'api/tournaments/' + idTournament + '/sport-matchs');
  }
}
