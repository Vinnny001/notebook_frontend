import { useMutation } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");

  const mutation = useMutation({
    mutationFn: () => api.login(email, password),
    onSuccess: (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      navigate("/");
    }
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthLayout>
      <form className="space-y-4" onSubmit={submit}>
        <input className="h-10 w-full rounded-md border border-border bg-background px-3" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input
          className="h-10 w-full rounded-md border border-border bg-background px-3"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {mutation.error ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}
        <Button className="w-full" disabled={mutation.isPending}>
          <LogIn size={16} /> Sign in
        </Button>
      </form>
      <p className="mt-4 text-sm text-foreground/70">
        New workspace? <Link className="text-primary underline" to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
