<template>
  <div class="user-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="queryParams.loginName"
              placeholder="请输入登录账号"
              clearable
              style="width: 180px; margin-right: 10px"
              @keyup.enter="handleQuery"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-input
              v-model="queryParams.username"
              placeholder="请输入用户名"
              clearable
              style="width: 180px; margin-right: 10px"
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
            <el-button type="primary" @click="handleAdd()">添加用户</el-button>
          </div>
        </div>
      </template>

      <!-- 用户列表 -->
      <el-table
        v-loading="loading"
        :data="userList"
        row-key="id"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="loginName" label="登录账号" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="deptName" label="部门" min-width="150" />
        <el-table-column prop="postName" label="岗位" min-width="150" />
        <el-table-column prop="roleNames" label="角色" min-width="150">
          <template #default="scope">
            {{ scope.row.roleNames ? scope.row.roleNames.join(', ') : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="userSex" label="性别" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.userSex === 'MALE' ? '' : scope.row.userSex === 'FEMALE' ? 'danger' : 'info'">
              {{ scope.row.userSex === "MALE" ? "男" : scope.row.userSex === "FEMALE" ? "女" : "未知" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'NORMAL' ? 'success' : 'danger'">
              {{ scope.row.status === "NORMAL" ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column fixed="right" label="操作" min-width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleUpdate(scope.row)" v-permissions="['admin']">编辑</el-button>
            <el-button
              type="primary"
              link
              @click="handleResetPassword(scope.row)"
              :disabled="scope.row.id === '1'"
              v-permissions="['admin']"
            >重置密码</el-button>
            <el-button
              type="primary"
              link
              @click="handleDelete(scope.row)"
              :disabled="scope.row.id === '1'"
              v-permissions="['admin']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleQuery"
        @current-change="handleQuery"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="cancel"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="登录账号" prop="loginName">
          <el-input
            v-model="userForm.loginName"
            placeholder="请输入登录账号"
            maxlength="30"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            maxlength="30"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="userForm.password"
            placeholder="请输入密码"
            type="password"
            maxlength="20"
            show-password
          />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="userForm.deptId"
            :data="deptOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            placeholder="选择部门"
            check-strictly
            filterable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="岗位" prop="postId">
          <el-select
            v-model="userForm.postId"
            placeholder="请选择岗位"
            style="width: 100%"
          >
            <el-option
              v-for="post in postOptions"
              :key="post.value"
              :label="post.label"
              :value="post.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="userForm.roleIds"
            placeholder="请选择角色"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input
            v-model="userForm.mobile"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="性别" prop="userSex">
          <el-radio-group v-model="userForm.userSex">
            <el-radio label="MALE">男</el-radio>
            <el-radio label="FEMALE">女</el-radio>
            <el-radio label="UNKNOWN">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-radio-group v-model="userForm.userType">
            <el-radio label="SYSTEM_USER">系统用户</el-radio>
            <el-radio label="NORMAL_USER">普通用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="NORMAL">正常</el-radio>
            <el-radio label="DISABLE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="userForm.remark"
            type="textarea"
            placeholder="请输入备注"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
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
  getUserList,
  addUser,
  updateUser,
  deleteUser,
} from "@/api/user.js";
import { getRoleOptions } from "@/api/role.js";
import { getDeptOptions } from "@/api/dept.js";
import { getPostOptions } from "@/api/post.js";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";

defineOptions({
  name: "User",
});

// 数据响应
const loading = ref(true);
const userList = ref([]);
const roleOptions = ref([]);
const deptOptions = ref([]);
const postOptions = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const isEdit = ref(false);
const total = ref(0);

// 表单引用
const userFormRef = ref(null);

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  loginName: "",
  username: "",
  status: "",
});

// 用户表单数据
const userForm = reactive({
  id: "",
  loginName: "",
  username: "",
  password: "",
  deptId: "",
  postId: "",
  roleIds: [],
  email: "",
  mobile: "",
  userSex: "UNKNOWN",
  userType: "NORMAL_USER",
  status: "NORMAL",
  remark: "",
});

// 表单验证规则
const rules = {
  loginName: [
    { required: true, message: "登录账号不能为空", trigger: "blur" },
  ],
  username: [
    { required: true, message: "用户名不能为空", trigger: "blur" },
  ],
  password: [
    { required: () => !isEdit.value, message: "密码不能为空", trigger: "blur" },
  ],
  email: [
    { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "请输入正确的邮箱", trigger: "blur" },
  ],
  mobile: [
    { required: false, pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" },
  ],
};

/**
 * 重置表单数据
 */
function resetForm() {
  Object.assign(userForm, {
    id: "",
    loginName: "",
    username: "",
    password: "",
    deptId: "",
    postId: "",
    roleIds: [],
    email: "",
    mobile: "",
    userSex: "UNKNOWN",
    userType: "NORMAL_USER",
    status: "NORMAL",
    remark: "",
  });
}

/**
 * 加载数据
 */
function loadData() {
  loading.value = true;
  getUserList(queryParams)
    .then(response => {
      const data = response.data;
      if (data && data.list) {
        userList.value = data.list;
        total.value = data.total || data.list.length;
      } else {
        userList.value = [];
        total.value = 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * 加载下拉选项
 */
async function loadOptions() {
  try {
    // 加载部门下拉选项
    const deptRes = await getDeptOptions();
    if (deptRes.code === 200 || deptRes.code === 0) {
      deptOptions.value = deptRes.data || [];
    }

    // 加载岗位下拉选项
    const postRes = await getPostOptions();
    if (postRes.code === 200 || postRes.code === 0) {
      postOptions.value = postRes.data || [];
    }

    // 加载角色下拉选项
    const roleRes = await getRoleOptions();
    if (roleRes.code === 200 || roleRes.code === 0) {
      roleOptions.value = roleRes.data || [];
    }
  } catch (error) {
    console.error("加载下拉选项失败:", error);
  }
}

/**
 * 查询
 */
function handleQuery() {
  queryParams.pageNo = 1;
  loadData();
}

/**
 * 新增用户
 */
function handleAdd() {
  resetForm();
  dialogVisible.value = true;
  dialogTitle.value = "新增用户";
  isEdit.value = false;
}

/**
 * 编辑用户
 */
function handleUpdate(row) {
  resetForm();
  isEdit.value = true;
  dialogVisible.value = true;
  dialogTitle.value = "编辑用户";
  Object.keys(userForm).forEach(key => {
    if (row[key] !== undefined) {
      userForm[key] = row[key];
    }
  });
  userForm.id = row.id;
}

/**
 * 删除用户
 */
function handleDelete(row) {
  ElMessageBox.confirm(`确定删除用户 "${row.username}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      return deleteUser(row.id);
    })
    .then(() => {
      ElMessage.success("删除成功");
      loadData();
    })
    .catch(() => {});
}

/**
 * 提交表单
 */
function submitForm() {
  userFormRef.value.validate(valid => {
    if (valid) {
      const submitFn = isEdit.value ? updateUser(userForm.id, userForm) : addUser(userForm);
      submitFn
        .then(() => {
          ElMessage.success(isEdit.value ? "修改成功" : "新增成功");
          dialogVisible.value = false;
          loadData();
        })
        .catch(error => {
          ElMessage.error(error.msg || error.message || "操作失败");
        });
    }
  });
}

/**
 * 取消
 */
function cancel() {
  dialogVisible.value = false;
  if (userFormRef.value) {
    userFormRef.value.resetFields();
  }
}

/**
 * 初始化
 */
onMounted(() => {
  loadOptions();
  loadData();
});
</script>

<style lang="scss" scoped>
.user-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-actions {
    display: flex;
    align-items: center;
  }

  :deep(.el-table th) {
    background-color: var(--el-fill-color-lighter);
  }

  :deep(.el-table__row:hover) {
    background-color: var(--el-fill-color-light);
  }
}
</style>