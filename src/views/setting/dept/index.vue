<template>
  <div class="dept-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <div class="header-actions">
            <el-input
              v-model="queryParams.deptName"
              placeholder="请输入部门名称"
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
            <el-button type="primary" @click="handleAdd()">添加部门</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="deptList"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
        style="width: 100%"
      >
        <el-table-column prop="name" label="部门名称" min-width="120" />
        <el-table-column prop="orderNum" label="排序" min-width="60" />
        <el-table-column prop="leader" label="负责人" min-width="120" />
        <el-table-column prop="phone" label="联系电话" min-width="180" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" min-width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'NORMAL' ? 'success' : 'info'">
              {{ scope.row.status === "NORMAL" ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column fixed="right" label="操作" min-width="180">
          <template #default="scope">
            <el-button type="primary" link @click="handleUpdate(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="primary"
              link
              @click="handleDelete(scope.row)"
              :disabled="
                scope.row.parentId === '00' &&
                scope.row.children &&
                scope.row.children.length > 0
              "
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑部门对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="cancel"
    >
      <el-form
        ref="deptFormRef"
        :model="deptForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="deptForm.parentId"
            :data="deptOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            node-key="id"
            placeholder="选择上级部门"
            check-strictly
            filterable
            :disabled="isEdit"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="deptForm.deptName"
            placeholder="请输入部门名称"
          />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number
            v-model="deptForm.orderNum"
            controls-position="right"
            :min="0"
            :max="999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="deptForm.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="deptForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="deptForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="deptForm.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option label="正常" value="NORMAL" />
            <el-option label="禁用" value="DISABLE" />
          </el-select>
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
  getDeptTree,
  addDept,
  updateDept,
  deleteDept,
} from "@/api/dept.js";
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";

defineOptions({
  name: "Dept",
});

// 数据响应
const loading = ref(true);
const deptList = ref([]);
const deptOptions = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const isEdit = ref(false);

// 表单引用
const deptFormRef = ref(null);

// 查询参数
const queryParams = reactive({
  deptName: "",
  status: "",
});

// 部门表单数据
const deptForm = reactive({
  id: "",
  parentId: "00",
  name: "",
  orderNum: 0,
  leader: "",
  phone: "",
  email: "",
  status: "NORMAL",
});

// 表单验证规则
const rules = {
  parentId: [
    { required: true, message: "上级部门不能为空", trigger: "blur" },
  ],
  name: [
    { required: true, message: "部门名称不能为空", trigger: "blur" },
  ],
  orderNum: [
    { required: true, message: "显示排序不能为空", trigger: "blur" },
  ],
  status: [{ required: true, message: "部门状态不能为空", trigger: "blur" }],
};

// 页面初始化
onMounted(() => {
  getDepts();
});

// 获取部门列表
const getDepts = () => {
  loading.value = true;
  getDeptTree(queryParams)
    .then((response) => {
      deptList.value = response.data;
      // 构造部门下拉选项
      const rootDept = { id: "00", name: "主类目", children: [] };
      
      // 处理部门数据，将顶级部门（parentId为"00"）放入根节点下
      const topLevelDepts = response.data.filter(dept => dept.parentId === "00");
      const otherDepts = response.data.filter(dept => dept.parentId !== "00");
      
      // 构建部门树结构用于下拉选择
      const buildDeptTree = (depts, parentId) => {
        return depts
          .filter(dept => dept.parentId === parentId)
          .map(dept => {
            const children = buildDeptTree(otherDepts, dept.id);
            if (children.length > 0) {
              return { ...dept, children };
            }
            return dept;
          });
      };
      
      rootDept.children = buildDeptTree(response.data, "00");
      deptOptions.value = [rootDept];
    })
    .finally(() => {
      loading.value = false;
    });
};

// 搜索
const handleQuery = () => {
  getDepts();
};

// 重置搜索
const resetQuery = () => {
  Object.assign(queryParams, {
    deptName: "",
    status: "",
  });
  handleQuery();
};

// 新增部门
const handleAdd = (row) => {
  dialogTitle.value = "添加部门";
  isEdit.value = false;
  dialogVisible.value = true;
  // 设置父级ID
  if (row) {
    deptForm.parentId = row.id;
  } else {
    deptForm.parentId = "00";
  }
};

// 修改部门
const handleUpdate = (row) => {
  dialogTitle.value = "编辑部门";
  isEdit.value = true;
  dialogVisible.value = true;

  // 深拷贝，避免影响原数据
  Object.assign(deptForm, row);
};

// 提交表单
const submitForm = () => {
  deptFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        updateDept(deptForm.id, deptForm).then((response) => {
          if (response.code === 200) {
            dialogVisible.value = false;
            getDepts();
          } else {
            ElMessage.error(response.message || "修改失败");
          }
        }).catch((error) => {
          // 从error中提取后端返回的message
          const message = error.response?.data?.message || error.message || "修改失败";
          ElMessage.error(message);
        });
      } else {
        addDept(deptForm).then((response) => {
          ElMessage.success("新增成功");
          dialogVisible.value = false;
          getDepts();
        }).catch((error) => {
          // 从error中提取后端返回的message
          const message = error.response?.data?.message || error.message || "新增失败";
          ElMessage.error(message);
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
  Object.assign(deptForm, {
    id: "",
    parentId: "00",
    name: "",
    orderNum: 0,
    leader: "",
    phone: "",
    email: "",
    status: "NORMAL",
  });
  deptFormRef.value.resetFields();
};

// 删除部门
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `是否确认删除名称为"${row.name}"的数据项？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      return deleteDept(row.id);
    })
    .then((response) => {
      ElMessage.success("删除成功");
      getDepts();
    })
    .catch((error) => {
      // 从error中提取后端返回的message
      const message = error.response?.data?.message || error.message || "删除失败";
      ElMessage.error(message);
    });
};
</script>

<style lang="scss" scoped>
.dept-container {
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
}
</style>