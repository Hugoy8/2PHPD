import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class CustomValidators {
  // Listes des domaines autorisés pour l'adresse e-mail.
  private static readonly _domainsEmail: string[] = ['gmail.com', 'yahoo.com', 'hotmail.com', 'supinfo.com', 'tournamentapi.com'];

  /**
   * Vérifie si l'adresse e-mail est valide.
   */
  public static emailValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const email = control.value;
      if (!email) {
        return { 'emailRequired': { valid: false, message: 'Veuillez renseigner votre e-mail.' } };
      }

      const partsEmail = email.split('@');
      if (partsEmail.length !== 2) {
        return { 'emailInvalid': { valid: false, message: 'L\'adresse e-mail est invalide.' } };
      }

      const domain = partsEmail[1];
      if (!CustomValidators._domainsEmail.includes(domain)) {
        return { 'domainInvalid': { valid: false, message: 'L\'adresse e-mail n\'est pas autorisé.' } };
      }

      const emailRegex: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!emailRegex.test(email)) {
        return { 'emailFormatInvalid': { valid: false, message: 'L\'adresse e-mail n\'est pas conforme.' } };
      }

      // L'email est valide
      return null;
    };
  }

  /**
   * Vérifie si le mot de passe est valide.
   */
  public static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const password = control.value;

      if (password == null || password === '') {
        return { 'passwordRequired': { valid: false, message: 'Veuillez renseigner un mot de passe.' } };
      }

      if (!/^\S*$/.test(password)) {
        return { 'passwordNoSpaces': { valid: false, message: 'Votre mot de passe ne doit pas contenir d\'espaces.' } };
      }

      if (password.length < 12) {
        return { 'passwordLength': { valid: false, message: 'Votre mot de passe doit faire 12 caractères minimum.' } };
      }

      if (!/[A-Z]/.test(password)) {
        return { 'passwordUppercase': { valid: false, message: 'Votre mot de passe doit contenir au minimum une lettre majuscule.' } };
      }

      if (!/[a-z]/.test(password)) {
        return { 'passwordLowercase': { valid: false, message: 'Votre mot de passe doit contenir au minimum une lettre minuscule.' } };
      }

      if (!/\d/.test(password)) {
        return { 'passwordDigit': { valid: false, message: 'Votre mot de passe doit contenir au minimum un chiffre.' } };
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { 'passwordSpecialChar': { valid: false, message: 'Votre mot de passe doit contenir au minimum un caractère spéciale.' } };
      }

      // Le mot de passe est valide
      return null;
    };
  }

  /**
   * Vérifie si les mots de passe du même formulaire correspondent.
   */
  public static passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      // Accéder au FormGroup parent
      const parent = control.parent;
      const password = parent?.get('password')?.value;
      const confirmPassword = control.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return { 'passwordMismatch': { valid: false, message: 'Les mots de passe ne correspondent pas.'}};
      }

      // Les mots de passes correspondent.
      return null;
    };
  }

  /**
   * Vérifie si la case à cocher est cochée, de type 'checkbox'.
   */
  public static checkBoxValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isChecked = control.value;
      return isChecked ? null : { 'notChecked': true };
    };
  }

  /**
   * Vérifie si le pseudo est valide.
   */
  public static pseudoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pseudo = control.value;

      if (pseudo == null || pseudo === '') {
        return { 'pseudoRequired': { valid: false, message: 'Veuillez renseigner un pseudo.' } };
      }

      if (pseudo.length < 2) {
        return { 'pseudoLength': { valid: false, message: 'Votre pseudo doit faire 2 caractères minimum.' } };
      }

      // Le pseudo est valide.
      return null;
    };
  }

  /**
   * Vérifie si l'un des champs n'est pas vide, et ne contient pas uniquement des espaces.
   */
  public static emptyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (value == null || value === '') {
        return { 'valueRequired': { valid: false, message: 'Veuillez renseigner ce champ.' } };
      }

      if (value.trim().length === 0) {
        return { 'onlySpaces': { valid: false, message: 'Le champ ne peut pas contenir que des espaces.' } };
      }

      // La valeur est valide
      return null;
    };
  }
}
