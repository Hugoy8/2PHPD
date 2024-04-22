<?php

namespace App\DataFixtures;

use App\Entity\Tournament;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class TournamentFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();

        for ($i = 0; $i < 5; $i++) {
            $tournament = new Tournament();
            $tournament->setTournamentName($faker->word . ' Tournament');
            $startDate = $faker->dateTimeThisYear;
            $tournament->setStartDate($startDate);
            $endDate = clone $startDate;
            $endDate->modify('+' . rand(1, 30) . ' days');
            $tournament->setEndDate($endDate);
            $tournament->setLocation($faker->city);
            $tournament->setDescription($faker->sentence);
            $tournament->setMaxParticipants($faker->numberBetween(5, 30));
            $tournament->setSport($faker->randomElement(['Football', 'Tennis', 'Basketball']));
            $tournament->setOrganizer($this->getReference('user'.rand(0,9)));
            $manager->persist($tournament);

            $this->addReference('tournament' . $i, $tournament);
        }

        $manager->flush();
    }

    public function getDependencies()
    {
        return [
            UserFixtures::class,
        ];
    }
}