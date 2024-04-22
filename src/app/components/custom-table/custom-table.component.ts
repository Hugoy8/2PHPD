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
import {CustomValidators} from "../../validators/custom-validators";
import {TournamentPopupComponent} from "../popup/tournament-popup/tournament-popup.component";

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    LoaderComponent,
    LowercaseDirective,
    ReactiveFormsModule,
    NgClass,
    TournamentPopupComponent
  ],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.css'
})
export class CustomTableComponent implements OnInit{
  /**
   * Les données à afficher dans le tableau.
   */
  @Input({required: true}) data: any[] = [];

  /**
   * Le type de tableau à afficher.
   */
  @Input({required: true}) type!: 'tournament' | 'user';

  /**
   * Le statut de la popup de création de tournoi.
   */
  public statusPopupCreateTournament: boolean = false;

  /* Le formulaire de creation de tournoi */
  public createForm!: FormGroup;

  /* Le statut de chargement pour la creation du tournoi */
  public isLoadingCreateForm: boolean = false;

  /**
   * Le statut de la popup de création d'utilisateur.
   */
  public statusPopupCreateUser: boolean = false;

  /* Le formulaire de creation d'utilisateur */
  public createUserForm!: FormGroup;

  /* Le statut de chargement pour la creation d'utilisateur */
  public isLoadingCreateUserForm: boolean = false;

  /* Le statut de chargement pour suppression d'un utilisateur */
  public isLoadingDeleteUser: boolean = false;

  /**
   * L'identifiant de l'utilisateur à modifier.
   */
  public userIdToModify: number | null = null;

  /**
   * Le statut de la popup de validation.
   */
  public statusPopupValidation: boolean = false;

  /**
   * Le statut de la popup d'un tournoi
   */
  public statusPopupTournament: boolean = false;

  /**
   * L'instance de la classe TournamentPopupComponent.
   */
  public instanceOfTournamentPopup: TournamentPopupComponent | null = null;

  /**
   * Le type du role pour le formulaire de modification.
   */
  public roleType: 'ROLE_ADMIN' | 'ROLE_USER' = 'ROLE_USER';

  /**
   * Le type du status pour le formulaire de modification.
   */
  public statusType: 'active' | 'suspended' | 'banned' = 'active';

  /**
   * Les informations de l'utilisateur a modifier
   */
  public userInformationToModify: User | null = null;

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

    this.createUserForm = this.formBuilder.group({
      firstName: [this.userInformationToModify?.firstName ?? null, Validators.required],
      lastName: [this.userInformationToModify?.lastName ?? null, Validators.required],
      username: [this.userInformationToModify?.username ?? null, Validators.required],
      role: [this.userInformationToModify?.roles ?? null, Validators.required],
      email: [this.userInformationToModify?.emailAddress ?? null, Validators.required],
      status: [this.userInformationToModify?.status ?? null, Validators.required]
    });

