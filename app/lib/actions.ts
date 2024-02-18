// 将身份验证逻辑与登录表单连接起来。在文件中 actions.ts ，
// 创建一个名为 authenticate 的新操作。
// 此操作应从以下位置 auth.ts 导入 signIn 函数
// 从您的身份验证模块中引入 signIn 函数
import { signIn } from '@/auth';
// 从 next-auth 库中引入 AuthError 类，用于错误处理
import { AuthError } from 'next-auth';

// ...

// 定义一个异步函数 authenticate，用于处理登录逻辑
export async function authenticate(
  prevState: string | undefined, // prevState 参数用于记录登录操作前的状态，可以用于登录后的重定向或其他逻辑
  formData: FormData, // formData 参数包含用户提交的登录表单数据
) {
  try {
    // 使用 signIn 函数进行登录尝试，'credentials' 表示使用凭据（如用户名和密码）登录
    await signIn('credentials', formData);
  } catch (error) {
    // 如果在登录过程中捕获到错误
    if (error instanceof AuthError) {
      // 如果错误是 AuthError 的实例，表示这是一个与身份验证相关的错误
      switch (error.type) {
        // 根据错误类型进行不同的处理
        case 'CredentialsSignin':
          // 如果是因为凭据不正确导致的登录失败
          return 'Invalid credentials.'; // 返回一个表示凭据无效的错误消息
        default:
          // 如果是其他类型的身份验证错误
          return 'Something went wrong.'; // 返回一个通用错误消息
      }
    }
    // 如果捕获到的错误不是 AuthError 的实例，可能是其他类型的运行时错误
    throw error; // 重新抛出这个错误，让调用者可以捕获并进行进一步的处理
  }
}
