<template>
  <div class="table-box">
    <!-- FILTROS -->
    <div class="filters">
      <input v-model="idPesquisa" placeholder="ID Marinheiro" @input="filtrarReservas" />
      <input v-model="idBarcoPesquisa" placeholder="ID Barco" @input="filtrarReservas" />
      <button class="clear" @click="listarTodasReservas">Lista Completa de Reservas</button>
      <button class="clear" @click="listarDisponiveis">Ver Barcos Disponíveis para Reserva</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>ID Barco</th>
          <th>Nome Barco</th>
          <th>Cor</th>
          <th>ID Marinheiro</th>
          <th>Nome Marinheiro</th>
          <th>
            <div class="acoes-header">
              <span></span>

              <span class="novo-texto">
                {{ tipoPesquisa === 'disponiveis' ? 'Efetuar Reserva' : 'Apagar Reserva' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- MENSAGENS -->
        <tr v-if="erroInline">
          <td colspan="7" class="erro">{{ erroInline }}</td>
        </tr>

        <tr v-if="mensagemInline">
          <td colspan="7" class="sucesso">{{ mensagemInline }}</td>
        </tr>

        <!-- LISTA -->
        <tr v-for="r in reservasPaginadas" :key="r.ID_BARCO + r.DATA">
          <!-- LINHA EM MODO CRIAÇÃO -->
          <template v-if="creating && reserva.id_barco === r.ID_BARCO">
            <td><input type="date" v-model="reserva.data" /></td>
            <td>{{ r.ID_BARCO }}</td>
            <td>{{ r.NOME_BARCO }}</td>
            <td>{{ r.COR }}</td>
            <td><input v-model="reserva.id_marinheiro" /></td>
            <td>-</td>
            <td>
              <button @click="reservarBarco">Guardar</button>
              <button @click="cancelarCriacao">Cancelar</button>
            </td>
          </template>

          <!-- LINHA NORMAL -->
          <template v-else>
            <td>{{ formatarData(r.DATA) }}</td>
            <td>{{ r.ID_BARCO }}</td>
            <td>{{ r.NOME_BARCO }}</td>
            <td>{{ r.COR }}</td>
            <td>{{ r.ID_MARINHEIRO }}</td>
            <td>{{ r.NOME_MARINHEIRO }}</td>

            <td>
              <!-- DISPONÍVEIS -->
              <button
                v-if="tipoPesquisa === 'disponiveis'"
                @click="ativarCriacaoComBarco(r.ID_BARCO)"
              >
                +
              </button>

              <!-- RESERVAS -->
              <button v-else @click="cancelarReservaInline(r)">❌</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <!-- PAGINAÇÃO -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="currentPage--" :disabled="currentPage === 1">Anterior</button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="currentPage++" :disabled="currentPage === totalPages">Seguinte</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,

      // CONTROLO
      mostrarDisponiveis: false,
      creating: false,
      erroInline: '',
      mensagemInline: '',

      // US010 - Reservar Barco
      reserva: {
        id_marinheiro: '',
        id_barco: '',
        data: '',
      },

      // US011 - Listar Reservas
      reservas: [],
      idPesquisa: '',
      idBarcoPesquisa: '',
      tipoPesquisa: 'todas',

      // US012 - Cancelar Reserva
      cancelar: {
        id_marinheiro: '',
        id_barco: '',
        data: '',
      },
    }
  },

  async mounted() {
    await this.listarTodasReservas()
  },

  computed: {
    reservasPaginadas() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.reservas.slice(start, start + this.itemsPerPage)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.reservas.length / this.itemsPerPage))
    },
  },

  methods: {
    // ATIVAR CRIAÇÃO (HEADER)
    ativarCriacao() {
      if (this.tipoPesquisa !== 'disponiveis') return

      this.creating = true
      this.erroInline = ''
      this.mensagemInline = ''

      this.reserva = {
        id_marinheiro: '',
        id_barco: '',
        data: '',
      }
    },

    // ATIVAR CRIAÇÃO COM BARCO (LINHA)
    ativarCriacaoComBarco(idBarco) {
      if (this.tipoPesquisa !== 'disponiveis') return

      this.creating = true
      this.erroInline = ''
      this.mensagemInline = ''

      this.reserva = {
        id_marinheiro: '',
        id_barco: idBarco, // 🔥 aqui fica já preenchido corretamente
        data: '',
      }
    },

    cancelarCriacao() {
      this.creating = false
      this.erroInline = ''
      this.mensagemInline = ''

      this.reserva = {
        id_marinheiro: '',
        id_barco: '',
        data: '',
      }
    },

    // US009 - DISPONÍVEIS
    async listarDisponiveis() {
      const res = await fetch('/api/barcos/disponiveis')

      let dados = []
      try {
        dados = await res.json()
      } catch {}

      if (res.ok) {
        this.tipoPesquisa = 'disponiveis'
        this.creating = false

        this.reservas = dados.map((b) => ({
          DATA: null,
          ID_BARCO: b[0],
          NOME_BARCO: b[1],
          COR: b[2],
          ID_MARINHEIRO: null,
          NOME_MARINHEIRO: null,
        }))

        this.currentPage = 1
      } else {
        this.reservas = []
        alert(dados.error || 'Nenhum barco disponível')
      }
    },

    // US011 - TODAS AS RESERVAS
    async listarTodasReservas() {
      this.tipoPesquisa = 'todas'
      this.creating = false

      //  LIMPA IMEDIATAMENTE A UI
      this.reservas = []

      this.reserva = {
        id_marinheiro: '',
        id_barco: '',
        data: '',
      }

      this.idPesquisa = ''
      this.idBarcoPesquisa = ''

      try {
        const res = await fetch('/api/reservas')

        let dados = []
        try {
          dados = await res.json()
        } catch {}

        if (res.ok) {
          this.reservas = dados
          this.currentPage = 1
        } else {
          alert(dados.error || 'Erro ao listar reservas')
        }
      } catch {
        alert('Erro de ligação')
      }
    },

    // FILTRO
    async filtrarReservas() {
      this.creating = false

      const idMarinheiro = Number(this.idPesquisa)
      const idBarco = Number(this.idBarcoPesquisa)

      const temMarinheiro = Number.isInteger(idMarinheiro) && idMarinheiro > 0
      const temBarco = Number.isInteger(idBarco) && idBarco > 0

      if (temMarinheiro && temBarco) {
        this.tipoPesquisa = 'marinheiro'

        try {
          const res = await fetch(`/api/reservas/marinheiro/${idMarinheiro}`)

          let dados = []
          try {
            dados = await res.json()
          } catch {}

          if (!res.ok) {
            this.reservas = []
            return
          }

          this.reservas = dados.filter((r) => r.ID_BARCO === idBarco)
          this.currentPage = 1
          return
        } catch {
          this.reservas = []
          return
        }
      }

      if (temMarinheiro) return this.listarReservas()
      if (temBarco) return this.listarReservasPorBarco()

      return this.listarTodasReservas()
    },

    // MARINHEIRO
    async listarReservas() {
      this.tipoPesquisa = 'marinheiro'
      this.creating = false

      const id = Number(this.idPesquisa)

      if (!Number.isInteger(id) || id <= 0) {
        this.reservas = []
        return
      }

      try {
        const res = await fetch(`/api/reservas/marinheiro/${id}`)

        let dados = []
        try {
          dados = await res.json()
        } catch {}

        if (!res.ok) {
          this.reservas = []
          return
        }

        this.reservas = dados
        this.currentPage = 1
      } catch {
        this.reservas = []
      }
    },

    // BARCO
    async listarReservasPorBarco() {
      this.tipoPesquisa = 'barco'
      this.creating = false

      const id = Number(this.idBarcoPesquisa)

      if (!Number.isInteger(id) || id <= 0) {
        this.reservas = []
        return
      }

      try {
        const res = await fetch(`/api/reservas/barco/${id}`)

        let dados = []
        try {
          dados = await res.json()
        } catch {}

        if (!res.ok) {
          this.reservas = []
          return
        }

        this.reservas = dados
        this.currentPage = 1
      } catch {
        this.reservas = []
      }
    },

    formatarData(data) {
      if (!data) return '-'
      const d = new Date(data)
      return isNaN(d) ? '-' : d.toLocaleDateString()
    },

    // US010 - CRIAR RESERVA
    async reservarBarco() {
      this.erroInline = ''
      this.mensagemInline = ''

      if (!this.reserva.id_marinheiro || !this.reserva.id_barco || !this.reserva.data) {
        this.erroInline = 'Preenche todos os campos'
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        let dados = {}
        try {
          dados = await res.json()
        } catch {}

        if (res.ok) {
          this.mensagemInline = 'Reserva criada com sucesso'

          // LIMPAR AUTOMATICAMENTE
          setTimeout(() => {
            this.mensagemInline = ''
          }, 3000)
          this.creating = false

          this.reserva = {
            id_marinheiro: '',
            id_barco: '',
            data: '',
          }

          await this.listarTodasReservas()
        } else {
          this.erroInline = dados.error || 'Erro ao criar reserva'
        }
      } catch {
        this.erroInline = 'Erro de ligação ao servidor'
      }
    },

    // US012 - CANCELAR INLINE
    async cancelarReservaInline(r) {
      if (!r.ID_MARINHEIRO || !r.ID_BARCO || !r.DATA) return

      const confirmacao = confirm('Cancelar esta reserva?')
      if (!confirmacao) return

      this.erroInline = ''
      this.mensagemInline = ''

      const payload = {
        id_marinheiro: r.ID_MARINHEIRO,
        id_barco: r.ID_BARCO,
        data: r.DATA,
      }

      try {
        const res = await fetch('/api/reservas', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        let dados = {}
        try {
          dados = await res.json()
        } catch {}

        if (res.ok) {
          // ✔️ SUCESSO
          this.mensagemInline = 'Reserva apagada com sucesso'

          setTimeout(() => {
            this.mensagemInline = ''
          }, 3000)

          await this.listarTodasReservas()
        } else {
          this.erroInline = dados.error || 'Erro ao apagar reserva'
        }
      } catch {
        this.erroInline = 'Erro de ligação ao servidor'
      }
    },
  },
}
</script>

