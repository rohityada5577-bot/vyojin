<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class ShiprocketService
{
    private string $baseUrl;
    private ?string $token = null;

    public function __construct()
    {
        $this->baseUrl = config(
            'services.shiprocket.base_url',
            'https://apiv2.shiprocket.in/v1/external'
        );
    }

    /**
     * Get Shiprocket API token.
     */
    public function login(): string
    {
        $response = Http::post(
            $this->baseUrl . '/auth/login',
            [
                'email' => config('services.shiprocket.email'),
                'password' => config('services.shiprocket.password'),
            ]
        );

        if ($response->failed()) {
            throw new RuntimeException(
                'Shiprocket login failed: ' . $response->body()
            );
        }

        $token = $response->json('token');

        if (!$token) {
            throw new RuntimeException(
                'Shiprocket token was not returned.'
            );
        }

        return $this->token = $token;
    }

    /**
     * Get API token.
     */
    private function token(): string
    {
        if (!$this->token) {
            $this->login();
        }

        return $this->token;
    }

    /**
     * Create Shiprocket order.
     */
    public function createOrder(array $data): array
    {
        $response = Http::withToken($this->token())
            ->post(
                $this->baseUrl . '/orders/create/adhoc',
                $data
            );

        if ($response->failed()) {
            throw new RuntimeException(
                'Shiprocket order creation failed: ' . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Check available couriers.
     */
    public function checkServiceability(
        string $pickupPostcode,
        string $deliveryPostcode,
        float $weight,
        int $cod = 0
    ): array {
        $response = Http::withToken($this->token())
            ->get(
                $this->baseUrl . '/courier/serviceability/',
                [
                    'pickup_postcode' => $pickupPostcode,
                    'delivery_postcode' => $deliveryPostcode,
                    'weight' => $weight,
                    'cod' => $cod,
                ]
            );

        if ($response->failed()) {
            throw new RuntimeException(
                'Unable to check courier serviceability: ' .
                $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Assign AWB/courier.
     */
    public function assignCourier(
        int $shipmentId,
        ?int $courierId = null
    ): array {
        $payload = [
            'shipment_id' => $shipmentId,
        ];

        if ($courierId) {
            $payload['courier_id'] = $courierId;
        }

        $response = Http::withToken($this->token())
            ->post(
                $this->baseUrl . '/courier/assign/awb',
                $payload
            );

        if ($response->failed()) {
            throw new RuntimeException(
                'Courier assignment failed: ' . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Request pickup.
     */
    public function requestPickup(int $shipmentId): array
    {
        $response = Http::withToken($this->token())
            ->post(
                $this->baseUrl . '/courier/generate/pickup',
                [
                    'shipment_id' => $shipmentId,
                ]
            );

        if ($response->failed()) {
            throw new RuntimeException(
                'Pickup request failed: ' . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Track shipment.
     */
    public function trackShipment(string $awb): array
    {
        $response = Http::withToken($this->token())
            ->get(
                $this->baseUrl . '/courier/track/awb/' . $awb
            );

        if ($response->failed()) {
            throw new RuntimeException(
                'Tracking request failed: ' . $response->body()
            );
        }

        return $response->json();
    }
}