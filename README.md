# 记忆回忆程序 - Memory Recall App

一个温馨的记忆回忆程序，支持文本润色、情感分析和记忆图片生成功能。现已升级支持真实的AI服务！

## ✨ 功能特性

- 📝 **智能文本润色** - 使用OpenAI GPT进行专业文本润色
- 🎭 **情感分析** - 智能分析文本的情感基调
- 🖼️ **记忆图片生成** - 支持Unsplash API和OpenAI DALL-E生成相关图片
- 🎨 **温馨界面设计** - 响应式设计，温暖的视觉体验
- 🔄 **智能降级** - API不可用时自动回退到模拟数据

## 🛠️ 技术栈

### 前端
- HTML5 + CSS3 + JavaScript
- 响应式设计
- 现代化UI/UX

### 后端
- Node.js + Express
- OpenAI GPT API
- Unsplash API
- 环境变量配置

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置API密钥（可选）
编辑 `.env` 文件，配置以下API密钥：

```env
# OpenAI API密钥（用于文本润色和图片生成）
# 获取地址: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Unsplash API密钥（用于图片生成，免费）
# 获取地址: https://unsplash.com/developers
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# Stability AI API密钥（备用图片生成服务）
# 获取地址: https://platform.stability.ai/account/keys
STABILITY_API_KEY=your_stability_api_key_here
```

**注意：** 如果不配置API密钥，程序会自动使用模拟数据，功能完全正常！

### 3. 启动服务（前后端分别启动）
后端（端口 3000）：
```bash
npm start
```

前端（端口 3001）：
```bash
cd vue
npm install
npm run dev
```

可选：在前端设置 API 基址（若后端端口有变动）
在 `vue/.env` 写入：
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 4. 访问应用
- 前端开发地址： http://localhost:3001
- 后端健康检查： http://localhost:3000/api/health

## 📖 使用指南

1. **输入文本** - 在文本框中输入您想要润色的文字
2. **文本润色** - 点击"润色文字"按钮，AI会帮您优化文本并分析情感
3. **生成图片** - 点击"生成记忆图片"按钮，根据文本和情感生成相关图片
4. **查看结果** - 润色后的文本和生成的图片会显示在下方

## 🔧 API接口

### 文本润色接口
```
POST /api/polish
Content-Type: application/json

{
  "text": "要润色的文本"
}
```

### 图片生成接口
```
POST /api/generate-image
Content-Type: application/json

{
  "text": "文本内容",
  "mood": "情感基调"
}
```

### 健康检查接口
```
GET /api/health
```

## 📁 项目结构

```
memory-recall-app/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 前端JavaScript
├── server.js           # 后端服务器
├── package.json        # 项目配置
├── .env               # 环境变量配置
└── README.md          # 项目说明
```

## 🔄 AI功能说明

### 文本润色功能
- **真实模式**：优先使用智谱（GLM）→ 通义千问；需在根目录 `.env` 配置 `ZHIPU_API_KEY` 或 `DASHSCOPE_API_KEY`
- **模拟模式**：使用本地智能/基础润色
- **自动降级**：API不可用时自动切换到本地/基础模式

### 图片生成功能
- **真实图片模式**：Pexels（免费，推荐）→ 在 `.env` 配置 `PEXELS_API_KEY`
- **生成式图片模式**：百度文心一格（`BAIDU_API_KEY`/`BAIDU_SECRET_KEY`）或通义万相（`DASHSCOPE_API_KEY`）
- **模拟模式**：Picsum 随机图
- **智能选择**：优先 Pexels → 百度/通义 → 模拟

### 环境变量示例
在项目根目录创建 `.env`（未提交到版本库）：
```env
# 后端端口（可选）
PORT=3000

# 文本润色
ZHIPU_API_KEY=your_zhipu_api_key_here
DASHSCOPE_API_KEY=your_dashscope_api_key_here

# 图片
PEXELS_API_KEY=your_pexels_api_key_here
BAIDU_API_KEY=your_baidu_api_key_here
BAIDU_SECRET_KEY=your_baidu_secret_key_here
```

前端可通过 `vue/.env` 指定后端地址：
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 💡 开发说明

### 环境要求
- Node.js 14+
- npm 6+

### 开发模式
```bash
npm run dev  # 使用nodemon自动重启
```

### API成本说明
- **OpenAI GPT-3.5-turbo**：约$0.002/1K tokens
- **OpenAI DALL-E-3**：约$0.04/图片
- **Unsplash API**：免费（每小时5000次请求）
- **模拟数据**：完全免费

## 🔮 扩展功能

### 可能的扩展方向
1. **数据持久化** - 添加数据库存储用户的回忆
2. **用户系统** - 支持用户注册和个人回忆管理
3. **更多AI服务** - 集成更多AI服务提供商
4. **语音功能** - 支持语音输入和朗读
5. **分享功能** - 支持将回忆分享到社交媒体

### 技术升级
- 使用TypeScript增强类型安全
- 添加单元测试和集成测试
- 使用Docker容器化部署
- 添加Redis缓存提升性能

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**享受您的记忆回忆之旅！** ✨