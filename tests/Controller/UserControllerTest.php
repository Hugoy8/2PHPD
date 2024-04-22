<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use Symfony\Component\HttpFoundation\Response;

class UserControllerTest extends WebTestCase
{
    private $client = null;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->client->disableReboot();
    }

    public function testRegister(): void
    {
        $data = [
            'firstName' => 'John',
            'lastName' => 'Doe',
            'username' => 'johndoe',
            'emailAddress' => 'johndoe@example.com',
            'password' => 'securepassword123'
        ];

        $this->client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($data)
        );

        $this->assertEquals(Response::HTTP_CREATED, $this->client->getResponse()->getStatusCode());
    }

    public function testGetAllUsers(): void
    {
        $this->client->request('GET', '/api/players');
        $response = $this->client->getResponse();

        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());
    }

    public function testDeleteUser(): void
    {
        // Assuming we are deleting a user with id=1
        $this->client->request('DELETE', '/api/players/1');
        $response = $this->client->getResponse();

        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertJson($response->getContent());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('User deleted successfully', $responseData['message']);
    }

    protected function tearDown(): void
    {
        $this->client = null;
    }
}