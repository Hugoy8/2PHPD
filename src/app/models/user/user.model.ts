/* Le model d'un utilisateur sur l'application */
export interface User {
  id: number,
  firstName: string,
  lastName: string,
  username: string
  emailAddress: string,
  roles: ['ROLE_USER'] | ['ROLE_ADMIN'],
  status: 'active' | 'suspended' | 'banned'
}

/* Les informations qu'on recoit lorsqu'on récupère les données d'un utilisateur */
export interface UserInformation {
  status: number,
  message: string,
  user: User
}

/* Le model pour les différentes informations à modifier */
export interface UpdateUser {
  firstName?: string,
  lastName?: string,
  username?: string,
  emailAddress?: string
}
