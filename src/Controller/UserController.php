<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/')]
class UserController extends AbstractController
{
    /**
     * @param Request $request // Request object
     * @param UserPasswordHasherInterface $passwordHasher // UserPasswordHasherInterface object
     * @param SerializerInterface $serializer // SerializerInterface object
     * @param ValidatorInterface $validator // ValidatorInterface object
     * @param EntityManagerInterface $em // EntityManagerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('register', name: 'register', methods: ['POST'])]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, SerializerInterface $serializer,
                             ValidatorInterface $validator, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $requiredFields = ['firstName', 'lastName', 'username', 'emailAddress', 'password'];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                throw new HttpException(Response::HTTP_BAD_REQUEST, "Missing required field: $field");
            }
        }

        $user = new User();
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setUsername($data['username']);
        $user->setEmailAddress($data['emailAddress']);
        $user->setPassword($data['password']);
        $user->setRoles(['ROLE_USER']);
        $user->setStatus('active');


        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, $errors[0]->getMessage());
        }

        $user->setPassword($passwordHasher->hashPassword($user, $user->getPassword()));

        $em->persist($user);
        $em->flush();
        $jsonUser = $serializer->serialize($user, 'json', ['groups' => 'getPlayers']);
        $response = [
            'message' => 'User created successfully',
            'status' => Response::HTTP_CREATED,
            'user' => json_decode($jsonUser, true)
        ];
        return new JsonResponse($response, Response::HTTP_CREATED);
    }

    /**
     * @param UserRepository $userRepository // UserRepository object
     * @param SerializerInterface $serializer // SerializerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('players', name: 'allPlayers', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN', message: "Only admins can access this route")]
    public function getAllUsers(UserRepository $userRepository, SerializerInterface $serializer): JsonResponse
    {
        $userList = $userRepository->findAll();
        $jsonUserList = $serializer->serialize($userList, 'json', ['groups' => 'getPlayers']);
        $response = [
            'message' => 'List of all users',
            'status' => Response::HTTP_OK,
            'users' => json_decode($jsonUserList, true)
        ];
        return new JsonResponse($response, Response::HTTP_OK);

    }

    /**
     * @param User $user // User object
     * @param SerializerInterface $serializer // SerializerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('players/{id}', name: 'playerById', methods: ['GET'])]
    public function getUserById(User $user, SerializerInterface $serializer): JsonResponse
    {
        $jsonUser = $serializer->serialize($user, 'json', ['groups' => 'getPlayers']);

        $response = [
            'message' => 'User found',
            'status' => Response::HTTP_OK,
            'user' => json_decode($jsonUser, true)
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param Request $request // Request object
     * @param User $user // User object
     * @param SerializerInterface $serializer // SerializerInterface object
     * @param ValidatorInterface $validator // ValidatorInterface object
     * @param UserPasswordHasherInterface $passwordHasher // UserPasswordHasherInterface object
     * @param EntityManagerInterface $em // EntityManagerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('players/{id}', name: 'updatePlayer', methods: ['PUT'])]
    public function updateUser(Request $request, User $user, SerializerInterface $serializer, ValidatorInterface $validator,
                               UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot update another user");
        }

        $updatedUser = $serializer->deserialize($request->getContent(), User::class, 'json', ['object_to_populate' => $user]);

        $errors = $validator->validate($user);
        if (count($errors) > 0) {
            throw new HttpException(Response::HTTP_BAD_REQUEST, $errors[0]->getMessage());
        }

        if ($updatedUser->getPassword()) {
            $updatedUser->setPassword($passwordHasher->hashPassword($updatedUser, $updatedUser->getPassword()));
        }

        $em->persist($updatedUser);
        $em->flush();

        $response = [
            'message' => 'User updated successfully',
            'status' => Response::HTTP_OK
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }

    /**
     * @param User $user // User object
     * @param EntityManagerInterface $em // EntityManagerInterface object
     * @return JsonResponse // JsonResponse object
     */
    #[Route('players/{id}', name: 'deletePlayer', methods: ['DELETE'])]
    public function deleteUser(User $user, EntityManagerInterface $em): JsonResponse
    {
        $currentUser = $this->getUser();
        if ($currentUser->getId() !== $user->getId() && !in_array('ROLE_ADMIN', $currentUser->getRoles())) {
            throw new HttpException(Response::HTTP_FORBIDDEN, "You cannot delete another user");
        }

        $em->remove($user);
        $em->flush();
        $response = [
            'message' => 'User deleted successfully',
            'status' => Response::HTTP_OK
        ];
        return new JsonResponse($response, Response::HTTP_OK);
    }
}
