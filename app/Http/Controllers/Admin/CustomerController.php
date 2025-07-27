<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TmDataCustomer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = TmDataCustomer::latest()->get();
        
        $stats = [
            'total_customers' => TmDataCustomer::count(),
            'active_customers' => TmDataCustomer::where('status', 'aktif')->count(),
            'total_countries' => TmDataCustomer::distinct('negara')->count(),
            'local_customers' => TmDataCustomer::where('negara', 'Indonesia')->count(),
        ];

        return Inertia::render('admin/master/customers/index', [
            'customers' => $customers,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_customer' => 'required|string|max:20|unique:tm_data_customer,kode_customer',
            'nama_customer' => 'required|string|max:100',
            'negara' => 'required|string|max:50',
            'alamat' => 'nullable|string',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'spesifikasi_khusus' => 'nullable|array',
            'status' => 'required|in:aktif,non_aktif',
        ]);

        TmDataCustomer::create($validated);

        return redirect()->back()->with('success', 'Data customer berhasil ditambahkan!');
    }

    public function update(Request $request, TmDataCustomer $customer)
    {
        $validated = $request->validate([
            'kode_customer' => 'required|string|max:20|unique:tm_data_customer,kode_customer,' . $customer->id,
            'nama_customer' => 'required|string|max:100',
            'negara' => 'required|string|max:50',
            'alamat' => 'nullable|string',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'spesifikasi_khusus' => 'nullable|array',
            'status' => 'required|in:aktif,non_aktif',
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', 'Data customer berhasil diupdate!');
    }

    public function destroy(TmDataCustomer $customer)
    {
        // Check if customer is being used in any reports
        if ($customer->laporanCutting()->exists()) {
            return redirect()->back()->with('error', 'Customer tidak dapat dihapus karena sedang digunakan dalam laporan!');
        }

        $customer->delete();

        return redirect()->back()->with('success', 'Data customer berhasil dihapus!');
    }

    public function toggleStatus(TmDataCustomer $customer)
    {
        $newStatus = $customer->status === 'aktif' ? 'non_aktif' : 'aktif';
        $customer->update(['status' => $newStatus]);

        $message = $newStatus === 'aktif' 
            ? 'Customer berhasil diaktifkan!' 
            : 'Customer berhasil dinonaktifkan!';

        return redirect()->back()->with('success', $message);
    }
}
