<template>
  <div class="home">
    <section class="infoContainer">
      <div class="pictureAndRole">
        <vs-card>
          <template #img>
            <img
              src="https://media-exp1.licdn.com/dms/image/C4E03AQGL-abya_hCqA/profile-displayphoto-shrink_800_800/0/1630622353198?e=1642636800&v=beta&t=I0SdFr-Mn3QOFjcc92bBH7rZDcnxhSM5iC-u_-vex78"
              alt=""
            />
          </template>
        </vs-card>
        <div class="nameCard">
          <vs-card type="3">
            <template #title>
              <h2>Nicolás Villabona</h2>
            </template>
            <template #text>
              <p>Frontend Developer</p>
            </template>
          </vs-card>
        </div>
      </div>
      <div class="about"></div>
    </section>
    <section class="languagesAndAbout">
      <vs-alert relief color="#108775">
        <h1>Languages I speak</h1>
        <div class="languages-grid">
          <p>Spanish</p>
          <p>🇨🇴</p>
          <p>Native</p>

          <p>English</p>
          <p>🇺🇸</p>
          <p>Advanced</p>

          <p>French</p>
          <p>🇫🇷</p>
          <p>Basic</p>
        </div>
      </vs-alert>
      <vs-alert relief color="#00c58e">
        <h1>A bit about me</h1>
        <div style="text-align: justify">
          <p>
            I am a frontend developer with a passion for creating beautiful and
            functional web applications. I am currently working as a frontend
            developer at
            <a href="https://wacoservices.com" target="_blank" ref="noopener">
              Waco
            </a>
          </p>
          <p>
            I'm {{ calcularEdad("10/09/1997") }} years old and I currently live
            in Cali, Colombia.
          </p>
        </div>
      </vs-alert>
    </section>
    <section class="skills">
      <skills-container></skills-container>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import SkillsContainer from "@/components/SkillsContainer.vue";

export default {
  name: "Home",
  components: {
    SkillsContainer,
  },
  methods: {
    calcularEdad(fecha) {
      var hoy = new Date();
      var cumpleanos = new Date(fecha);
      var edad = hoy.getFullYear() - cumpleanos.getFullYear();
      var m = hoy.getMonth() - cumpleanos.getMonth();

      if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
      }

      return edad;
    },
  },
};
</script>
<style scoped>
.home {
  padding: 2em;
  /* display: flex;
  justify-content: center; */
}
.infoContainer {
  display: flex;
  justify-content: center;
}
.skills {
  margin-top: 2em;
}
.pictureAndRole {
  display: flex;
  align-items: center;
}
.about {
  display: flex;
  align-items: center;
}
.languagesAndAbout {
  margin-top: 2em;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1em;
}

.nameCard {
  margin-left: -1.5em;
}
.vs-alert {
  height: 100% !important;
}
.languages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 0em 25%;
  text-align: center;
}

@media screen and (max-width: 800px) {
  .languagesAndAbout {
    grid-template-columns: 1fr;
  }
  .languages-grid {
    padding: 0;
  }
}
</style>
