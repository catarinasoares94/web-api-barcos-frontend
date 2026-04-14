<template>
  <div class="page">
    <div class="main">

      <!-- LISTAR RESERVAS -->
      <div v-if="activeBox === 'listar'" class="table-box">
        <h3 class="page-title">VISTA GERAL DAS RESERVAS</h3>

        <p v-if="loadingReservas">A carregar reservas...</p>

        <!-- TOPO (BOTÃO + FILTROS) -->
        <div class="filters" v-if="tipoPesquisa === 'todas'">
          <button @click="listarTodasReservas">Ver Todas as Reservas</button>

          <input v-model="filtros.data" placeholder="Data (dd/mm/aaaa)" />
          <input v-model="filtros.id_barco" placeholder="ID Barco" />
          <input v-model="filtros.nome_barco" placeholder="Nome Barco" />
          <input v-model="filtros.cor" placeholder="Cor" />
          <input v-model="filtros.id_marinheiro" placeholder="ID Marinheiro" />
          <input v-model="filtros.nome_marinheiro" placeholder="Nome Marinheiro" />

          <button @click="limparFiltros">Limpar</button>
        </div>

        <!-- MENSAGEM -->
        <div v-if="mensagem" :class="['alert', tipoMensagem]">
          {{ mensagem }}
        </div>

        <!-- TABELA -->
        <table v-if="reservasFiltradas.length > 0">
          <thead>
            <tr>
              <th>Data</th>
              <th>ID Barco</th>
              <th>Nome Barco</th>
              <th>Cor</th>
              <th>ID Marinheiro</th>
              <th>Nome Marinheiro</th>

              <!-- AÇÕES -->
              <th>
                Ações
                <button @click="novoInline = true" class="btn-add">+</button>
                <span style="color: green; margin-left: 5px">Nova Reserva</span>
              </th>
            </tr>
          </thead>

          <tbody>

            <!-- LINHA NOVA RESERVA -->
            <tr v-if="novoInline">
              <td><input type="date" v-model="novaReserva.DATA" /></td>
              <td><input type="number" v-model="novaReserva.ID_BARCO" /></td>
              <td>-</td>
              <td>-</td>
              <td><input type="number" v-model="novaReserva.ID_MARINHEIRO" /></td>
              <td>-</td>

              <td>
                <button @click="guardarNovoInline">✔</button>
                <button @click="novoInline = false">✖</button>
              </td>
            </tr>

            <!-- LISTA -->
            <tr v-for="r in reservasPaginadas" :key="r.ID_BARCO + r.DATA + r.ID_MARINHEIRO">
              <td>{{ formatarData(r.DATA) }}</td>
              <td>{{ r.ID_BARCO }}</td>
              <td>{{ r.NOME_BARCO }}</td>
              <td>{{ r.COR }}</td>
              <td>{{ r.ID_MARINHEIRO }}</td>
              <td>{{ r.NOME_MARINHEIRO }}</td>

              <!-- DELETE -->
              <td>
                <button class="btn-delete" @click="cancelarInline(r)">
                  X Apagar Reserva
                </button>
              </td>
            </tr>

          </tbody>
        </table>

        <p v-else-if="!loadingReservas">Sem resultados.</p>

        <!-- PAGINAÇÃO -->
        <div class="pagination" v-if="totalPages > 1">
          <button @click="currentPage--" :disabled="currentPage === 1">Anterior</button>
          <span>Página {{ currentPage }} de {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages">Seguinte</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mensagem: '',
      tipoMensagem: '', // 'sucesso' ou 'erro'

      loadingReservas: false,
      activeBox: 'listar',
      modoCriar: false,
      currentPage: 1,
      itemsPerPage: 10,
      cacheReservas: [],

      reservas: [],
      tipoPesquisa: 'todas',

      // FILTROS
      filtros: {
        data: '',
        id_barco: '',
        nome_barco: '',
        cor: '',
        id_marinheiro: '',
        nome_marinheiro: '',
      },

      // NOVO INLINE
      novoInline: false,
      novaReserva: {
        ID_BARCO: '',
        ID_MARINHEIRO: '',
        DATA: '',
      },
    }
  },

  mounted() {
    const modo = this.$route.query.modo

    if (modo === 'criar') {
      this.activeBox = 'listar'

      // PRIMEIRO carregar dados
      this.listarTodasReservas().then(() => {
        // DEPOIS ativar linha nova
        this.novoInline = true

        this.novaReserva.ID_BARCO = this.$route.query.id_barco || ''
        this.novaReserva.DATA = this.$route.query.data || ''

        // opcional: scroll
        this.$nextTick(() => {
          const el = document.querySelector('table')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        })
      })
    } else {
      this.listarTodasReservas()
    }

    this.preloadReservas()
  },

  computed: {
    // ✅ FILTROS
    reservasFiltradas() {
      return this.reservas.filter((r) => {
        return (
          (!this.filtros.data || this.formatarData(r.DATA).includes(this.filtros.data)) &&
          (!this.filtros.id_barco || r.ID_BARCO.toString().includes(this.filtros.id_barco)) &&
          (!this.filtros.nome_barco ||
            r.NOME_BARCO.toLowerCase().includes(this.filtros.nome_barco.toLowerCase())) &&
          (!this.filtros.cor || r.COR.toLowerCase().includes(this.filtros.cor.toLowerCase())) &&
          (!this.filtros.id_marinheiro ||
            r.ID_MARINHEIRO.toString().includes(this.filtros.id_marinheiro)) &&
          (!this.filtros.nome_marinheiro ||
            r.NOME_MARINHEIRO.toLowerCase().includes(this.filtros.nome_marinheiro.toLowerCase()))
        )
      })
    },

    // ✅ PAGINAÇÃO
    reservasPaginadas() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.reservasFiltradas.slice(start, start + this.itemsPerPage)
    },

    totalPages() {
      return Math.ceil(this.reservasFiltradas.length / this.itemsPerPage) || 1
    },
  },

  methods: {
    async preloadReservas() {
      try {
        const res = await fetch('/api/reservas')
        const dados = await res.json()
        if (res.ok) this.cacheReservas = dados
      } catch {}
    },

    async listarTodasReservas() {
      this.loadingReservas = true
      this.currentPage = 1

      try {
        const res = await fetch('/api/reservas')
        const dados = await res.json()

        if (res.ok) {
          this.reservas = dados
        } else {
          alert(dados.error || 'Erro ao listar reservas')
        }
      } catch {
        alert('Erro de ligação')
      } finally {
        this.loadingReservas = false
      }
    },

    // ✅ CRIAR INLINE
    async guardarNovoInline() {
      const payload = {
        id_marinheiro: Number(this.novaReserva.ID_MARINHEIRO),
        id_barco: Number(this.novaReserva.ID_BARCO),
        data: this.novaReserva.DATA,
      }

      try {
        const res = await fetch('/api/reservas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const dados = await res.json().catch(() => ({}))

        if (res.ok) {
          this.mensagem = 'Reserva criada com sucesso!'
          this.tipoMensagem = 'sucesso'

          this.novoInline = false
          this.novaReserva = { ID_BARCO: '', ID_MARINHEIRO: '', DATA: '' }
          this.listarTodasReservas()
        } else {
          this.mensagem = dados.error || 'Erro ao criar reserva'
          this.tipoMensagem = 'erro'
        }
      } catch {
        alert('Erro de ligação')
      }
    },

    // DELETE INLINE
    async cancelarInline(r) {
      if (!confirm('Cancelar esta reserva?')) return

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

        const dados = await res.json().catch(() => ({}))

        if (res.ok) {
          this.mensagem = 'Reserva cancelada com sucesso!'
          this.tipoMensagem = 'sucesso'

          this.listarTodasReservas()
        } else {
          this.mensagem = dados.error || 'Erro ao cancelar'
          this.tipoMensagem = 'erro'
        }
      } catch {
        alert('Erro de ligação')
      }
    },

    formatarData(data) {
      if (!data) return ''
      const d = new Date(data)
      return d.toLocaleDateString('pt-PT')
    },

    limparFiltros() {
      this.filtros = {
        data: '',
        id_barco: '',
        nome_barco: '',
        cor: '',
        id_marinheiro: '',
        nome_marinheiro: '',
      }
      this.currentPage = 1
    },
  },
}
</script>