    this.roleType = this.userInformationToModify?.roles[0] ?? 'ROLE_USER';
    this.statusType = this.userInformationToModify?.status ?? 'active';
  }

  /**
   * Permet de changer le type du role.
   */
  public toggleRoleType(): void{
    if (this.roleType === 'ROLE_ADMIN'){
      this.roleType = 'ROLE_USER';
      this.createUserForm.value.role = 'ROLE_USER';
    } else {
      this.roleType = 'ROLE_ADMIN';
      this.createUserForm.value.role = 'ROLE_ADMIN';
    }
  }

  /**
   * Permet de changer le type du status.
   * @param newStatus Le nouveau status.
   */
  public toggleStatusType(newStatus: 'active' | 'suspended' | 'banned'): void{
    this.statusType = newStatus;
    this.createUserForm.value.status = newStatus;
  }

  /**
   * Permet de changer le status de la popup d'un tournoi.
   * @param idTournament L'identifiant du tournoi.
   */
  public togglePopupTournament(idTournament: number): void{
    this.instanceOfTournamentPopup?.setIdTournament(idTournament);
    this.instanceOfTournamentPopup?.initData();
    this.statusPopupTournament = !this.statusPopupTournament;
  }

  /**
   * Permet d'assigner l'instance de la classe TournamentPopupComponent.
   * @param instance L'instance de la classe TournamentPopupComponent.
   */
  public setInstanceOfTournamentPopup(instance: TournamentPopupComponent): void {
    this.instanceOfTournamentPopup = instance;
  }

  /**
   * Permet de fermer la popup d'un tournoi.
   */
  public closePopupTournament(): void {
    this.statusPopupTournament = false;
  }

  /**
   * Permet de changer le statut de la popup de création de tournoi.
   */
  public togglePopupCreateTournament(): void {
    this.statusPopupCreateTournament = !this.statusPopupCreateTournament;
  }

  /**
   * Permet de changer le statut de la popup de validation.
   * @param idUser L'identifiant de l'utilisateur.
   */
  public togglePopupValidation(idUser?: number): void {
    this.statusPopupValidation = !this.statusPopupValidation;
    if (idUser){
      this.userIdToModify = idUser;
    }
  }

  /**
   * Permet de changer le statut de la popup de création d'utilisateur.
   * @param idUserToModify L'identifiant de l'utilisateur à modifier.
   */
  public togglePopupCreateUser(idUserToModify?: number | null): void {
    if (idUserToModify){
      this.userInformationToModify = this.getUserInformationById(idUserToModify);
      this.initForm();
    }
    this.statusPopupCreateUser = !this.statusPopupCreateUser;
  }

  /**
   * Permet de supprimer un utilisateur.
   */
  public deleteUser(): void {
    this.isLoadingDeleteUser = true;
    this.informationPopupService.displayPopup('Cette utilisateur est en cours de suppression...', 'information');

    if (this.userIdToModify){
      this.userService.deleteUserById(this.userIdToModify)
        .pipe(
          map((data: responseStandard) => {
            this.informationPopupService.displayPopup('Cette utilisateur a été supprimé avec succès !', 'success');
          }),
          tap(() => {
            this.togglePopupValidation();
            this.isLoadingDeleteUser = false;
          }),
          catchError((error: any) => {
            this.isLoadingDeleteUser = false;
            this.informationPopupService.displayPopup(error.error.message, 'error');
            return of(error);
          })
      ).subscribe(() => {});
    }
  }

  /**
   * Permet de récupérer les informations de l'utilisateur à modifier.
   * @param idUser L'identifiant de l'utilisateur.
   */
  private getUserInformationById(idUser: number): User | null {
    return this.data.find((user: User) => user.id === idUser);
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
   * Permet de créer un utilisateur. Soumis par le formulaire.
   */
  public onSubmitCreateUser(): void {
    this.isLoadingCreateUserForm = true;
    if (this.userInformationToModify){
      this.userService.updateUser(this.userInformationToModify.id, {
        firstName : this.createUserForm.value.firstName,
        lastName : this.createUserForm.value.lastName,
        username : this.createUserForm.value.username,
        emailAddress : this.createUserForm.value.email,
        roles : [this.roleType],
        status : this.statusType
      })
        .pipe(
          map((data: responseStandard): void => {
          this.informationPopupService.displayPopup('Les informations de cette utilisateur ont bien été mis à jour !', 'success');
          this.togglePopupCreateUser();
        }),
        tap(() => {
          this.isLoadingCreateUserForm = false;
        }),
        catchError((error: any) => {
          this.informationPopupService.displayPopup(error.error.message, 'error');
          this.isLoadingCreateUserForm = false;
          return of(error);
        })
        ).subscribe(() => {});
    }
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

  /**
   * Elle permet de retourner le message reçu de la part du validator du formulaire.
   * @param controlName Nom du control du formulaire.
   * @returns {string} Retourne le message d'erreur du validateur.
   */
  public getErrorMessageOfValidatorForCreateUser(controlName: 'firstName' | 'lastName' | 'username' | 'role' | 'email' | 'status'): string {
    const control = this.createUserForm?.get(controlName);
    if (control && control.errors) {
      let errorKey : string = Object.keys(control.errors)[0];
      if (this.createUserForm?.get(controlName)?.value == null || this.createUserForm?.get(controlName)?.value === '') {
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
