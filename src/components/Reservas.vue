<template>
  <div class="page">
    <!-- ESQUERDA -->
    <div class="main">
      <!-- US011 - LISTAR RESERVAS -->
      <div v-if="activeBox === 'listar' && mostrarReservas" class="table-box">
        <table v-if="reservas.length > 0">
          <thead>
            <tr>
              <!-- TODAS -->
              <template v-if="tipoPesquisa === 'todas'">
                <th>Data</th>
                <th>ID Barco</th>
                <th>Nome Barco</th>
                <th>Cor</th>
                <th>ID Marinheiro</th>
                <th>Nome Marinheiro</th>
              </template>

              <!-- MARINHEIRO -->
              <template v-if="tipoPesquisa === 'marinheiro'">
                <th>ID Barco</th>
                <th>Nome Barco</th>
                <th>Data</th>
              </template>

              <!-- BARCO -->
              <template v-if="tipoPesquisa === 'barco'">
                <th>ID Marinheiro</th>
                <th>Nome Marinheiro</th>
                <th>Data</th>
              </template>
            </tr>
          </thead>

          <tbody>
            <tr v-for="r in reservasPaginadas" :key="r.ID_BARCO + r.DATA">
              <!-- TODAS -->
              <template v-if="tipoPesquisa === 'todas'">
                <td>{{ formatarData(r.DATA) }}</td>
                <td>{{ r.ID_BARCO }}</td>
                <td>{{ r.NOME_BARCO }}</td>
                <td>{{ r.COR }}</td>
                <td>{{ r.ID_MARINHEIRO }}</td>
                <td>{{ r.NOME_MARINHEIRO }}</td>
              </template>

              <!-- MARINHEIRO -->
              <template v-if="tipoPesquisa === 'marinheiro'">
                <td>{{ r.ID_BARCO }}</td>
                <td>{{ r.NOME_BARCO }}</td>
                <td>{{ formatarData(r.DATA) }}</td>
              </template>

              <!-- BARCO -->
              <template v-if="tipoPesquisa === 'barco'">
                <td>{{ r.ID_MARINHEIRO }}</td>
                <td>{{ r.NOME_MARINHEIRO }}</td>
                <td>{{ formatarData(r.DATA) }}</td>
              </template>
            </tr>
          </tbody>
        </table>

        <p v-else>Sem resultados.</p>

        <div class="pagination" v-if="totalPages > 1">
          <button @click="currentPage--" :disabled="currentPage === 1">Anterior</button>

          <span>Página {{ currentPage }} de {{ totalPages }}</span>

          <button @click="currentPage++" :disabled="currentPage === totalPages">Seguinte</button>
        </div>

        <!-- INFO DINÂMICA -->
        <p v-if="reservas.length > 0">
          <template v-if="tipoPesquisa === 'marinheiro'">
            <strong>Marinheiro:</strong> {{ reservas[0].NOME_MARINHEIRO }} (ID:
            {{ reservas[0].ID_MARINHEIRO }})
          </template>

          <template v-if="tipoPesquisa === 'barco'">
            <strong>Barco:</strong> {{ reservas[0].NOME_BARCO }} (ID: {{ reservas[0].ID_BARCO }})
          </template>
        </p>
      </div>

      <!-- FORMS -->
      <div class="forms-area">
        <!-- US010 - RESERVAR BARCO -->
        <div v-if="activeBox === 'reservar'" class="card">
          <h3>Reservar Barco</h3>

          <form @submit.prevent="reservarBarco" class="form">
            <label>ID Marinheiro</label>
            <input type="number" v-model="reserva.id_marinheiro" required />

            <label>ID Barco</label>
            <input type="number" v-model="reserva.id_barco" required />

            <label>Data</label>
            <input type="date" v-model="reserva.data" required />

            <button type="submit" class="primary">Reservar</button>
          </form>
        </div>

        <!-- US011 - INPUT PARA LISTAR -->
        <div v-if="activeBox === 'procurar'" class="card">
          <h3>Procurar Reserva</h3>

          <input type="number" v-model="idPesquisa" placeholder="ID do Marinheiro" />
          <button @click="listarReservas">Listar por Marinheiro</button>

          <input type="number" v-model="idBarcoPesquisa" placeholder="ID do Barco" />
          <button @click="listarReservasPorBarco">Listar por Barco</button>
        </div>
      </div>

      <!-- US012 - CANCELAR RESERVA -->
      <div v-if="activeBox === 'cancelar'" class="card danger">
        <h3>Cancelar Reserva</h3>

        <form @submit.prevent="cancelarReservaForm" class="form">
          <label>ID Marinheiro</label>
          <input type="number" v-model="cancelar.id_marinheiro" required />

          <label>ID Barco</label>
          <input type="number" v-model="cancelar.id_barco" required />

          <label>Data</label>
          <input type="date" v-model="cancelar.data" required />

          <button type="submit" class="danger">Cancelar Reserva</button>
        </form>
      </div>
    </div>

    <!-- DIREITA -->
    <div class="sidebar">
      <button @click="toggleBox('reservar')">Reservar Barco</button>

      <button @click="toggleBox('listar')">Todas as Reservas</button>

      <button @click="toggleBox('procurar')">Procurar Reservas</button>

      <button class="danger" @click="toggleBox('cancelar')">Cancelar Reserva</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeBox: 'reservar',

      currentPage: 1,
      itemsPerPage: 10,

      // US010 - Reservar Barco
      reserva: {
        id_marinheiro: '',
        id_barco: '',
        data: '', // usar input type="date" → YYYY-MM-DD
      },

      // US011 - Listar Reserva Através de ID de Marinheiro
      reservas: [],
      idPesquisa: '',
      idBarcoPesquisa: '',
      mostrarReservas: false,
      tipoPesquisa: '',

      // US012 - Cancelar Reserva no Futuro Através do Seu ID
      cancelar: {
        id_marinheiro: '',
        id_barco: '',
        data: '',
      },

      async listarTodasReservas() {
        this.tipoPesquisa = 'todas'

        const res = await fetch('/api/reservas')

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
    }
  },

  mounted() {
    this.activeBox = 'listar'
    this.listarTodasReservas()
  },

  computed: {
    reservasPaginadas() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.reservas.slice(start, end)
    },

    totalPages() {
      return Math.ceil(this.reservas.length / this.itemsPerPage)
    },
  },

  methods: {
    toggleBox(box) {
      this.activeBox = box
    },

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
        const res = await fetch('/api/reservas', {
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

      this.tipoPesquisa = 'marinheiro'

      const res = await fetch(`/api/reservas/marinheiro/${this.idPesquisa}`)

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

    // US011 - Listar Reserva Através de ID de Barco
    async listarReservasPorBarco() {
      if (!this.idBarcoPesquisa) {
        alert('Indica o ID do barco')
        return
      }

      this.tipoPesquisa = 'barco'

      const res = await fetch(`/api/reservas/barco/${this.idBarcoPesquisa}`)

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

    // US012 - Cancelar Reserva no Futuro Através do Seu ID
    async cancelarReservaForm() {
      if (!this.cancelar.id_marinheiro || !this.cancelar.id_barco || !this.cancelar.data) {
        alert('Preenche todos os campos')
        return
      }

      const payload = {
        id_marinheiro: Number(this.cancelar.id_marinheiro),
        id_barco: Number(this.cancelar.id_barco),
        data: this.cancelar.data,
      }

      try {
        const res = await fetch('/api/reservas', {
          method: 'DELETE',
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
          alert('Reserva cancelada com sucesso!')

          this.cancelar = {
            id_marinheiro: '',
            id_barco: '',
            data: '',
          }

          if (this.idPesquisa) {
            this.listarReservas()
          }
        } else {
          alert(dados.error || 'Erro ao cancelar reserva')
        }
      } catch (e) {
        alert('Erro de ligação ao servidor')
      }
    },
  },
}
</script>

<style>
.page {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 30px;
  padding: 30px;
}

/* ESQUERDA */
.main {
  position: relative;
  z-index: 1;
}

/* TABELA */
.table-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* SIDEBAR */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
}

/* CARDS */
.card {
  background: white;
  padding: 20px;
  border-radius: 12px;

  display: flex;
  flex-direction: column;
  gap: 10px;

  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin-bottom: 10px;
}

/* FORM */
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* INPUTS */
input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
}

input:focus {
  border-color: #999;
}

/* LABELS */
label {
  margin-top: 5px;
}

/* BOTÕES */
button {
  background: #2c5364;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background: #203a43;
}

/* BOTÃO PRINCIPAL */
.primary {
  background: #ff9800;
}

.primary:hover {
  background: #e68900;
}

/* DELETE */
.danger button {
  background: #c62828;
}

.danger button:hover {
  background: #a61b1b;
}

/* TABELA */
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f4f4f4;
}

th,
td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

/* MENSAGENS */
.sucesso {
  color: #2e7d32;
  font-weight: 500;
}

.erro {
  color: #c62828;
  font-weight: 500;
}

/* BACKGROUND */
body {
  background: #f4f6f9;
}
</style>
