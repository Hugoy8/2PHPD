<?php

namespace App\Command;

use App\Entity\SportMatch;
use App\Entity\Tournament;
use App\Entity\User;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Doctrine\ORM\EntityManagerInterface;

#[AsCommand(
    name: 'app:get-matchs-results',
    description: 'Get all matchs results for a player.',
)]
class GetMatchsResultsCommand extends Command
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct();
        $this->em = $em;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('idPlayer', InputArgument::REQUIRED, 'Argument player id')
            ->addArgument('idTournament', InputArgument::OPTIONAL, 'Argument tournament id')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $idPlayer = $input->getArgument('idPlayer');
        $idTournament = $input->getArgument('idTournament');

        $playerRepository = $this->em->getRepository(User::class);
        $player = $playerRepository->find($idPlayer);

        if (!$player) {
            $io->error(sprintf('Player with id %s does not exist', $idPlayer));
            return Command::FAILURE;
        }

        if ($idTournament) {
            $tournamentRepository = $this->em->getRepository(Tournament::class);
            $tournament = $tournamentRepository->find($idTournament);

            if (!$tournament) {
                $io->error(sprintf('Tournament with id %s does not exist', $idTournament));
                return Command::FAILURE;
            }
        }

        $matchRepository = $this->em->getRepository(SportMatch::class);
        $matches = $matchRepository->findByPlayer($idPlayer, $idTournament);
        if (!$matches) {
            $io->warning(sprintf('Player %s has no matchs', $idPlayer));
            return Command::SUCCESS;
        }
        $wins = 0;
        $losses = 0;
        $draws = 0;

        foreach ($matches as $match) {
            if ($match->getStatus() === 'finished') {
                if ($match->getWinner() && (int)$match->getWinner()->getId() === (int)$idPlayer) {
                    $wins++;
                } elseif ($match->getScorePlayer1() === $match->getScorePlayer2()) {
                    $draws++;
                } else {
                    $losses++;
                }
            }
        }

        if (!$idTournament) {
            $io->success(sprintf('Player %s has %d wins, %d draws and %d losses', $idPlayer, $wins, $draws, $losses));
            return Command::SUCCESS;

        } else {
            $io->success(sprintf('Player %s has %d wins, %d draws and %d losses in tournament %s', $idPlayer, $wins, $draws, $losses, $idTournament));
            return Command::SUCCESS;

        }
    }
}
