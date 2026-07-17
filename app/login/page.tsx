'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';

type Step = 'welcome' | 'auth';
type Tab = 'login' | 'lapor';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login berhasil!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  // wave anchor point (0-100 viewBox units) — lower number = taller white sheet
  const waveY = step === 'welcome' ? 58 : 24;

  return (
    <div className="min-h-screen w-full font-sans">
      {/* ======================= MOBILE / TABLET (< lg) ======================= */}
      <div className="relative min-h-screen w-full overflow-hidden bg-[#0B3D2E] lg:hidden">
        {/* ambient texture on the green field */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M-10,15 C 15,5 25,25 45,14 S 75,4 110,16" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
          <path d="M-10,26 C 10,34 30,16 50,26 S 80,36 110,24" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
          <path d="M-10,38 C 20,30 35,44 55,34 S 85,28 110,40" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
          <path d="M-10,4 C 10,12 40,-2 60,6 S 90,14 110,4" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
        </svg>

        {/* top bar */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2 text-[#EAF6EE]">
            <div className="flex items-center justify-center rounded-full bg-white p-1">
              <Image src="/icon-512.png" alt="SampahDesa" width={24} height={24} priority />
            </div>
            <span className="text-sm font-semibold tracking-wide">SampahDesa</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/titik-jemput')}
              className="flex items-center gap-1 text-xs font-medium text-[#EAF6EE]/80 hover:text-[#EAF6EE]"
            >
              <MapPin className="h-3.5 w-3.5" />
              Titik Jemput
            </button>
            {step === 'welcome' && (
              <button
                onClick={() => setStep('auth')}
                className="text-xs font-medium text-[#EAF6EE]/80 underline-offset-4 hover:underline"
              >
                Lewati
              </button>
            )}
            {step === 'auth' && (
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-1 text-xs font-medium text-[#EAF6EE]/80 hover:text-[#EAF6EE]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </button>
            )}
          </div>
        </div>

        {/* headline sits directly on the green field */}
        <div
          className="relative z-20 flex flex-col items-center px-8 text-center transition-all duration-500"
          style={{ paddingTop: step === 'welcome' ? '13vh' : '6vh' }}
        >
          <div className="flex items-center justify-center rounded-full bg-white p-2">
            <Image src="/icon-512.png" alt="SampahDesa" width={100} height={100} priority />
          </div>
          {step === 'auth' && <p className="mt-4 text-sm text-[#070707]">Selamat datang kembali</p>}
        </div>

        {/* wave-topped white sheet */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full transition-all duration-500 ease-in-out"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d={`M0,${waveY + 7} C 18,${waveY - 8} 34,${waveY + 9} 50,${waveY} C 66,${waveY - 9} 82,${waveY + 8} 100,${waveY} L100,100 L0,100 Z`}
            fill="#FFFFFF"
          />
        </svg>

        {/* sheet content */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 flex flex-col px-8 pb-10 transition-all duration-500 ease-in-out"
          style={{ top: `${waveY + 14}%` }}
        >
          {step === 'welcome' && (
            <div className="flex h-full flex-col">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0B3D2E]">Selamat Datang</h1>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#6B8577]">
                  Kelola dan pantau pengumpulan sampah di desa Anda dengan mudah, cepat, dan transparan.
                </p>
              </div>
              <div className="flex items-center justify-between pb-2">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-5 rounded-full bg-[#0B3D2E]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D8E3DC]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D8E3DC]" />
                </div>
                <button
                  onClick={() => setStep('auth')}
                  aria-label="Lanjutkan"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B3D2E] text-white shadow-lg shadow-[#0B3D2E]/30 transition-transform hover:scale-105 active:scale-95"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 'auth' && (
            <AuthCard
              tab={tab}
              setTab={setTab}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              handleSubmit={handleSubmit}
              router={router}
            />
          )}
        </div>
      </div>

      {/* ======================= DESKTOP (>= lg) ======================= */}
      <div className="hidden min-h-screen w-full lg:flex">
        {/* left branding panel */}
        <div className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden bg-[#0B3D2E] px-12 xl:w-2/5">
          <button
            onClick={() => router.push('/titik-jemput')}
            className="absolute right-6 top-6 z-20 flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-medium text-[#EAF6EE]/90 hover:bg-white/20 hover:text-[#EAF6EE]"
          >
            <MapPin className="h-3.5 w-3.5" />
            Titik Jemput Sampah
          </button>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M-10,15 C 15,5 25,25 45,14 S 75,4 110,16" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
            <path d="M-10,26 C 10,34 30,16 50,26 S 80,36 110,24" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
            <path d="M-10,38 C 20,30 35,44 55,34 S 85,28 110,40" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
            <path d="M-10,4 C 10,12 40,-2 60,6 S 90,14 110,4" stroke="#EAF6EE" strokeWidth="0.4" fill="none" />
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-center justify-center rounded-full bg-white p-2.5 shadow-lg shadow-black/10">
              <Image src="/icon-512.png" alt="SampahDesa" width={110} height={110} priority />
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#EAF6EE]">SampahDesa</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#EAF6EE]/75">
              Kelola dan pantau pengumpulan sampah di desa Anda dengan mudah, cepat, dan transparan.
            </p>
          </div>

          {/* decorative wave hugging the bottom of the panel */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
          >
            <path d="M0,10 C 18,2 34,18 50,9 C 66,1 82,17 100,9 L100,20 L0,20 Z" fill="#EAF6EE" fillOpacity="0.06" />
          </svg>
        </div>

        {/* right form panel */}
        <div className="flex w-1/2 items-center justify-center bg-white px-8 xl:w-3/5">
          <div className="w-full max-w-sm">
            <AuthCard
              tab={tab}
              setTab={setTab}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              handleSubmit={handleSubmit}
              router={router}
              desktop
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthCardProps {
  tab: Tab;
  setTab: (t: Tab) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  router: ReturnType<typeof useRouter>;
  desktop?: boolean;
}

function AuthCard({
  tab,
  setTab,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  handleSubmit,
  router,
  desktop = false,
}: AuthCardProps) {
  return (
    <div className={desktop ? 'flex flex-col' : 'flex h-full flex-col'}>
      {desktop && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#0B3D2E]">Selamat Datang Kembali</h2>
          <p className="mt-1 text-sm text-[#6B8577]">Masuk untuk melanjutkan ke dashboard Anda</p>
        </div>
      )}

      {/* tab switch */}
      <div className="mb-6 flex rounded-full bg-[#F1F5F2] p-1">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
            tab === 'login' ? 'bg-[#0B3D2E] text-white shadow-sm' : 'text-[#6B8577]'
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setTab('lapor')}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
            tab === 'lapor' ? 'bg-[#0B3D2E] text-white shadow-sm' : 'text-[#6B8577]'
          }`}
        >
          Lapor Warga
        </button>
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleSubmit} className={desktop ? 'flex flex-col' : 'flex flex-1 flex-col'}>
          {!desktop && <h2 className="mb-5 text-xl font-bold text-[#0B3D2E]">Sign in</h2>}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-[#6B8577]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-none border-0 border-b border-[#D8E3DC] px-0 focus-visible:ring-0 focus-visible:border-[#0B3D2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-[#6B8577]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-none border-0 border-b border-[#D8E3DC] px-0 pr-8 focus-visible:ring-0 focus-visible:border-[#0B3D2E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center text-[#9AAAA1] hover:text-[#0B3D2E]"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-[#6B8577]">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#D8E3DC] accent-[#0B3D2E]" />
              Remember Me
            </label>
            <button type="button" className="font-medium text-[#0B3D2E] hover:underline">
              Forgot Password?
            </button>
          </div>

          <div className={desktop ? 'mt-6' : 'mt-auto pt-6'}>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-[#0B3D2E] text-base font-semibold hover:bg-[#0F4732]"
            >
              {loading ? 'Memproses...' : 'Login'}
            </Button>
          </div>
        </form>
      ) : (
        <div className={desktop ? 'flex flex-col' : 'flex flex-1 flex-col'}>
          <h2 className="mb-2 text-xl font-bold text-[#0B3D2E]">Lapor Sampah</h2>
          <p className="mb-6 text-sm leading-relaxed text-[#6B8577]">
            Tidak perlu akun. Laporkan tumpukan sampah di sekitar Anda langsung ke petugas desa.
          </p>
          <div className={desktop ? 'mt-2' : 'mt-auto pt-6'}>
            <Button
              type="button"
              onClick={() => router.push('/lapor')}
              className="h-12 w-full rounded-full bg-[#0B3D2E] text-base font-semibold hover:bg-[#0F4732]"
            >
              Lapor Sekarang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}