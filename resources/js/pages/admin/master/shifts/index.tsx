import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Clock, Edit, Plus, Power, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface BreakTime {
    mulai: string;
    selesai: string;
    deskripsi: string;
}

interface Shift {
    id: number;
    nama_shift: string;
    jam_mulai: string;
    jam_selesai: string;
    durasi_menit: number;
    break_time: BreakTime[];
    supervisor_default: string;
    status: 'aktif' | 'non_aktif';
    keterangan: string;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_shifts: number;
    active_shifts: number;
    total_duration: number;
    avg_duration: number;
}

interface Props {
    shifts: Shift[];
    stats: Stats;
}

export default function ShiftsIndex({ shifts, stats }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [breakTimes, setBreakTimes] = useState<BreakTime[]>([{ mulai: '', selesai: '', deskripsi: '' }]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nama_shift: '',
        jam_mulai: '',
        jam_selesai: '',
        durasi_menit: 0,
        supervisor_default: '',
        keterangan: '',
        status: 'aktif' as 'aktif' | 'non_aktif',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data, break_time: breakTimes.filter(bt => bt.mulai && bt.selesai) };
        
        if (selectedShift) {
            put(route('admin.master.shifts.update', selectedShift.id), {
                onSuccess: () => {
                    setIsEditOpen(false);
                    reset();
                    setBreakTimes([{ mulai: '', selesai: '', deskripsi: '' }]);
                    setSelectedShift(null);
                }
            });
        } else {
            post(route('admin.master.shifts.store'), {
                ...payload,
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                    setBreakTimes([{ mulai: '', selesai: '', deskripsi: '' }]);
                }
            });
        }
    };

    const handleEdit = (shift: Shift) => {
        setSelectedShift(shift);
        setData('nama_shift', shift.nama_shift);
        setData('jam_mulai', shift.jam_mulai);
        setData('jam_selesai', shift.jam_selesai);
        setData('durasi_menit', shift.durasi_menit);
        setData('supervisor_default', shift.supervisor_default || '');
        setData('keterangan', shift.keterangan || '');
        setData('status', shift.status);
        setBreakTimes(shift.break_time && shift.break_time.length > 0 ? shift.break_time : [{ mulai: '', selesai: '', deskripsi: '' }]);
        setIsEditOpen(true);
    };

    const handleDelete = (shift: Shift) => {
        if (confirm('Yakin ingin menghapus shift ini?')) {
            destroy(route('admin.master.shifts.destroy', shift.id));
        }
    };

    const handleToggleStatus = (shift: Shift) => {
        put(route('admin.master.shifts.toggle-status', shift.id));
    };

    const addBreakTime = () => {
        setBreakTimes([...breakTimes, { mulai: '', selesai: '', deskripsi: '' }]);
    };

    const removeBreakTime = (index: number) => {
        setBreakTimes(breakTimes.filter((_, i) => i !== index));
    };

    const updateBreakTime = (index: number, field: keyof BreakTime, value: string) => {
        const updated = breakTimes.map((bt, i) => 
            i === index ? { ...bt, [field]: value } : bt
        );
        setBreakTimes(updated);
    };

    // Calculate duration when time changes
    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
        const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
        return endMinutes > startMinutes ? endMinutes - startMinutes : (1440 - startMinutes) + endMinutes;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Shift" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Data Shift</h2>
                            <p className="text-gray-600">Kelola data shift kerja produksi</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Shift
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Shift</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.total_shifts}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Shift Aktif</CardTitle>
                                <Power className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.active_shifts}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Durasi</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.total_duration / 60)} jam</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Durasi</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avg_duration / 60)} jam</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shifts Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Shift</CardTitle>
                            <CardDescription>
                                Kelola semua data shift kerja produksi
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Shift</TableHead>
                                        <TableHead>Jam Kerja</TableHead>
                                        <TableHead>Durasi</TableHead>
                                        <TableHead>Break Time</TableHead>
                                        <TableHead>Supervisor</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shifts.map((shift) => (
                                        <TableRow key={shift.id}>
                                            <TableCell className="font-medium">{shift.nama_shift}</TableCell>
                                            <TableCell>{shift.jam_mulai} - {shift.jam_selesai}</TableCell>
                                            <TableCell>{Math.round(shift.durasi_menit / 60)} jam</TableCell>
                                            <TableCell>
                                                {shift.break_time && shift.break_time.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {shift.break_time.map((bt, idx) => (
                                                            <div key={idx} className="text-xs">
                                                                {bt.mulai}-{bt.selesai} ({bt.deskripsi})
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{shift.supervisor_default || '-'}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={shift.status === 'aktif' ? 'default' : 'secondary'}
                                                    className={shift.status === 'aktif' ? 'bg-green-100 text-green-800' : ''}
                                                >
                                                    {shift.status === 'aktif' ? 'Aktif' : 'Non Aktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(shift)}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(shift)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(shift)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Create/Edit Dialog */}
                    <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
                        if (!open) {
                            setIsCreateOpen(false);
                            setIsEditOpen(false);
                            reset();
                            setBreakTimes([{ mulai: '', selesai: '', deskripsi: '' }]);
                            setSelectedShift(null);
                        }
                    }}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{selectedShift ? 'Edit Shift' : 'Tambah Shift Baru'}</DialogTitle>
                                <DialogDescription>
                                    {selectedShift ? 'Update informasi shift' : 'Tambahkan shift kerja baru'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nama_shift">Nama Shift *</Label>
                                        <Input
                                            id="nama_shift"
                                            value={data.nama_shift}
                                            onChange={(e) => setData('nama_shift', e.target.value)}
                                            placeholder="Contoh: Shift Pagi"
                                        />
                                        {errors.nama_shift && <p className="text-red-500 text-sm">{errors.nama_shift}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={(value: 'aktif' | 'non_aktif') => setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="aktif">Aktif</SelectItem>
                                                <SelectItem value="non_aktif">Non Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="jam_mulai">Jam Mulai *</Label>
                                        <Input
                                            id="jam_mulai"
                                            type="time"
                                            value={data.jam_mulai}
                                            onChange={(e) => {
                                                setData('jam_mulai', e.target.value);
                                                if (data.jam_selesai) {
                                                    setData('durasi_menit', calculateDuration(e.target.value, data.jam_selesai));
                                                }
                                            }}
                                        />
                                        {errors.jam_mulai && <p className="text-red-500 text-sm">{errors.jam_mulai}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="jam_selesai">Jam Selesai *</Label>
                                        <Input
                                            id="jam_selesai"
                                            type="time"
                                            value={data.jam_selesai}
                                            onChange={(e) => {
                                                setData('jam_selesai', e.target.value);
                                                if (data.jam_mulai) {
                                                    setData('durasi_menit', calculateDuration(data.jam_mulai, e.target.value));
                                                }
                                            }}
                                        />
                                        {errors.jam_selesai && <p className="text-red-500 text-sm">{errors.jam_selesai}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="durasi_menit">Durasi (menit)</Label>
                                        <Input
                                            id="durasi_menit"
                                            type="number"
                                            value={data.durasi_menit}
                                            onChange={(e) => setData('durasi_menit', parseInt(e.target.value) || 0)}
                                            readOnly
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="supervisor_default">Supervisor Default</Label>
                                    <Input
                                        id="supervisor_default"
                                        value={data.supervisor_default}
                                        onChange={(e) => setData('supervisor_default', e.target.value)}
                                        placeholder="Nama supervisor shift ini"
                                    />
                                </div>

                                {/* Break Times */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label>Break Time</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addBreakTime}>
                                            <Plus className="w-4 h-4 mr-1" />
                                            Tambah Break
                                        </Button>
                                    </div>
                                    
                                    {breakTimes.map((breakTime, index) => (
                                        <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                                            <Input
                                                type="time"
                                                placeholder="Mulai"
                                                value={breakTime.mulai}
                                                onChange={(e) => updateBreakTime(index, 'mulai', e.target.value)}
                                            />
                                            <Input
                                                type="time"
                                                placeholder="Selesai"
                                                value={breakTime.selesai}
                                                onChange={(e) => updateBreakTime(index, 'selesai', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Deskripsi"
                                                value={breakTime.deskripsi}
                                                onChange={(e) => updateBreakTime(index, 'deskripsi', e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeBreakTime(index)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                                        placeholder="Keterangan tambahan tentang shift ini"
                                        rows={3}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateOpen(false);
                                            setIsEditOpen(false);
                                            reset();
                                            setBreakTimes([{ mulai: '', selesai: '', deskripsi: '' }]);
                                            setSelectedShift(null);
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : (selectedShift ? 'Update' : 'Simpan')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
