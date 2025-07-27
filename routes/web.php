<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\AccountStatusController;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::redirect('/', '/dashboard')->name('home');

// Account status routes (accessible without auth)
Route::get('/account/inactive', [AccountStatusController::class, 'inactive'])->name('account.inactive');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    // Main dashboard route - redirect based on role
    Route::get('dashboard', function () {
        $user = Auth::user();
        
        if ($user->hasRole('admin')) {
            return Inertia::render('dashboard', [
                'user' => $user,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ]);
        } else {
            // Redirect operator to mobile dashboard
            return redirect()->route('dashboard.operator');
        }
    })->name('dashboard');

    // Operator mobile dashboard
    Route::get('dashboard-operator', [App\Http\Controllers\DashboardOperatorController::class, 'index'])->name('dashboard.operator');

    // Profile routes (accessible by all authenticated users)
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');

    // Operator Reports Routes (accessible by users with 'user' role)
    Route::middleware(['role:user'])->group(function () {
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [App\Http\Controllers\OperatorReportController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\OperatorReportController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\OperatorReportController::class, 'store'])->name('store');
            Route::get('/{report}', [App\Http\Controllers\OperatorReportController::class, 'show'])->name('show');
            Route::get('/{report}/edit', [App\Http\Controllers\OperatorReportController::class, 'edit'])->name('edit');
            Route::put('/{report}', [App\Http\Controllers\OperatorReportController::class, 'update'])->name('update');
            Route::delete('/{report}', [App\Http\Controllers\OperatorReportController::class, 'destroy'])->name('destroy');
        });
    });

    // Admin only routes
    Route::middleware(['role:admin'])->group(function () {
        // User Management Routes
        Route::prefix('admin/users')->name('admin.users.')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('index');
            Route::post('/', [App\Http\Controllers\Admin\UserController::class, 'store'])->name('store');
            Route::put('/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('update');
            Route::delete('/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('destroy');
            Route::patch('/{user}/toggle-status', [App\Http\Controllers\Admin\UserController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Role Management Routes
        Route::prefix('admin/roles')->name('admin.roles.')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\RoleController::class, 'index'])->name('index');
            Route::post('/', [App\Http\Controllers\Admin\RoleController::class, 'store'])->name('store');
            Route::put('/{role}', [App\Http\Controllers\Admin\RoleController::class, 'update'])->name('update');
            Route::delete('/{role}', [App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('destroy');
            
            // Permission Management
            Route::get('/permissions', [App\Http\Controllers\Admin\RoleController::class, 'permissions'])->name('permissions.index');
            Route::post('/permissions', [App\Http\Controllers\Admin\RoleController::class, 'storePermission'])->name('permissions.store');
            Route::delete('/permissions/{permission}', [App\Http\Controllers\Admin\RoleController::class, 'destroyPermission'])->name('permissions.destroy');
        });

        // Master Data Routes
        Route::prefix('admin/master')->name('admin.master.')->group(function () {
            // Data Mesin
            Route::prefix('machines')->name('machines.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\MesinController::class, 'index'])->name('index');
                Route::post('/', [App\Http\Controllers\Admin\MesinController::class, 'store'])->name('store');
                Route::put('/{mesin}', [App\Http\Controllers\Admin\MesinController::class, 'update'])->name('update');
                Route::delete('/{mesin}', [App\Http\Controllers\Admin\MesinController::class, 'destroy'])->name('destroy');
                Route::patch('/{mesin}/toggle-status', [App\Http\Controllers\Admin\MesinController::class, 'toggleStatus'])->name('toggle-status');
            });

            // Data Shift
            Route::prefix('shifts')->name('shifts.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\ShiftController::class, 'index'])->name('index');
                Route::post('/', [App\Http\Controllers\Admin\ShiftController::class, 'store'])->name('store');
                Route::put('/{shift}', [App\Http\Controllers\Admin\ShiftController::class, 'update'])->name('update');
                Route::delete('/{shift}', [App\Http\Controllers\Admin\ShiftController::class, 'destroy'])->name('destroy');
                Route::patch('/{shift}/toggle-status', [App\Http\Controllers\Admin\ShiftController::class, 'toggleStatus'])->name('toggle-status');
            });

            // Jenis Kain
            Route::prefix('fabrics')->name('fabrics.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\JenisKainController::class, 'index'])->name('index');
                Route::post('/', [App\Http\Controllers\Admin\JenisKainController::class, 'store'])->name('store');
                Route::put('/{fabric}', [App\Http\Controllers\Admin\JenisKainController::class, 'update'])->name('update');
                Route::delete('/{fabric}', [App\Http\Controllers\Admin\JenisKainController::class, 'destroy'])->name('destroy');
                Route::patch('/{fabric}/toggle-status', [App\Http\Controllers\Admin\JenisKainController::class, 'toggleStatus'])->name('toggle-status');
            });

            // Line Produksi
            Route::prefix('lines')->name('lines.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\LineProduksiController::class, 'index'])->name('index');
                Route::post('/', [App\Http\Controllers\Admin\LineProduksiController::class, 'store'])->name('store');
                Route::put('/{line}', [App\Http\Controllers\Admin\LineProduksiController::class, 'update'])->name('update');
                Route::delete('/{line}', [App\Http\Controllers\Admin\LineProduksiController::class, 'destroy'])->name('destroy');
                Route::patch('/{line}/toggle-status', [App\Http\Controllers\Admin\LineProduksiController::class, 'toggleStatus'])->name('toggle-status');
            });

            // Customer
            Route::prefix('customers')->name('customers.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\CustomerController::class, 'index'])->name('index');
                Route::post('/', [App\Http\Controllers\Admin\CustomerController::class, 'store'])->name('store');
                Route::put('/{customer}', [App\Http\Controllers\Admin\CustomerController::class, 'update'])->name('update');
                Route::delete('/{customer}', [App\Http\Controllers\Admin\CustomerController::class, 'destroy'])->name('destroy');
                Route::patch('/{customer}/toggle-status', [App\Http\Controllers\Admin\CustomerController::class, 'toggleStatus'])->name('toggle-status');
            });

            // Pattern
            Route::prefix('patterns')->name('patterns.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\PatternController::class, 'index'])->name('index');
                Route::post('/', [App\Http\Controllers\Admin\PatternController::class, 'store'])->name('store');
                Route::put('/{pattern}', [App\Http\Controllers\Admin\PatternController::class, 'update'])->name('update');
                Route::delete('/{pattern}', [App\Http\Controllers\Admin\PatternController::class, 'destroy'])->name('destroy');
                Route::patch('/{pattern}/toggle-status', [App\Http\Controllers\Admin\PatternController::class, 'toggleStatus'])->name('toggle-status');
            });
        });

        // Input Laporan Routes
        Route::prefix('admin/input-reports')->name('admin.input-reports.')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\InputReportController::class, 'index'])->name('index');
            Route::get('/drafts', [App\Http\Controllers\Admin\InputReportController::class, 'drafts'])->name('drafts');
            Route::get('/create', [App\Http\Controllers\Admin\InputReportController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\Admin\InputReportController::class, 'store'])->name('store');
            Route::get('/{report}', [App\Http\Controllers\Admin\InputReportController::class, 'show'])->name('show');
            Route::get('/{report}/edit', [App\Http\Controllers\Admin\InputReportController::class, 'edit'])->name('edit');
            Route::put('/{report}', [App\Http\Controllers\Admin\InputReportController::class, 'update'])->name('update');
            Route::delete('/{report}', [App\Http\Controllers\Admin\InputReportController::class, 'destroy'])->name('destroy');
        });

        // Log Aktivitas Routes
        Route::prefix('admin/logs')->name('admin.logs.')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\LogController::class, 'index'])->name('index');
            Route::get('/login', [App\Http\Controllers\Admin\LogController::class, 'loginLogs'])->name('login');
            Route::get('/system', [App\Http\Controllers\Admin\LogController::class, 'systemLogs'])->name('system');
            Route::get('/export', [App\Http\Controllers\Admin\LogController::class, 'export'])->name('export');
            Route::get('/{log}', [App\Http\Controllers\Admin\LogController::class, 'show'])->name('show');
        });

        Route::get('/admin/monitoring', function () {
            return Inertia::render('admin/monitoring');
        })->name('admin.monitoring');
    });

    // User/Operator routes - REMOVED DUPLICATE
    // Routes sudah ada di atas dalam middleware role:user
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
