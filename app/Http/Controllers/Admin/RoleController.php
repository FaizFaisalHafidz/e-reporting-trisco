<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('name'),
                    'permissions_count' => $role->permissions->count(),
                    'users_count' => $role->users_count,
                    'created_at' => $role->created_at?->format('d M Y H:i'),
                    'updated_at' => $role->updated_at?->format('d M Y H:i'),
                ];
            });

        $permissions = Permission::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        try {
            DB::beginTransaction();

            $role = Role::create([
                'name' => $request->name,
                'guard_name' => 'web',
            ]);

            if ($request->has('permissions')) {
                $role->syncPermissions($request->permissions);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Role berhasil dibuat');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal membuat role: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        // Prevent updating system roles
        if (in_array($role->name, ['admin', 'user'])) {
            return redirect()->back()->withErrors(['error' => 'Role sistem tidak dapat diubah']);
        }

        try {
            DB::beginTransaction();

            $role->update([
                'name' => $request->name,
            ]);

            $role->syncPermissions($request->permissions ?? []);

            DB::commit();

            return redirect()->back()->with('success', 'Role berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui role: ' . $e->getMessage()]);
        }
    }

    public function destroy(Role $role)
    {
        // Prevent deleting system roles
        if (in_array($role->name, ['admin', 'user'])) {
            return redirect()->back()->withErrors(['error' => 'Role sistem tidak dapat dihapus']);
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return redirect()->back()->withErrors(['error' => 'Role tidak dapat dihapus karena masih digunakan oleh user']);
        }

        try {
            $role->delete();
            return redirect()->back()->with('success', 'Role berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal menghapus role: ' . $e->getMessage()]);
        }
    }

    public function permissions()
    {
        $permissions = Permission::orderBy('name')->get(['id', 'name', 'guard_name']);

        return Inertia::render('admin/roles/permissions', [
            'permissions' => $permissions,
        ]);
    }

    public function storePermission(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
        ]);

        try {
            Permission::create([
                'name' => $request->name,
                'guard_name' => 'web',
            ]);

            return redirect()->back()->with('success', 'Permission berhasil dibuat');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal membuat permission: ' . $e->getMessage()]);
        }
    }

    public function destroyPermission(Permission $permission)
    {
        // Check if permission is used by roles
        if ($permission->roles()->count() > 0) {
            return redirect()->back()->withErrors(['error' => 'Permission tidak dapat dihapus karena masih digunakan oleh role']);
        }

        try {
            $permission->delete();
            return redirect()->back()->with('success', 'Permission berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal menghapus permission: ' . $e->getMessage()]);
        }
    }
}
