<?php

namespace App\Controller;

use App\Entity\Registration;
use App\Entity\SportMatch;
use App\Entity\Tournament;
use App\Entity\User;
use App\Manager\WebsocketManager;
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

#[Route('/api/tournaments/')]
class SportMatchController extends AbstractController
{
    private $websocketManager;

    public function __construct(WebsocketManager $websocketManager)
    {
        $this->websocketManager = $websocketManager;
    }

    /**
     * @param int $id
     * @param SerializerInterface $serializer
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('{id}/sport-matchs', name: 'allSportMatchsFromTournament', methods: ['GET'])]
    public function getAllSportMatchsFromTournament($id, SerializerInterface $serializer, EntityManagerInterface $em): JsonResponse
    {
        if (!is_numeric($id)) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Invalid tournament ID');
        }

        $tournament = $em->getRepository(Tournament::class)->find($id);
        if (!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Tournament not found');
        }

        $sportMatchs = $em->getRepository(SportMatch::class)->findBy(['tournament' => $id]);

        if (empty($sportMatchs)) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'No sport matchs found for the tournament');
        }

        $jsonSportMatchs = $serializer->serialize($sportMatchs, 'json', ['groups' => 'getSportMatchs']);

        $response = [
            'message' => 'All sport matchs for the tournament',
            'number_of_sport_matchs' => count($sportMatchs),
            'status' => Response::HTTP_OK,
            'sport_matchs' => json_decode($jsonSportMatchs, true)
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param int $idTournament
     * @param int $idSportMatchs
     * @param SerializerInterface $serializer
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('{idTournament}/sport-matchs/{idSportMatchs}', name: 'getSportMatchFromTournament', methods: ['GET'])]
    public function getSportMatchFromTournament($idTournament, $idSportMatchs, SerializerInterface $serializer, EntityManagerInterface $em): JsonResponse
    {
        if (!is_numeric($idTournament) || !is_numeric($idSportMatchs)) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Invalid tournament ID or sport match ID');
        }

        $tournament = $em->getRepository(Tournament::class)->find($idTournament);
        if (!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Tournament not found');
        }

        $sportMatch = $em->getRepository(SportMatch::class)->findOneBy(['tournament' => $idTournament, 'id' => $idSportMatchs]);

        if (!$sportMatch) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Sport match not found for the tournament');
        }

        $jsonSportMatch = $serializer->serialize($sportMatch, 'json', ['groups' => 'getSportMatchs']);

        $response = [
            'message' => 'Sport match for the tournament',
            'status' => Response::HTTP_OK,
            'sport_match' => json_decode($jsonSportMatch, true)
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param int $id
     * @param SerializerInterface $serializer
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('{id}/sport-matchs', name: 'createSportMatchForTournament', methods: ['POST'])]
    public function createSportMatchForTournament($id, Request $request, SerializerInterface $serializer,
                                                  EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {

        $tournament = $em->getRepository(Tournament::class)->find($id);
        if (!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Tournament not found');
        }

        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot create a sport match for this tournament, you are not the organizer");
        }

        if ($tournament->getStatus() === 'Finished') {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Tournament is already closed');
        }

        $data = json_decode($request->getContent(), true);

        $player1 = $em->getRepository(User::class)->find($data['player1']);
        $player2 = $em->getRepository(User::class)->find($data['player2']);


        if (!$player1 || !$player2) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Player not found');
        }

        if ($player1->getId() === $player2->getId()) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Player 1 and Player 2 cannot be the same');
        }

        $player1Registration = $em->getRepository(Registration::class)->findOneBy(['player' => $player1, 'tournament' => $tournament, 'status' => 'registered']);
        $player2Registration = $em->getRepository(Registration::class)->findOneBy(['player' => $player2, 'tournament' => $tournament, 'status' => 'registered']);

        if (!$player1Registration || !$player2Registration) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Both players must be registered in the tournament');
        }

        if (!isset($data['matchDate'])) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'matchDate is required');
        }

        $matchDate = \DateTime::createFromFormat('Y-m-d', $data['matchDate']);
        if (!$matchDate) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Invalid matchDate format, expected format is Y-m-d');
        }

        $sportMatch = new SportMatch();
        $sportMatch->setTournament($tournament);
        $sportMatch->setPlayer1($player1);
        $sportMatch->setPlayer2($player2);
        $sportMatch->setMatchDate($matchDate);
        $sportMatch->setStatus("Pending");

        $errors = $validator->validate($sportMatch);
        if (count($errors) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, $errors[0]->getMessage());
        }

        $em->persist($sportMatch);
        $em->flush();

        $jsonSportMatch = $serializer->serialize($sportMatch, 'json', ['groups' => 'getSportMatchs']);

        $response = [
            'message' => 'Sport match created successfully',
            'status' => Response::HTTP_CREATED,
            'sport_match' => json_decode($jsonSportMatch, true)
        ];
        return new JsonResponse($response, Response::HTTP_CREATED);
    }

    /**
     * @param int $idTournament
     * @param int $idSportMatchs
     * @param Request $request
     * @param SerializerInterface $serializer
     * @param EntityManagerInterface $em
     * @param ValidatorInterface $validator
     * @return JsonResponse
     * @throws BadOpcodeException
     */
    #[Route('{idTournament}/sport-matchs/{idSportMatchs}', name: 'updateSportMatchFromTournament', methods: ['PUT'])]
    public function updateSportMatchFromTournament($idTournament, $idSportMatchs, Request $request, SerializerInterface $serializer,
                                                  EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        if (!is_numeric($idTournament) || !is_numeric($idSportMatchs)) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Invalid tournament ID or sport match ID');
        }

