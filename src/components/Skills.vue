<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <div class="container">
      <div v-for="(item, i) in data" :key="i">
        <vs-tooltip>
          <img :src="item.img_link" />
          <template #tooltip>{{item.title}} </template>
        </vs-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style>
/* grid with centered items */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  align-items: center;
}
/* .container {
    
} */
.card {
  width: 15em;
  height: 12em;
  border-radius: 20px;
  background: white;
  color: black;
}
</style>
