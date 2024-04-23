# Tournois de sport - Scorelt

Ce projet est un site web permettant de gérer des tournois de sport. 
Il permet de créer des tournois, des joueurs, des matchs et de saisir les scores des matchs.

## Prérequis

- PHP 8.2
- Composer
- Symfony CLI
- WAMP ou XAMP

## Installation

Commandes nécessaires pour installer le projet : 

1. Clonez le dépôt : `git clone https://github.com/user/repo.git`
2. Accédez au dossier du projet : `cd repo`
3. Installez les dépendances : `composer install`
4. Mettez à jour les dépendances : `composer update`

## Configuration de la base de données

1. Lancez WAMP ou XAMP.
2. Créez un utilisateur avec les droits admin sur la base de données.
3. Modifiez le fichier `.env.local` pour la configuration de la base de données.

## Création de la base de données

1. Créez la base de données : `php bin/console doctrine:database:create`
2. Créez les tables : `php bin/console doctrine:schema:update --force`
3. Créez les fixtures : `php bin/console doctrine:fixture:load`

## Lancement du serveur

1. Lancez le serveur : `symfony server:start`
2. Lancez le serveur websocket : `php bin/console websocket:serveur`

## Commandes utiles

- Pour récupérer les stats de partie d'un joueur : `php bin/console app:get-matchs-results {idPlayer} {idTournament}` (le tournoi peut être null)

## Documentation

Consultez la documentation pour plus d'informations sur l'utilisation de l'API et du websocket.