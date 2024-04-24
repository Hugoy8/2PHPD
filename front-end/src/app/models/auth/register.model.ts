import {User} from "../user/user.model";

// Model de réponse avec un succès lors de l'inscription
export interface successRegister {
  status: number,
  message: string,
  user: User
}
// Model de réponse avec une erreur lors de l'inscription
export interface errorRegister {
  statusCode: number,
  message: string[],
  error: string
}
