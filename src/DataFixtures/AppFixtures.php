<?php

namespace App\DataFixtures;

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

        $manager->flush();
    }
}
