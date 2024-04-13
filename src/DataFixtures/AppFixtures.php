<?php

namespace App\DataFixtures;

use App\Entity\Registration;
use App\Entity\Tournament;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private $userPasswordHasher;

    public function __construct(UserPasswordHasherInterface $userPasswordHasher)
    {
        $this->userPasswordHasher = $userPasswordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Création d'un utilisateur
        $user = new User();
        $user->setFirstName('Hugo');
        $user->setLastName('Ponthieux');
        $user->setEmailAddress('user@bookapi.com');
        $user->setUsername('Hugoy');
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($this->userPasswordHasher->hashPassword($user, 'password'));
        $user->setStatus('active');
        $manager->persist($user);

        // Création d'un utilisateur
        $user2 = new User();
        $user2->setFirstName('Adrien');
        $user2->setLastName('Czesnalowicz');
        $user2->setEmailAddress('user2@bookapi.com');
        $user2->setUsername('Hugoy');
        $user2->setRoles(['ROLE_USER']);
        $user2->setPassword($this->userPasswordHasher->hashPassword($user2, 'password'));
        $user2->setStatus('active');
        $manager->persist($user2);

        // Création d'un admin
        $userAdmin = new User();
        $userAdmin->setFirstName('Hugo');
        $userAdmin->setLastName('Barbosa');
        $userAdmin->setUsername('Noriz');
        $userAdmin->setEmailAddress('admin@bookapi.com');
        $userAdmin->setRoles(['ROLE_ADMIN']);
        $userAdmin->setPassword($this->userPasswordHasher->hashPassword($userAdmin, 'password'));
        $userAdmin->setStatus('active');
        $manager->persist($userAdmin);

        // Création de tournois
        $tournament1 = new Tournament();
        $tournament1->setTournamentName('Tournoi de foot');
        $tournament1->setStartDate(new \DateTime('2022-01-01'));
        $tournament1->setEndDate(new \DateTime('2022-01-02'));
        $tournament1->setLocation('Stade de France');
        $tournament1->setDescription('Tournoi de foot amateur');
        $tournament1->setMaxParticipants(22);
        $tournament1->setSport('Football');
        $tournament1->setOrganizer($user);
        $manager->persist($tournament1);

        $tournament2 = new Tournament();
        $tournament2->setTournamentName('Tournoi de tennis');
        $tournament2->setStartDate(new \DateTime('2024-06-06'));
        $tournament2->setEndDate(new \DateTime('2024-07-07'));
        $tournament2->setLocation('Open Australie');
        $tournament2->setDescription('Tournoi de tennis amateur');
        $tournament2->setMaxParticipants(10);
        $tournament2->setSport('Tennis');
        $tournament2->setOrganizer($user2);
        $manager->persist($tournament2);

        // Création d'inscriptions
        $registration1 = new Registration();
        $registration1->setPlayer($user);
        $registration1->setTournament($tournament1);
        $registration1->setRegistrationDate(new \DateTime('2021-12-01'));
        $registration1->setStatus('registered');
        $manager->persist($registration1);

        $registration2 = new Registration();
        $registration2->setPlayer($user2);
        $registration2->setTournament($tournament2);
        $registration2->setRegistrationDate(new \DateTime('2023-06-06'));
        $registration2->setStatus('registered');
        $manager->persist($registration2);

        $manager->flush();
    }
}
