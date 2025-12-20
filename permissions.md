在这个框架中，控制按钮显示的权限机制主要有两种方式，且都已经封装好了，你可以直接使用。

### 1. 使用 `v-permissions` 指令（推荐）
这是框架提供的自定义指令，专门用于控制元素（如按钮）的显示与隐藏。

**使用方法：**
在需要控制权限的按钮上添加 `v-permissions` 指令，并传入一个包含所需权限角色的数组。

```html
<!-- 只有拥有 'admin' 角色的用户才能看到此按钮 -->
<el-button v-permissions="['admin']">删除</el-button>

<!-- 拥有 'admin' 或 'editor' 角色的用户都能看到此按钮 -->
<el-button v-permissions="['admin', 'editor']">编辑</el-button>
```

**原理说明：**
- **定义位置**：`layouts/Permissions/permissions.js`
- **注册位置**：`src/plugins/index.js` (通过 `layouts/Permissions/index.js` 全局注册)
- **工作机制**：指令会获取 Vuex 中的 `user/permissions`，并与你传入的数组进行比对。如果没有匹配的权限，该指令会将当前 DOM 元素从页面中移除 (`removeChild`)。

---

### 2. 使用 `checkPermission` 函数
如果你需要更复杂的逻辑（比如结合其他条件判断），可以使用框架提供的工具函数。

**使用方法：**
1. 引入工具函数：
   ```javascript
   import checkPermission from '@/utils/permission'
   ```
2. 在 `v-if` 中使用：
   ```html
   <el-button v-if="checkPermission(['admin']) && someOtherCondition">复杂判断按钮</el-button>
   ```

**原理说明：**
- **定义位置**：`src/utils/permission.js`
- **工作机制**：这是一个纯函数，接收权限数组作为参数，返回布尔值 (`true`/`false`)。

### ⚠️ 重要提示（关于 Vue 3 兼容性）
我检查了 `layouts/Permissions/permissions.js` 的源码，发现它使用的是 Vue 2 的生命周期钩子 `inserted`：

```javascript
// layouts/Permissions/permissions.js
export default {
  inserted(element, binding) { // <--- Vue 2 写法
    // ...
  },
}
```

而在 Vue 3 中，指令的生命周期钩子已经变更为 `mounted`。
- 如果你发现 `v-permissions` 指令**不起作用**（即没有权限也能看到按钮），这是因为框架代码未适配 Vue 3。
- **解决方法**（如果不介意修改这一个文件）：将 `inserted` 改为 `mounted` 即可生效。如果不修改代码，建议使用第 2 种 `checkPermission` + `v-if` 的方式。