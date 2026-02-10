import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeStore } from '@/stores/themeStore';
import { Logo } from '@/components/Logo';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 flex items-center justify-center">
                <Logo size={56} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">PayZenix</h1>
                <p className="text-white/70 text-sm">Payroll & HR Suite</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Streamline Your Payroll<br />
              & HR Operations
            </h2>
            <p className="text-white/80 text-lg max-w-md mb-8">
              Complete payroll processing with Indian statutory compliance.
              PF, ESI, TDS, PT — all automated and secure.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                { label: 'Companies', value: '500+' },
                { label: 'Employees Managed', value: '50,000+' },
                { label: 'Payrolls Processed', value: '₹100Cr+' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <Logo size={48} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PayZenix</h1>
              <p className="text-muted-foreground text-sm">Payroll & HR Suite</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to access your payroll dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-4 flex justify-center">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
