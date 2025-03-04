<template>
  <header class="bg-white p-3 flex justify-between items-center border-b border-gray-300 h-12 shadow-sm">
    <div class="flex items-center">
    </div>
    <div class="flex items-center gap-4">
      <el-dropdown>
        <div class="flex items-center gap-4 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition ">
          <el-icon class="text-gray-600 ">
            <Avatar />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="w-40">
            <!-- View Profile -->
            <el-dropdown-item @click="goToProfile">
              <el-icon class="mr-2">
                <User />
              </el-icon> View Profile
            </el-dropdown-item>

            <!-- Logout -->
            <el-dropdown-item divided @click="logout">
              <el-icon class="mr-2 text-red-500">
                <Back />
              </el-icon> Logout
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

    </div>
  </header>
</template>

<script setup lang="ts">

import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { clearAuthData } from '../utils/api';

const router = useRouter();

const logout = () => {
  clearAuthData(); // ✅ Clears token & user ID from localStorage

  ElMessage.success('Logged out successfully!');

  setTimeout(() => {
    router.push('/login');  
    router.go(0); // ✅ Refresh page to fully reset state
  }, 500);
};


</script>
