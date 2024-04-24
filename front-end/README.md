# Scorelt - Gestion de Tournoi Sportif

Scorelt est une application web développée avec Angular 17, destinée à la gestion de tournois sportifs. Elle offre aux administrateurs la possibilité de créer, de suivre et de gérer des tournois et matchs efficacement.

## Prérequis

Avant d'installer et de lancer Scorelt, vous devez vous assurer que les outils suivants sont installés sur votre système :

- [Node.js](https://nodejs.org/en/download/) (Version recommandée: 14.x ou plus)
- [Angular CLI](https://angular.io/cli) (Version 17)
- [Docker](https://docker.com/) pour la gestion des conteneurs

## Installation

Suivez ces étapes pour installer et configurer Scorelt :

1. **Clonez le dépôt Git :**
   ```bash
   git clone https://github.com/Hugoy8/2PHPD.git
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
