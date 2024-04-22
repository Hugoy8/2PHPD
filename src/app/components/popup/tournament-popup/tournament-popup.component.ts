import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {LoaderComponent} from "../../loader/loader.component";
import {InformationPopupService} from "../../../services/popups/information-popup/information-popup.service";
import {DatePipe, NgClass} from "@angular/common";
import {TournamentService} from "../../../services/tournament/tournament.service";
import {catchError, map, of, tap} from "rxjs";
import {responseTournament, Tournament} from "../../../models/tournaments/tournament.model";
import {User} from "../../../models/user/user.model";
import {responseStandard} from "../../../models/response.model";
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: 'app-tournament-popup',
  standalone: true,
  imports: [
    LoaderComponent,
    NgClass,
    DatePipe
  ],
  templateUrl: './tournament-popup.component.html',
  styleUrl: './tournament-popup.component.css'
})
export class TournamentPopupComponent implements OnInit{
  /**
   * Le statut de la popup qui permet de savoir si elle est ouverte ou non.
   */
  @Input({required: true}) statusPopup!: boolean;

  /**
   * L'id du tournoi pour récupérer toutes les informations.
   */
  private idTournament!: number | null;

  /**
   * Permet de changer le statut de la popup.
   */
  @Output() statusPopupChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Permet de retourner l'instance de la classe.
   */
  @Output() instanceOfComponent: EventEmitter<TournamentPopupComponent> = new EventEmitter<TournamentPopupComponent>();

  /* Le statut de chargement pour l'inscriptio au tournoi */
  public isLoadingRegisterTournament: boolean = false;

  /**
   * Les informations du tournoi.
   */
  public tournamentInformation: Tournament | null = null;

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly informationPopupService: InformationPopupService,
    private readonly userService: UserService
  ) {}

  public ngOnInit(): void {
    this.initData();
    this.emitInstance();
  }

  /**
   * Permet d'initialiser les données du tournoi
   */
  public initData(): void {
    if (this.idTournament) {
      this.tournamentService.getTournamentById(this.idTournament)
      .pipe(
        map((reponseData: responseTournament) => {
          console.log(reponseData.tournament);
          this.tournamentInformation = reponseData.tournament;
        }),
        tap(() => {

        }),
        catchError((error: any) => {
          return of(error);
        })
      ).subscribe(() => {});
    }
  }

  /**
   * Permet de retourner l'instance de la classe.
   */
  private emitInstance(): void {
    this.instanceOfComponent.emit(this);
  }

  /**
   * Permet d'assigner l'id du tournoi pour récupérer les informations.
   * @param idTournament L'id du tournoi.
   */
  public setIdTournament(idTournament: number): void {
    this.idTournament = idTournament;
  }

  /**
   * Permet de fermer la popup
   */
  public closePopup(): void {
    this.statusPopupChange.emit(false);
  }

  /**
   * Permet de s'inscrire à un tournoi.
   */
  public async registerOfTournament(): Promise<void> {
    this.isLoadingRegisterTournament = true;
    const userInformation: User | null = await this.userService.user();

    if (userInformation && this.idTournament){
      this.tournamentService.createRegistrationTournament(this.idTournament, userInformation.id)
        .pipe(
          map((data: responseStandard) => {
            this.informationPopupService.displayPopup('Votre inscription a bien été enregistrée. On vous attend bientôt !', 'success');
          }),
          tap(() => {
            this.isLoadingRegisterTournament = false;
          }),
          catchError((error: any) => {
            this.isLoadingRegisterTournament = false;
            this.informationPopupService.displayPopup(error.error.message, 'error');
            return of(error);
          })
        ).subscribe(() => {});
    } else {
      this.informationPopupService.displayPopup('Impossible de récupérer vos informations utilisateurs. Merci de ressayer plus tard !', 'error');
    }
  }
}
