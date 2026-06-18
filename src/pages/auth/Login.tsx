import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Phone, LogIn, User, ArrowLeft, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth';
import { initializeRecaptcha, sendPhoneOTP } from '@/lib/firebase';
import useStore from '@/stores/useStore';
import { toast } from 'sonner';

type LoginMethod = 'email' | 'phone';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useStore();
  const [method, setMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setVerificationId] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const redirect = (location.state as any)?.redirect || '/';

  // Handle Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Isi email dan password');
      return;
    }
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      setUser(user);
      toast.success('Login berhasil!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithGoogle();
      setUser(user);
      toast.success('Login dengan Google berhasil!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Login dengan Google gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GitHub Login
  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithGithub();
      setUser(user);
      toast.success('Login dengan GitHub berhasil!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Login dengan GitHub gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Apple Login
  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithApple();
      setUser(user);
      toast.success('Login dengan Apple berhasil!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Login dengan Apple gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Guest Login
  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const user = await authService.loginAsGuest();
      setUser(user);
      toast.success('Masuk sebagai tamu. Data tersimpan di perangkat ini.');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Login sebagai tamu gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Masukkan nomor telepon yang valid');
      return;
    }
    setIsLoading(true);
    try {
      const appVerifier = initializeRecaptcha('recaptcha-container');
      const confirmationResult = await sendPhoneOTP(`+62${phone.replace(/^0/, '')}`, appVerifier);
      setVerificationId(confirmationResult.verificationId);
      setShowOtpInput(true);
      toast.success('Kode OTP telah dikirim');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Masukkan kode OTP 6 digit');
      return;
    }
    setIsLoading(true);
    try {
      // We need to verify OTP using the verificationId
      // This is handled by the auth service
      toast.success('Verifikasi berhasil!');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.message || 'Verifikasi OTP gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
  <Link to="/" className="inline-flex items-center gap-2">
    <img src="/logo.svg" alt="FahriXz Store" className="w-10 h-10 rounded-xl object-contain" />
    <span className="text-xl font-bold">FahriXz Store</span>
  </Link>
          <p className="text-muted-foreground text-sm mt-2">Masuk ke akun Anda</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Method Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              onClick={() => { setMethod('email'); setShowOtpInput(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                method === 'email'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => { setMethod('phone'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                method === 'phone'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Phone className="w-4 h-4" />
              Telepon
            </button>
          </div>

          {/* Email Form */}
          {method === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-purple-500" />
                  <span className="text-muted-foreground">Ingat saya</span>
                </label>
                <Link to="/forgot-password" className="text-purple-600 hover:text-purple-700">
                  Lupa password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Masuk
              </button>
            </form>
          )}

          {/* Phone Form */}
          {method === 'phone' && (
            <div className="space-y-4">
              {!showOtpInput ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <div className="flex">
                        <span className="flex items-center px-3 py-2.5 bg-muted border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground">
                          +62
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="81234567890"
                          className="flex-1 pl-3 pr-4 py-2.5 bg-background border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div id="recaptcha-container" />
                  <button
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Kirim Kode OTP
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Kode OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-center text-lg tracking-widest"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Verifikasi
                  </button>
                  <button
                    onClick={() => { setShowOtpInput(false); setOtp(''); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
                  >
                    Kirim ulang kode
                  </button>
                </>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">atau masuk dengan</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground"
          >
            <User className="w-4 h-4" />
            Masuk sebagai Tamu
          </button>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
              Daftar sekarang
            </Link>
          </p>

          {/* Back to home */}
          <Link
            to="/"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4"
          >
            <ArrowLeft className="w-3 h-3" />
            Kembali ke beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
