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
    public function testCreateRegistrationForTournament()
    {
        echo getenv('CORS_ALLOW_ORIGIN');
        $client = static::createClient();
        $client->request('GET', '/api/tournaments/11');
        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    protected static function getKernelClass(): string
    {
        return \App\Kernel::class;
    }


}