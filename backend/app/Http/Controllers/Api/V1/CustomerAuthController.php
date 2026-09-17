<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CustomerAuthController extends Controller
{
    /**
     * Register customer
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
            ],

            'email' => [
                'required',
                'email',
                'max:150',
                'unique:customers,email',
            ],

            'phone' => [
                'required',
                'string',
                'min:10',
                'max:15',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $customer = Customer::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'phone' => $validated['phone'],
            'password' => $validated['password'],
            'is_active' => true,
        ]);

        $token = $customer->createToken('customer-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'data' => [
                'customer' => $this->customerData($customer),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login customer
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],
        ]);

        $customer = Customer::where(
            'email',
            strtolower($validated['email'])
        )->first();

        if (
            !$customer ||
            !Hash::check($validated['password'], $customer->password)
        ) {
            throw ValidationException::withMessages([
                'email' => ['The email or password is incorrect.'],
            ]);
        }

        if (!$customer->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is currently inactive.',
            ], 403);
        }

        // Remove previous customer tokens
        $customer->tokens()->delete();

        $token = $customer->createToken('customer-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'customer' => $this->customerData($customer),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Current logged-in customer
     */
    public function me(Request $request)
    {
        $customer = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => $this->customerData($customer),
            ],
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Customer response data
     */
    private function customerData(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'city' => $customer->city,
            'state' => $customer->state,
            'pincode' => $customer->pincode,
            'is_active' => $customer->is_active,
            'created_at' => $customer->created_at,
        ];
    }
}