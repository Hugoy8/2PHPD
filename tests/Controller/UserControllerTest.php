<?php

namespace App\Tests\Controller;

use App\Controller\UserController;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UserControllerTest extends TestCase
{
    public function testCreateUser()
    {

        // Create a Request mock with the expected JSON content
        $requestContent = json_encode([
            'firstName' => 'Test',
            'lastName' => 'User',
            'username' => 'testuser',
            'emailAddress' => 'testuser@example.com',
            'password' => 'password123'
        ]);

        $requestMock = $this->createMock(Request::class);
        $requestMock->method('getContent')
            ->willReturn($requestContent);

        // Create the necessary mocks
        $entityManagerMock = $this->createMock(EntityManagerInterface::class);
        $passwordHasherMock = $this->createMock(UserPasswordHasherInterface::class);
        $serializerMock = $this->createMock(SerializerInterface::class);
        $validatorMock = $this->createMock(ValidatorInterface::class);

        // Mock the password hasher
        $passwordHasherMock->method('hashPassword')
            ->will($this->returnCallback(function ($user, $password) {
                return 'hashed_' . $password;
            }));

        // Set up the EntityManager to expect persisting a User object
        $entityManagerMock->expects($this->once())
            ->method('persist')
            ->with($this->callback(function ($user) {
                return $user instanceof User
                    && $user->getFirstName() === 'Test'
                    && $user->getLastName() === 'User'
                    && $user->getUsername() === 'testuser'
                    && $user->getEmailAddress() === 'testuser@example.com'
                    && $user->getPassword() === 'password123'; // The actual password won't be 'password123' because it's hashed
            }));

        $entityManagerMock->expects($this->once())
            ->method('flush');

        // Mock the Serializer to return a JSON representation of the User
        $serializerMock->method('serialize')
            ->willReturn('{"id":1,"firstName":"Test","lastName":"User","username":"testuser","emailAddress":"testuser@example.com","roles":["ROLE_USER"]}');

        // Instantiate the controller and call the register method
        $userController = new UserController();
        $response = $userController->register($requestMock, $passwordHasherMock, $serializerMock, $validatorMock, $entityManagerMock);

        // Perform the assertions to make sure everything worked as expected
        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(JsonResponse::HTTP_CREATED, $response->getStatusCode());
        $this->assertJsonStringEqualsJsonString(
            '{"message":"User created successfully","status":201,"user":{"id":1,"firstName":"Test","lastName":"User","username":"testuser","emailAddress":"testuser@example.com","roles":["ROLE_USER"]}}',
            $response->getContent()
        );
    }
}