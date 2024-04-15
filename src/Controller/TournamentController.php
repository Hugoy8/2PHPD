<?php

namespace App\Controller;

use App\Entity\Registration;
use App\Entity\SportMatch;
use App\Entity\Tournament;
use App\Manager\WebsocketManager;
use App\Repository\TournamentRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use WebSocket\BadOpcodeException;

#[Route('/api/')]
class TournamentController extends AbstractController
{
    // initialisation du websocketManager
    private $websocketManager;

    public function __construct(WebsocketManager $websocketManager)
    {
        $this->websocketManager = $websocketManager;
    }

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
    public function getAllTournaments(TournamentRepository $tournamentRepository, SerializerInterface $serializer): JsonResponse
    {

        $tournamentList = $tournamentRepository->findAll();

        foreach ($tournamentList as $tournament) {
            $tournament->status = $tournament->getStatus();
        }

        $jsonTournamentList = $serializer->serialize($tournamentList, 'json', ['groups' => 'getTournaments']);

        $response = [
            'message' => 'List of all tournaments',
            'number_of_tournaments' => count($tournamentList),
            'status' => Response::HTTP_OK,
            'tournaments' => json_decode($jsonTournamentList, true)
        ];

        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param SerializerInterface $serializer // SerializerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('tournaments/{id}', name: 'tournamentById', methods: ['GET'])]
    public function getTournamentById(int $id, SerializerInterface $serializer, EntityManagerInterface $em): JsonResponse
    {
        $tournament = $em->getRepository(Tournament::class)->find($id);
        if(!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, "Tournament not found");
        }

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
     * @param SerializerInterface $serializer // SerializerInterface object
     * @param ValidatorInterface $validator // ValidatorInterface object
     * @param EntityManagerInterface $em // EntityManagerInterface object
     * @return JsonResponse // JsonResponse object
     * @throws BadOpcodeException
     */
    #[Route('tournaments/{id}', name: 'updateTournament', methods: ['PUT'])]
    public function updateTournament(Request $request, int $id, SerializerInterface $serializer, ValidatorInterface $validator, EntityManagerInterface $em, UserRepository $userRepository): JsonResponse
    {
        $tournament = $em->getRepository(Tournament::class)->find($id);
        if(!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, "Tournament not found");
        }

        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot update a tournament you did not create");
        }

        $data = json_decode($request->getContent(), true);
        $context = ['object_to_populate' => $tournament, 'ignored_attributes' => ['organizer', 'winner']];
        $updatedTournament = $serializer->deserialize($request->getContent(), Tournament::class, 'json', $context);
        if (isset($data['winner'])) {
            $winner = $userRepository->find($data['winner']);
            if (!$winner) {
                throw new HttpException(Response::HTTP_BAD_REQUEST, "Invalid winner ID");
            }
            $registrations = $em->getRepository(Registration::class)->findBy(['tournament' => $tournament]);
            $isParticipant = false;
            foreach ($registrations as $registration) {
                if ($registration->getPlayer()->getId() === $winner->getId()) {
                    $isParticipant = true;
                    break;
                }
            }
            if (!$isParticipant) {
                throw new HttpException(Response::HTTP_BAD_REQUEST, "The winner must be a participant of the tournament");
            }
            $tournament->setWinner($winner);

            $this->websocketManager->sendMessageToRoom($winner->getId(), "Congratulation 🎉 You won the tournament ".$tournament->getTournamentName());

            $registrations = $em->getRepository(Registration::class)->findBy([
                'tournament' => $tournament,
                'status' => 'registered'
            ]);

            foreach ($registrations as $registration) {
                if ($registration->getPlayer()->getId() === $winner->getId()) {
                    continue;
                }

                $this->websocketManager->sendMessageToRoom(
                    $registration->getPlayer()->getId(),
                    "The tournament ".$tournament->getTournamentName()." has ended. The winner is ".$winner->getFirstName()." ".$winner->getLastName()
                );
            }


        }

        if (isset($data['organizer'])) {
            $organizer = $userRepository->find($data['organizer']);
            if (!$organizer) {
                throw new HttpException(Response::HTTP_BAD_REQUEST, "Invalid organizer ID");
            }
            $tournament->setOrganizer($organizer);
        }

        $error = $validator->validate($updatedTournament);
        if (count($error) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, $error[0]->getMessage());
        }

        $em->persist($updatedTournament);
        $em->flush();
        $response = [
            'message' => 'Tournament updated successfully',
            'status' => Response::HTTP_OK,
        ];

        return new JsonResponse($response, Response::HTTP_OK);
    }



    /**
     * @param EntityManagerInterface $em // EntityManagerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('tournaments/{id}', name: 'deleteTournament', methods: ['DELETE'])]
    public function deleteTournament(int $id, EntityManagerInterface $em): JsonResponse
    {
        $tournament = $em->getRepository(Tournament::class)->find($id);
        if(!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, "Tournament not found");
        }
        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot delete a tournament you did not create");
        }

        $sportMatches = $em->getRepository(SportMatch::class)->findBy(['tournament' => $tournament]);

        foreach ($sportMatches as $sportMatch) {
            $em->remove($sportMatch);
        }

        $registrations = $em->getRepository(Registration::class)->findBy(['tournament' => $tournament]);

        foreach ($registrations as $registration) {
            $em->remove($registration);
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
