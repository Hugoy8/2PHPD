<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="User",
 *     required={"firstName", "lastName", "username", "emailAddress", "password"},
 *     @OA\Property(
 *         property="firstName",
 *         type="string",
 *         description="The first name of the user"
 *     ),
 *     @OA\Property(
 *         property="lastName",
 *         type="string",
 *         description="The last name of the user"
 *     ),
 *     @OA\Property(
 *         property="username",
 *         type="string",
 *         description="The username of the user"
 *     ),
 *     @OA\Property(
 *         property="emailAddress",
 *         type="string",
 *         description="The email address of the user"
 *     ),
 *     @OA\Property(
 *         property="password",
 *         type="string",
 *         description="The password of the user"
 *     )
 * )
 */
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_emailAddress_username', fields: ['emailAddress', 'username'])]
#[UniqueEntity(fields: ['username'], message: 'Username already taken')]
#[UniqueEntity(fields: ['emailAddress'], message: 'Email address already taken')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['getPlayers', 'getTournaments', 'getRegistrations', 'getSportMatchs'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getPlayers', 'getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'First name is required')]
    #[Assert\Length(min: 1, max: 255, minMessage: 'The first name must be at least 1 character long', maxMessage: 'The first name must be at most 255 characters long')]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getPlayers', 'getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'Last name is required')]
    #[Assert\Length(min: 1, max: 255, minMessage: 'The last name must be at least 1 character long', maxMessage: 'The last name must be at most 255 characters long')]
    private ?string $lastName = null;

    #[ORM\Column(length: 180)]
    #[Groups(['getPlayers', 'getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'Email address is required')]
    #[Assert\Length(min: 1, max: 180, minMessage: 'The email address must be at least 1 character long', maxMessage: 'The email address must be at most 180 characters long')]
    #[Assert\Email(message: 'The email address is not valid')]
    private ?string $emailAddress = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getPlayers', 'getTournaments', 'getRegistrations', 'getSportMatchs'])]
    #[Assert\NotBlank(message: 'Username is required')]
    #[Assert\Length(min: 1, max: 255, minMessage: 'The username must be at least 1 character long', maxMessage: 'The username must be at most 255 characters long')]
    private ?string $username = null;

    #[ORM\Column(length: 30)]
    #[Groups(['getPlayers'])]
    private ?string $status = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['getPlayers', 'getTournaments', 'getRegistrations', 'getSportMatchs'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Assert\NotBlank(message: 'Password is required')]
    #[Assert\Length(
        min: 8,
        max: 255,
        minMessage: 'The password must be at least 8 characters long',
        maxMessage: 'The password must be at most 255 characters long'
    )]
    #[Assert\Regex(
        pattern: '/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W]).+/',
        message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.'
    )]
    private ?string $password = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;

        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;

        return $this;
    }

    public function getEmailAddress(): ?string
    {
        return $this->emailAddress;
    }

    public function setEmailAddress(string $emailAddress): static
    {
        $this->emailAddress = $emailAddress;

        return $this;
    }


    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->emailAddress;
    }

    public function getUsername(): string {
        return $this->getUserIdentifier();
    }


    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getPseudo(): string
    {
        return $this->username;
    }

    /**
     * @see UserInterface
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

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

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->getId(),
            'firstName' => $this->getFirstName(),
            'lastName' => $this->getLastName(),
            'emailAddress' => $this->getEmailAddress(),
            'username' => $this->getPseudo(),
            'status' => $this->getStatus(),
            'roles' => $this->getRoles(),
        ];
    }
}
