<template>
  <div class="table-box">
    <!-- FILTROS -->
    <div class="filters">
      <input v-model="filtros.id" placeholder="ID" />
      <input v-model="filtros.nome" placeholder="Nome..." />
      <input v-model="filtros.classificacao" placeholder="Classificação" />
      <input v-model="filtros.idade" placeholder="Idade" />
      <button class="clear" @click="limparFiltros">Limpar filtros</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Classificação</th>
          <th>Idade</th>
          <th>
            Ações
            <button class="add" @click="ativarCriacao" :disabled="creating">+</button>
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- CRIAR INLINE - A TABELA PARA CLICAR DENTRO -->
        <tr v-if="creating">
          <td><input v-model="novoInline.id_marinheiro" /></td>
          <td><input v-model="novoInline.nome" /></td>
          <td><input v-model="novoInline.classificacao" /></td>
          <td><input v-model="novoInline.idade" /></td>
          <td>
            <button @click="guardarNovoInline">💾</button>
            <button @click="cancelarCriacao">❌</button>
          </td>
        </tr>

        <!-- ERROS -->
        <tr v-if="erroInline">
          <td colspan="5" class="erro">{{ erroInline }}</td>
        </tr>

        <tr v-if="mensagemInline">
          <td colspan="5" class="sucesso">{{ mensagemInline }}</td>
        </tr>

        <!-- LISTA -->
        <tr v-for="m in marinheirosPaginados" :key="m[0]">
          <td>{{ m[0] }}</td>
          <td>{{ m[1] }}</td>

          <td>
            <template v-if="editingId === m[0]">
              <input v-model="editRow.classificacao" />
            </template>
            <template v-else>
              {{ m[2] }}
            </template>
          </td>

          <td>{{ m[3] }}</td>

          <td>
            <template v-if="editingId === m[0]">
              <button @click="guardarEdicao(m[0])">💾</button>
              <button @click="cancelarEdicao">❌</button>
            </template>

            <template v-else>
              <button @click="editarLinha(m)" :disabled="creating">✏️</button>
              <button @click="prepararDelete(m[0])">❌</button>
            </template>
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
      activeBox: 'listar',
      currentPage: 1,
      itemsPerPage: 10,

      marinheiros: [],

      filtros: { id: '', nome: '', idade: '', classificacao: '' },

      editingId: null,
      editRow: { classificacao: '' },

      creating: false,
      novoInline: { id_marinheiro: '', nome: '', idade: '', classificacao: '' },

      erroInline: '',
      mensagemInline: '',

      novo: { id_marinheiro: '', nome: '', idade: '', classificacao: '' },

      filtroClassificacao: '',
      marinheirosFiltrados: [],
      erroFiltro: '',

      idPesquisa: '',
      marinheiroEncontrado: [],
      erroId: '',

      update: { id: '', classificacao: '' },
      mensagemUpdate: '',
      erroUpdate: '',
    }
  },

  mounted() {
    this.atualizarLista()

    document.addEventListener('click', this.limparMensagensGlobal)
  },

  watch: {
    marinheirosFiltradosLocal() {
      this.currentPage = 1
    },
  },

  computed: {
    marinheirosFiltradosLocal() {
      return this.marinheiros.filter((m) => {
        if (this.filtros.id && Number(m[0]) !== Number(this.filtros.id)) return false
        if (this.filtros.nome && !m[1].toLowerCase().includes(this.filtros.nome.toLowerCase()))
          return false
        if (this.filtros.idade && Number(m[3]) !== Number(this.filtros.idade)) return false
        if (this.filtros.classificacao && Number(m[2]) !== Number(this.filtros.classificacao))
          return false
        return true
      })
    },

    marinheirosPaginados() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.marinheirosFiltradosLocal.slice(start, start + this.itemsPerPage)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.marinheirosFiltradosLocal.length / this.itemsPerPage))
    },
  },

  methods: {
    toggleBox(box) {
      this.activeBox = box
      this.erroInline = ''
      this.mensagemInline = ''
    },

    limparMensagensGlobal() {
      this.erroInline = ''
      this.mensagemInline = ''
    },

    limparMensagensGlobal(event) {
      const tabela = this.$el

      if (!tabela.contains(event.target)) {
        this.erroInline = ''
        this.mensagemInline = ''
      }
    },

    limparFiltros() {
      this.filtros = { id: '', nome: '', idade: '', classificacao: '' }
      this.currentPage = 1
    },

    editarLinha(m) {
      this.erroInline = ''
      this.mensagemInline = ''
      this.editingId = m[0]
      this.editRow.classificacao = m[2]
    },

    cancelarEdicao() {
      this.editingId = null
      this.erroInline = ''
    },

    async guardarEdicao(id) {
      this.erroInline = ''
      this.mensagemInline = ''

      const classNum = Number(this.editRow.classificacao)

      if (!Number.isInteger(classNum) || classNum < 1 || classNum > 10) {
        this.erroInline = 'Classificação inválida (1-10)'
        return
      }

      const res = await fetch(`/api/marinheiros/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classificacao: classNum }),
      })

      if (!res.ok) {
        this.erroInline = 'Erro ao atualizar'
        return
      }

      this.mensagemInline = 'Atualizado com sucesso'
      this.editingId = null
      this.atualizarLista()
    },

    ativarCriacao() {
      this.erroInline = 'Erro ao criar marinheiro.'
      this.mensagemInline = 'Marinheiro registado com sucesso.'
      this.creating = true
    },

    cancelarCriacao() {
      this.creating = false
      this.erroInline = ''
      this.novoInline = { id_marinheiro: '', nome: '', idade: '', classificacao: '' }
    },

    async guardarNovoInline() {
      this.erroInline = ''
      this.mensagemInline = ''

      const idNum = Number(this.novoInline.id_marinheiro)
      if (!Number.isInteger(idNum) || idNum <= 0) {
        this.erroInline = 'ID do marinheiro deve ser um inteiro.'
        return
      }

      const nomeRegex = /^[A-Za-zÀ-ÿ\s'-]+$/
      if (!this.novoInline.nome || !nomeRegex.test(this.novoInline.nome)) {
        this.erroInline = 'Nome deve conter apenas letras e espaços.'
        return
      }

      const idadeNum = Number(this.novoInline.idade)
      if (!Number.isInteger(idadeNum) || idadeNum < 1 || idadeNum > 100) {
        this.erroInline = 'Idade deve ser um inteiro entre 1 e 100.'
        return
      }

      const classNum = Number(this.novoInline.classificacao)
      if (!Number.isInteger(classNum) || classNum < 1 || classNum > 10) {
        this.erroInline = 'Classificação deve ser um inteiro entre 1 e 10.'
        return
      }

      try {
        const res = await fetch('/api/marinheiros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_marinheiro: idNum,
            nome: this.novoInline.nome,
            idade: idadeNum,
            classificacao: classNum,
          }),
        })

        if (!res.ok) {
          let erro = 'Erro ao registar marinheiro.'

          try {
            const data = await res.json()
            erro = data.erro || data.message || erro
          } catch {
            const texto = await res.text()
            if (texto) erro = texto
          }

          this.erroInline = erro
          return
        }

        this.cancelarCriacao()
        this.mensagemInline = 'Marinheiro criado com sucesso.'
        this.atualizarLista()
      } catch {
        this.erroInline = 'Erro de ligação ao servidor.'
      }
    },

    prepararDelete(id) {
      this.idDelete = id
      this.activeBox = 'delete'
    },

    async atualizarLista() {
      try {
        const res = await fetch('/api/marinheiros')
        this.marinheiros = await res.json()

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages
        }
      } catch {
        console.error('Erro ao carregar lista')
      }
    },

    async registarMarinheiro() {
      const idNum = Number(this.novo.id_marinheiro)
      if (!Number.isInteger(idNum) || idNum <= 0) {
        alert('ID inválido')
        return
      }

      const nomeRegex = /^[A-Za-zÀ-ÿ\s'-]+$/
      if (!nomeRegex.test(this.novo.nome)) {
        alert('Nome inválido')
        return
      }

      const idadeNum = Number(this.novo.idade)
      if (!Number.isInteger(idadeNum) || idadeNum < 1 || idadeNum > 100) {
        alert('Idade inválida')
        return
      }

      const classNum = Number(this.novo.classificacao)
      if (!Number.isInteger(classNum) || classNum < 1 || classNum > 10) {
        alert('Classificação inválida')
        return
      }

      try {
        const res = await fetch('/api/marinheiros', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_marinheiro: idNum,
            nome: this.novo.nome,
            idade: idadeNum,
            classificacao: classNum,
          }),
        })

        if (!res.ok) {
          alert('Erro ao registar')
          return
        }

        alert('Registado com sucesso')
        this.novo = { id_marinheiro: '', nome: '', idade: '', classificacao: '' }
        this.atualizarLista()
      } catch {
        alert('Erro de ligação')
      }
    },

    async listarPorClassificacao() {
      this.erroFiltro = ''
      this.marinheirosFiltrados = []

      const classNum = Number(this.filtroClassificacao)

      if (!Number.isInteger(classNum) || classNum < 1 || classNum > 10) {
        this.erroFiltro = 'Classificação inválida (1-10)'
        return
      }

      try {
        const res = await fetch(`/api/marinheiros/classificacao/${classNum}`)

        if (!res.ok) {
          this.erroFiltro = 'Erro ao filtrar'
          return
        }

        this.marinheirosFiltrados = await res.json()
      } catch {
        this.erroFiltro = 'Erro de ligação'
      }
    },

    async procurarPorId() {
      this.erroId = ''
      this.marinheiroEncontrado = []

      const idNum = Number(this.idPesquisa)

      if (!Number.isInteger(idNum) || idNum <= 0) {
        this.erroId = 'ID inválido'
        return
      }

      try {
        const res = await fetch(`/api/marinheiros/${idNum}`)

        if (!res.ok) {
          this.erroId = 'Não encontrado'
          return
        }

        const data = await res.json()
        this.marinheiroEncontrado = [data]
      } catch {
        this.erroId = 'Erro de ligação'
      }
    },

    async atualizarClassificacao() {
      this.erroUpdate = ''
      this.mensagemUpdate = ''

      const idNum = Number(this.update.id)
      const classNum = Number(this.update.classificacao)

      if (!Number.isInteger(idNum) || idNum <= 0) {
        this.erroUpdate = 'ID inválido.'
        return
      }

      if (!Number.isInteger(classNum) || classNum < 1 || classNum > 10) {
        this.erroUpdate = 'Classificação inválida.'
        return
      }

      try {
        const res = await fetch(`/api/marinheiros/${idNum}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classificacao: classNum }),
        })

        if (!res.ok) {
          this.erroUpdate = 'Erro ao atualizar.'
          return
        }

        this.mensagemUpdate = 'Atualizado com sucesso.'
        this.atualizarLista()
      } catch {
        this.erroUpdate = 'Erro de ligação.'
      }
    },
    async prepararDelete(id) {
      this.erroInline = ''
      this.mensagemInline = ''

      const confirmacao = confirm('Tens a certeza que queres eliminar este marinheiro?')
      if (!confirmacao) return

      try {
        const res = await fetch(`/api/marinheiros/${id}`, {
          method: 'DELETE',
        })

        if (!res.ok) {
          this.erroInline = 'Marinheiro tem reservas associadas.'
          return
        }

        this.mensagemInline = 'Marinheiro eliminado com sucesso'
        this.atualizarLista()
      } catch {
        this.erroInline = 'Erro de ligação'
      }
    },
  },
}
</script>

<style>
/* LAYOUT */
.page {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  display: flex;
  justify-content: center;
}

/* TABELA */
.table-box {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto; /* CENTRO REAL */
  background: white;
  padding: 20px;
  border-radius: 10px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

th,
td {
  padding: 10px;
  text-align: center;
  white-space: nowrap;
  border-bottom: 1px solid #ddd;
}

td button {
  margin: 0 4px;
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
  padding: 6px;
}

/* BOTÕES */
button {
  cursor: pointer;
}

.clear {
  background: #999;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
}

.add {
  margin-left: 10px;
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
}

.danger {
  background: #b00020;
  color: white;
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

/* PAGINAÇÃO */
.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* RESPONSIVO */
@media (max-width: 768px) {
  th,
  td {
    font-size: 12px;
    padding: 6px;
  }
}
</style>
