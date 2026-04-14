<template>
  <div class="table-box">
    <h3 class="page-title">VISTA GERAL DA FROTA</h3>
    <!-- US008 - LISTAR TODOS OS BARCOS REGISTADOS NO SISTEMA -->

    <!-- FILTROS -->
    <div class="filters">
      <button @click="atualizarLista">Ver Todos os Barcos</button>
      <input v-model="filtros.id" placeholder="ID" />
      <input v-model="filtros.nome" placeholder="Nome" />
      <input v-model="filtros.cor" placeholder="Cor" />
      <button class="clear" @click="limparFiltros">Limpar filtros</button>
      <button @click="listarDisponiveis">Disponíveis Para Reserva</button>
      <input type="date" v-model="dataSelecionada" />
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Cor</th>
          <th v-if="modoDisponiveis">Reservar</th>

          <th v-if="!modoDisponiveis">
            <div class="acoes-header">
              <span>Ações</span>
              <button class="add" @click="ativarCriacao" :disabled="creating">+</button>
              <span class="novo-texto">Registar Barco</span>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- CRIAR INLINE -->
        <tr v-if="creating && !modoDisponiveis">
          <td><input v-model="novoInline.id_barco" /></td>
          <td><input v-model="novoInline.nome" /></td>
          <td><input v-model="novoInline.cor" /></td>
          <td>
            <button @click="guardarNovoInline">💾 Guardar</button>
            <button @click="cancelarCriacao">❌ Cancelar </button>
          </td>
        </tr>

        <!-- ERROS -->
        <tr v-if="erroInline">
          <td colspan="4" class="erro">{{ erroInline }}</td>
        </tr>

        <tr v-if="mensagemInline">
          <td colspan="4" class="sucesso">{{ mensagemInline }}</td>
        </tr>

        <!-- LISTA -->
        <tr v-for="b in barcosPaginados" :key="b.ID_BARCO">
          <td>{{ b.ID_BARCO }}</td>
          <td>{{ b.NOME }}</td>
          <td>{{ b.COR }}</td>
          <td v-if="modoDisponiveis">
            <button class="reservar-btn" @click="irParaReserva(b.ID_BARCO)">
              ⛵ Efetuar Reserva
            </button>
          </td>

          <td v-if="!modoDisponiveis">
            <button @click="prepararDelete(b.ID_BARCO)">❌Eliminar Barco</button>
          </td>
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
      // US009 - Barcos Disponiveis para Reserva (depende da data)
      dataSelecionada: '',
      modoDisponiveis: false,

      // US008 - Lista de barcos disponiveis no sistema
      barcos: [],

      // US007 - Registo de barco (id, nome e cor)
      novo: {
        id_barco: '',
        nome: '',
        cor: '',
      },

      //Eliminar barco
      idDelete: '',
      mensagemDelete: '',
      erroDelete: '',

      // ----------- TABELA DE TODOS OS BARCOS

      currentPage: 1,
      itemsPerPage: 10,

      filtros: { id: '', nome: '', cor: '' },

      creating: false,
      novoInline: { id_barco: '', nome: '', cor: '' },

      erroInline: '',
      mensagemInline: '',
    }
  },

  async mounted() {
    await this.atualizarLista()
    document.addEventListener('click', this.limparMensagensGlobal)
    this.novaReserva.id_barco = this.$route.query.id_barco || ''
    this.novaReserva.data = this.$route.query.data || ''
  },

  computed: {
    barcosFiltradosLocal() {
      return this.barcos.filter((b) => {
        if (this.filtros.id && Number(b.ID_BARCO) !== Number(this.filtros.id)) return false
        if (this.filtros.nome && !b.NOME.toLowerCase().includes(this.filtros.nome.toLowerCase()))
          return false
        if (this.filtros.cor && !b.COR.toLowerCase().includes(this.filtros.cor.toLowerCase()))
          return false
        return true
      })
    },

    barcosPaginados() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.barcosFiltradosLocal.slice(start, start + this.itemsPerPage)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.barcosFiltradosLocal.length / this.itemsPerPage))
    },
  },

  methods: {
    irParaReserva(id_barco) {
      this.$router.push({
        path: '/reservas',
        query: {
          id_barco: id_barco,
          data: this.dataSelecionada,
          modo: 'criar',
        },
      })
    },

    limparMensagensGlobal(event) {
      const tabela = this.$el
      if (!tabela.contains(event.target)) {
        this.erroInline = ''
        this.mensagemInline = ''
      }
    },

    limparFiltros() {
      this.filtros = { id: '', nome: '', cor: '' }
      this.currentPage = 1
    },

    ativarCriacao() {
      this.erroInline = ''
      this.mensagemInline = ''
      this.creating = true
    },

    cancelarCriacao() {
      this.creating = false
      this.erroInline = ''
      this.novoInline = { id_barco: '', nome: '', cor: '' }
    },

    async guardarNovoInline() {
      this.erroInline = ''
      this.mensagemInline = ''

      const idNum = Number(this.novoInline.id_barco)
      if (!Number.isInteger(idNum)) {
        this.erroInline = 'ID inválido.'
        return
      }

      const textoRegex = /^[A-Za-zÀ-ÿ\s]+$/

      if (!textoRegex.test(this.novoInline.nome)) {
        this.erroInline = 'Nome inválido.'
        return
      }

      if (!textoRegex.test(this.novoInline.cor)) {
        this.erroInline = 'Cor inválida.'
        return
      }

      try {
        const res = await fetch('/api/barcos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.novoInline),
        })

        if (!res.ok) {
          const texto = await res.text()

          if (texto.includes('ORA-00001') || texto.toLowerCase().includes('unique')) {
            this.erroInline = 'ID já existe'
          } else {
            this.erroInline = 'Erro ao criar'
          }
          return
        }

        this.cancelarCriacao()
        this.mensagemInline = 'Barco criado com sucesso'
        await this.atualizarLista()
      } catch {
        this.erroInline = 'Erro de ligação'
      }
    },

    async prepararDelete(id) {
      this.erroInline = ''
      this.mensagemInline = ''

      const confirmacao = confirm('Tens a certeza que queres eliminar este barco?')
      if (!confirmacao) return

      try {
        const res = await fetch(`/api/barcos/${id}`, {
          method: 'DELETE',
        })

        if (!res.ok) {
          this.erroInline = 'Barco tem reservas associadas.'
          return
        }

        this.mensagemInline = 'Barco eliminado com sucesso'
        await this.atualizarLista()
      } catch {
        this.erroInline = 'Erro de ligação'
      }
    },

    //US009 - Barcos Disponiveis para Reserva (depende da data)
    async listarDisponiveis() {
      this.erroInline = ''
      this.mensagemInline = ''
      this.modoDisponiveis = true

      if (!this.dataSelecionada) {
        this.erroInline = 'Seleciona uma data.'
        return
      }

      try {
        const res = await fetch(`/api/barcos/disponiveis?data=${this.dataSelecionada}`)

        if (!res.ok) {
          const erro = await res.json()
          this.erroInline = erro.error || 'Erro ao listar disponíveis'
          return
        }

        this.barcos = await res.json()
        this.currentPage = 1
      } catch {
        this.erroInline = 'Erro de ligação'
      }
    },

    // US008 - Lista de barcos disponiveis no sistema
    async atualizarLista() {
      this.modoDisponiveis = false
      const res = await fetch('/api/barcos')
      this.barcos = await res.json()

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
    },

    // US007 - Registo de barco (id, nome e cor)
    async registarBarco() {
      const idNum = Number(this.novo.id_barco)

      if (!Number.isInteger(idNum)) {
        alert('ID do barco deve ser um número inteiro.')
        return
      }

      const textoRegex = /^[A-Za-zÀ-ÿ\s]+$/

      if (
        typeof this.novo.nome !== 'string' ||
        this.novo.nome.length === 0 ||
        this.novo.nome.length > 20 ||
        !textoRegex.test(this.novo.nome)
      ) {
        alert('Nome deve conter apenas letras (máx. 20 caracteres).')
        return
      }

      if (
        typeof this.novo.cor !== 'string' ||
        this.novo.cor.length === 0 ||
        this.novo.cor.length > 10 ||
        !textoRegex.test(this.novo.cor)
      ) {
        alert('Cor deve conter apenas letras (máx. 10 caracteres).')
        return
      }

      const res = await fetch('/api/barcos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.novo),
      })

      const texto = await res.text()
      console.log(texto)

      if (res.ok) {
        alert('Barco registado!')

        this.novo = {
          id_barco: '',
          nome: '',
          cor: '',
        }

        await this.atualizarLista()
      } else {
        if (texto.includes('ORA-00001') || texto.toLowerCase().includes('unique')) {
          alert('ID já existe')
        } else {
          alert('Erro ao registar')
        }
      }
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