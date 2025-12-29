<template>
  <div class="menu-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <div class="header-actions">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入菜单标题"
              clearable
              style="width: 200px; margin-right: 10px"
              @keyup.enter="handleQuery"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-select
              v-model="queryParams.status"
              placeholder="状态筛选"
              clearable
              style="width: 120px; margin-right: 10px"
            >
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="NORMAL"></el-option>
              <el-option label="禁用" value="DISABLE"></el-option>
            </el-select>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button type="primary" @click="handleAdd()">添加菜单</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="menuList"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
        style="width: 100%"
      >
        <el-table-column prop="meta.title" label="菜单标题" min-width="150">
          <template #default="scope">
            <span style="display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;">
              <el-icon v-if="scope.row.meta && scope.row.meta.icon">
                <component :is="faToElIcon(scope.row.meta.icon)" />
              </el-icon>
              <span>{{ scope.row.meta?.title || '' }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="路由名称" min-width="120" />
        <el-table-column prop="type" label="菜单类型" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'BUTTON' ? 'warning' : 'primary'" size="small">
              {{ scope.row.type === "BUTTON" ? "按钮" : "菜单" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="120" />
        <el-table-column prop="component" label="组件路径" min-width="200" />
        <el-table-column prop="orderNum" label="排序" min-width="80" />
        <el-table-column prop="meta.permissions" label="权限标识" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'NORMAL' ? 'success' : 'info'">
              {{ scope.row.status === "NORMAL" ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="180">
          <template #default="scope">
            <el-button type="primary" link @click="handleUpdate(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="primary"
              link
              @click="handleAdd(scope.row)"
              >新增下级</el-button
            >
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑菜单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="cancel"
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                v-model="menuForm.parentId"
                :data="menuOptions"
                :props="{ value: 'id', label: 'title', children: 'children' }"
                node-key="id"
                placeholder="选择上级菜单"
                check-strictly
                filterable
                :disabled="isEdit"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单标题" prop="title">
              <el-input
                v-model="menuForm.title"
                placeholder="请输入菜单标题"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-select
                v-model="menuForm.type"
                placeholder="请选择菜单类型"
                style="width: 100%"
              >
                <el-option label="菜单" value="MENU" />
                <el-option label="按钮" value="BUTTON" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由名称" prop="name">
              <el-input
                v-model="menuForm.name"
                placeholder="请输入路由名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="路由路径" prop="path">
              <el-input
                v-model="menuForm.path"
                placeholder="请输入路由路径"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件路径" prop="component">
              <el-input
                v-model="menuForm.component"
                placeholder="请输入组件路径"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重定向" prop="redirect">
              <el-input
                v-model="menuForm.redirect"
                placeholder="请输入重定向路径"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="menuForm.orderNum"
                controls-position="right"
                :min="0"
                :max="999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标" prop="icon">
              <el-input
                v-model="menuForm.icon"
                placeholder="请输入图标名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识" prop="permissions">
              <el-input
                v-model="menuForm.permissions"
                placeholder="请输入权限标识"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="menuForm.status"
                placeholder="请选择状态"
                style="width: 100%"
              >
                <el-option label="正常" value="NORMAL" />
                <el-option label="禁用" value="DISABLE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否总是显示">
              <el-switch v-model="menuForm.alwaysShow" />
              <span class="form-item-tip">（选择后将始终显示在侧边栏，即使只有一个子菜单）</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否默认展开">
              <el-switch v-model="menuForm.defaultOpen" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  getMenuTree,
  addMenu,
  updateMenu,
  deleteMenu,
} from "@/api/menu.js";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { faToElIcon } from "@/utils/vab";

defineOptions({
  name: "Menu",
});

// 数据响应
const loading = ref(true);
const menuList = ref([]);
const menuOptions = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const isEdit = ref(false);

// 表单引用
const menuFormRef = ref(null);

// 查询参数
const queryParams = reactive({
  title: "",
  status: "",
});

// 菜单表单数据
const menuForm = reactive({
  id: "",
  parentId: "00",
  type: "MENU",
  path: "",
  name: "",
  component: "",
  redirect: "",
  alwaysShow: false,
  orderNum: 0,
  status: "NORMAL",
  title: "",
  icon: "",
  defaultOpen: false,
  permissions: "",
});

// 表单验证规则
const rules = {
  path: [{ required: true, message: "路由路径不能为空", trigger: "blur" }],
  name: [{ required: true, message: "路由名称不能为空", trigger: "blur" }],
  title: [{ required: true, message: "菜单标题不能为空", trigger: "blur" }],
};

// 页面初始化
onMounted(() => {
  getMenus();
});

// 获取菜单列表
const getMenus = () => {
  loading.value = true;
  getMenuTree(queryParams)
    .then((response) => {
      menuList.value = response.data || [];

      // 构造菜单下拉选项 - 将树形数据转换为树形选择器格式
      const buildMenuOptions = (menus) => {
        return menus.map(menu => ({
          id: menu.id,
          title: menu.meta?.title || menu.path,
          path: menu.path,
          children: menu.children && menu.children.length > 0
            ? buildMenuOptions(menu.children)
            : undefined
        }));
      };

      // 添加根节点
      menuOptions.value = [
        {
          id: "00",
          title: "主类目",
          children: buildMenuOptions(menuList.value)
        }
      ];
    })
    .finally(() => {
      loading.value = false;
    });
};

// 搜索
const handleQuery = () => {
  getMenus();
};

// 新增菜单
const handleAdd = (row) => {
  dialogTitle.value = "添加菜单";
  isEdit.value = false;
  dialogVisible.value = true;
  // 设置父级ID
  if (row) {
    menuForm.parentId = row.id || "00";
  } else {
    menuForm.parentId = "00";
  }
};

// 修改菜单
const handleUpdate = (row) => {
  dialogTitle.value = "编辑菜单";
  isEdit.value = true;
  dialogVisible.value = true;

  // 从 row 中提取数据到表单
  menuForm.id = row.id || "";
  menuForm.parentId = row.parentId || "00";
  menuForm.type = row.type || "MENU";
  menuForm.path = row.path || "";
  menuForm.name = row.name || "";
  menuForm.component = typeof row.component === 'object' ? '' : (row.component || "");
  menuForm.redirect = row.redirect || "";
  menuForm.alwaysShow = row.alwaysShow || false;
  menuForm.orderNum = row.orderNum || 0;
  menuForm.status = row.status || "NORMAL";
  menuForm.title = row.meta?.title || "";
  menuForm.icon = row.meta?.icon || "";
  menuForm.defaultOpen = row.meta?.defaultOpen || false;
  menuForm.permissions = row.meta?.permissions || "";
};

// 提交表单
const submitForm = () => {
  menuFormRef.value.validate((valid) => {
    if (valid) {
      // 构造提交数据
      const submitData = {
        parentId: menuForm.parentId,
        type: menuForm.type,
        path: menuForm.path,
        name: menuForm.name,
        component: menuForm.component,
        redirect: menuForm.redirect,
        alwaysShow: menuForm.alwaysShow,
        orderNum: menuForm.orderNum,
        status: menuForm.status,
        title: menuForm.title,
        icon: menuForm.icon,
        defaultOpen: menuForm.defaultOpen,
        permissions: menuForm.permissions,
      };

      if (isEdit.value) {
        // 更新时需要传递ID
        updateMenu(menuForm.id, submitData)
          .then((response) => {
            ElMessage.success("修改成功");
            dialogVisible.value = false;
            getMenus();
          })
          .catch((error) => {
            // 错误消息已在响应拦截器中显示，这里只需记录日志
            console.error("修改菜单失败:", error);
            // 确保对话框不关闭
          });
      } else {
        addMenu(submitData)
          .then((response) => {
            ElMessage.success("新增成功");
            dialogVisible.value = false;
            getMenus();
          })
          .catch((error) => {
            // 错误消息已在响应拦截器中显示，这里只需记录日志
            console.error("新增菜单失败:", error);
            // 确保对话框不关闭
          });
      }
    }
  });
};

// 取消
const cancel = () => {
  dialogVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  Object.assign(menuForm, {
    id: "",
    parentId: "00",
    type: "MENU",
    path: "",
    name: "",
    component: "",
    redirect: "",
    alwaysShow: false,
    orderNum: 0,
    status: "NORMAL",
    title: "",
    icon: "",
    defaultOpen: false,
    permissions: "",
  });
  if (menuFormRef.value) {
    menuFormRef.value.resetFields();
  }
};

// 删除菜单
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `是否确认删除菜单"${row.meta?.title || row.title}"？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      return deleteMenu(row.id);
    })
    .then((response) => {
      ElMessage.success("删除成功");
      getMenus();
    })
    .catch((error) => {
      // 错误消息已在响应拦截器中显示，这里只需记录日志
      // 如果用户取消了确认框，error 会是 'cancel' 字符串，不需要处理
      if (error !== "cancel") {
        console.error("删除菜单失败:", error);
      }
    });
};
</script>

<style lang="scss" scoped>
.menu-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }

  .header-actions {
    display: flex;
    align-items: center;
  }

  .form-item-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #999;
  }
}
</style>
