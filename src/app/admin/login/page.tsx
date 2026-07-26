'use client';

import { useFormState } from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginAdmin } from '../actions/auth';
import { useFormStatus } from 'react-dom';

const initialState: { error: string | null } = {
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full bg-[#D0FF2A] text-black hover:bg-[#bceb24] font-medium rounded-lg"
      disabled={pending}
    >
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAdmin, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-4 absolute inset-0 z-50">
      <Card className="w-full max-w-md bg-[#1C1C1E] border-gray-800 text-white shadow-2xl rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-wider text-center">
            Admin Portal
          </CardTitle>
          <p className="text-sm text-gray-400 text-center">
            Enter your credentials to access the dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="bg-black/50 border-gray-700 focus:border-[#D0FF2A] focus:ring-[#D0FF2A] text-white"
                placeholder="Enter admin username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-black/50 border-gray-700 focus:border-[#D0FF2A] focus:ring-[#D0FF2A] text-white"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-500/10 p-2 rounded">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
