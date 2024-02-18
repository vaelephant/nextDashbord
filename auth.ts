// 引入 NextAuth 库和 authConfig 配置文件
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
// 引入 next-auth 的 credentials 提供者
import Credentials from 'next-auth/providers/credentials';
// 引入 zod 库用于验证和解析凭证
import { z } from 'zod';
// 引入 @vercel/postgres 的 sql 标签模板函数用于数据库查询
import { sql } from '@vercel/postgres';
// 引入用户类型定义
import type { User } from '@/app/lib/definitions';
// 引入 bcrypt 库用于密码加密和验证
import bcrypt from 'bcrypt';

// 定义一个异步函数用于从数据库获取用户信息
async function getUser(email: string): Promise<User | undefined> {
  try {
    // 使用 SQL 查询语句获取用户信息
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    // 返回查询结果的第一条记录
    console.log("登录时候查询数据库成功",user.rows[0]);
    return user.rows[0];
  } catch (error) {
    console.error('登录是查询数据库失败Failed to fetch user:', error);
    // 如果查询失败，抛出错误
    throw new Error('Failed to fetch user.');
  }
}

// 使用 NextAuth 创建 auth 对象，并扩展 authConfig 配置
export const { auth, signIn, signOut } = NextAuth({
  // 将 authConfig 中的配置项合并到当前配置中
  ...authConfig,
  // 定义身份验证提供者
  providers: [
    Credentials({
      // credentials 提供者的授权函数
      async authorize(credentials) {
        // 使用 zod 对提供的凭证进行解析和验证
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        // 如果凭证验证成功
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          // 获取用户信息
          const user = await getUser(email);
          console.log("验证用户成功user", user);
          // 如果未找到用户，返回 null，表示授权失败
          if (!user) {return null;}  //yzm
          // 比较密码是否匹配
          const passwordsMatch = await bcrypt.compare(password, user.password);
  
          // 如果密码匹配，返回用户信息，表示授权成功
          if (passwordsMatch) return user;
        }
        console.log('Invalid credentials');
        // 如果凭证无效或验证失败，返回 null
        return null;
      },
    }),
  ],
});
