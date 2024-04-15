<?php

namespace App\Manager;

use WebSocket\BadOpcodeException;
use WebSocket\Client;

class WebsocketManager
{
    private string $url;

    public function __construct(string $url = 'ws://localhost:8080')
    {
        $this->url = $url;
    }

    /**
     * Sends a message to a specific room on the websocket server.
     *
     * @param string $room The room identifier
     * @param string $msg The message to send
     * @throws BadOpcodeException
     */
    public function sendMessageToRoom(string $room, string $msg): void
    {
        $client = new Client($this->url);
        $message = json_encode(['room' => $room, 'message' => $msg]);
        $client->send($message);
    }
}