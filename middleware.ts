// 在缓存内容和路由匹配之前运行
import { authMiddleware } from "@clerk/nextjs";

// publicRoutes 配置未登录时依旧允许访问的页面路由
// ignoredRoutes 配置忽略身份验证的页面路由
export default authMiddleware({});


export const config = {
  // 配置使用身份验证的路由匹配规则
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};