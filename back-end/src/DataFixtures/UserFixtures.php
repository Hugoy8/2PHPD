<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Faker\Factory;

class UserFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // create a user
        $user = new User();
        $user->setFirstName('Hugo');
        $user->setLastName('Ponthieux');
        $user->setEmailAddress('user@tournamentapi.com');
        $user->setUsername('Hugoy');
        $user->setRoles(['ROLE_USER']);
        $user->setPassword($this->passwordHasher->hashPassword($user, 'password'));
        $user->setStatus('active');
        $manager->persist($user);

        $this->addReference('user', $user);

        // create an admin
        $admin = new User();
        $admin->setFirstName('Hugo');
        $admin->setLastName('Barbosa');
        $admin->setEmailAddress('admin@tournamentapi.com');
        $admin->setUsername('admin');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'Password123!'));
        $admin->setStatus('active');
        $manager->persist($admin);

        $this->addReference('admin', $admin);

        $faker = Factory::create();

        for ($i = 0; $i < 10; $i++) {
            $user = new User();
            $user->setFirstName($faker->firstName);
            $user->setLastName($faker->lastName);
            $user->setEmailAddress($faker->email);
            $user->setUsername($faker->userName);
            $user->setRoles($i % 2 == 0 ? ['ROLE_USER'] : ['ROLE_ADMIN']);
            $user->setPassword($this->passwordHasher->hashPassword($user, 'password123'));
            $user->setStatus('active');
            $manager->persist($user);

            $this->addReference('user' . $i, $user);
        }

        $manager->flush();
    }
}