# Supabase 配置指南

本文档将指导您完成 Supabase 项目的配置，为诗词起名器添加用户认证和云端收藏功能。

---

## 📋 前置条件

1. ✅ 您已有 Supabase 账号和项目
2. ✅ 项目代码已完成（代码已准备就绪）
3. ⏳ 需要配置 Supabase 数据库和认证

---

## 🗄️ 步骤一：创建数据库表

### 1.1 打开 SQL Editor

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 左侧菜单选择 **SQL Editor**
4. 点击 **New Query**

### 1.2 执行 SQL 脚本

复制以下 SQL 代码并执行：

```sql
-- 创建 favorites 表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  book TEXT NOT NULL,
  author TEXT,
  title TEXT NOT NULL,
  sentence TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_favorite UNIQUE(user_id, name, family_name, sentence)
);

-- 创建索引以优化查询性能
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- 启用 Row Level Security (重要！)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看自己的收藏
CREATE POLICY "用户查看自己的收藏"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 策略：用户只能创建自己的收藏
CREATE POLICY "用户创建自己的收藏"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 策略：用户只能删除自己的收藏
CREATE POLICY "用户删除自己的收藏"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

### 1.3 验证创建结果

1. 左侧菜单选择 **Table Editor**
2. 确认看到 `favorites` 表
3. 点击表名，查看结构是否正确

---

## 🔐 步骤二：配置认证服务

### 2.1 启用邮箱认证

1. 左侧菜单选择 **Authentication** > **Providers**
2. 找到 **Email** provider
3. 确认已启用（默认应该已启用）

#### 邮箱验证设置（可选）

**开发测试阶段建议：**

- **Confirm email**: 关闭（OFF）
- 这样注册后可以直接登录，无需验证邮箱

**生产环境建议：**

- **Confirm email**: 开启（ON）
- **Secure email change**: 开启（ON）
- 提高安全性

### 2.2 配置 Google OAuth（推荐）

#### 创建 Google OAuth 凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **APIs & Services** > **Credentials**
4. 点击 **Create Credentials** > **OAuth 2.0 Client IDs**
5. 应用类型选择 **Web application**
6. **Authorized redirect URIs** 添加：
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   将 `<your-project-ref>` 替换为您的 Supabase 项目引用 ID
7. 创建后获得 **Client ID** 和 **Client Secret**

#### 在 Supabase 中配置

1. 回到 Supabase Dashboard
2. **Authentication** > **Providers**
3. 找到 **Google** provider
4. 启用并填入：
   - **Client ID**: 从 Google 获取的 Client ID
   - **Client Secret**: 从 Google 获取的 Client Secret
5. 点击 **Save**

### 2.3 配置 GitHub OAuth（可选）

#### 创建 GitHub OAuth App

1. 访问 [GitHub Settings](https://github.com/settings/developers)
2. 点击 **OAuth Apps** > **New OAuth App**
3. 填写信息：
   - **Application name**: 诗词起名器
   - **Homepage URL**: 您的应用 URL
   - **Authorization callback URL**:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
4. 创建后获得 **Client ID** 和 **Client Secret**

#### 在 Supabase 中配置

1. **Authentication** > **Providers**
2. 找到 **GitHub** provider
3. 启用并填入：
   - **Client ID**: 从 GitHub 获取
   - **Client Secret**: 从 GitHub 获取
4. 点击 **Save**

### 2.4 配置重定向 URL

1. **Authentication** > **URL Configuration**
2. 添加允许的重定向 URL：

   ```
   开发环境：
   http://localhost:5173/*

   生产环境（根据实际部署地址修改）：
   https://your-domain.com/*
   https://holynova.github.io/gushi_namer/*
   ```

---

## 🔑 步骤三：配置环境变量

### 3.1 获取 Supabase 凭据

1. Supabase Dashboard > **Project Settings** > **API**
2. 复制以下信息：
   - **Project URL** (例如: `https://xxxxx.supabase.co`)
   - **anon public** key（在 Project API keys 下）

### 3.2 创建本地环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# 在项目根目录执行
touch .env
```

### 3.3 填写环境变量

编辑 `.env` 文件，填入您的 Supabase 凭据：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

> ⚠️ **重要提示**：
>
> - 不要将 `.env` 文件提交到 Git（已在 `.gitignore` 中）
> - `anon public` key 可以安全地在前端使用
> - Row Level Security 策略确保数据安全

---

## ✅ 步骤四：验证配置

### 4.1 启动开发服务器

```bash
npm run dev
```

### 4.2 测试功能清单

#### ✅ 用户注册

1. 打开应用
2. 点击 **注册** 按钮
3. 输入邮箱和密码
4. 验证是否注册成功

#### ✅ 用户登录

1. 使用注册的账号登录
2. 验证是否显示用户菜单

#### ✅ OAuth 登录

1. 点击 Google 或 GitHub 登录
2. 完成授权流程
3. 验证是否成功登录

#### ✅ 收藏功能

1. 登录后生成一些名字
2. 点击名字卡片的爱心图标收藏
3. 点击用户菜单 > **我的收藏**
4. 验证收藏列表是否正确显示

#### ✅ 数据同步

1. 在不同浏览器或设备登录同一账号
2. 验证收藏数据是否同步

#### ✅ 未登录引导

1. 登出账号
2. 尝试点击收藏按钮
3. 验证是否提示登录并打开登录弹窗

---

## 🐛 常见问题排查

### 问题 1: 环境变量读取失败

**错误信息**: `Missing Supabase environment variables`

**解决方案**:

1. 确认 `.env` 文件在项目根目录
2. 环境变量以 `VITE_` 开头
3. 重启开发服务器（`npm run dev`）

### 问题 2: 无法创建收藏

**可能原因**:

- RLS 策略未正确配置
- 用户未登录

**解决方案**:

1. 在 Supabase Dashboard 检查 RLS 策略
2. 确认用户已登录（`auth.uid()` 有值）

### 问题 3: OAuth 重定向失败

**解决方案**:

1. 检查 OAuth 应用的回调 URL 配置
2. 确认 Supabase 中的 redirect URLs 包含当前域名

---

## 📊 数据库管理

### 查看用户数据

```sql
SELECT * FROM auth.users;
```

### 查看所有收藏

```sql
SELECT
  f.*,
  u.email
FROM favorites f
JOIN auth.users u ON f.user_id = u.id
ORDER BY f.created_at DESC;
```

### 清空测试数据

```sql
-- 删除所有收藏
DELETE FROM favorites;

-- 删除测试用户（谨慎使用！）
-- DELETE FROM auth.users;
```

---

## 🚀 部署到生产环境

### 1. 更新环境变量

生产环境需要配置生产用的环境变量：

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 2. 更新 redirect URLs

在 Supabase Dashboard 添加生产域名到允许的 redirect URLs

### 3. 启用邮箱验证

生产环境建议启用邮箱验证以提高安全性

---

## 📚 相关文档

- [Supabase Authentication 文档](https://supabase.com/docs/guides/auth)
- [Row Level Security 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [OAuth Providers 设置](https://supabase.com/docs/guides/auth/social-login)

---

## ✨ 配置完成！

现在您的诗词起名器已经具备：

- ✅ 用户注册/登录
- ✅ 第三方 OAuth 登录
- ✅ 云端收藏功能
- ✅ 跨设备数据同步

开始享受完整功能吧！ 🎉
