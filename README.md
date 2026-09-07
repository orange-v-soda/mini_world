# Mini World

由 **Three.js** 驱动的微型 3D 场景集合。当前包含森林小岛和轨道星球，支持场景切换、轨道相机、缩放、重置视角和暂停动画。

## 本地开发

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
