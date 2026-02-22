<template>
  <el-dialog
    v-model="dialogVisible"
    title="个人中心"
    width="600px"
    :before-close="handleClose"
    class="personal-center-dialog"
    :close-on-click-modal="false"
    append-to-body
    :modal="true"
    destroy-on-close
    draggable
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="personal-form"
    >
      <el-form-item label="用户头像">
        <div class="avatar-upload-wrapper">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
            accept="image/*"
          >
            <img v-if="formData.avatar && avatarUrl" :src="avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="avatar-tip">点击上传头像</div>
        </div>
      </el-form-item>

      <el-form-item label="登录账号">
        <el-input v-model="formData.loginName" disabled />
      </el-form-item>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号码" />
      </el-form-item>

      <el-form-item label="性别" prop="userSex">
        <el-radio-group v-model="formData.userSex">
          <el-radio label="MALE">男</el-radio>
          <el-radio label="FEMALE">女</el-radio>
          <el-radio label="UNKNOWN">未知</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-divider content-position="left">其他信息</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">部门：</span>
            <span class="info-value">{{ formData.deptName || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">岗位：</span>
            <span class="info-value">{{ formData.postName || '-' }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">最后登录IP：</span>
            <span class="info-value">{{ formData.loginIp || '-' }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">最后登录时间：</span>
            <span class="info-value">{{ formData.loginDate || '-' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { getCurrentUserInfo, updateUserProfile } from "@/api/user";
import { uploadFile, getFileInfo } from "@/api/file";

defineOptions({
  name: "PersonalCenterDialog",
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:visible", "success"]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});

const formRef = ref(null);
const submitting = ref(false);
const loading = ref(false);

const formData = ref({
  id: "",
  loginName: "",
  username: "",
  email: "",
  mobile: "",
  userSex: "UNKNOWN",
  avatar: "",
  deptName: "",
  postName: "",
  loginIp: "",
  loginDate: "",
});

const avatarUrl = ref("");

const formRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "用户名长度在 2 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  mobile: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
};

// 获取用户头像URL
const getAvatarUrl = async (avatarId) => {
  if (!avatarId) return "";
  try {
    const info = await getFileInfo(avatarId);
    console.log('获取头像信息:', info);
    if (info && info.data) {
      const url = info.data.objectUrl || "";
      console.log('头像URL:', url);
      return url;
    }
  } catch (error) {
    console.error("获取头像信息失败:", error);
  }
  return "";
};

// 加载当前用户信息
const loadUserInfo = async () => {
  loading.value = true;
  try {
    const res = await getCurrentUserInfo();
    if (res && res.data) {
      formData.value = {
        id: res.data.id || "",
        loginName: res.data.loginName || "",
        username: res.data.username || "",
        email: res.data.email || "",
        mobile: res.data.mobile || "",
        userSex: res.data.userSex || "UNKNOWN",
        avatar: res.data.avatar || "",
        deptName: res.data.deptName || "",
        postName: res.data.postName || "",
        loginIp: res.data.loginIp || "",
        loginDate: res.data.loginDate || "",
      };
      
      // 获取头像URL
      if (formData.value.avatar) {
        avatarUrl.value = await getAvatarUrl(formData.value.avatar);
      }
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    ElMessage.error("获取用户信息失败");
  } finally {
    loading.value = false;
  }
};

// 头像上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 处理头像上传
const handleAvatarUpload = async (options) => {
  const { file } = options;
  try {
    const res = await uploadFile(file, { useRandomFileName: true });
    if (res && res.data) {
      formData.value.avatar = res.data;
      avatarUrl.value = await getAvatarUrl(res.data);
      ElMessage.success("头像上传成功");
    }
  } catch (error) {
    console.error("头像上传失败:", error);
    ElMessage.error("头像上传失败");
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    submitting.value = true;
    try {
      const data = {
        username: formData.value.username,
        avatar: formData.value.avatar,
        email: formData.value.email,
        mobile: formData.value.mobile,
        userSex: formData.value.userSex,
      };

      await updateUserProfile(formData.value.id, data);
      ElMessage.success("保存成功");
      emit("success");
      handleClose();
    } catch (error) {
      console.error("保存失败:", error);
      ElMessage.error(error.message || "保存失败");
    } finally {
      submitting.value = false;
    }
  });
};

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields();
  avatarUrl.value = "";
  dialogVisible.value = false;
};

// 监听对话框打开，加载用户信息
watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadUserInfo();
    }
  }
);
</script>

<style lang="scss">
.personal-center-dialog {
  .el-dialog__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .el-dialog__body {
    padding: 20px;
    max-height: 600px;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 10px 20px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.personal-form {
  .avatar-upload-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;

    .avatar-uploader {
      .el-upload {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border: 1px dashed #d9d9d9;
        border-radius: 50%;
        width: 100px;
        height: 100px;
        transition: all 0.3s;

        &:hover {
          border-color: #409eff;
        }
      }

      .avatar {
        width: 100px;
        height: 100px;
        display: block;
        border-radius: 50%;
        object-fit: cover;
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .avatar-tip {
      font-size: 12px;
      color: #909399;
    }
  }

  .el-input.is-disabled .el-input__inner {
    color: #606266;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.info-item {
  padding: 8px 0;
  font-size: 14px;

  .info-label {
    color: #909399;
    font-weight: 500;
  }

  .info-value {
    color: #606266;
  }
}
</style>
