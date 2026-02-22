<template>
  <div class="config-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <div class="header-actions">
            <el-input v-model="listQuery.configName" placeholder="参数名称" clearable
              style="width: 180px; margin-right: 10px">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
            <el-input v-model="listQuery.configKey" placeholder="参数键名" clearable
              style="width: 180px; margin-right: 10px">
              <template #prefix>
                <el-icon>
                  <Key />
                </el-icon>
              </template>
            </el-input>
            <el-select v-model="listQuery.configType" placeholder="系统内置" clearable style="width: 120px; margin-right: 10px">
              <el-option label="全部" value=""></el-option>
              <el-option label="是" value="Y"></el-option>
              <el-option label="否" value="N"></el-option>
            </el-select>
            <el-button type="primary" @click="fetchList">查询</el-button>
            <el-button v-permissions="['setting:config:add']" type="primary" @click="openCreate">新增配置</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="listLoading" :data="list" style="width:100%">
        <el-table-column prop="configName" show-overflow-tooltip label="参数名称" min-width="150" />
        <el-table-column prop="configKey" show-overflow-tooltip label="参数键名" min-width="180" />
        <el-table-column prop="configValue" show-overflow-tooltip label="参数键值" min-width="200" />
        <el-table-column prop="configType" show-overflow-tooltip label="系统内置" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.configType === 'Y' ? 'success' : 'info'">
              {{ row.configType === 'Y' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" show-overflow-tooltip label="备注" min-width="160" />
        <el-table-column prop="createTime" show-overflow-tooltip label="创建时间" min-width="160" />
        <el-table-column prop="updateTime" show-overflow-tooltip label="更新时间" min-width="160" />
        <el-table-column fixed="right" label="操作" min-width="150" align="center">
          <template #default="{ row }">
            <el-button v-permissions="['setting:config:edit']" type="text" @click="openEdit(row)">编辑</el-button>
            <el-button v-permissions="['setting:config:delete']" type="text" @click="handleDelete(row)" style="color: #f56c6c;">删除</el-button>
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
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="configType">
          <el-select v-model="form.configType" placeholder="请选择" style="width: 100%">
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
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
import { getList, doCreate, doEdit, doDelete } from "@/api/config";

const list = ref([]);
const totalCount = ref(0);
const listLoading = ref(false);

const listQuery = reactive({
  pageNo: 1,
  pageSize: 20,
  configName: "",
  configKey: "",
  configType: ""
});

const dialogVisible = ref(false);
const dialogTitle = ref("新增配置");
const formRef = ref(null);
const form = reactive({
  id: null,
  configName: "",
  configKey: "",
  configValue: "",
  configType: "N",
  remark: ""
});

const rules = {
  configName: [{ required: true, message: "请输入参数名称", trigger: "blur" }],
  configKey: [{ required: true, message: "请输入参数键名", trigger: "blur" }],
  configValue: [{ required: true, message: "请输入参数键值", trigger: "blur" }],
  configType: [{ required: true, message: "请选择是否系统内置", trigger: "change" }],
};

async function fetchList() {
  listLoading.value = true;
  try {
    const response = await getList({
      pageNo: listQuery.pageNo,
      pageSize: listQuery.pageSize,
      configName: listQuery.configName,
      configKey: listQuery.configKey,
      configType: listQuery.configType,
    });

    list.value = response.data.list;
    totalCount.value = response.data.total || 0;
  } catch (e) {
    console.error('fetchList error:', e);
    list.value = [];
    totalCount.value = 0;
    ElMessage.error('获取配置列表失败');
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
  dialogTitle.value = "新增配置";
  form.id = null;
  form.configName = "";
  form.configKey = "";
  form.configValue = "";
  form.configType = "N";
  form.remark = "";
  dialogVisible.value = true;
}

async function openEdit(row) {
  dialogTitle.value = "编辑配置";

  // 直接使用表格行数据填充表单
  form.id = row.id;
  form.configName = row.configName || "";
  form.configKey = row.configKey || "";
  form.configValue = row.configValue || "";
  form.configType = row.configType || "N";
  form.remark = row.remark || "";

  dialogVisible.value = true;
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      // 准备提交的数据
      const submitData = {
        configName: form.configName,
        configKey: form.configKey,
        configValue: form.configValue,
        configType: form.configType,
        remark: form.remark,
      };

      if (form.id) {
        // 编辑配置
        submitData.id = form.id;
        await doEdit(submitData);
        ElMessage.success("更新成功");
      } else {
        // 新增配置
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
  ElMessageBox.confirm("确定删除该配置吗？", "提示", { type: "warning" })
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
.config-container {
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
