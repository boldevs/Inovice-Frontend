<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <el-card class="w-full max-w-md shadow-lg p-6">
      <template #header>
        <div class="flex items-center justify-center gap-2 text-2xl font-bold text-gray-700">
          <el-icon class="text-blue-500">
            <Document />
          </el-icon>
          Mini Invoice
        </div>
      </template>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" @submit.prevent="handleLogin" class="space-y-4">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="Enter username or email" clearable class="h-12 ">
            <template #prefix>
              <el-icon class="text-gray-500">
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="Enter password" clearable show-password
            class="h-12 ">
            <template #prefix>
              <el-icon class="text-gray-500">
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="w-full h-10 mt-2 flex justify-center items-center" native-type="submit"
            :loading="loading">
            Login
          </el-button>
        </el-form-item>
      </el-form>

      <div class="text-center text-gray-600 text-sm mt-4">
        Don’t have an account?
        <a href="#" @click.prevent="showRegisterAlert" class="text-blue-500 hover:text-blue-700">
          Register
        </a>
      </div>

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElForm, ElMessage } from 'element-plus';
import { login, setAuthData } from '../utils/api';

const router = useRouter();
const loading = ref(false);

const loginForm = ref({
  username: '',
  password: '',
});

const loginFormRef = ref<InstanceType<typeof ElForm>>();

// Form validation rules
const rules = {
  username: [
    { required: true, message: 'Please enter your username or email', trigger: 'blur' },
    { min: 3, message: 'Username/email must be at least 3 characters', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
  ],
};

const showRegisterAlert = () => {
  ElMessage.warning('Registration is not available yet!');
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const response = await login(loginForm.value.username, loginForm.value.password);

        if (response && response.token && response.userId) {  // ✅ Ensure both token & userId exist
          setAuthData(response.token, response.userId); // ✅ Store in localStorage
          console.log("✅ Token & User ID received:", response);

          ElMessage.success('✅ Login successful!');

          setTimeout(() => {
            router.push('/'); // Redirect to dashboard or homepage
          }, 500);
        } else {
          throw new Error("❌ Token or User ID not found in response");
        }

      } catch (error) {
        console.error('❌ Login error:', error);
        ElMessage.error('❌ Login failed. Please check your credentials.');
      } finally {
        loading.value = false;
      }
    }
  });
};


</script>

<style scoped>
/* Improve card appearance */
.el-card {
  border-radius: 10px;
  background-color: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Input fields */
.el-input {
  height: 45px;
}

/* Responsive */
@media (max-width: 640px) {
  .el-card {
    width: 90%;
  }
}
</style>
