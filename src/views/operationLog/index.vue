<template>
  <div class="operation-log-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <div class="header-actions">
            <el-input v-model="listQuery.module" placeholder="操作模块" clearable
              style="width: 140px; margin-right: 10px" />
            <el-input v-model="listQuery.operatorName" placeholder="操作人" clearable
              style="width: 120px; margin-right: 10px" />
            <el-select v-model="listQuery.status" placeholder="操作状态" clearable style="width: 120px; margin-right: 10px">
              <el-option label="成功" value="SUCCESS" />
              <el-option label="失败" value="FAILURE" />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              style="width: 360px; margin-right: 10px"
            />
            <el-button type="primary" @click="fetchList">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="listLoading" :data="list" style="width: 100%">
        <el-table-column prop="module" label="操作模块" min-width="120" />
        <el-table-column prop="operationType" label="操作类型" min-width="100" />
        <el-table-column prop="description" label="操作描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="operatorName" label="操作人" min-width="100" />
        <el-table-column prop="deptName" label="操作部门" min-width="120" />
        <el-table-column prop="requestMethod" label="请求方式" min-width="80">
          <template #default="{ row }">
            <el-tag :type="getMethodTagType(row.requestMethod)" size="small">
              {{ row.requestMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="requestUrl" label="请求URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="operIp" label="操作IP" min-width="120" />
        <el-table-column prop="operTime" label="操作时间" min-width="160" />
        <el-table-column prop="status" label="操作状态" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'SUCCESS' ? 'success' : 'danger'" size="small">
              {{ row.status === 'SUCCESS' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="耗时(ms)" min-width="90" />
        <el-table-column fixed="right" label="操作" min-width="80">
          <template #default="{ row }">
            <el-button type="text" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container" style="margin-top: 12px; text-align: center">
        <el-pagination
          v-model:current-page="listQuery.pageNo"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="listQuery.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="操作日志详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作模块">{{ detailData.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ detailData.operationType }}</el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{ detailData.description }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detailData.operatorName }}</el-descriptions-item>
        <el-descriptions-item label="操作部门">{{ detailData.deptName }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">
          <el-tag :type="getMethodTagType(detailData.requestMethod)" size="small">
            {{ detailData.requestMethod }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行耗时">{{ detailData.costTime }} ms</el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">{{ detailData.requestUrl }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ detailData.operIp }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailData.operTime }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="detailData.status === 'SUCCESS' ? 'success' : 'danger'" size="small">
            {{ detailData.status === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getList, getDetail } from "@/api/operationLog";

/**
 * 获取默认日期范围（最近30天）
 * 开始时间带 00:00:00，结束时间带 23:59:59
 */
function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000);
  const formatDate = (date, time) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${time}`;
  };
  return [formatDate(start, "00:00:00"), formatDate(end, "23:59:59")];
}

const list = ref([]);
const totalCount = ref(0);
const listLoading = ref(false);
const dateRange = ref(getDefaultDateRange());

const listQuery = reactive({
  pageNo: 1,
  pageSize: 20,
  module: "",
  operationType: "",
  operatorId: "",
  operatorName: "",
  status: "",
  startTime: "",
  endTime: "",
});

// 详情对话框
const detailDialogVisible = ref(false);
const detailData = ref({});

/**
 * 获取请求方式对应的标签类型
 */
function getMethodTagType(method) {
  const typeMap = {
    GET: "success",
    POST: "primary",
    PUT: "warning",
    DELETE: "danger",
    PATCH: "info",
  };
  return typeMap[method] || "info";
}

/**
 * 获取操作日志列表
 */
async function fetchList() {
  listLoading.value = true;
  try {
    // 处理日期范围，添加时分秒
    const params = { ...listQuery };
    if (dateRange.value && dateRange.value.length === 2) {
      // 如果日期格式不包含时分秒，则添加
      let startTime = dateRange.value[0];
      let endTime = dateRange.value[1];
      if (startTime && !startTime.includes(":")) {
        startTime = `${startTime} 00:00:00`;
      }
      if (endTime && !endTime.includes(":")) {
        endTime = `${endTime} 23:59:59`;
      }
      params.startTime = startTime;
      params.endTime = endTime;
    } else {
      params.startTime = "";
      params.endTime = "";
    }

    const response = await getList(params);
    const pageData = response && response.data ? response.data : { list: [], total: 0 };
    list.value = Array.isArray(pageData.list) ? pageData.list : [];
    totalCount.value = Number(pageData.total) || 0;
  } catch (e) {
    console.error("fetchList error:", e);
    list.value = [];
    totalCount.value = 0;
    ElMessage.error("获取操作日志列表失败");
  } finally {
    listLoading.value = false;
  }
}

/**
 * 重置查询条件
 */
function resetQuery() {
  listQuery.pageNo = 1;
  listQuery.module = "";
  listQuery.operationType = "";
  listQuery.operatorId = "";
  listQuery.operatorName = "";
  listQuery.status = "";
  listQuery.startTime = "";
  listQuery.endTime = "";
  dateRange.value = getDefaultDateRange();
  fetchList();
}

/**
 * 分页大小变更
 */
function handleSizeChange(val) {
  listQuery.pageSize = val;
  fetchList();
}

/**
 * 页码变更
 */
function handleCurrentChange(val) {
  listQuery.pageNo = val;
  fetchList();
}

/**
 * 打开详情对话框
 */
async function openDetail(row) {
  try {
    const response = await getDetail(row.id);
    if (response && response.data) {
      detailData.value = response.data;
      detailDialogVisible.value = true;
    }
  } catch (e) {
    console.error("获取日志详情失败:", e);
    ElMessage.error("获取日志详情失败");
  }
}

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.operation-log-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
