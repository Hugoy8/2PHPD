<?php

namespace App\DataFixtures;

use App\Entity\SportMatch;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class MatchFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();

        for ($i = 0; $i < 15; $i++) {
            $match = new SportMatch();
            $match->setTournament($this->getReference('tournament'.rand(0,4)));
            $match->setPlayer1($this->getReference('user'.rand(0,9)));
            $match->setPlayer2($this->getReference('user'.rand(0,9)));
            $match->setMatchDate($faker->dateTimeThisYear);
            $match->setScorePlayer1($faker->numberBetween(0,5));
            $match->setScorePlayer2($faker->numberBetween(0,5));
            $match->setStatus($faker->randomElement(['Finished', 'On going', 'Pending']));
            $manager->persist($match);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            TournamentFixtures::class,
            UserFixtures::class
        ];
    }
}