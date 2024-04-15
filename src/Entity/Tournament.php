<?php

namespace App\Entity;

use App\Repository\TournamentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TournamentRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_TOURNAMENT_NAME', columns: ['tournament_name'])]
#[UniqueEntity(fields: ['tournamentName'], message: 'Tournament name already taken')]
class Tournament
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'Tournament name is required')]
    #[Assert\Length(min: 1, max: 255,
        minMessage: 'The tournament name must be at least 1 character long',
        maxMessage: 'The tournament name must be at most 255 characters long')]
    private ?string $tournamentName = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'Start date is required')]
    #[Assert\Expression(
        expression: 'this.getEndDate() >= value',
        message: 'The start date must be before the end date'
    )]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'End date is required')]
    #[Assert\Expression(
        expression: 'this.getStartDate() <= value',
        message: 'The end date must be after the start date'
    )]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\Length(min: 1, max: 255,
        minMessage: 'The location must be at least 1 character long',
        maxMessage: 'The location must be at most 255 characters long')]
    private ?string $location = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'Description is required')]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'maxParticipants is required')]
    private ?int $maxParticipants = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'Sport is required')]
    #[Assert\Length(min: 1, max: 255,
        minMessage: 'The sport must be at least 1 character long',
        maxMessage: 'The sport must be at most 255 characters long')]
    private ?string $sport = null;

    #[ORM\ManyToOne(cascade: ["persist"])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    private ?User $organizer = null;

    #[ORM\ManyToOne(cascade: ["persist"])]
    #[Groups(['getTournaments', 'getRegistrations', 'getSportMatchs'])]
    private ?User $winner = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTournamentName(): ?string
    {
        return $this->tournamentName;
    }

    public function setTournamentName(string $tournamentName): static
    {
        $this->tournamentName = $tournamentName;

        return $this;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeInterface $endDate): static
    {
        $this->endDate = $endDate;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getMaxParticipants(): ?int
    {
        return $this->maxParticipants;
    }

    public function setMaxParticipants(int $maxParticipants): static
    {
        $this->maxParticipants = $maxParticipants;

        return $this;
    }

    public function getSport(): ?string
    {
        return $this->sport;
    }

    public function setSport(string $sport): static
    {
        $this->sport = $sport;

        return $this;
    }

    public function getOrganizer(): ?User
    {
        return $this->organizer;
    }

    public function setOrganizer(?User $organizer): static
    {
        $this->organizer = $organizer;

        return $this;
    }

    public function getWinner(): ?User
    {
        return $this->winner;
    }

    public function setWinner(?User $winner): static
    {
        $this->winner = $winner;

        return $this;
    }

    #[Groups(['getTournaments'])]
    public function getStatus(): ?string
    {
        $now = new \DateTime();

        if ($this->startDate > $now) {
            return 'Upcoming';
        } elseif ($this->endDate >= $now) {
            return 'Ongoing';
        } else {
            return 'Finished';
        }
    }


}
