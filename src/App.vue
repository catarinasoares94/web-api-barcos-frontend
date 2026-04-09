<template>
 <header class="navbar">
    <h1>UPSKILL BARCOS</h1>

    <nav>
      <router-link to="/marinheiros">Gestão de Marinheiros</router-link>
      <router-link to="/barcos">Gestão de Barcos</router-link>
      <router-link to="/reservas">Gestão de Reservas</router-link>
    </nav>
  </header>

  <main>
    <router-view></router-view>
  </main>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: black;
  color: white;

  padding: 15px 20px;
}

h1 {
  margin: 0;
  font-size: 20px;
}

nav a {
  color: white;
  text-decoration: none;
  margin-left: 15px;
  padding: 6px 10px;
  border-radius: 5px;
}

nav a:hover,
.router-link-active {
  background-color: rgb(110, 79, 13);
}

main {
  padding: 20px;
}
</style>