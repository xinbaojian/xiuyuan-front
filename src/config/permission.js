/**
 * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
 * @description 路由守卫，目前两种模式：all模式与intelligence模式
 */
import router from "@/router";
import store from "@/store";
import VabProgress from "nprogress";
import "nprogress/nprogress.css";
import getPageTitle from "@/utils/pageTitle";
import {
  authentication,
  loginInterception,
  progressBar,
  recordRoute,
  routesWhiteList,
} from "@/config";
import { ElMessage } from "element-plus";

VabProgress.configure({
  easing: "ease",
  speed: 500,
  trickleSpeed: 200,
  showSpinner: false,
});

router.beforeEach(async (to, from, next) => {
  if (progressBar) VabProgress.start();
  let hasToken = store.getters["user/accessToken"];

  if (!loginInterception) hasToken = true;

  // 处理无效路径 /noRedirect
  if (to.path === '/noRedirect' || to.path === 'noRedirect') {
    console.log('检测到无效路径 /noRedirect，重定向到首页')
    next({ path: '/', replace: true })
    if (progressBar) VabProgress.done()
    return
  }

  if (hasToken) {
    if (to.path === "/login") {
      next({ path: "/" });
      if (progressBar) VabProgress.done();
    } else {
      const hasPermissions =
        store.getters["user/permissions"] &&
        store.getters["user/permissions"].length > 0;
      if (hasPermissions) {
        next();
      } else {
        try {
          let permissions;
          if (!loginInterception) {
            //settings.js loginInterception为false时，创建虚拟权限
            await store.dispatch("user/setPermissions", ["admin"]);
            permissions = ["admin"];
          } else {
            permissions = await store.dispatch("user/getUserInfo");
            if (!permissions) {
              throw new Error("获取用户权限失败");
            }
          }

          let accessRoutes = [];
          if (authentication === "intelligence") {
            accessRoutes = await store.dispatch(
              "routes/setRoutes",
              permissions
            );
          } else if (authentication === "all") {
            accessRoutes = await store.dispatch("routes/setAllRoutes");
          }

          console.log('准备添加路由，accessRoutes:', accessRoutes)
          console.log('accessRoutes 类型:', typeof accessRoutes)
          console.log('accessRoutes 是否为数组:', Array.isArray(accessRoutes))

          // 确保accessRoutes是数组
          if (!Array.isArray(accessRoutes)) {
            console.error("路由数据格式错误:", accessRoutes);
            accessRoutes = [];
          }

          console.log('开始添加路由，路由数量:', accessRoutes.length)

          // 添加路由
          accessRoutes.forEach((item) => {
            console.log('添加路由:', item.path || item.name)
            router.addRoute(item);
          });

          console.log('路由添加完成，当前路由列表:', router.getRoutes())

          // 确保路由添加完成后，跳转到目标页面
          next({ ...to, replace: true });
        } catch (error) {
          console.error("路由守卫错误:", error);

          // 检查是否是动态菜单加载失败
          const isDynamicMenuError = error.message && error.message.includes('获取菜单树失败');
          const isDev = process.env.NODE_ENV === 'development';
          const { dynamicMenuFallback } = require('@/config/setting.config.js');

          // 如果是动态菜单加载失败且开发环境允许降级，尝试使用硬编码路由
          if (isDynamicMenuError && isDev && dynamicMenuFallback) {
            console.warn('动态菜单加载失败，使用硬编码路由作为降级方案');
            ElMessage.warning('动态菜单加载失败，已切换到硬编码路由模式');
            next({ ...to, replace: true });
          } else {
            ElMessage.error(error.message || "发生错误，请重新登录");
            await store.dispatch("user/resetAccessToken");
            next(`/login?redirect=${to.path}`);
          }
          if (progressBar) VabProgress.done();
        }
      }
    }
  } else {
    // 检查是否有保存的路由信息（页面刷新场景）
    const savedRoute = sessionStorage.getItem('currentRoute');
    if (savedRoute) {
      try {
        const routeInfo = JSON.parse(savedRoute);
        // 如果目标路由不在白名单中，仍然需要登录
        if (routesWhiteList.indexOf(to.path) !== -1) {
          next();
        } else {
          // 检查当前路径是否需要登录
          if (recordRoute) {
            next(`/login?redirect=${to.path}`);
          } else {
            next("/login");
          }
        }
      } catch (e) {
        console.error('解析保存的路由信息失败:', e);
        // 继续正常的登录检查流程
        if (routesWhiteList.indexOf(to.path) !== -1) {
          next();
        } else {
          if (recordRoute) {
            next(`/login?redirect=${to.path}`);
          } else {
            next("/login");
          }
        }
      }
    } else {
      if (routesWhiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        if (recordRoute) {
          next(`/login?redirect=${to.path}`);
        } else {
          next("/login");
        }
      }
    }

    if (progressBar) VabProgress.done();
  }
  document.title = getPageTitle(to.meta.title);
});

router.afterEach(() => {
  if (progressBar) VabProgress.done();
});
