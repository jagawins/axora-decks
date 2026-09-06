import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { getVariant, trackABEvent } from '@/lib/ab-testing';
import axivaWordmark from "@/assets/axiva-wordmark-dark.svg";

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').optional();

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.7 0 248.7 0 125.8c0-70.5 24.2-135.4 68.1-182.4C112.2 95.6 171.5 64 240.6 64c66.3 0 119.1 41.5 160.1 41.5 39.6 0 101.1-44 176.6-44 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

type AuthMode = 'signin' | 'signup' | 'magic';

const NEW_SIGNUP_FLAG = 'axiva_new_signup';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const requestedMode: AuthMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<AuthMode>(requestedMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Validated, same-origin destination only. Empty string means "decide from context".
  const nextPath = safeInternalPath(searchParams.get('next'), '');
  const draft = readCreateDraft();

  const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithMicrosoft, signInWithMagicLink, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      try { localStorage.setItem('axiva_referred_by', ref); } catch { }
    }
  }, [searchParams]);

  // Single redirect owner: submit handlers never navigate on success.
  useEffect(() => {
    if (loading || !user) return;
    let isNewSignup = false;
    try {
      isNewSignup = sessionStorage.getItem(NEW_SIGNUP_FLAG) === '1';
      if (isNewSignup) sessionStorage.removeItem(NEW_SIGNUP_FLAG);
    } catch { /* storage may be unavailable */ }

    if (nextPath) {
      if (draft) trackProductEvent('auth_return_with_draft', { source: 'next_param' });
      navigate(nextPath, { replace: true });
      return;
    }
    if (draft) {
      trackProductEvent('auth_return_with_draft', { source: 'draft' });
      navigate('/create', { replace: true });
      return;
    }
    navigate(isNewSignup ? '/onboarding' : '/dashboard', { replace: true });
  }, [user, loading, navigate, nextPath, draft]);

  // Track auth page impression for A/B testing
  useEffect(() => {
    if (mode === 'signup') {
      trackABEvent("signup_cta", "impression");
    }
  }, [mode]);

  const validateEmail = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrors(e => ({ ...e, email: result.error.errors[0].message }));
      return false;
    }
    setErrors(e => ({ ...e, email: undefined }));
    return true;
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    if (mode === 'signup' && name) {
      const nameResult = nameSchema.safeParse(name);
      if (nameResult && !nameResult.success) newErrors.name = nameResult.error.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast({
            title: error.message.includes('already registered') ? 'Account exists' : 'Sign up failed',
            description: error.message.includes('already registered') ? 'An account with this email already exists.' : error.message,
            variant: 'destructive',
          });
        } else {
          trackABEvent("signup_cta", "convert", "email_signup");
          trackABEvent("hero_headline", "convert", "signup_complete");
          trackABEvent("pricing_pro_cta", "convert", "signup_complete");
          toast({ title: 'Welcome to AXIVA!', description: 'Your account has been created.' });
          navigate('/onboarding');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message.includes('Invalid login credentials') ? 'Please check your email and password.' : error.message,
            variant: 'destructive',
          });
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setIsLoading(true);
    const { error } = await signInWithMagicLink(email);
    setIsLoading(false);
    if (error) {
      toast({ title: 'Magic link failed', description: error.message, variant: 'destructive' });
    } else {
      setMagicSent(true);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple' | 'microsoft') => {
    // Track OAuth signup intent
    trackABEvent("signup_cta", "click", `oauth_${provider}`);
    trackABEvent("hero_headline", "click", `oauth_${provider}`);

    setIsLoading(true);
    if (provider === 'apple') {
      const result = await lovable.auth.signInWithOAuth('apple', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: 'Apple sign in failed', description: String(result.error), variant: 'destructive' });
        setIsLoading(false);
      }
      return;
    }
    const fn = provider === 'google' ? signInWithGoogle : signInWithMicrosoft;
    const { error } = await fn();
    if (error) {
      toast({ title: `${provider} sign in failed`, description: error.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <a href="/" className="mb-6 inline-block">
            <img src={axivaWordmark} alt="AXIVA" className="h-8" />
          </a>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {mode === 'signup' 
              ? (getVariant("signup_cta") === "no_credit_card" ? "Start free, no credit card needed"
                : getVariant("signup_cta") === "instant_deck" ? "Create your first deck in 60 seconds"
                : "Create your account")
              : mode === 'magic' ? 'Sign in with email' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground text-center">
            {mode === 'signup' 
              ? (getVariant("signup_cta") === "no_credit_card" ? "98 executive templates. AI deck generation. Speech coaching. All free to start."
                : getVariant("signup_cta") === "instant_deck" ? "Describe your topic. AI builds the structure, narrative, and visuals."
                : "Start creating executive-grade presentations")
              : mode === 'magic' ? "We'll send you a magic link" : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        <div className="bg-card/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/40 p-8">
          {mode !== 'magic' && (
            <>
              <div className="flex flex-col gap-2 mb-6">
                <Button variant="outline" size="lg" onClick={() => handleOAuth('google')} disabled={isLoading} className="h-12 relative group hover:bg-muted/80">
                  <GoogleIcon />
                  <span className="ml-2">Continue with Google</span>
                </Button>
                <Button variant="outline" size="lg" onClick={() => handleOAuth('apple')} disabled={isLoading} className="h-12 relative group hover:bg-muted/80">
                  <AppleIcon />
                  <span className="ml-2">Continue with Apple</span>
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with email</span></div>
              </div>
            </>
          )}

          {mode === 'magic' ? (
            magicSent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Check your email</h3>
                <p className="text-muted-foreground mb-6">We've sent a magic link to <span className="font-medium text-foreground">{email}</span></p>
                <Button variant="outline" onClick={() => { setMagicSent(false); setMode('signin'); }}>
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <Label htmlFor="magic-email">Email address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="magic-email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-muted/50" required />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 mr-2" />Send magic link</>}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setMode('signin')}>
                  Back to sign in
                </Button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-12 bg-muted/50" />
                    </div>
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-muted/50" required />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 bg-muted/50" required />
                  </div>
                  {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full h-12 group" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {mode === 'signup' ? 'Create account' : 'Sign in'}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center text-sm">
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setErrors({}); }} className="text-accent hover:underline font-medium">
                    {mode === 'signup' ? 'Sign in' : 'Sign up'}
                  </button>
                </div>
                <div className="text-center">
                  <button type="button" onClick={() => setMode('magic')} className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center mx-auto gap-2 group">
                    <Sparkles className="w-4 h-4 group-hover:text-accent transition-colors" />
                    Sign in with magic link
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
