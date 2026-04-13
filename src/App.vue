<template>
  <!-- NAVBAR (escondida na Home) -->
  <header v-if="$route.path !== '/'" class="navbar">
    <div class="logo">
      ⚓ {{ $route.path.includes('reservas') ? 'MARINHEIRO' : 'GESTOR' }}
    </div>

    <nav class="nav-links">
      <router-link to="/">Home</router-link>
      <router-link to="/marinheiros">Marinheiros</router-link>
      <router-link to="/barcos">Barcos</router-link>
      <router-link to="/reservas">Reservas</router-link>
    </nav>
  </header>

  <!-- CONTEÚDO -->
  <main :class="{ 'no-padding': $route.path === '/' }">
    <router-view></router-view>
  </main>
</template>

<style scoped> 
/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 15px 40px;

  background: linear-gradient(90deg, #0f2027, #203a43, #2c5364);
  color: white;

  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

/* LOGO */
.logo {
  font-size: 22px;
  font-weight: bold;
}

/* LINKS */
.nav-links a {
  color: white;
  text-decoration: none;
  margin-left: 20px;

  padding: 8px 14px;
  border-radius: 8px;

  transition: 0.3s;
}

.nav-links a:hover {
  background-color: rgba(22, 162, 223, 0.15);
}

/* LINK ATIVO */
.router-link-active {
  background-color: #ff9800;
  color: white;
}

/* MAIN */
main {
  padding: 30px;
  background-color: #f4f7fa;
  min-height: 100vh;
}

/* HOME sem padding (full width) */
.no-padding {
  padding: 0;
}
</style>