import { DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const revenueData = [
  { name: 'Sen', income: 2500000, expense: 800000 },
  { name: 'Sel', income: 3200000, expense: 1200000 },
  { name: 'Rab', income: 2800000, expense: 900000 },
  { name: 'Kam', income: 4100000, expense: 1500000 },
  { name: 'Jum', income: 3800000, expense: 1100000 },
  { name: 'Sab', income: 5200000, expense: 1800000 },
  { name: 'Min', income: 4600000, expense: 1300000 },
];

const transactions = [
  { id: 'TRX-001', type: 'income', description: 'Pembelian Netflix Premium', amount: 55000, date: '2024-06-18 14:30' },
  { id: 'TRX-002', type: 'income', description: 'Pembelian ChatGPT Plus', amount: 45000, date: '2024-06-18 13:15' },
  { id: 'TRX-003', type: 'expense', description: 'Withdraw ke BCA - Ahmad', amount: -150000, date: '2024-06-18 12:00' },
  { id: 'TRX-004', type: 'income', description: 'Pembelian Canva Pro', amount: 95000, date: '2024-06-17 16:45' },
  { id: 'TRX-005', type: 'expense', description: 'Reward Misi #1234', amount: -25000, date: '2024-06-17 11:20' },
  { id: 'TRX-006', type: 'income', description: 'Pembelian Spotify', amount: 25000, date: '2024-06-16 20:00' },
];

export default function AdminFinance() {
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Keuangan</h1>
          <p className="text-muted-foreground">Laporan keuangan toko</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pemasukan</p>
                <p className="text-2xl font-bold">Rp {totalIncome.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pengeluaran</p>
                <p className="text-2xl font-bold">Rp {totalExpense.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold">
                  Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grafik Keuangan Mingguan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="income" fill="#10b981" name="Pemasukan" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-mono text-sm">{trx.id}</TableCell>
                    <TableCell>{trx.description}</TableCell>
                    <TableCell>
                      <span className={trx.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                        {trx.type === 'income' ? '+' : ''}Rp {trx.amount.toLocaleString('id-ID')}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{trx.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
