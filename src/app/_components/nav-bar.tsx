import Link from "next/link";
import { Button } from "@heroui/react";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 shadow-sm sticky top-0 left-0 right-0 z-10">
      <h1 className="text-xl font-bold">Chat Resume</h1>
      <Link href="/auth">
        <Button>登录 / 注册</Button>
      </Link>
    </nav>
  );
}
