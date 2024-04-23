<?php

namespace App\Entity;

use App\Repository\SportMatchRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SportMatchRepository::class)]
class SportMatch
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['getSportMatchs'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['getSportMatchs'])]
    #[Assert\NotBlank(message: 'Tournament is required')]
    private ?Tournament $tournament = null;

    #[ORM\ManyToOne(cascade: ["persist"])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['getSportMatchs'])]
    #[Assert\NotBlank(message: 'Player 1 is required')]
    private ?User $player1 = null;

    #[ORM\ManyToOne(cascade: ["persist"])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['getSportMatchs'])]
    #[Assert\NotBlank(message: 'Player 2 is required')]
    private ?User $player2 = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['getSportMatchs'])]
    #[Assert\NotBlank(message: 'Match date is required')]
    private ?\DateTimeInterface $matchDate = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['getSportMatchs'])]
    #[Assert\PositiveOrZero(message: 'Score must be a positive number or zero')]
    private ?int $scorePlayer1 = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['getSportMatchs'])]
    #[Assert\PositiveOrZero(message: 'Score must be a positive number or zero')]
    private ?int $scorePlayer2 = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getSportMatchs'])]
    #[Assert\NotBlank(message: 'Status is required')]
    #[Assert\Length(min: 1, max: 255, minMessage: 'The status must be at least 1 character long', maxMessage: 'The status must be at most 255 characters long')]
    private ?string $status = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTournament(): ?Tournament
    {
        return $this->tournament;
    }

    public function setTournament(?Tournament $tournament): static
    {
        $this->tournament = $tournament;

        return $this;
    }

    public function getPlayer1(): ?User
    {
        return $this->player1;
    }

    public function setPlayer1(?User $player1): static
    {
        $this->player1 = $player1;

        return $this;
    }

    public function getPlayer2(): ?User
    {
        return $this->player2;
    }

    public function setPlayer2(?User $player2): static
    {
        $this->player2 = $player2;

        return $this;
    }

    public function getMatchDate(): ?\DateTimeInterface
    {
        return $this->matchDate;
    }

    public function setMatchDate(\DateTimeInterface $matchDate): static
    {
        $this->matchDate = $matchDate;

        return $this;
    }

    public function getScorePlayer1(): ?int
    {
        return $this->scorePlayer1;
    }

    public function setScorePlayer1(?int $scorePlayer1): static
    {
        $this->scorePlayer1 = $scorePlayer1;

        return $this;
    }

    public function getScorePlayer2(): ?int
    {
        return $this->scorePlayer2;
    }

    public function setScorePlayer2(?int $scorePlayer2): static
    {
        $this->scorePlayer2 = $scorePlayer2;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getWinner(): ?User
    {
        if ($this->getStatus() !== 'Finished') {
            return null;
        }

        if ($this->getScorePlayer1() > $this->getScorePlayer2()) {
            return $this->getPlayer1();
        } else if ($this->getScorePlayer1() < $this->getScorePlayer2()) {
            return $this->getPlayer2();
        } else {
            return null;
        }
    }
}
