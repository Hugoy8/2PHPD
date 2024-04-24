import {User} from "../user/user.model";
import {Tournament} from "./tournament.model";

/* Le model d'un match pour un tournoi */
export interface Match {
  id: number,
  tournament: Tournament,
  player1: User,
  player2: User,
  matchDate: string,
  scorePlayer1: number,
  scorePlayer2: number,
  status: 'Finished' | 'On going' | 'Pending'
}

/* Réponse de tous les matchs d'un tournoi */
export interface allMatchsTournament {
  message: string,
  number_of_sport_matchs: number,
  status: number,
  sport_matchs: Match[]
}
