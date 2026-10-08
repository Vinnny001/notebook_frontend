import { useMutation } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.register(email, password, name),
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
        <input className="h-10 w-full rounded-md border border-border bg-background px-3" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="h-10 w-full rounded-md border border-border bg-background px-3" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input
          className="h-10 w-full rounded-md border border-border bg-background px-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {mutation.error ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}
        <Button className="w-full" disabled={mutation.isPending}>
          <UserPlus size={16} /> Create account
        </Button>
      </form>
      <p className="mt-4 text-sm text-foreground/70">
        Already registered? <Link className="text-primary underline" to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
