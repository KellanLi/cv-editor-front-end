import { login } from '@/apis/auth';
import storage from '@/lib/storage';
import { TLogin } from '@/types/api/auth/login';
import {
  Button,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  TextField,
} from '@heroui/react';
import { FormEvent } from 'react';

interface IProps {
  onSubmit?: (values: TLogin) => void;
}

export default function LoginForm(props: IProps) {
  const { onSubmit } = props;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries()) as TLogin;
    try {
      const res = await login(values);
      storage.setToken(res.data.token);
    } catch (error) {
      console.error('登录失败:', error);
    }

    onSubmit?.(values);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Fieldset>
        {/* 标题 */}
        <Fieldset.Legend className="text-center text-2xl font-semibold">
          登录账号
        </Fieldset.Legend>

        <Description className="mb-4 text-center">
          欢迎回来，请登录你的账号
        </Description>

        <Fieldset.Group>
          {/* 邮箱 */}
          <TextField isRequired name="email" type="email">
            <Label>邮箱</Label>
            <Input placeholder="请输入邮箱" variant="secondary" />
            <FieldError />
          </TextField>

          {/* 密码 */}
          <TextField
            isRequired
            name="password"
            type="password"
            validate={(value) => {
              if (!value || value.length < 6) {
                return '密码至少6位';
              }
              return null;
            }}
          >
            <Label>密码</Label>
            <Input
              placeholder="请输入密码"
              type="password"
              variant="secondary"
            />
            <FieldError />
          </TextField>
        </Fieldset.Group>

        {/* 操作按钮 */}
        <Fieldset.Actions className="mt-4 flex flex-col gap-2">
          <Button type="submit" className="w-full">
            登录
          </Button>
        </Fieldset.Actions>
      </Fieldset>
    </Form>
  );
}
