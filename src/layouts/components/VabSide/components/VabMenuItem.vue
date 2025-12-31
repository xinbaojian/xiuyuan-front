<template>
  <el-menu-item :index="handlePath(routeChildren.path)" @click="handleLink">
    <el-icon
      v-if="routeChildren.meta && routeChildren.meta.icon"
      class="vab-fas-icon"
    >
      <component :is="getIconComponent(routeChildren.meta.icon)" />
    </el-icon>
    <span>{{ routeChildren.meta.title }}</span>
  </el-menu-item>
</template>

<script setup>
import { isExternal } from "@/utils/validate";
import path from "path";
import { faToElIcon } from "@/utils/vab";
import { useRouter, useRoute } from "vue-router";
import * as ElIcons from "@element-plus/icons-vue";

defineOptions({
  name: "VabMenuItem",
});

const router = useRouter();
const route = useRoute();

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

const handleLink = () => {
  const routePath = props.routeChildren.path;
  const target = props.routeChildren.meta.target;

  if (target === "_blank") {
    if (isExternal(routePath)) {
      window.open(routePath);
    } else if (isExternal(props.fullPath)) {
      window.open(props.fullPath);
    } else if (route.path !== path.resolve(props.fullPath, routePath)) {
      let routeData = router.resolve(path.resolve(props.fullPath, routePath));
      window.open(routeData.href);
    }
  } else {
    if (isExternal(routePath)) {
      window.location.href = routePath;
    } else if (isExternal(props.fullPath)) {
      window.location.href = props.fullPath;
    } else if (route.path !== path.resolve(props.fullPath, routePath)) {
      router.push(path.resolve(props.fullPath, routePath));
    }
  }
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
