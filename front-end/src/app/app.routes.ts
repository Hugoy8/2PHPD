import {RouterModule, Routes} from '@angular/router';
import {NgModule} from "@angular/core";
import {LoginComponent} from "./pages/auth/login/login.component";
import {RegisterComponent} from "./pages/auth/register/register.component";
import {ResetPasswordComponent} from "./pages/auth/reset-password/reset-password.component";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";

const baseTitle : string = ' - Scorelt';
export const routes: Routes = [
  // Route de base
  {path: '', redirectTo: 'login', pathMatch: 'full'},

  // Route d'authentification
  {path: 'login', component: LoginComponent, title: 'Connexion' + baseTitle},
  {path: 'register', component: RegisterComponent, title: 'Inscription' + baseTitle},
  {path: 'reset-password', component: ResetPasswordComponent, title: 'Réinitialisation du mot de passe' + baseTitle},

  // Route du dashboard
  {path: 'dashboard', component: DashboardComponent, title: 'Tableau de bord' + baseTitle},

  // Route de redirection par défaut
  {path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
