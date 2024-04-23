import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {InformationPopupService} from "../../services/popups/information-popup/information-popup.service";
import {AddModifyUserPopupComponent} from "../../components/popup/add-modify-user-popup/add-modify-user-popup.component";
import {CustomTableComponent} from "../../components/custom-table/custom-table.component";
import {responseAllTournament, Tournament} from "../../models/tournaments/tournament.model";
import {UserService} from "../../services/user/user.service";
import {NgClass} from "@angular/common";
import {TournamentService} from "../../services/tournament/tournament.service";
import {catchError, map, of, tap} from "rxjs";
import {AllUserInformation, User} from "../../models/user/user.model";
import {WebsocketService} from "../../services/websocket/websocket.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AddModifyUserPopupComponent,
    CustomTableComponent,
    NgClass
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  /**
   * Le statut de la popup de modification des informations qui permet de savoir si elle est ouverte ou non.
   */
  public statusPopupModify: boolean = false;
  /**
   * Le type de la popup de modification des informations qui permet de savoir si on modifie un utilisateur, on ajoute un utilisateur, on modifie le mot de passe ou on supprime un utilisateur.
   */
  public typePopupModify: 'modifyUser' | 'addUser' | 'modifyPassword' | 'deleteUser' = 'modifyUser';

  /**
   * La liste des onglets de la page.
   */
  public tabSwitch: {name: string, status: boolean}[] = [
    {name: 'Tous les tournois', status: true},
    {name: 'Mes tournois', status: false}
  ]

  /**
   * La liste de tous les tournois qui sont affichés dans le tableau.
   */
  private allTournamentsData: Tournament[] = [];

  /**
   * Les informations de l'utilisateur.
   */
  public userInformation!: User | null;

  /**
   * La liste de tous les utilisateurs de l'application.
   */
  private allUserData: User[] = [];

  /**
   * L'instance de la popup de modification des informations.
   */
  private instanceOfPopupComponent!: AddModifyUserPopupComponent;

  constructor(
    public readonly authService: AuthService,
    private readonly informationPopupService: InformationPopupService,
    private readonly userService: UserService,
    private readonly tournamentService: TournamentService,
    private readonly websocketService: WebsocketService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.authService.checkIfLoginIsValid();
    await this.websocketService.connect();

    if (await this.userService.isAdmin()){
      this.tabSwitch.push({name: 'Administrateur', status: false});
    }

    await this.initData();
  }

  private async initData(): Promise<void> {
    this.tournamentService.getAllTournaments()
      .pipe(
        map((data: responseAllTournament) => {
          this.allTournamentsData = data.tournaments;
        }),
        tap(() => {

        }),
        catchError((error: any) => {
          return of(error);
        })
      ).subscribe(() => {});

    this.userService.getAllUser()
      .pipe(
        map((data: AllUserInformation) => {
          this.allUserData = data.users;
        }),
        tap(() => {

        }),
        catchError((error: any) => {
          return of(error);
        })
      ).subscribe(() => {});

    this.userInformation = await this.userService.user();
  }

  /**
   * Permet d'afficher la popup d'information expliquant que la fonctionnalité n'est pas encore implémentée.
   */
  public displayFunctionNotGood(): void {
    this.informationPopupService.displayPopup('Cette fonctionnalité n\'est pas encore implémentée. Merci de revenir plus tard !', 'information')
  }

  /**
   * Permet de récupérer l'instance de la popup de modification des informations et de l'ajouter à la variable de la classe.
   */
  public setInstanceOfPopupComponent(instance: AddModifyUserPopupComponent): void {
    this.instanceOfPopupComponent = instance;
  }

  /**
   * Permet d'ouvrir ou de fermer la popup de modification des informations.
   * @param type Le type de la popup de modification des informations.
   */
  public togglePopupModify(type: 'modifyUser' | 'addUser' | 'modifyPassword' | 'deleteUser'): void {
    this.typePopupModify = type;
    this.instanceOfPopupComponent.setTypePopup(type);
    this.instanceOfPopupComponent.initForm();
    this.statusPopupModify = !this.statusPopupModify;
  }

  /**
   * Permet de fermer la popup de modification des informations.
   */
  public closePopupModify(): void {
    this.statusPopupModify = false;
  }

  /**
   * Permet de récupérer les données de tous les tournois.
   */
  public getDataOfAllTournaments(): Tournament[] {
    return this.allTournamentsData;
  }

  /**
   * Permet de récupérer les données pour les tournois uniquement de l'utilisateur.
   */
  public getDataOfYourTournaments(): Tournament[] {
    return this.allTournamentsData.filter((tournament: Tournament) => {
      return this.userInformation && tournament.organizer.id === this.userInformation.id;
    });
  }

  /**
   * Permet de récupérer le nombre de tournois de l'utilisateur qu'il a organisé.
   */
  public getNumberOfTYourTournament(): number {
    return this.getDataOfYourTournaments().length;
  }

  /**
   * Permet de récupérer tous les utilisateurs de l'application.
   */
  public getDataOfAllUsers(): User[] {
    return this.allUserData;
  }

  /**
   * Permet de changer l'onglet actif.
   * @param index L'index de l'onglet à activer.
   */
  public toggleTabSwitch(index: number): void {
    this.tabSwitch.forEach((tab, i) => {
      if (i === index) {
        tab.status = true;
      } else {
        tab.status = false;
      }
    });
  }
}