<style>
/* TABELA */
.table-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  max-width: 1200px;
  margin: 0 auto;
}

/* FILTROS */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: center;
}

.filters input {
  flex: 1 1 150px;
  max-width: 200px;
}

.filters button {
  padding: 6px 10px;
  font-size: 13px;
}

/* HEADER AÇÕES */
.acoes-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add {
  background: #4caf50;
  padding: 6px 10px;
  border-radius: 6px;
}

/* 🔥 MELHORIA UX */
.add:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.novo-texto {
  font-size: 18px;
  color: #3454d2;
  font-weight: 500;
}

/* BOTÃO LIMPAR */
.clear {
  background: #999;
  padding: 6px 10px;
  border-radius: 6px;
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

  margin-top: 20px;
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

/* 🔥 INPUT INLINE (criação) */
tbody input {
  width: 100%;
  box-sizing: border-box;
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

/* HEADER */
th {
  background: #f4f4f4;
  font-weight: 600;
}

/* 🔥 MELHORIA IMPORTANTE */
th,
td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

/* 🔥 BOTÕES NA TABELA */
td button {
  padding: 6px 10px;
  border-radius: 6px;
}

/* PAGINAÇÃO */
.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.pagination button {
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: #2c5364;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* MENSAGENS */
.sucesso {
  color: #2e7d32;
  font-weight: 500;
  text-align: center;
}

.erro {
  color: #c62828;
  font-weight: 500;
  text-align: center;
}

/* BACKGROUND */
body {
  background: #f4f6f9;
}
</style>
