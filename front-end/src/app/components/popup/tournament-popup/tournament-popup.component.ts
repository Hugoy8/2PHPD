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
import {allMatchsTournament, Match} from "../../../models/tournaments/match.model";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {allRegistrationsTournament, Registration} from "../../../models/tournaments/registration.model";

@Component({
  selector: 'app-tournament-popup',
  standalone: true,
  imports: [
    LoaderComponent,
    NgClass,
    DatePipe,
    FormsModule,
    ReactiveFormsModule
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
   * L'id du match à modifier.
   */
  private idMatchToModify!: number | null;

  /**
   * Le formulaire pour les résultats d'un match
   */
  public resultMatchForm!: FormGroup;

  /**
   * Le formulaire pour l'ajout d'un match
   */
  public addMatchForm!: FormGroup;

  /**
   * Le statut de la popup des résultats d'un match.
   */
  public statusPopupResult: boolean = false;

  /**
   * Le statut de la popup de l'ajout d'un match.
   */
  public statusPopupAddMatch: boolean = false;

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

  /* Le statut de chargement pour la modification des résultats de match */
  public isLoadingResultMatch: boolean = false;

  /* Le statut de chargement pour l'ajout d'un match */
  public isLoadingAddMatch: boolean = false;

  /**
   * Les informations du tournoi.
   */
  public tournamentInformation: Tournament | null = null;

  /**
   * La liste des matchs du tournoi.
   */
  public matchInformation: Match[] = [];

  /**
   * Les informations de l'utilisateur connecté.
   */
  public userInformation: User | null = null;

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly informationPopupService: InformationPopupService,
    private readonly userService: UserService,
    private readonly formBuilder: FormBuilder
  ) {}

  public async ngOnInit(): Promise<void> {
    this.initForm();
    this.initData();
    this.emitInstance();

    this.userInformation = await this.userService.user();
  }

  /**
   * Initialisation du formulaire des résultats d'un match.
   */
  private initForm(): void {
    this.resultMatchForm = this.formBuilder.group({
      scorePlayer1: [this.getMatchById()?.scorePlayer1 ?? null],
      scorePlayer2: [this.getMatchById()?.scorePlayer2 ?? null]
    });

    this.addMatchForm = this.formBuilder.group({
      player1: [null, Validators.required],
      player2: [null, Validators.required],
      date: [null, Validators.required],
    });
  }

  /**
   * Permet de récupérer un match par l'identifiant de la variable de classe.
   */
  private getMatchById(): Match | null {
    return this.matchInformation.find((match: Match) => match.id === this.idMatchToModify) || null;
  }

  /**
   * Permet d'initialiser les données du tournoi
   */
  public initData(): void {
    if (this.idTournament) {
      this.tournamentService.getTournamentById(this.idTournament)
      .pipe(
        map((reponseData: responseTournament) => {
          this.tournamentInformation = reponseData.tournament;
        }),
        tap(() => {

        }),
        catchError((error: any) => {
          return of(error);
        })
      ).subscribe(() => {});

      this.matchInformation = [];
      this.tournamentService.getAllMatchsOfTournamentById(this.idTournament)
        .pipe(
          map((reponseData: allMatchsTournament) => {
            this.matchInformation = reponseData.sport_matchs;
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

  /**
   * Permet de changer le statut de la popup des résultats d'un match.
   * @param idMatch L'identifiant du match.
   */
  public togglePopupResultMatch(idMatch?: number): void {
    this.statusPopupResult = !this.statusPopupResult;
    if (idMatch){
      this.idMatchToModify = idMatch;
      this.initForm();
    }
  }

  /**
   * Permet de changer le statut de la popup de l'ajout d'un match.
   */
  public togglePopupAddMatch(): void {
    this.statusPopupAddMatch = !this.statusPopupAddMatch;
  }

  /**
   * Permet de modifier les résultats d'un match. Soumis par le formulaire.
   */
  public onSubmitResultMatch(): void {
    if (this.idMatchToModify && this.idTournament){
      this.isLoadingResultMatch = true;
      this.tournamentService.modifyMatch(this.idMatchToModify, this.idTournament, {
        scorePlayer1: this.resultMatchForm.value.scorePlayer1,
        scorePlayer2: this.resultMatchForm.value.scorePlayer2
      })
        .pipe(
          map((data: responseStandard) => {
            this.informationPopupService.displayPopup('Le résultat de ce match a bien été enregistré !', 'success');
          }),
          tap(() => {
            this.togglePopupResultMatch();
            this.isLoadingResultMatch = false;
          }),
          catchError((error: any) => {
            this.isLoadingResultMatch = false;
            this.informationPopupService.displayPopup(error.error.message, 'error');
            return of(error);
          })
        ).subscribe(() => {});
    }
  }

  /**
   * Permet de savoir si un joueur est dans le match sélectionné.
   */
  public isPlayerInMatch(): boolean {
    if (this.userInformation){
      const match: Match | null = this.getMatchById();
      if (match){
        return match.player1.id === this.userInformation.id || match.player2.id === this.userInformation.id;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Permet d'ajouter un match à un tournoi. Soumis par le formulaire.
   */
  public onSubmitAddMatch(): void {
    if (this.idTournament){
      this.isLoadingAddMatch = true;
      this.tournamentService.addMatch(this.idTournament, {
        matchDate: this.addMatchForm.value.date,
        player1: this.addMatchForm.value.player1,
        player2: this.addMatchForm.value.player2
      })
        .pipe(
          map((data: responseStandard) => {
            this.informationPopupService.displayPopup('Ce match a été ajouté avec succès.', 'success');
          }),
          tap(() => {
            this.togglePopupAddMatch();
            this.isLoadingAddMatch = false;
          }),
          catchError((error: any) => {
            this.isLoadingAddMatch = false;
            this.informationPopupService.displayPopup(error.error.message, 'error');
            return of(error);
          })
        ).subscribe(() => {});
    }
  }

  /**
   * Permet de supprimer un match.
   * @param idMatch L'identifiant du match.
   */
  public onSubmitDeleteMatch(idMatch: number): void {
    if (this.idTournament){
      this.informationPopupService.displayPopup('Ce match est en cours de suppression ...', 'information');
      this.tournamentService.deleteMatch(idMatch, this.idTournament)
      .pipe(
        map((data: responseStandard) => {
          this.informationPopupService.displayPopup('Ce match a été supprimé avec succès.', 'success');
        }),
        tap(() => {
        }),
        catchError((error: any) => {
          this.informationPopupService.displayPopup(error.error.message, 'error');
          return of(error);
        })
      ).subscribe(() => {});
    }
  }

  /**
   * Permet de savoir si le tournoi et donc les matchs appartiennent à l'utilisateur connecté.
   */
  public isTournament(): boolean{
    if (this.userInformation && this.tournamentInformation){
      return this.tournamentInformation.organizer.id === this.userInformation.id;
    } else {
      return false;
    }
  }

  /**
   * Elle permet de retourner le message reçu de la part du validator du formulaire.
   * @param controlName Nom du control du formulaire.
   * @returns {string} Retourne le message d'erreur du validateur.
   */
  public getErrorMessageOfValidatorResultMatch(controlName: 'scorePlayer1' | 'scorePlayer2'): string {
    const control = this.resultMatchForm?.get(controlName);
    if (control && control.errors) {
      let errorKey : string = Object.keys(control.errors)[0];
      if (this.resultMatchForm?.get(controlName)?.value == null || this.resultMatchForm?.get(controlName)?.value === '') {
        errorKey = Object.keys(control.errors)[1];
      }

      if (control.errors[errorKey] && control.errors[errorKey].message){
        return control.errors[errorKey].message;
      }

      return 'Cette valeur n\'est pas valide.';
    }
    return 'Cette valeur n\'est pas valide.';
  }

  /**
   * Elle permet de retourner le message reçu de la part du validator du formulaire.
   * @param controlName Nom du control du formulaire.
   * @returns {string} Retourne le message d'erreur du validateur.
   */
  public getErrorMessageOfValidatorAddMatch(controlName: 'date' | 'player1' | 'player2'): string {
    const control = this.addMatchForm?.get(controlName);
    if (control && control.errors) {
      let errorKey : string = Object.keys(control.errors)[0];
      if (this.addMatchForm?.get(controlName)?.value == null || this.addMatchForm?.get(controlName)?.value === '') {
        errorKey = Object.keys(control.errors)[1];
      }

      if (control.errors[errorKey] && control.errors[errorKey].message){
        return control.errors[errorKey].message;
      }

      return 'Cette valeur n\'est pas valide.';
    }
    return 'Cette valeur n\'est pas valide.';
  }

  /**
   * Permet de récupérer la date de fin du tournoi. Sous le format 'YYYY-MM-DD'.
   */
  public getEndDate(): string {
    if (this.tournamentInformation){
      return new Date(this.tournamentInformation.endDate).toISOString().split('T')[0];
    } else {
      return '';
    }
  }

  /**
   * Permet de récupérer la date de début du tournoi. Sous le format 'YYYY-MM-DD'.
   */
  public getStartDate(): string {
    if (this.tournamentInformation){
      return new Date(this.tournamentInformation.startDate).toISOString().split('T')[0];
    } else {
      return '';
    }
  }
}
