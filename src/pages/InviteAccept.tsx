
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInvitations } from '@/hooks/useInvitations';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const { validateInvitation, markInvitationAccepted } = useInvitations();
  const { signup, login, isAuthenticated } = useAuth();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'validate' | 'signup' | 'complete'>('validate');
  const [hasValidated, setHasValidated] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Memoize the validation function to prevent infinite loops
  const validateToken = useCallback(async (tokenValue: string) => {
    if (hasValidated) return; // Prevent multiple validations
    
    try {
      console.log('Starting token validation...');
      setIsValidating(true);
      setError('');
      setHasValidated(true);
      
      const result = await validateInvitation(tokenValue);
      console.log('Validation result:', result);
      
      if (result && result.is_valid) {
        setInvitation(result);
        // Only access email if the result is valid and contains invitation data
        if ('email' in result) {
          setEmail(result.email);
        }
        setStep('signup');
      } else {
        setError(result?.message || 'This invitation is invalid or has expired');
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setError('Failed to validate invitation. Please try again.');
    } finally {
      setIsValidating(false);
    }
  }, [validateInvitation, hasValidated]);

  useEffect(() => {
    if (!token) {
      console.log('No token provided');
      setError('Invalid invitation link');
      setIsValidating(false);
      return;
    }

    // Only validate once when component mounts
    validateToken(token);
  }, [token, validateToken]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('Starting signup process...');
      
      // Sign up the user with the invitation data
      await signup(email, password, {
        first_name: firstName,
        last_name: lastName,
        role: invitation.role,
        tenant_id: invitation.tenant_id
      });

      console.log('Signup successful, now marking invitation as accepted...');
      
      // Mark the invitation as accepted
      try {
        await markInvitationAccepted(token!);
        console.log('Invitation marked as accepted successfully');
      } catch (inviteError) {
        console.error('Error marking invitation as accepted:', inviteError);
        // Don't fail the whole process if invitation marking fails
      }
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        setStep('complete');
      }, 1000);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && step === 'validate') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Welcome to Aura HRMS!</CardTitle>
            <CardDescription>
              Your account has been created successfully. You will be redirected shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Join <span className="text-accent">Aura</span> HRMS
          </CardTitle>
          <CardDescription>
            You've been invited to join as a {invitation?.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                disabled={isProcessing}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAccept;
