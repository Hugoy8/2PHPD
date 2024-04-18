import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {LowercaseDirective} from "../../../directives/lowercase-directive";
import {CustomValidators} from "../../../validators/custom-validators";
import {NgClass} from "@angular/common";
import {LoaderComponent} from "../../../components/loader/loader.component";
import {AuthService} from "../../../services/auth/auth.service";
import {catchError, map, of, tap} from "rxjs";
import {successRegister} from "../../../models/auth/register.model";
import {UserService} from "../../../services/user/user.service";
import {InformationPopupService} from "../../../services/popups/information-popup/information-popup.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    LowercaseDirective,
    NgClass,
    LoaderComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  /* Le formulaire de connexion */
  public registerForm!: FormGroup;

  /* Le statut de chargement pour l'inscription */
  public isLoading: boolean = false;

  /* Le status pour l'affichage du mot de passe */
  public statutViewPassword : boolean = false;
  /* Le status pour l'affichage de la confirmation de mot de passe */
  public statutViewConfirmPassword : boolean = false;

  /* Le type du champ de mot de passe */
  public inputPasswordType: 'password' | 'text' = 'password';
  /* Le type du champ de confirmation du mot de passe */
  public inputConfirmPasswordType: 'password' | 'text' = 'password';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly informationPopupService: InformationPopupService
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  /**
   * Permet d'initialiser le formulaire de connexion
   */
  private initForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      pseudo: [null, [Validators.required, CustomValidators.pseudoValidator()]],
      email: [null, [Validators.required, CustomValidators.emailValidator()]],
      password: [null, [Validators.required, CustomValidators.passwordValidator()]],
      confirmPassword: [null, [Validators.required, CustomValidators.passwordMatchValidator()]]
    });
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

  /**
   * Permet de soumettre le formulaire d'inscription
   */
  public onSubmitRegister(): void {
    this.isLoading = true;
    this.authService.register(
      this.registerForm.value.firstName,
      this.registerForm.value.lastName,
      this.registerForm.value.pseudo,
      this.registerForm.value.email,
      this.registerForm.value.password
    ).pipe(
      map((successRegister: successRegister): void => {
        this.userService.setUserInformation(successRegister.user);
        this.informationPopupService.displayPopup('Votre inscription a été effectué avec succès.', 'success');
      }),
      tap(():void => {
        this.isLoading = false;
      }),
      catchError((error: any) => {
        this.informationPopupService.displayPopup(error.error.message, 'error');
        this.isLoading = false;
        return of(error);
      })
    ).subscribe((): void => {});
  }

  /**
   * Elle permet de retourner le message reçu de la part du validator du formulaire.
   * @param controlName Nom du control du formulaire.
   * @returns {string} Retourne le message d'erreur du validateur.
   */
  public getErrorMessageOfValidator(controlName: 'firstName' | 'lastName' | 'pseudo' | 'email' | 'password' | 'confirmPassword'): string {
    const control = this.registerForm?.get(controlName);
    if (control && control.errors) {
      let errorKey : string = Object.keys(control.errors)[0];
      if (this.registerForm?.get(controlName)?.value == null || this.registerForm?.get(controlName)?.value === '') {
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
