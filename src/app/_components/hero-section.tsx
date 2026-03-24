import Link from 'next/link';
import { Button } from '@heroui/react';

export default function HeroSection() {
  return (
    <section className="flex h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 text-4xl font-bold">用 AI 快速生成你的专业简历</h2>
      <p className="mb-6 text-gray-600">
        一键生成、智能优化，让你的简历脱颖而出
      </p>

      <Link href="/auth">
        <Button size="lg">立即开始</Button>
      </Link>
    </section>
  );
}
