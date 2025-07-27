<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Dashboard permissions
            'view dashboard',
            'view dashboard stats',
            
            // Report permissions
            'create report',
            'view own reports',
            'view all reports',
            'edit report',
            'delete report',
            'export reports',
            
            // Validation permissions
            'validate reports',
            'approve reports',
            'reject reports',
            'add validation comments',
            
            // User management permissions
            'view users',
            'create users',
            'edit users',
            'delete users',
            'assign roles',
            
            // Role and Permission management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'view permissions',
            'create permissions',
            'delete permissions',
            
            // Master data permissions
            'manage machines',
            'view machines',
            
            // Monitoring permissions
            'view monitoring',
            'view team performance',
            'view production trends',
            
            // Log permissions
            'view activity logs',
            'view login logs',
            
            // Settings permissions
            'manage system settings',
            'change own password',
            'edit own profile',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Admin Role (Leader Cutting/Supervisor)
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo([
            'view dashboard',
            'view dashboard stats',
            'view all reports',
            'export reports',
            'validate reports',
            'approve reports',
            'reject reports',
            'add validation comments',
            'view users',
            'create users',
            'edit users',
            'delete users',
            'assign roles',
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'view permissions',
            'create permissions',
            'delete permissions',
            'manage machines',
            'view machines',
            'view monitoring',
            'view team performance',
            'view production trends',
            'view activity logs',
            'view login logs',
            'manage system settings',
            'change own password',
            'edit own profile',
        ]);

        // User Role (Operator)
        $userRole = Role::create(['name' => 'user']);
        $userRole->givePermissionTo([
            'view dashboard',
            'create report',
            'view own reports',
            'edit report', // only own reports
            'view machines',
            'change own password',
            'edit own profile',
        ]);

        // Create default admin user
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@trisco.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Create default operator user
        $operator = User::create([
            'name' => 'Operator 1',
            'email' => 'operator@trisco.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $operator->assignRole('user');
    }
}
