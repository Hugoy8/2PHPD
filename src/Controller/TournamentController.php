<?php

namespace App\Controller;

use App\Entity\Tournament;
use App\Entity\User;
use App\Repository\TournamentRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/')]
class TournamentController extends AbstractController
{
    /**
     * @param Request $request
     * @param SerializerInterface $serializer // SerializerInterface object
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $em
     * @return JsonResponse // JsonResponse object
     */
    #[Route('tournaments', name: 'createTournament', methods: ['POST'])]
    public function createTournament(Request $request, SerializerInterface $serializer, ValidatorInterface $validator,
                                     EntityManagerInterface $em): JsonResponse
    {
        $tournament = $serializer->deserialize($request->getContent(), Tournament::class, 'json');

        $user = $this->getUser();
        $tournament->setOrganizer($user);

        $error = $validator->validate($tournament);
        if (count($error) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, $error[0]->getMessage());
        }

        $em->persist($tournament);
        $em->flush();

        $jsonTournament = $serializer->serialize($tournament, 'json', ['groups' => 'getTournaments']);
        $response = [
            'message' => 'Tournament created successfully',
            'status' => Response::HTTP_CREATED,
            'tournament' => json_decode($jsonTournament, true)
        ];

        return new JsonResponse($response, Response::HTTP_CREATED);
    }

    /**
     * @param TournamentRepository $tournamentRepository // TournamentRepository object
     * @param SerializerInterface $serializer // SerializerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('tournaments', name: 'allTournaments', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', message: "Only admins can access this route")]
    public function getAllTournaments(TournamentRepository $tournamentRepository, SerializerInterface $serializer): JsonResponse
    {
        $tournamentList = $tournamentRepository->findAll();

        foreach ($tournamentList as $tournament) {
            $tournament->status = $tournament->getStatus();
        }

        $jsonTournamentList = $serializer->serialize($tournamentList, 'json', ['groups' => 'getTournaments']);

        $response = [
            'message' => 'List of all tournaments',
            'status' => Response::HTTP_OK,
            'tournaments' => json_decode($jsonTournamentList, true)
        ];

        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param Tournament $tournament // Tournament object
     * @param SerializerInterface $serializer // SerializerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('tournaments/{id}', name: 'tournamentById', methods: ['GET'])]
    public function getTournamentById(Tournament $tournament, SerializerInterface $serializer): JsonResponse
    {
        $jsonTournament = $serializer->serialize($tournament, 'json', ['groups' => 'getTournaments']);

        $response = [
            'message' => 'Tournament found',
            'status' => Response::HTTP_OK,
            'tournament' => json_decode($jsonTournament, true)
        ];

        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param Request $request // Request object
     * @param Tournament $tournament // Tournament object
     * @param SerializerInterface $serializer // SerializerInterface object
     * @param ValidatorInterface $validator // ValidatorInterface object
     * @param EntityManagerInterface $em // EntityManagerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('tournaments/{id}', name: 'updateTournament', methods: ['PUT'])]
    public function updateTournament(Request $request, Tournament $tournament, SerializerInterface $serializer,
                                     ValidatorInterface $validator, EntityManagerInterface $em, UserRepository $userRepository): JsonResponse
    {
        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot update a tournament you did not create");
        }

        $data = json_decode($request->getContent(), true);
        if (isset($data['winner'])) {
            $winner = $userRepository->find($data['winner']);
            if (!$winner) {
                throw new HttpException(Response::HTTP_BAD_REQUEST, "Invalid winner ID");
            }
            $tournament->setWinner($winner);
        }

        $serializer->deserialize($request->getContent(), Tournament::class, 'json', ['object_to_populate' => $tournament, 'ignored_attributes' => ['winner', 'organizer']]);

        if (isset($data['organizer'])) {
            $organizer = $userRepository->find($data['organizer']);
            if (!$organizer) {
                throw new HttpException(Response::HTTP_BAD_REQUEST, "Invalid organizer ID");
            }
            $tournament->setOrganizer($organizer);
        }

        $error = $validator->validate($tournament);
        if (count($error) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, $error[0]->getMessage());
        }

        $em->persist($tournament);
        $em->flush();

        $response = [
            'message' => 'Tournament updated successfully',
            'status' => Response::HTTP_OK,
        ];

        return new JsonResponse($response, Response::HTTP_OK);
    }

    #[Route('tournaments/{id}', name: 'deleteTournament', methods: ['DELETE'])]
    public function deleteTournament(Tournament $tournament, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot delete a tournament you did not create");
        }

        $em->remove($tournament);
        $em->flush();

        $response = [
            'message' => 'Tournament deleted successfully',
            'status' => Response::HTTP_OK
        ];

        return new JsonResponse($response, Response::HTTP_OK);
    }

}
