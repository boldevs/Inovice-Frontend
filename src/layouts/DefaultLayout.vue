<template>
  <div class="flex h-screen bg-gray-50 text-gray-900">
    <!-- Sidebar -->
    <Sidebar :isCollapsed="isSidebarCollapsed" @toggleSidebar="toggleSidebar" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col transition-all duration-300">
      <!-- Header -->
      <DashboardHeader />

      <!-- Page Content -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DashboardHeader from '../components/DashboardHeader.vue';
import Sidebar from '../components/Sidebar.vue';

const isSidebarCollapsed = ref(false);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};
</script>

<style scoped>
@media (max-width: 768px) {
  .flex {
    flex-direction: column;
  }
}
</style>