        $tournament = $em->getRepository(Tournament::class)->find($idTournament);
        if (!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Tournament not found');
        }

        $sportMatch = $em->getRepository(SportMatch::class)->findOneBy(['tournament' => $idTournament, 'id' => $idSportMatchs]);

        if (!$sportMatch) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Sport match not found for the tournament');
        }

        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            if ($currentUser->getId() !== $sportMatch->getPlayer1()->getId() && $currentUser->getId() !== $sportMatch->getPlayer2()->getId()) {
                throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot update a sport match for this tournament, you are not the organizer or a player in the match");
            }
        }

        $data = json_decode($request->getContent(), true);
        if (in_array('ROLE_ADMIN', $currentUser->getRoles()) || $currentUser->getId() === $tournament->getOrganizer()->getId()) {
            if (isset($data['scorePlayer1'])) {
                $sportMatch->setScorePlayer1($data['scorePlayer1']);
            }
            if (isset($data['scorePlayer2'])) {
                $sportMatch->setScorePlayer2($data['scorePlayer2']);
            }
            if ($sportMatch->getPlayer1()->getId() === $sportMatch->getPlayer2()->getId()) {
                throw new HttpException(Response::HTTP_BAD_REQUEST, 'Player 1 and Player 2 cannot be the same');
            }
            if (isset($data['matchDate'])) {
                $matchDate = \DateTime::createFromFormat('Y-m-d', $data['matchDate']);
                if (!$matchDate) {
                    throw new HttpException(Response::HTTP_BAD_REQUEST, "Invalid match date format. Expected format is Y-m-d");
                }
                if ($matchDate < $tournament->getStartDate() || $matchDate > $tournament->getEndDate()) {
                    throw new HttpException(Response::HTTP_BAD_REQUEST, "Match date must be within the tournament dates");
                }
                $sportMatch->setMatchDate($matchDate);
            }
        } elseif ($currentUser->getId() === $sportMatch->getPlayer1()->getId()) {
            if (isset($data['scorePlayer1']) && !isset($data['scorePlayer2'])) {
                $sportMatch->setScorePlayer1($data['scorePlayer1']);
                if ($sportMatch->getScorePlayer2() === null)
                    $messagePlayer2 = 'Your opponent has updated his score in the tournament ' . $tournament->getTournamentName() . ', please update your score';
                    $this->websocketManager->sendMessageToRoom($sportMatch->getPlayer2()->getId(), $messagePlayer2);

            } else {
                throw new HttpException(Response::HTTP_FORBIDDEN, "You are not allowed to update the other player's score");
            }
        } elseif ($currentUser->getId() === $sportMatch->getPlayer2()->getId()) {
            if (isset($data['scorePlayer2']) && !isset($data['scorePlayer1'])) {
                $sportMatch->setScorePlayer2($data['scorePlayer2']);
                if ($sportMatch->getScorePlayer1() === null) {
                    $messagePlayer1 = 'Your opponent has updated his score in the tournament ' . $tournament->getTournamentName() . ', please update your score';
                    $this->websocketManager->sendMessageToRoom($sportMatch->getPlayer1()->getId(), $messagePlayer1);
                }
            } else {
                throw new HttpException(Response::HTTP_FORBIDDEN, "You are not allowed to update the other player's score");
            }
        } else {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You are not authorized to update scores for this match");
        }

        if ($sportMatch->getScorePlayer1() !== null && $sportMatch->getScorePlayer2() !== null) {
            $sportMatch->setStatus('Finished');
        }

        elseif ($sportMatch->getMatchDate() === new \DateTime('now') || $sportMatch->getScorePlayer1() !== null || $sportMatch->getScorePlayer2() !== null) {
            $sportMatch->setStatus('Ongoing');
        }
        elseif ($sportMatch->getMatchDate() < new \DateTime('now')) {
            $sportMatch->setStatus('Finished');
        }
        else {
            $sportMatch->setStatus('Pending');
        }

        $updatedSportMatch = $serializer->denormalize($data, SportMatch::class, 'json', ['object_to_populate' => $sportMatch]);

        $errors = $validator->validate($updatedSportMatch);
        if (count($errors) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, $errors[0]->getMessage());
        }

        $em->persist($updatedSportMatch);
        $em->flush();

        $jsonSportMatch = $serializer->serialize($updatedSportMatch, 'json', ['groups' => 'getSportMatchs']);

        $response = [
            'message' => 'Sport match updated successfully',
            'status' => Response::HTTP_OK,
            'sport_match' => json_decode($jsonSportMatch, true)
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param int $idTournament
     * @param int $idSportMatchs
     * @param Request $request
     * @param SerializerInterface $serializer
     * @param EntityManagerInterface $em
     * @param ValidatorInterface $validator
     * @return JsonResponse
     */
    #[Route('{idTournament}/sport-matchs/{idSportMatchs}', name: 'deleteSportMatchFromTournament', methods: ['DELETE'])]
    public function deleteSportMatchFromTournament($idTournament, $idSportMatchs, Request $request, SerializerInterface $serializer,
                                                  EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {

        if (!is_numeric($idTournament) || !is_numeric($idSportMatchs)) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Invalid tournament ID or sport match ID');
        }

        $tournament = $em->getRepository(Tournament::class)->find($idTournament);
        if (!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Tournament not found');
        }


        $sportMatch = $em->getRepository(SportMatch::class)->findOneBy(['tournament' => $idTournament, 'id' => $idSportMatchs]);

        if (!$sportMatch) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Sport match not found for the tournament');
        }

        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot delete a sport match for this tournament");

        }

        $em->remove($sportMatch);
        $em->flush();

        $response = [
            'message' => 'Sport match deleted successfully',
            'status' => Response::HTTP_OK
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }
}
