import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./ui/Button";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.theme === "dark" || (!localStorage.theme && matchMedia("(prefers-color-scheme: dark)").matches));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <Button aria-label="Toggle theme" title="Toggle theme" variant="ghost" onClick={() => setDark((value) => !value)}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
