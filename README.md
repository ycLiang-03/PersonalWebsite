# Personal Website

个人网站项目，使用 Vue 3 + Three.js 实现海洋背景效果。

## 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **3D效果**：Three.js（海浪背景动画、Gerstner波、着色器编程）
- **部署**：Git、GitHub、Vercel

## 项目结构

```
├── public/
│   └── avatar.jpg          # 头像图片
├── src/
│   ├── components/
│   │   ├── Hero.vue        # 英雄区域组件
│   │   ├── Nav.vue         # 导航组件
│   │   └── OceanBackground.vue  # 海洋背景组件
│   ├── App.vue             # 主应用组件
│   ├── main.css            # 全局样式
│   └── main.js             # 应用入口
├── 配置文件                # 标准项目配置
```

## 主要功能

- **动态海洋背景**：使用 Three.js 实现真实的海浪动画效果
- **响应式设计**：适配不同屏幕尺寸
- **导航栏**：简洁的导航菜单
- **英雄区域**：包含头像和个人信息

## 最近更新

### 海面细节优化（2026-04-17）

- **减少细碎噪声**：降低了高频噪声频率和强度，使海面更加平滑
- **聚焦浪尖效果**：只在浪尖区域保留细节和高光
- **增强层次感**：浪尖与波谷的对比更加明显
- **优化法线细节**：减少了波浪法线细节的强度，只在浪尖区域显示
- **简化噪声组合**：移除了最高频率的微涟漪，专注于大尺度波浪

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署

项目使用 Vercel 进行部署，链接：[Personal Website](https://personal-website.vercel.app)

## 许可证

MIT License