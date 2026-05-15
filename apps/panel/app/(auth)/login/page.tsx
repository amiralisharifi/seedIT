import { LoginForm } from './login-form';
import { brand } from '@/config';

export const metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-semibold">Sign in to {brand.name}</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the panel.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
