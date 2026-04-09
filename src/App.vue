<template>
  <h1>Escolha o Perfil de Utilizador:</h1>

  <router-link to="/marinheiros">Sou Gestor</router-link>
  <router-link to="/barcos">Barcos</router-link>
  <router-link to="/reservas">Reservas</router-link>

  <br>

  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped>
a {
  display: inline-block;
  background-color: black;
  border: solid 1px black;
  color: white;
  padding: 5px;
  margin: 10px;
}

a:hover,
a.router-link-active {
  background-color: rgb(110, 79, 13);
}

div {
  border: dashed black 1px;
  padding: 20px;
  margin: 10px;
  display: inline-block;
}
</style>