<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UserControllerTest extends WebTestCase
{
    public function testCreateUser()
    {
        $client = static::createClient();

        $playerId = 1;

        // Use correct method and endpoint for creating a user, assuming POST and `/api/users`
        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'John Doe', 'email' => 'john@example.com', 'password' => 'secure123'])
        );

        $response = $client->getResponse();

        $this->assertEquals(201, $response->getStatusCode(), "Expected HTTP status code 201 for user creation.");

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('id', $responseData, "Response should contain an 'id' field.");
        $this->assertEquals($playerId, $responseData['id'], "The returned user ID should match the requested.");
    }

    public function testCreateUserWithInvalidData()
    {
        $client = static::createClient();

        // Use correct method and endpoint for creating a user, assuming POST and `/api/users`
        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['name' => 'John Doe', 'email' => 'invalid-email', 'password' => 'secure123'])
        );

        $response = $client->getResponse();

        $this->assertEquals(400, $response->getStatusCode(), "Expected HTTP status code 400 for invalid user creation.");

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('message', $responseData, "Response should contain a 'message' field.");
        $this->assertEquals('Invalid data', $responseData['message'], "The returned message should indicate invalid data.");
    }

    public function isValueBetween($value, $min, $max)
    {
        $this->assertGreaterThanOrEqual($min, $value, "The value should be greater than or equal to $min.");
    }
}
