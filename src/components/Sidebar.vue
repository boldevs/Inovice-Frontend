<template>
  <el-menu :default-active="activeMenu"
    class="el-menu-vertical-demo transition-all duration-300 bg-white shadow-lg border-r border-gray-200 w-12"
    :collapse="isCollapsed" text-color="#374151" active-text-color="#2563eb" @select="handleSelect">

    <!-- Sidebar Header -->
    <div class="h-12 flex items-center justify-center border-b border-gray-300">
      <el-menu-item>
        <div class="icon-wrapper">
          <el-icon>
            <Shop />
          </el-icon>
        </div>
      </el-menu-item>
    </div>

    <!-- Sidebar Items (With Tooltips) -->
    <el-tooltip content="Dashboard" placement="right">
      <el-menu-item index="1">
        <router-link to="/" class="sidebar-link">
          <div class="icon-wrapper">
            <el-icon>
              <PieChart />
            </el-icon>
          </div>
        </router-link>
      </el-menu-item>
    </el-tooltip>

    <el-tooltip content="Sales" placement="right">
      <el-menu-item index="2">
        <router-link to="/sales" class="sidebar-link">
          <div class="icon-wrapper">
            <el-icon>
              <Sell />
            </el-icon>
          </div>
        </router-link>
      </el-menu-item>
    </el-tooltip>

    <el-tooltip content="Customers" placement="right">
      <el-menu-item index="3">
        <router-link to="/customers" class="sidebar-link">
          <div class="icon-wrapper">
            <el-icon>
              <User />
            </el-icon>
          </div>
        </router-link>
      </el-menu-item>
    </el-tooltip>

    <el-tooltip content="Products" placement="right">
      <el-menu-item index="4">
        <router-link to="/products" class="sidebar-link">
          <div class="icon-wrapper">
            <el-icon>
              <Box />
            </el-icon> <!-- Changed from Smoking to Box -->
          </div>
        </router-link>
      </el-menu-item>
    </el-tooltip>

  </el-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeMenu = ref('1');
defineProps<{ isCollapsed: boolean }>();

const handleSelect = (index: string) => {
  activeMenu.value = index;
};

</script>

<style scoped>
/* Sidebar Links */
.sidebar-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  display: flex;
  justify-content: center;
  /* Centers content */
  align-items: center;
  width: 100%;
  height: 100%;
}

/* Centering Icons */
.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 48px;
  /* Adjust height to match menu item */
}

/* Active & Hover Effects */
.el-menu-item.is-active {
  background-color: #dfdfdf !important;
  color: white !important;
}
</style>
