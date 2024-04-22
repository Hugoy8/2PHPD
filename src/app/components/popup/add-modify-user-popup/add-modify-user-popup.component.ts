import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {LoaderComponent} from "../../loader/loader.component";
import {LowercaseDirective} from "../../../directives/lowercase-directive";
import {RouterLink} from "@angular/router";
import {UserService} from "../../../services/user/user.service";
import {InformationPopupService} from "../../../services/popups/information-popup/information-popup.service";
import {CustomValidators} from "../../../validators/custom-validators";
import {NgClass} from "@angular/common";
import {UpdateUser, User} from "../../../models/user/user.model";
import {responseStandard} from "../../../models/response.model";
import {catchError, map, of, tap} from "rxjs";
import {AuthService} from "../../../services/auth/auth.service";

@Component({
  selector: 'app-add-modify-user-popup',
  standalone: true,
  imports: [
    FormsModule,
    LoaderComponent,
    LowercaseDirective,
    ReactiveFormsModule,
    RouterLink,
    NgClass
  ],
  templateUrl: './add-modify-user-popup.component.html',
  styleUrl: './add-modify-user-popup.component.css'
})
export class AddModifyUserPopupComponent implements OnInit{
  /**
   * Le statut de la popup qui permet de savoir si elle est ouverte ou non.
   */
  @Input({required: true}) statusPopup!: boolean;

  /**
   * Le type de la popup qui permet de savoir si c'est une modification, un ajout d'utilisateur ou autres.
   */
  @Input({required: true}) typePopup!: 'modifyUser' | 'addUser' | 'modifyPassword' | 'deleteUser';

  /**
   * Permet de changer le statut de la popup.
   */
  @Output() statusPopupChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Permet de retourner l'instance de la classe.
   */
  @Output() instanceOfComponent: EventEmitter<AddModifyUserPopupComponent> = new EventEmitter<AddModifyUserPopupComponent>();

  /* Le formulaire de connexion */
  public modifyForm!: FormGroup;

  /* Le statut de chargement pour les modifications */
  public isLoadingModifyForm: boolean = false;

  /* Le status pour l'affichage du mot de passe */
  public statutViewPassword : boolean = false;
  /* Le status pour l'affichage de la confirmation de mot de passe */
  public statutViewConfirmPassword : boolean = false;

  /* Le type du champ de mot de passe */
  public inputPasswordType: 'password' | 'text' = 'password';
  /* Le type du champ de confirmation du mot de passe */
  public inputConfirmPasswordType: 'password' | 'text' = 'password';

