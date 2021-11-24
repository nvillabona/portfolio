<template>
  <transition
    name="fade"
  >
    <div v-if="show" class="container" >
      <div class="flex-start w-full">
        <h1>Tecnologies I've worked with</h1>
      </div>

      <div class="skills">
        <skills title="Languages" :data="languages"></skills>
        <skills title="JS Frameworks" :data="jsFrameworks"></skills>
        <skills title="PHP Frameworks" :data="backendFrameworks"></skills>
        <skills title="Databases" :data="databases"></skills>
        <skills title="Other tools" :data="others"></skills>
      </div>
    </div>
  </transition>
</template>

<script>
import Skills from "@/components/Skills.vue";
export default {
  name: "SkillsContainer",
  components: {
    Skills,
  },
  created() {
    setTimeout(() => {
      this.show = true;
    }, 500);
  },
  destroyed() {
    this.show = false;
  },
  data() {
    return {
      show: false,
      languages: [
        {
          title: "Javascript",
          img_link: "https://img.icons8.com/color/48/000000/javascript.png",
        },
        {
          title: "Css",
          img_link: "https://img.icons8.com/color/48/000000/css3.png",
        },
        {
          title: "Html",
          img_link: "https://img.icons8.com/color/48/000000/html-5.png",
        },
        {
          title: "Php",
          img_link: "https://img.icons8.com/officel/48/000000/php-logo.png",
        },
        // {
        //   title: "Python",
        //   img_link: "https://img.icons8.com/color/48/000000/python--v1.png",
        // },
      ],

      jsFrameworks: [
        {
          title: "Vue.js",
          img_link: "https://img.icons8.com/color/48/000000/vue-js.png",
        },
        {
          title: "React",
          img_link: "https://img.icons8.com/color/48/000000/react-native.png",
        },
      ],
      backendFrameworks: [
        {
          title: "Laravel",
          img_link: "https://img.icons8.com/fluency/48/000000/laravel.png",
        },
      ],
      others: [
        {
          title: "Git",
          img_link: "https://img.icons8.com/color/48/000000/git.png",
        },
        {
          title: "Bootstrap",
          img_link: "https://img.icons8.com/color/48/000000/bootstrap.png",
        },
        {
          title: "Material-ui",
          img_link: "https://img.icons8.com/color/48/000000/material-ui.png",
        },
        {
          title: "Figma",
          img_link: "https://img.icons8.com/color/48/000000/figma.png",
        },
      ],
      databases: [
        {
          title: "Firebase",
          img_link: "https://img.icons8.com/color/48/000000/firebase.png",
        },
        {
          title: "MySql",
          img_link:
            "https://img.icons8.com/ios-filled/48/000000/mysql-logo.png",
        },
      ],
    };
  },
};
</script>

<style scoped>
.skills {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-radius: 20px;
  gap: 1em;
  place-items: center;
}
.container {
  background: #35495e;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1em;
  border-radius: 20px;
}

@media screen and (max-width: 1000px) {
  .skills {
    grid-template-columns: 1fr;
    gap: 2em;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