<style>

/* ===== LAYOUT BASE ===== */
.page {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  display: flex;
  justify-content: center;
  padding: 30px;
  font-family: sans-serif;
}

.main {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== CARD / CONTAINER ===== */
.table-box,
.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* ===== TABELA ===== */
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

th, td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

td button {
  margin: 0 5px;
}

th {
  background: #f8f9fa;
  font-weight: bold;
}

/* ===== FILTROS ===== */
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
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.filters button {
  padding: 6px 10px;
  border-radius: 6px;
}

/* ===== INPUTS GERAIS ===== */
input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

/* ===== BOTÕES ===== */
button {
  background: #2c5364;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #203a43;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ===== VARIAÇÕES ===== */
.primary {
  background: #ff9800;
}
.primary:hover {
  background: #e68900;
}

.add {
  background: #4caf50;
}

.add:hover {
  background: #3d9442;
}

.danger {
  background: #c62828;
}

.danger:hover {
  background: #a61b1b;
}

.clear {
  background: #999;
}

/* ===== AÇÕES HEADER ===== */
.acoes-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.novo-texto {
  font-size: 12px;
  color: #4caf50;
  font-weight: 500;
}

/* ===== INPUTS INLINE (TABELA) ===== */
td input {
  width: 100%;
  padding: 6px;
  font-size: 13px;
}

/* ===== PAGINAÇÃO ===== */
.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* ===== MENSAGENS ===== */
.alert {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  font-weight: bold;
}

.alert.sucesso {
  background: #e6f4ea;
  color: #2e7d32;
}

.alert.erro {
  background: #fdecea;
  color: #c62828;
}

/* ===== RESPONSIVO ===== */
@media (max-width: 768px) {
  th, td {
    font-size: 12px;
    padding: 6px;
  }
}
</style>