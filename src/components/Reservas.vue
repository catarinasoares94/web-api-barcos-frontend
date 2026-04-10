<template>
  <div class="container">
    <!-- US010 - RESERVAR BARCO -->

    <div class="box">
      <h2>Reservar Barco</h2>

      <form @submit.prevent="reservarBarco" class="form">
        <label>ID Marinheiro</label>
        <input type="number" v-model="reserva.id_marinheiro" required />

        <label>ID Barco</label>
        <input type="number" v-model="reserva.id_barco" required />

        <label>Data</label>
        <input type="date" v-model="reserva.data" required />

        <button type="submit">Reservar</button>
      </form>
    </div>
  </div>
  <!-- DIV DO CONTAINER -->
</template>

<script>
export default {
  data() {
    return {
      reserva: {
        id_marinheiro: '',
        id_barco: '',
        data: '', // usar input type="date" → YYYY-MM-DD
      },
    }
  },

  methods: {
    async reservarBarco() {
      if (!this.reserva.id_marinheiro || !this.reserva.id_barco || !this.reserva.data) {
        alert('Preenche todos os campos')
        return
      }

      const payload = {
        id_marinheiro: Number(this.reserva.id_marinheiro),
        id_barco: Number(this.reserva.id_barco),
        data: this.reserva.data,
      }

      try {
        const res = await fetch('http://localhost:8080/api/reservas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        let dados = {}
        try {
          dados = await res.json()
        } catch {}

        if (res.ok) {
          alert('Reserva criada com sucesso!')

          this.reserva = {
            id_marinheiro: '',
            id_barco: '',
            data: '',
          }
        } else {
          // 🔹 usa diretamente a mensagem do backend
          alert(dados.error || 'Erro ao criar reserva')
        }
      } catch (e) {
        alert('Erro de ligação ao servidor')
      }
    },
  },
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 600px;
  margin: 20px 0 20px 40px;
}

.box {
  background: #ffffff;
  border-radius: 14px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(192, 26, 26, 0.08);
  border: 1px solid #ddd;

  display: flex;
  flex-direction: column;
  gap: 12px;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  max-width: 350px;
  width: 100%;
  margin-bottom: 5px;
}

.box:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.box h2 {
  font-size: 18px;
  margin-bottom: 10px;
  border-bottom: 2px solid #f1f1f1;
  padding-bottom: 5px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  width: 100%;
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
}

input:focus {
  border-color: #007bff;
  padding: 6px;
  border: 1px solid #999;
}

label {
  margin-top: 10px;
  display: block;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #0056b3;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  background: #f5f5f5;
}

th,
td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
}

.sucesso {
  color: #2e7d32;
  font-weight: 500;
}

.erro {
  color: #c62828;
  font-weight: 500;
}

body {
  background: #f4f6f9;
}
</style>
