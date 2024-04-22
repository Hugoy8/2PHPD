import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CustomValidators} from "../../../validators/custom-validators";
import {LowercaseDirective} from "../../../directives/lowercase-directive";
import {NgClass} from "@angular/common";
import {AuthService} from "../../../services/auth/auth.service";
import {catchError, map, of, tap} from "rxjs";
import {successLogin} from "../../../models/auth/login.model";
import {CookieService} from "../../../services/cookie/cookie.service";
import {LoaderComponent} from "../../../components/loader/loader.component";
import {InformationPopupService} from "../../../services/popups/information-popup/information-popup.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    LowercaseDirective,
    NgClass,
    LoaderComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  /* Le formulaire de connexion */
  public loginForm!: FormGroup;

  /* Le statut de chargement pour la connexion */
  public isLoading: boolean = false;

  /* Le status pour l'affichage du mot de passe */
  public statutViewPassword : boolean = false;

  /* Le type du champ de mot de passe */
  public inputPasswordType: 'password' | 'text' = 'password';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
    private readonly informationPopupService: InformationPopupService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.initForm();

    if (this.cookieService.checkCookie('session') && this.cookieService.getCookie('session') != ''){
      this.router.navigateByUrl('/dashboard');
    }
  }

  /**
   * Permet d'initialiser le formulaire de connexion
   */
  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, CustomValidators.emailValidator()]],
      password: [null, [Validators.required, CustomValidators.passwordValidator()]]
    });
  }

  /**
   * Permet de soumettre le formulaire de connexion
   */
  public onSubmitLogin(): void {
    this.isLoading = true;
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
      .pipe(
        map((successLogin: successLogin): void => {
          this.cookieService.setCookie('session', successLogin.token, 1);
          this.informationPopupService.displayPopup('Vous vous êtes connecté correctement.', 'success');
          this.router.navigateByUrl('/dashboard');
        }),
        tap((): void => {
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
   * Elle permet de retourner le message reçu de la part du validator du formulaire.
   * @param controlName Nom du control du formulaire.
   * @returns {string} Retourne le message d'erreur du validateur.
   */
  public getErrorMessageOfValidator(controlName: 'email' | 'password'): string {
    const control = this.loginForm?.get(controlName);
    if (control && control.errors) {
      let errorKey : string = Object.keys(control.errors)[0];
      if (this.loginForm?.get(controlName)?.value == null || this.loginForm?.get(controlName)?.value === '') {
        errorKey = Object.keys(control.errors)[1];
      }
      return control.errors[errorKey].message;
    }
    return 'Cette valeur n\'est pas valide.';
  }
}
