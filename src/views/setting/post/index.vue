<template>
  <div class="post-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>岗位管理</span>
          <div class="header-actions">
            <el-input v-model="listQuery.postName" placeholder="搜索岗位..." clearable
              style="width: 200px; margin-right: 10px">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-input v-model="listQuery.postCode" placeholder="岗位编码" clearable
              style="width: 150px; margin-right: 10px">
              <template #prefix>
                <el-icon>
                  <Key />
                </el-icon>
              </template>
            </el-input>
            <el-select v-model="listQuery.status" placeholder="状态筛选" clearable style="width: 120px; margin-right: 10px">
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="NORMAL"></el-option>
              <el-option label="禁用" value="DISABLE"></el-option>
            </el-select>
            <el-button type="primary" @click="fetchList">查询</el-button>
            <el-button type="primary" @click="openCreate">添加岗位</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="listLoading" :data="list" style="width:100%">
        <el-table-column prop="postName" label="岗位名称" min-width="150" />
        <el-table-column prop="postCode" label="岗位编码" min-width="120" />
        <el-table-column prop="orderNum" label="排序" min-width="80" align="center" />
        <el-table-column prop="status" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'NORMAL' ? 'success' : 'info'">
              {{ row.status === 'NORMAL' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" min-width="180" align="center">
          <template #default="{ row }">
            <el-button type="text" @click="openEdit(row)">编辑</el-button>
            <el-button type="text" @click="handleDelete(row)" style="color: #f56c6c;">删除</el-button>
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
        <el-form-item label="岗位名称" prop="postName">
          <el-input v-model="form.postName" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="postCode">
          <el-input v-model="form.postCode" placeholder="请输入岗位编码" />
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
import { Search, Key } from "@element-plus/icons-vue";
import { getList, doCreate, doEdit, doDelete } from "@/api/post";

const list = ref([]);
const totalCount = ref(0);
const listLoading = ref(false);

const listQuery = reactive({
  pageNo: 1,
  pageSize: 20,
  postName: "",
  postCode: "",
  status: ""
});

const dialogVisible = ref(false);
const dialogTitle = ref("新建岗位");
const formRef = ref(null);
const form = reactive({
  id: null,
  postName: "",
  postCode: "",
  orderNum: 0,
  status: "NORMAL",
  remark: ""
});

const rules = {
  postName: [{ required: true, message: "请输入岗位名称", trigger: "blur" }],
  postCode: [{ required: true, message: "请输入岗位编码", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

async function fetchList() {
  listLoading.value = true;
  try {
    const response = await getList({
      pageNo: listQuery.pageNo,
      pageSize: listQuery.pageSize,
      postName: listQuery.postName,
      postCode: listQuery.postCode,
      status: listQuery.status,
    });

    list.value = response.data.list;
    totalCount.value = response.data.total || 0;
  } catch (e) {
    console.error('fetchList error:', e);
    list.value = [];
    totalCount.value = 0;
    ElMessage.error('获取岗位列表失败');
  } finally {
    listLoading.value = false;
  }
}

function handleSizeChange(val) {
  listQuery.pageSize = val;
  listQuery.pageNo = 1;
  fetchList();
}

function handleCurrentChange(val) {
  listQuery.pageNo = val;
  fetchList();
}

function openCreate() {
  dialogTitle.value = "新建岗位";
  form.id = null;
  form.postName = "";
  form.postCode = "";
  form.orderNum = 0;
  form.status = "NORMAL";
  form.remark = "";
  dialogVisible.value = true;
}

async function openEdit(row) {
  dialogTitle.value = "编辑岗位";

  // 直接使用表格行数据填充表单
  form.id = row.id;
  form.postName = row.postName || "";
  form.postCode = row.postCode || "";
  form.orderNum = row.orderNum !== undefined && row.orderNum !== null ? row.orderNum : 0;
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
        postName: form.postName,
        postCode: form.postCode,
        orderNum: form.orderNum,
        status: form.status,
        remark: form.remark,
      };

      if (form.id) {
        // 编辑岗位
        submitData.id = form.id;
        await doEdit(submitData);
        ElMessage.success("更新成功");
      } else {
        // 新增岗位
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
  ElMessageBox.confirm("确定删除该岗位吗？", "提示", { type: "warning" })
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
.post-container {
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
    gap: 10px;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  :deep(.el-table) {
    .el-button--text {
      padding: 0 8px;
    }
  }
}
</style>