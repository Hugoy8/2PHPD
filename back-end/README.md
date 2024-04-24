# Tournois de sport - Scorelt

Ce projet est un site web permettant de gérer des tournois de sport. 
Il permet de créer des tournois, des joueurs, des matchs et de saisir les scores des matchs.

## Prérequis

- [PHP](https://nodejs.org/en/download/) (Version recommandée: 8.2)
- [Composer](https://angular.io/cli) (Dernière version)
- [Symfony CLI](https://docker.com/) (Version recommandée: 6.4)
- [WAMP](https://www.wampserver.com/en/) ou [XAMP](https://www.apachefriends.org/index.html) pour la gestion des bases de données

## Installation

Commandes nécessaires pour installer le projet : 

1. **Clonez le dépôt Git :**
   ```bash
   git clone https://github.com/Hugoy8/2PHPD.git
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
