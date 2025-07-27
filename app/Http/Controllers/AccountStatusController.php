<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountStatusController extends Controller
{
    /**
     * Show account inactive page
     */
    public function inactive()
    {
        return Inertia::render('auth/account-inactive');
    }
}
