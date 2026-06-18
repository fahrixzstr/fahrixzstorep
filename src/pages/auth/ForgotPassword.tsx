import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import authService from '@/services/auth';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Masukkan email');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email);
      setSent(true);
      toast.success('Link reset password telah dikirim ke email Anda');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim link reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold">FahriXz Store</span>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold mb-2">Email Terkirim!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Periksa inbox email Anda untuk link reset password.
              </p>
              <Link to="/login" className="text-purple-600 hover:text-purple-700 text-sm">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Reset Password</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Masukkan email Anda dan kami akan mengirimkan link reset password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Kirim Link Reset
                </button>
              </form>
              <Link to="/login"
                className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4">
                <ArrowLeft className="w-3 h-3" />
                Kembali ke Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
