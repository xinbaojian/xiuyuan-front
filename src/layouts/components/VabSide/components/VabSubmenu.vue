<template>
  <el-sub-menu
    ref="subMenu"
    :index="handlePath(item.path)"
    :popper-append-to-body="false"
  >
    <template #title>
      <el-icon v-if="item.meta && item.meta.icon" class="vab-fas-icon">
        <component :is="getIconComponent(item.meta.icon)" />
      </el-icon>
      <span>{{ item.meta.title }}</span>
    </template>
    <slot />
  </el-sub-menu>
</template>

<script setup>
import { isExternal } from "@/utils/validate";
import path from "path";
import { faToElIcon } from "@/utils/vab";
import * as ElIcons from "@element-plus/icons-vue";

defineOptions({
  name: "VabSubmenu",
});

const props = defineProps({
  routeChildren: {
    type: Object,
    default: () => null,
  },
  item: {
    type: Object,
    default: () => null,
  },
  fullPath: {
    type: String,
    default: "",
  },
});

const handlePath = (routePath) => {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.fullPath)) {
    return props.fullPath;
  }
  return path.resolve(props.fullPath, routePath);
};

// 将路由中的icon名称转换为Element Plus图标组件
const getIconComponent = (iconName) => {
  // 获取所有Element Plus图标名称
  const elIconNames = Object.keys(ElIcons);

  // 如果是Element Plus原生图标，直接返回
  if (elIconNames.includes(iconName)) {
    return iconName;
  }

  // 否则使用faToElIcon进行转换（兼容旧的FontAwesome图标名）
  return faToElIcon(iconName);
};
</script>
