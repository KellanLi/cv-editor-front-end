'use client';

import { useState } from 'react';
import { Link, Surface } from '@heroui/react';
import RegisterForm from './_components/register-form';
import LoginForm from './_components/login-form';

const enum AuthType {
  LOGIN = 'login',
  REGISTER = 'register',
}

const RENDER_MAP = {
  [AuthType.LOGIN]: LoginForm,
  [AuthType.REGISTER]: RegisterForm,
};

export default function AuthPage() {
  const [authType, setAuthType] = useState(AuthType.LOGIN);
  const FormComponent = RENDER_MAP[authType];

  const TEXT_MAP = {
    [AuthType.LOGIN]: (
      <>
        还没有账号？
        <Link onClick={() => setAuthType(AuthType.REGISTER)}>去注册</Link>
      </>
    ),
    [AuthType.REGISTER]: (
      <>
        已经有账号？
        <Link onClick={() => setAuthType(AuthType.LOGIN)}>去登录</Link>
      </>
    ),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafbfc] px-4">
      <Surface className="w-full max-w-md rounded-2xl p-8 shadow-lg">
        <FormComponent onSubmit={() => {}} />
        <div className="mt-6 text-center text-sm">{TEXT_MAP[authType]}</div>
      </Surface>
    </div>
  );
}
