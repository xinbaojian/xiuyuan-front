<template>
  <div class="role-connainer">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <div class="header-actions">
            <el-input v-model="listQuery.roleName" placeholder="搜索任务..." clearable
              style="width: 200px; margin-right: 10px">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-select v-model="listQuery.status" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="NORMAL"></el-option>
              <el-option label="禁用" value="DISABLE"></el-option>
            </el-select>
            <el-button type="primary" @click="fetchList">查询</el-button>
            <el-button type="primary" @click="openCreate">添加角色</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="listLoading" :data="list" style="width:100%">
        <el-table-column prop="roleName" label="角色名称" min-width="120" />
        <el-table-column prop="roleKey" label="编码" min-width="120" />
        <el-table-column prop="orderNum" label="排序" min-width="80" />
        <el-table-column prop="status" label="状态" min-width="120" >
          <template #default="{ row }">
            <el-tag :type="row.status === 'NORMAL' ? 'success' : 'info'">
              {{ row.status === 'NORMAL' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column fixed="right" label="操作" min-width="180">
          <template #default="{ row }">
            <el-button type="text" @click="openEdit(row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" style="margin-top:12px;text-align:center;">
        <el-pagination v-model:current-page="listQuery.pageNo" background
          layout="total, sizes, prev, pager, next, jumper" :page-size="listQuery.pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="totalCount" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="正常" value="NORMAL" />
            <el-option label="禁用" value="DISABLE" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getList, doCreate, doEdit, doDelete, getDetail } from "@/api/role";

const list = ref([]);
const totalCount = ref(0);
const listLoading = ref(false);

const listQuery = reactive({ pageNo: 1, pageSize: 20, name: "" });

const dialogVisible = ref(false);
const dialogTitle = ref("新建角色");
const formRef = ref(null);
const form = reactive({ 
  id: null, 
  roleName: "", 
  roleKey: "", 
  orderNum: 0, 
  status: "NORMAL", 
  remark: "" 
});

const rules = {
  roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  roleKey: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

async function fetchList() {
  listLoading.value = true;
  try {
    const response = await getList({
      pageNo: listQuery.pageNo,
      pageSize: listQuery.pageSize,
      roleName: listQuery.roleName,
      status: listQuery.status,
    });
    console.log('API response:', response); // 调试日志

    // 处理不同的数据结构
    let data = [];
    let total = 0;
    if (response && response.code === 200) {
      data = response.data.list;
      total = response.data.total || 0;
    }

    list.value = data;
    totalCount.value = total;
  } catch (e) {
    console.error('fetchList error:', e);
    list.value = [];
    totalCount.value = 0;
    ElMessage.error('获取角色列表失败');
  } finally {
    listLoading.value = false;
  }
}

function handleSizeChange(val) {
  listQuery.pageSize = val;
  fetchList();
}

function handleCurrentChange(val) {
  listQuery.pageNo = val;
  fetchList();
}

function openCreate() {
  dialogTitle.value = "新建角色";
  form.id = null;
  form.roleName = "";
  form.roleKey = "";
  form.orderNum = 0;
  form.status = "NORMAL";
  form.remark = "";
  dialogVisible.value = true;
}

async function openEdit(row) {
  dialogTitle.value = "编辑角色";
  
  // 直接使用表格行数据填充表单
  form.id = row.id;
  form.roleName = row.roleName || "";
  form.roleKey = row.roleKey || "";
  form.orderNum = row.orderNum || 0;
  form.status = row.status || "NORMAL";
  form.remark = row.remark || "";

  dialogVisible.value = true;
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      // 准备提交的数据
      const submitData = {
        roleName: form.roleName,
        roleKey: form.roleKey,
        orderNum: form.orderNum,
        status: form.status,
        remark: form.remark,
      };

      if (form.id) {
        // 编辑角色
        submitData.id = form.id;
        await doEdit(submitData);
        ElMessage.success("更新成功");
      } else {
        // 新增角色
        await doCreate(submitData);
        ElMessage.success("创建成功");
      }
      dialogVisible.value = false;
      fetchList();
    } catch (e) {
      console.error("提交失败:", e);
      ElMessage.error((e && e.message) || "操作失败");
    }
  });
}

function handleDelete(row) {
  ElMessageBox.confirm("确定删除该角色吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        await doDelete({ id: row.id });
        ElMessage.success("删除成功");
        fetchList();
      } catch (e) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => { });
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.role-connainer {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }

  .task-title {
    display: flex;
    align-items: center;
  }

  .completed-task {
    text-decoration: line-through;
    color: #909399;
  }

  .task-description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
