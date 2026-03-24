import { TRegister } from '@/types/api/auth/register';
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
  onSubmit?: (values: TRegister) => void;
}

export default function RegisterForm(props: IProps) {
  const { onSubmit } = props;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    onSubmit?.(values as TRegister);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Fieldset>
        <Fieldset.Legend className="text-center text-2xl font-semibold">
          注册账号
        </Fieldset.Legend>
        <Description className="mb-4 text-center">
          创建一个新账号开始使用
        </Description>
        <Fieldset.Group>
          <TextField
            isRequired
            name="name"
            validate={(value) => {
              if (!value || value.length < 2) {
                return '用户名至少2个字符';
              }
              return null;
            }}
          >
            <Label>用户名</Label>
            <Input placeholder="请输入用户名" variant="secondary" />
            <FieldError />
          </TextField>

          <TextField isRequired name="email" type="email">
            <Label>邮箱</Label>
            <Input placeholder="请输入邮箱" variant="secondary" />
            <FieldError />
          </TextField>
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
            注册
          </Button>
        </Fieldset.Actions>
      </Fieldset>
    </Form>
  );
}
