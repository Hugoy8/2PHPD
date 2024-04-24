import {User} from "../user/user.model";
import {Tournament} from "./tournament.model";

/* Le model d'une inscription pour un tournoi */
export interface Registration {
  id: number,
  player: User,
  tournament: Tournament,
  registrationDate: string,
  status: 'pending' | 'registered' | 'refused'
}

/* Réponse de toutes les inscriptions d'un tournoi */
export interface allRegistrationsTournament {
  message: string,
  number_of_registrations: number,
  status: number,
  registrations: Registration[]
}
