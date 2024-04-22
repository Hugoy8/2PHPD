import {User} from "../user/user.model";

/* Le model des informations d'un tournoi */
export interface Tournament{
  id: number,
  tournamentName: string,
  startDate: string,
  endDate: string,
  location: string,
  description: string,
  maxParticipants: number,
  numberOfParticipants: number,
  isUserRegistered: 'not registered' | 'pending' | 'registered',
  sport: string,
  organizer: User,
  winner: User | null,
  status: 'Finished' | 'Upcoming' | 'Ongoing'
}

/* Réponse pour la liste des tous les tournois */
export interface responseAllTournament {
  message: string,
  number_of_tournaments: number,
  status: number,
  tournaments: Tournament[]
}

/* Le model pour la réponse pour les infos d'un tournoi */
export interface responseTournament {
  message: string,
  status: number,
  tournament: Tournament
}
