<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        <h1>GESTÃO EFICIENTE DE<br />MARINHEIROS E BARCOS</h1>
        <p>Controlar marinheiros, barcos e reservas de forma simples e eficaz.</p>
      </div>
    </section>

    <!-- CARDS -->
    <section class="cards">
      <div class="card marinheiros" @click="$router.push('/Marinheiros')">
        <h2>Gestão de Marinheiros ⚓</h2>
        <button>Gerir Marinheiros</button>
      </div>

      <div class="card barcos" @click="$router.push('/barcos')">
        <h2>Gestão de Barcos 🚤</h2>
        <button>Gerir Barcos</button>
      </div>

      <div class="card reservas" @click="$router.push('/reservas')">
        <h2>Gestão de Reservas 📅</h2>
        <button>Minhas Reservas</button>
      </div>
    </section>

    <!-- SECÇÃO INFERIOR -->
    <section class="cta">
      <div class="cta-content">
        <h2>Simplifique a Gestão Náutica!</h2>
        <p>
          Uma solução completa, moderna e intuitiva para a sua empresa.
        </p>
        
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* HERO */
.hero {
  height: 420px;
  border-radius: 20px;
  overflow: hidden;

  background-image: url('/images/hero.png');
  background-size: cover;
  background-position: 25% 25%;

  position: relative;
  display: flex;
  align-items: center;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 30, 60, 0.65);
}

.hero-content {
  position: relative;
  color: white;
  padding: 50px;
  max-width: 600px;
}

.hero h1 {
  font-size: 38px;
  margin-bottom: 15px;
}

.hero p {
  margin-bottom: 20px;
  opacity: 0.9;
}

.hero button {
  background: #ff9800;
  border: none;
  padding: 12px 22px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.hero button:hover {
  transform: scale(1.05);
}

/* CARDS */
.cards {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.card {
  width: 320px;
  height: 220px;

  border-radius: 20px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 20px;
  color: white;

  background-size: cover;
  background-position: center;

  position: relative;
  cursor: pointer;

  transition: 0.3s;
}

.card:hover {
  transform: translateY(-8px);
}

/* overlay */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 30, 60, 0.6);
}

.card * {
  position: relative;
}

.card h2 {
  margin-bottom: 8px;
}

.card p {
  margin-bottom: 12px;
  font-size: 14px;
}

.card button {
  background: rgba(170, 171, 171, 0.285);
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

/* imagens */
.marinheiros {
  background-image: url('/images/marinheiros.png');
}

.barcos {
  background-image: url('/images/barcos.png');
}

.reservas {
  background-image: url('/images/reservas.png');
}

/* CTA */
.cta {
  height: 300px;
  border-radius: 20px;
  overflow: hidden;

  background-image: url('/images/wave.png');
  background-size: cover;
  background-position: center;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 30, 60, 0.7);
}

.cta-content {
  position: relative;
  color: white;
  text-align: center;
  max-width: 600px;
}

.cta h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.cta button {
  margin-top: 15px;
  background: #ff9800;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
</style>
