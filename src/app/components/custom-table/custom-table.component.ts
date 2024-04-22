import {Component, Input, OnInit} from '@angular/core';
import {Tournament} from "../../models/tournaments/tournament.model";
import {DatePipe, NgClass} from "@angular/common";
import {TournamentService} from "../../services/tournament/tournament.service";
import {InformationPopupService} from "../../services/popups/information-popup/information-popup.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoaderComponent} from "../loader/loader.component";
import {LowercaseDirective} from "../../directives/lowercase-directive";
import {catchError, map, of, tap} from "rxjs";
import {User} from "../../models/user/user.model";
import {UserService} from "../../services/user/user.service";
import {ApiService} from "../../services/api/api.service";
import {responseStandard} from "../../models/response.model";

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    LoaderComponent,
    LowercaseDirective,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.css'
})
export class CustomTableComponent implements OnInit{
  /**
   * Les données à afficher dans le tableau.
   */
  @Input({required: true}) data: Tournament[] = [];

  /**
   * Le statut de la popup de création de tournoi.
   */
  public statusPopupCreateTournament: boolean = false;

  /* Le formulaire de creation de tournoi */
  public createForm!: FormGroup;

  /* Le statut de chargement pour la creation du tournoi */
  public isLoadingCreateForm: boolean = false;

  constructor(
    private readonly tournamentService: TournamentService,
    private readonly informationPopupService: InformationPopupService,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    public readonly apiService: ApiService
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  /**
   * Permet d'initialiser le formulaire de création de tournoi.
   */
  private initForm(): void {
    this.createForm = this.formBuilder.group({
      name: [null, Validators.required],
      sport: [null, Validators.required],
      description: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      location: [null, Validators.required],
      numberPlayers: [null, Validators.required],
    });
  }

  /**
   * Permet de s'inscrire à un tournoi.
   * @param idTournament L'identifiant du tournoi.
   */
  public async registerOfTournament(idTournament: number): Promise<void> {
    this.informationPopupService.displayPopup('Votre inscription est en cours de traitement...', 'information');
    const userInformation: User | null = await this.userService.user();

    if (userInformation){
      this.tournamentService.createRegistrationTournament(idTournament, userInformation.id)
        .pipe(
          map((data: responseStandard) => {
            this.informationPopupService.displayPopup('Votre inscription a bien été enregistrée. On vous attend bientôt !', 'success');
          }),
          tap(() => {

          }),
          catchError((error: any) => {
            this.informationPopupService.displayPopup(error.error.message, 'error');
            return of(error);
          })
        ).subscribe(() => {});
    } else {
      this.informationPopupService.displayPopup('Impossible de récupérer vos informations utilisateurs. Merci de ressayer plus tard !', 'error');
    }
  }

  /**
   * Permet de changer le statut de la popup de création de tournoi.
   */
  public togglePopupCreateTournament(): void {
    this.statusPopupCreateTournament = !this.statusPopupCreateTournament;
  }

  /**
   * Permet de créer un tournoi. Soumis par le formulaire.
   */
  public onSubmitCreateTournament(): void {
    this.isLoadingCreateForm = true;
    this.tournamentService.createTournament(
      this.createForm.value.name,
      this.createForm.value.description,
      this.createForm.value.startDate,
      this.createForm.value.endDate,
      this.createForm.value.numberPlayers,
      this.createForm.value.sport,
      this.createForm.value.location)
      .pipe(
        map((data): void => {
          console.log(data);
          this.informationPopupService.displayPopup('Le tournoi a été créé avec succès !', 'success');
          this.togglePopupCreateTournament();
        }),
        tap(() => {
          this.isLoadingCreateForm = false;
        }),
        catchError((error: any) => {
          this.informationPopupService.displayPopup(error.error.message, 'error');
          this.isLoadingCreateForm = false;
          return of(error);
        })
      ).subscribe(() => {});
  }

  /**
   * Elle permet de retourner le message reçu de la part du validator du formulaire.
   * @param controlName Nom du control du formulaire.
   * @returns {string} Retourne le message d'erreur du validateur.
   */
  public getErrorMessageOfValidator(controlName: 'name' | 'sport' | 'description' | 'startDate' | 'endDate' | 'location' | 'numberPlayers'): string {
    const control = this.createForm?.get(controlName);
    if (control && control.errors) {
      let errorKey : string = Object.keys(control.errors)[0];
      if (this.createForm?.get(controlName)?.value == null || this.createForm?.get(controlName)?.value === '') {
        errorKey = Object.keys(control.errors)[1];
      }

      if (control.errors[errorKey] && control.errors[errorKey].message){
        return control.errors[errorKey].message;
      }

      return 'Cette valeur n\'est pas valide.';
    }
    return 'Cette valeur n\'est pas valide.';
  }
}
