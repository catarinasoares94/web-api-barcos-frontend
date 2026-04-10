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

    <!-- US011 - LISTAR RESERVAS ATRAVES DO ID DO MARINHEIRO -->

    <div class="box">
      <h2>Minhas Reservas</h2>

      <input type="number" v-model="idPesquisa" placeholder="ID do Marinheiro" />

      <button @click="listarReservas">Listar Reservas</button>

      <table v-if="mostrarReservas && reservas.length > 0">
        <p v-if="reservas.length > 0">
          <strong>Marinheiro:</strong> {{ reservas[0].NOME_MARINHEIRO }} (ID:
          {{ reservas[0].ID_MARINHEIRO }})
        </p>
        <thead>
          <tr>
            <th>ID Barco</th>
            <th>Nome Barco</th>
            <th>Cor</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in reservas" :key="r.ID_BARCO + r.DATA">
            <td>{{ r.ID_BARCO }}</td>
            <td>{{ r.NOME_BARCO }}</td>
            <td>{{ r.COR }}</td>
            <td>{{ formatarData(r.DATA) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- DIV DO CONTAINER -->
</template>

<script>
export default {
  data() {
    return {
      // US010 - Reservar Barco
      reserva: {
        id_marinheiro: '',
        id_barco: '',
        data: '', // usar input type="date" → YYYY-MM-DD
      },

      // US011 - Listar Reserva Através de ID de Marinheiro
      reservas: [],
      idPesquisa: '',
      mostrarReservas: false,
    }
  },

  methods: {
    // US010 - Reservar Barco
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
    // US011 - Listar Reserva Através de ID de Marinheiro
    async listarReservas() {
      if (!this.idPesquisa) {
        alert('Indica o ID do marinheiro')
        return
      }

      const res = await fetch(`http://localhost:8080/api/reservas/marinheiro/${this.idPesquisa}`)

      let dados = {}
      try {
        dados = await res.json()
      } catch {}

      if (res.ok) {
        this.reservas = dados
        this.mostrarReservas = true
      } else {
        this.reservas = []
        this.mostrarReservas = false
        alert(dados.error || 'Erro ao listar reservas')
      }
    },
    formatarData(data) {
      const d = new Date(data)
      return d.toLocaleDateString()
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
