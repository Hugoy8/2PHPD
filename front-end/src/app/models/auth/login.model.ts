// Model de réponse avec un succès lors de la connexion
export interface successLogin {
  token: string
}

// Model de réponse avec une erreur lors de la connexion
export interface errorLogin {
  statusCode: number,
  message: string,
  error: string
}
