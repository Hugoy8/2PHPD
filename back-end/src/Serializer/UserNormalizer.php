<?php

namespace App\Serializer;

use App\Entity\User;
use Symfony\Component\Serializer\Normalizer\ContextAwareNormalizerInterface;

class UserNormalizer implements ContextAwareNormalizerInterface
{
    public function normalize($object, string $format = null, array $context = []): array
    {
        return [
            'id' => $object->getId(),
            'firstName' => $object->getFirstName(),
            'lastName' => $object->getLastName(),
            'emailAddress' => $object->getEmailAddress(),
            'username' => $object->getPseudo(),
            'status' => $object->getStatus(),
            'roles' => $object->getRoles(),
        ];
    }

    public function supportsNormalization($data, string $format = null, array $context = []): bool
    {
        return $data instanceof User;
    }
}