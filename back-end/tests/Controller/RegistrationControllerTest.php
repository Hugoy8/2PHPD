<?php

namespace App\Tests\Controller;

use App\Entity\Registration;
use App\Entity\Tournament;
use App\Entity\User;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class RegistrationControllerTest extends WebTestCase
{
    public function testAddition()
    {
        $this->assertEquals(2, 1 + 1);
    }

    public function testGetAllRegistrationsForTournament()
    {
        $client = static::createClient();
        $client->request('GET', '/api/tournaments/1/registrations');

        $this->assertEquals(500, $client->getResponse()->getStatusCode());
    }

    public function testCreateRegistrationForTournament()
    {
        $client = static::createClient();
        $client->request('POST', '/api/tournaments/1/registrations', [], [], [], json_encode([
            'player' => 1
        ]));

        $this->assertEquals(500, $client->getResponse()->getStatusCode());
    }

    public function testDeleteRegistrationForTournament()
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/tournaments/1/registrations/1');

        $this->assertEquals(500, $client->getResponse()->getStatusCode());
    }



    protected static function getKernelClass(): string
    {
        return \App\Kernel::class;
    }


}