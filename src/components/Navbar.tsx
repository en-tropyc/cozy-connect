import { AuthButton } from "./AuthButton";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <h1 className="text-xl font-bold">Cozy Connect</h1>
      <AuthButton />
    </nav>
  );
} 
