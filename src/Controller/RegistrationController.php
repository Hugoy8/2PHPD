<?php

namespace App\Controller;

use App\Entity\Registration;
use App\Entity\Tournament;
use App\Entity\User;
use App\Repository\RegistrationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tournaments/')]
class RegistrationController extends AbstractController
{
    /**
     * @param int $id
     * @param RegistrationRepository $registrationRepository
     * @param Tournament $tournament
     * @param SerializerInterface $serializer
     * @return JsonResponse
     */
    #[Route('{id}/registrations', name: 'allRegistrationsForTournament', methods: ['GET'])]
    public function getAllRegistrationsForTournament(int $id, RegistrationRepository $registrationRepository, Tournament $tournament,
                                                     SerializerInterface $serializer): JsonResponse
    {

        $jsonTournament = $serializer->serialize($tournament, 'json', ['groups' => 'getTournaments']);

        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $tournament->getOrganizer()->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot get the registration for a tournament you did not create");
        }

        $registrations = $registrationRepository->findBy(['tournament' => $id]);

        if (empty($registrations)) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'No registrations found for the tournament');
        }

        $jsonRegistrations = $serializer->serialize($registrations, 'json', ['groups' => 'getRegistrations']);

        $response = [
            'message' => 'All registrations for the tournament',
            'number_of_registrations' => count($registrations),
            'status' => Response::HTTP_OK,
            'registrations' => json_decode($jsonRegistrations, true)
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param int $id
     * @param Request $request
     * @param SerializerInterface $serializer
     * @param ValidatorInterface $validator
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('{id}/registrations', name: 'createRegistrationForTournament', methods: ['POST'])]
    public function createRegistrationForTournament(int $id, Request $request, SerializerInterface $serializer, ValidatorInterface $validator, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userId = $data['player'];
        $currentUser = $this->getUser();

        if ($currentUser->getId() !== $userId && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot create a registration for another player");
        }

        $user = $em->getRepository(User::class)->find($userId);
        if (!$user) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'User not found');
        }

        $tournament = $em->getRepository(Tournament::class)->find($id);
        if (!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Tournament not found');
        }

        // Check if the tournament is already closed
        if ($tournament->getStatus() === 'Finished') {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Tournament is already closed');
        }

        // Check if the tournament is already started
        if ($tournament->getStatus() === 'Ongoing') {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Tournament is already started');
        }

        // Set the player if already registered
        $existingRegistration = $em->getRepository(Registration::class)->findOneBy(['tournament' => $tournament, 'player' => $user]);
        if ($existingRegistration) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Player is already registered for this tournament');
        }

        // Get the number of registrations for the tournament
        $registrationCount = $em->getRepository(Registration::class)->count(['tournament' => $tournament]);

        // Check if the tournament is already full
        if ($registrationCount >= $tournament->getMaxParticipants()) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Tournament is already full');
        }

        $registration = $serializer->deserialize($request->getContent(), Registration::class, 'json');

        $registration->setPlayer($user);
        $registration->setTournament($tournament);
        $registration->setRegistrationDate(new \DateTime());
        $registration->setStatus('pending');

        $errors = $validator->validate($registration);
        if (count($errors) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, (string) $errors[0]->getMessage());
        }

        $em->persist($registration);
        $em->flush();

        $response = [
            'message' => 'Registration created successfully',
            'status' => Response::HTTP_CREATED,
        ];

        return new JsonResponse($response, Response::HTTP_CREATED);
    }

    /**
     * @param int $idTournament
     * @param int $idRegistration
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('{idTournament}/registrations/{idRegistration}', name: 'deleteRegistrationForTournament', methods: ['DELETE'])]
    public function deleteRegistrationForTournament($idTournament, $idRegistration, EntityManagerInterface $em): JsonResponse
    {
        $idTournament = (int)$idTournament;
        $idRegistration = (int)$idRegistration;

        if (!$idRegistration || !$idTournament) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Invalid registration or tournament id');
        }

        $currentUser = $this->getUser();

        $tournament = $em->getRepository(Tournament::class)->find($idTournament);
        if (!$tournament) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Tournament not found');
        }

        $registration = $em->getRepository(Registration::class)->find($idRegistration);
        if (!$registration) {
            throw new HttpException(Response::HTTP_NOT_FOUND, 'Registration not found');
        }

        if ($registration->getTournament()->getId() !== $tournament->getId()) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, 'Registration does not belong to the tournament');
        }

        if ($currentUser->getId() !== $registration->getPlayer()->getId() &&
            $currentUser->getId() !== $tournament->getOrganizer()->getId() &&
            !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot delete a registration for another player");
        }

        $em->remove($registration);
        $em->flush();

        $response = [
            'message' => 'Registration deleted successfully',
            'status' => Response::HTTP_OK
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }
}
