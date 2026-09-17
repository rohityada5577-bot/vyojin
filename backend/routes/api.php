<?php

use Illuminate\Support\Facades\Route;

// Public/API Controllers
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CouponController;

// Customer
use App\Http\Controllers\Api\V1\CustomerAuthController;

// Admin
use App\Http\Controllers\Api\V1\AdminAuthController;
use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\AdminOrderController;
use App\Http\Controllers\Api\V1\AdminCategoryController;
use App\Http\Controllers\Api\V1\AdminCustomerController;
use App\Http\Controllers\Api\V1\AdminCouponController;
use App\Http\Controllers\Api\V1\AdminAnalyticsController;






Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | PUBLIC
    |--------------------------------------------------------------------------
    */

    Route::get('/categories', [
        CategoryController::class,
        'index'
    ]);

    Route::get('/products', [
        ProductController::class,
        'index'
    ]);

    Route::get('/products/{slug}', [
        ProductController::class,
        'show'
    ]);


    /*
    |--------------------------------------------------------------------------
    | COUPONS
    |--------------------------------------------------------------------------
    */

    Route::post('/coupons/validate', [
        CouponController::class,
        'validateCoupon'
    ]);


    /*
    |--------------------------------------------------------------------------
    | ORDERS
    |--------------------------------------------------------------------------
    */

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/orders', [
        OrderController::class,
        'store'
    ]);

});

    Route::get('/orders/{orderNumber}', [
        OrderController::class,
        'show'
    ]);


    /*
    |--------------------------------------------------------------------------
    | PAYMENTS
    |--------------------------------------------------------------------------
    */

 /*
|--------------------------------------------------------------------------
| PAYMENTS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/payments/create', [
        PaymentController::class,
        'create'
    ]);

    Route::post('/payments/verify', [
        PaymentController::class,
        'verify'
    ]);

    Route::post('/payments/cancel', [
        PaymentController::class,
        'cancel'
    ]);

});


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    // Register
    Route::post('/customer/register', [
        CustomerAuthController::class,
        'register'
    ]);

    // Login
    Route::post('/customer/login', [
        CustomerAuthController::class,
        'login'
    ]);


    /*
    |--------------------------------------------------------------------------
    | PROTECTED CUSTOMER
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')
        ->prefix('customer')
        ->group(function () {

            /*
            |--------------------------------------------------------------------------
            | CUSTOMER PROFILE
            |--------------------------------------------------------------------------
            */

            // Current customer
            Route::get('/me', [
                CustomerAuthController::class,
                'me'
            ]);

            // Logout
            Route::post('/logout', [
                CustomerAuthController::class,
                'logout'
            ]);


            /*
            |--------------------------------------------------------------------------
            | CUSTOMER ORDERS
            |--------------------------------------------------------------------------
            */

            // All orders of logged-in customer
            Route::get('/orders', [
                OrderController::class,
                'customerOrders'
            ]);

            // Single order of logged-in customer
            Route::get('/orders/{orderNumber}', [
                OrderController::class,
                'customerOrder'
            ]);

        });


    /*
    |--------------------------------------------------------------------------
    | ADMIN LOGIN
    |--------------------------------------------------------------------------
    */

    Route::post('/admin/login', [
        AdminAuthController::class,
        'login'
    ]);


    /*
    |--------------------------------------------------------------------------
    | PROTECTED ADMIN
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')
        ->prefix('admin')
        ->group(function () {


            /*
            |--------------------------------------------------------------------------
            | ADMIN AUTHENTICATION
            |--------------------------------------------------------------------------
            */

            Route::get('/me', [
                AdminAuthController::class,
                'me'
            ]);

            Route::post('/logout', [
                AdminAuthController::class,
                'logout'
            ]);


            /*
            |--------------------------------------------------------------------------
            | DASHBOARD
            |--------------------------------------------------------------------------
            */

            Route::get('/dashboard', [
                AdminDashboardController::class,
                'index'
            ]);


            /*
            |--------------------------------------------------------------------------
            | PRODUCTS
            |--------------------------------------------------------------------------
            */

            Route::get('/products', [
                ProductController::class,
                'adminIndex'
            ]);

            Route::post('/products', [
                ProductController::class,
                'store'
            ]);

            Route::get('/products/{id}', [
                ProductController::class,
                'adminShow'
            ]);

            Route::match(
                ['put', 'post'],
                '/products/{id}',
                [ProductController::class, 'update']
            );

            Route::delete('/products/{id}', [
                ProductController::class,
                'destroy'
            ]);


            /*
            |--------------------------------------------------------------------------
            | ORDERS
            |--------------------------------------------------------------------------
            */

            Route::get('/orders', [
                AdminOrderController::class,
                'index'
            ]);

            Route::get('/orders/{id}', [
                AdminOrderController::class,
                'show'
            ]);

            Route::put('/orders/{id}/status', [
                AdminOrderController::class,
                'updateStatus'
            ]);


            /*
            |--------------------------------------------------------------------------
            | CATEGORIES
            |--------------------------------------------------------------------------
            */

            Route::get('/categories', [
                AdminCategoryController::class,
                'index'
            ]);

            Route::post('/categories', [
                AdminCategoryController::class,
                'store'
            ]);

            Route::get('/categories/{id}', [
                AdminCategoryController::class,
                'show'
            ]);

            Route::match(
                ['put', 'post'],
                '/categories/{id}',
                [AdminCategoryController::class, 'update']
            );

            Route::delete('/categories/{id}', [
                AdminCategoryController::class,
                'destroy'
            ]);


            /*
            |--------------------------------------------------------------------------
            | CUSTOMERS
            |--------------------------------------------------------------------------
            */

            Route::get('/customers', [
                AdminCustomerController::class,
                'index'
            ]);

            Route::get('/customers/{id}', [
                AdminCustomerController::class,
                'show'
            ]);


            /*
            |--------------------------------------------------------------------------
            | COUPONS
            |--------------------------------------------------------------------------
            */

            Route::get('/coupons', [
                AdminCouponController::class,
                'index'
            ]);

            Route::post('/coupons', [
                AdminCouponController::class,
                'store'
            ]);

            Route::get('/coupons/{id}', [
                AdminCouponController::class,
                'show'
            ]);

            Route::match(
                ['put', 'post'],
                '/coupons/{id}',
                [AdminCouponController::class, 'update']
            );

            Route::delete('/coupons/{id}', [
                AdminCouponController::class,
                'destroy'
            ]);

            Route::patch('/coupons/{id}/toggle', [
                AdminCouponController::class,
                'toggleStatus'
            ]);


            /*
            |--------------------------------------------------------------------------
            | ANALYTICS
            |--------------------------------------------------------------------------
            */

            Route::get('/analytics/sales', [
                AdminAnalyticsController::class,
                'sales'
            ]);

            Route::get('/analytics/top-products', [
                AdminAnalyticsController::class,
                'topProducts'
            ]);

            Route::get('/analytics/low-stock', [
                AdminAnalyticsController::class,
                'lowStock'
            ]);

        });

});