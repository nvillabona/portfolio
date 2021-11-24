<template>
  <div class="center examplex">
    <vs-navbar fixed square center-collapsed v-model="active">
      <template #left>
        <vs-button 
          color="#00c58e"
          @click="activeSidebar = !activeSidebar" >
          <img
            src="https://img.icons8.com/material-outlined/24/000000/menu--v3.png"
          />
        </vs-button>
      </template>
      <vs-navbar-item :active="active === '/'" id="guide">
        <img class="nav-logo" src="../assets/logo.png" alt="Logo" />
      </vs-navbar-item>
    </vs-navbar>
    <vs-sidebar

      v-model="active"
      background="#e9ecef"
      :open.sync="activeSidebar"
    >
      <template #logo>
        <!-- ...img logo -->
      </template>
      <vs-sidebar-item id="/" to="/">
        <template #icon>
          <i class="bx bx-home"></i>
        </template>
        Home
      </vs-sidebar-item>
      <vs-sidebar-item id="about" to="/about">
        <template #icon>
          <i class="bx bxs-music"></i>
        </template>
        About
      </vs-sidebar-item>
      <template #footer> </template>
    </vs-sidebar>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      active: "/",
      activeSidebar: false,
      test: this.$route.path
    };
  },
  watch: {
    $route: function(to) {
      this.active = to.path == "/" ? "/":to.path.replace("/", "");
    }
  }
}
</script>
<style>
.nav-logo {
  width: 2rem;
}

.vs-sidebar__item::after {
  background: #00c58e !important;
}
.vs-sidebar__item.active {
  color: #00c58e !important;
}
</style>
