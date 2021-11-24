<template>
  <div class="about">
      <vs-button
        flat
        :active="active == 0"
        @click="active = 0"
      >
        Active
      </vs-button>
    <h1>This is an about page</h1>
  </div>
</template>
