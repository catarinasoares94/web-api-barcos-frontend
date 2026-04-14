<template>
  <div class="table-box">
    <!-- US008 - LISTAR TODOS OS BARCOS REGISTADOS NO SISTEMA -->

    <!-- FILTROS -->
    <div class="filters">
      <input v-model="filtros.id" placeholder="ID" />
      <input v-model="filtros.nome" placeholder="Nome" />
      <input v-model="filtros.cor" placeholder="Cor" />
      <button class="clear" @click="limparFiltros">Limpar filtros</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Cor</th>
          <th>
            <div class="acoes-header">
              <span>Ações</span>
              <button class="add" @click="ativarCriacao" :disabled="creating">+</button>
              <span class="novo-texto">Novo</span>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- CRIAR INLINE -->
        <tr v-if="creating">
          <td><input v-model="novoInline.id_barco" /></td>
          <td><input v-model="novoInline.nome" /></td>
          <td><input v-model="novoInline.cor" /></td>
          <td>
            <button @click="guardarNovoInline">💾</button>
            <button @click="cancelarCriacao">❌</button>
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
        <tr v-for="b in barcosPaginados" :key="b[0]">
          <td>{{ b[0] }}</td>
          <td>{{ b[1] }}</td>
          <td>{{ b[2] }}</td>

          <td>
            <button @click="prepararDelete(b[0])">❌</button>
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

      // ----------- TABELA -----------

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
  },

  computed: {
    barcosFiltradosLocal() {
      return this.barcos.filter((b) => {
        if (this.filtros.id && Number(b[0]) !== Number(this.filtros.id)) return false
        if (this.filtros.nome && !b[1].toLowerCase().includes(this.filtros.nome.toLowerCase()))
          return false
        if (this.filtros.cor && !b[2].toLowerCase().includes(this.filtros.cor.toLowerCase()))
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

    // US008 - Lista de barcos disponiveis no sistema
    async atualizarLista() {
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

/* TABELA */
.table-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  max-width: 1200px;
  margin: 0 auto;
}

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

/* INPUTS */
input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
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

.novo-texto {
  font-size: 12px;
  color: #4caf50;
  font-weight: 500;
}

/* BOTÃO LIMPAR */
.clear {
  background: #999;
  padding: 6px 10px;
  border-radius: 6px;
}

/* MENSAGENS */
.erro {
  color: red;
  text-align: center;
}

.sucesso {
  color: green;
  text-align: center;
}
</style>