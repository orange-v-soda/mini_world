# Mini World

由 **Three.js** 驱动的微型 3D 场景集合。当前包含春雨 · 柳岸听雨、街角 · 面包与日常、森林小岛和轨道星球，支持场景切换、轨道相机、缩放、重置视角和暂停动画。

## 在线访问（GitHub Pages）

部署成功后访问：https://orange-v-soda.github.io/mini_world/

首次发布：在仓库 Settings → Pages → Build and deployment 中，将 Source 设为 GitHub Actions。在 Actions 中运行 Deploy Mini World to GitHub Pages 工作流。此后每次推送到 main 都会自动重新构建并发布。

工作流执行 npm ci、语法检查、生产构建及 Pages 部署。Vite 的 base 已设为 /mini_world/，确保资源在仓库子路径下正确加载。

## 本地开发（可选）

需要 Node.js 22.12 或更高版本。

```bash
npm install
npm run dev
```

打开终端输出的本地地址。

```bash
npm run check
npm run build
npm run preview
```

构建产物位于 `dist/`。浏览器需支持 WebGL 2。

## 项目结构

- `src/main.js`：渲染器、相机、交互、动画循环与场景资源释放。
- `src/scenes/index.js`：场景注册表与示例场景工厂。
- `src/style.css`：响应式界面。
- `index.html`：应用入口。

## 添加场景

在 `src/scenes/` 中创建场景模块，导出工厂函数：

```js
import * as THREE from 'three';

export function createScene() {
  const root = new THREE.Group();
  // 将场景对象添加到 root。
  return {
    root,
    update(timeInSeconds) {
      // 更新动画；timeInSeconds 在暂停时保持不变。
    },
  };
}
```

在 `src/scenes/index.js` 的 `scenes` 数组中注册唯一 `id`、`title`、`description` 和 `create`。场景应拥有独立的几何体和材质，切换时会自动释放。引入纹理、额外监听器或后处理时，需要扩展清理逻辑。

系统偏好减少动态效果时默认暂停场景动画。设备像素比限制为 2，以控制渲染开销。

## 技术选择

Three.js + Vite，使用原生 ES Modules；不引入 UI 框架，便于专注场景开发。参考 [Three.js 官方安装指南](https://threejs.org/manual/en/installation.html)。

## 春雨 · 柳岸听雨

默认展示的春雨微缩场景包含随风摆动的柳条和野花、草尖水珠积聚与滴落、池面涟漪、睡莲叶、漂浮花瓣、湿石径、蜗牛、长椅与雨伞。六个细节视角支持近距离观察。所有动态使用统一的场景时间，暂停按钮会同时停止风、雨和滴水；切换场景时释放资源。
