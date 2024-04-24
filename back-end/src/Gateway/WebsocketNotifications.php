<?php

namespace App\Gateway;

use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

class WebsocketNotifications implements MessageComponentInterface
{
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        echo "Server started\n";
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        $this->clients->attach($conn);
        $querystring = $conn->httpRequest->getUri()->getQuery();
        parse_str($querystring, $queryarray);

        // Ensure every connection has a room property, default to 'default-room'
        $conn->room = $queryarray['userId'] ?? 'default-room';
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            echo "Failed to decode JSON message.\n";
            return;
        }

        $room = $data['room'] ?? 'default-room';
        $message = $data['message'] ?? '';

        $recipients = 0;

        foreach ($this->clients as $client) {
            if ($from !== $client && $client->room === $room) {
                $client->send($message);
                $recipients++;
            }
        }

        echo "Message sent to $recipients client(s) in room $room\n";
    }



    public function onClose(ConnectionInterface $conn): void
    {
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected from room {$conn->room}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        echo "An error occurred: {$e->getMessage()}\n";
        if (isset($conn->room)) {
            echo "Error in room {$conn->room}\n";
        }
        $conn->close();
    }

    public function sendMessage(string $room, string $msg): void
    {
        echo "Attempting to send message to room $room: $msg\n";

        $clientCount = 0;
        foreach ($this->clients as $client) {
            if ($client->room === $room) {
                $clientCount++;
                $client->send($msg);
            }
        }

        echo "Message sent to $clientCount client(s) in room $room\n";
    }
}