  /**
   * Les informations de l'utilisateur
   */
  public userInformation!: User | null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly informationPopupService: InformationPopupService,
    private readonly authService: AuthService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.initForm();
    await this.initData();
    this.emitInstance();
  }

  /**
   * Permet d'initialiser les données de l'utilisateur
   */
  private async initData(): Promise<void> {
    this.userInformation = await this.userService.user();
    this.initForm();
  }

  /**
   * Permet de retourner l'instance de la classe.
   */
  private emitInstance(): void {
    this.instanceOfComponent.emit(this);
  }

  /**
   * Permet d'initialiser le formulaire de modification et d'ajout d'utilisateur
   */
  public initForm(): void {
    if (this.typePopup === 'modifyUser') {
      this.modifyForm = this.formBuilder.group({
        firstName: [this.userInformation?.firstName ?? null, Validators.required],
        lastName: [this.userInformation?.lastName ?? null, Validators.required],
        pseudo: [this.userInformation?.username ?? null, [Validators.required, CustomValidators.pseudoValidator()]],
        email: [this.userInformation?.emailAddress ?? null, [Validators.required, CustomValidators.emailValidator()]]
      });
    } else if (this.typePopup === 'modifyPassword'){
      this.modifyForm = this.formBuilder.group({
        password: [null, [Validators.required, CustomValidators.passwordValidator()]],
        confirmPassword: [null, [Validators.required, CustomValidators.passwordMatchValidator()]],
      });
    }
  }

  /**
   * Permet de changer le type de la popup
   * @param type Le type de la popup
   */
  public setTypePopup(type: 'modifyUser' | 'addUser' | 'modifyPassword' | 'deleteUser'): void {
    this.typePopup = type;
  }

  /**
   * Permet de soumettre le formulaire de modification
   */
  public onSubmitModify(): void {
    this.isLoadingModifyForm = true;

    if (this.typePopup === 'modifyUser'){
      if (this.userInformation){
        let dataUpdate: UpdateUser = {};

        if (this.modifyForm?.get('firstName')?.value !== this.userInformation.firstName){
          dataUpdate.firstName = this.modifyForm?.get('firstName')?.value;
        } else if (this.modifyForm?.get('lastName')?.value !== this.userInformation.lastName){
          dataUpdate.lastName = this.modifyForm?.get('lastName')?.value;
        } else if (this.modifyForm?.get('pseudo')?.value !== this.userInformation.username){
          dataUpdate.username = this.modifyForm?.get('pseudo')?.value;
        } else if (this.modifyForm?.get('email')?.value !== this.userInformation.emailAddress){
          dataUpdate.emailAddress = this.modifyForm?.get('email')?.value;
        }

        this.userService.updateUser(this.userInformation.id, dataUpdate)
          .pipe(
            map(async (response: responseStandard) => {
              this.informationPopupService.displayPopup('Vos informations ont bien été mis a jour', 'success');
              await this.userService.refreshUserInformation();
              this.closePopup();
            }),
            tap(() => {
              this.isLoadingModifyForm = false;
            }),
            catchError((error: any) => {
              this.informationPopupService.displayPopup(error.error.message, 'error')
              this.isLoadingModifyForm = false;
              return of(error);
            })
          ).subscribe(() => {});
      }
    } else if (this.typePopup === 'modifyPassword'){
      if (this.userInformation) {
        this.userService.updatePasswordUser(this.userInformation.id, this.modifyForm?.get('password')?.value)
          .pipe(
            map(async (response: responseStandard) => {
              this.informationPopupService.displayPopup('Votre mot de passe a bien été mis a jour. Merci de vous reconnecter', 'success');
              this.closePopup();
              this.authService.logout();
            }),
            tap(() => {
              this.isLoadingModifyForm = false;
            }),
            catchError((error: any) => {
              this.informationPopupService.displayPopup(error.error.message, 'error')
              this.isLoadingModifyForm = false;
              return of(error);
            })
          ).subscribe(() => {});
      }
    }
  }

  /**
   * Elle permet de retourner le message reçu de la part du validator du formulaire.
   * @param controlName Nom du control du formulaire.
   * @returns {string} Retourne le message d'erreur du validateur.
   */
  public getErrorMessageOfValidatorForModifyForm(controlName: 'firstName' | 'lastName' | 'pseudo' | 'email' | 'password' | 'confirmPassword'): string {
    const control = this.modifyForm?.get(controlName);
    if (control && control.errors) {
      let errorKey : string = Object.keys(control.errors)[0];
      if (this.modifyForm?.get(controlName)?.value == null || this.modifyForm?.get(controlName)?.value === '') {
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
   * Permet de fermer la popup
   */
  public closePopup(): void {
    this.statusPopupChange.emit(false);
  }

  /**
   * Permet de basculer l'affichage du mot de passe
   */
  public toggleViewPassword(): void {
    if (this.statutViewPassword) {
      this.inputPasswordType = 'password';
      this.statutViewPassword = false;
    } else {
      this.inputPasswordType = 'text';
      this.statutViewPassword = true;
    }
  }

  /**
   * Permet de basculer l'affichage de la confirmation de mot de passe
   */
  public toggleViewConfirmPassword(): void {
    if (this.statutViewConfirmPassword) {
      this.inputConfirmPasswordType = 'password';
      this.statutViewConfirmPassword = false;
    } else {
      this.inputConfirmPasswordType = 'text';
      this.statutViewConfirmPassword = true;
    }
  }
}
