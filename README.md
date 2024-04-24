# Scorelt - Gestion de Tournoi Sportif

Scorelt est une application web développée avec Angular 17, destinée à la gestion de tournois sportifs. Elle offre aux administrateurs la possibilité de créer, de suivre et de gérer des tournois et matchs efficacement.

# Back-End
## Prérequis

- [PHP](https://nodejs.org/en/download/) (Version recommandée: 8.2)
- [Composer](https://angular.io/cli) (Dernière version)
- [Symfony CLI](https://docker.com/) (Version recommandée: 6.4)
- [WAMP](https://www.wampserver.com/en/) ou [XAMP](https://www.apachefriends.org/index.html) pour la gestion des bases de données

## Installation

Commandes nécessaires pour installer le projet : 

1. **Clonez le dépôt Git :**
   ```bash
   git clone https://github.com/Hugoy8/Scorelt.git
   git checkout back
   ```

2. **Installez les dépendances :**
   ```bash
   composer install
   ```

3. **Mettre à jour les dépendances :**
   ```bash
   composer update
   ```

## Configuration de la base de données

1. Lancez WAMP ou XAMP.
2. Créez un utilisateur avec les droits admin sur la base de données.
3. Modifiez le fichier `.env.local` pour la configuration de la base de données `DATABASE_URL`.

## Création de la base de données

1. Créez la base de données : `php bin/console doctrine:database:create`
2. Créez les tables : `php bin/console doctrine:schema:update --force`
3. Créez les fixtures : `php bin/console doctrine:fixture:load`

## Lancement du serveur


1. Lancez le serveur :
   ```bash
   symfony server:start
   ```
2. Lancez le serveur websocket : 
   ```bash
   php bin/console websocket:serveur
   ```

## Commandes utiles

- Pour récupérer les stats de partie d'un joueur : `php bin/console app:get-matchs-results {idPlayer} {idTournament}` (le tournoi peut être null)

## Lancer les tests

Pour lancer les tests unitaires :

   ```bash
   ./vendor/bin/phpunit
   ```

## Documentation

Consultez la documentation pour plus d'informations sur l'utilisation de l'API et du websocket.
Le lien d'invitation du [postman](https://app.getpostman.com/join-team?invite_code=8690c97027d49d73ab3535f9bc3eefe9&target_code=a03aed0c19ae5254516ddf5c9fc50000) pour tester l'API.

# Front-End 
## Prérequis

Avant d'installer et de lancer Scorelt, vous devez vous assurer que les outils suivants sont installés sur votre système :

- [Node.js](https://nodejs.org/en/download/) (Version recommandée: 14.x ou plus)
- [Angular CLI](https://angular.io/cli) (Version 17)
- [Docker](https://docker.com/) pour la gestion des conteneurs

## Installation

Suivez ces étapes pour installer et configurer Scorelt :

1. **Clonez le dépôt Git :**
   ```bash
   git clone https://github.com/Hugoy8/Scorelt.git
   git checkout front
   ```

2. **Installez les dépendances :**
   ```bash
   npm install
   ```

3. **Configurez les variables d'environnement :**
   Modifier les fichiers `environment.ts`, `environment.development.ts` et `environment.staging.ts` selon votre environnement de développement.

## Démarrage de l'application

Pour lancer l'application en développement :

```bash
ng serve
```

Ouvrez votre navigateur et allez à `http://localhost:4200/`. L'application se rechargera automatiquement si vous apportez des modifications aux fichiers sources.

## Déploiement avec Docker

Pour construire et démarrer l'application avec Docker, utilisez les commandes suivantes :

```bash
docker-compose up --build
```

Cela construira l'image Docker de Scorelt et lancera tous les services nécessaires définis dans votre `docker-compose.yml`. Accédez à `http://localhost:4200/` pour voir l'application en action.

## Contribution

Nous encourageons la contribution à ce projet ! Si vous avez des suggestions ou des corrections, n'hésitez pas à soumettre une pull request ou ouvrir un issue.

## Licence

Ce projet est licencié sous les termes de la licence MIT.

## Contact

- **Hugo Ponthieux & Hugo Barbosa** - _hugoy8_ & _hugobrbs_
- **Lien du Projet** - [Scorelt GitHub](https://github.com/Hugoy8/2PHPD/tree/front)
