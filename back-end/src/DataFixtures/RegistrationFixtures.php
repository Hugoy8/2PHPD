<?php

namespace App\DataFixtures;

use App\Entity\Registration;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class RegistrationFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();

        for ($i = 0; $i < 20; $i++) {
            $registration = new Registration();
            $registration->setPlayer($this->getReference('user'.rand(0,9)));
            $registration->setTournament($this->getReference('tournament'.rand(0,4)));
            $registration->setRegistrationDate($faker->dateTimeThisYear);
            $registration->setStatus($faker->randomElement(['registered', 'pending', 'refused']));
            $manager->persist($registration);
        }

        $manager->flush();
    }
    public function getDependencies()
    {
        return [
            TournamentFixtures::class,
        ];
    }
}