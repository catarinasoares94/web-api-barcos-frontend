<template>
  <div class="page">
    <!-- ESQUERDA -->
    <div class="main">
      <!-- HEADER -->
      <div class="header-box">
        <h1>Marinheiros</h1>
      </div>

      <!-- TABELA -->
      <div class="table-box" v-show="activeBox === 'listar'">
        <button class="refresh" @click="atualizarLista">Atualizar</button>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Classificação</th>
              <th>Idade</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="m in marinheirosPaginados" :key="m[0]">
              <td>{{ m[0] }}</td>
              <td>{{ m[1] }}</td>
              <td>{{ m[2] }}</td>
              <td>{{ m[3] }}</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" v-if="totalPages > 1">
          <button @click="currentPage--" :disabled="currentPage === 1">Anterior</button>

          <span>Página {{ currentPage }} de {{ totalPages }}</span>

          <button @click="currentPage++" :disabled="currentPage === totalPages">Seguinte</button>
        </div>
      </div>

      <!-- FORMS DINÂMICOS -->
      <div class="forms-area">
        <!-- US001 REGISTAR MARINHEIRO -->
        <div v-show="activeBox === 'registar'" class="card">
          <h3>Registar</h3>

          <input v-model="novo.id_marinheiro" placeholder="ID" />
          <input v-model="novo.nome" placeholder="Nome" />
          <input v-model="novo.idade" placeholder="Idade" />
          <input v-model="novo.classificacao" placeholder="Classificação" />

          <button class="primary" @click="registarMarinheiro">Registar</button>
        </div>

        <!-- US003 LISTAR MARINHEIRO POR CLASSIFICAÇÃO -->
        <div v-show="activeBox === 'filtro'" class="card">
          <h3>Filtrar por Classificação</h3>

          <input v-model="filtroClassificacao" placeholder="Ex: 5" />
          <button @click="listarPorClassificacao">Filtrar</button>
        </div>

        <!-- US004 LISTAR INFO DE MARINHEIRO POR ID -->
        <div v-show="activeBox === 'procurar'" class="card">
          <h3>Procurar por ID</h3>

          <input v-model="idPesquisa" placeholder="ID" />
          <button @click="procurarPorId">Procurar</button>
        </div>

        <!-- US005 - UPDATE -->
        <div v-show="activeBox === 'update'" class="card">
          <h3>Atualizar Classificação</h3>

          <input v-model="update.id" placeholder="ID" />
          <input v-model="update.classificacao" placeholder="Nova classificação" />

          <button @click="atualizarClassificacao">Atualizar</button>
        </div>

        <!-- US006 - ELIMINAR -->
        <div v-show="activeBox === 'delete'" class="card danger">
          <h3>Eliminar</h3>

          <input v-model="idDelete" placeholder="ID" />
          <button @click="eliminarMarinheiro">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- DIREITA -->
    <div class="sidebar">
      <button @click="toggleBox('listar')">Listar Marinheiros</button>

      <button @click="toggleBox('registar')">Registar Marinheiro</button>

      <button @click="toggleBox('filtro')">Filtrar por Classificação</button>

      <button @click="toggleBox('procurar')">Procurar por ID</button>

      <button @click="toggleBox('update')">Atualizar Classificação</button>

      <button class="danger" @click="toggleBox('delete')">Eliminar Marinheiro</button>
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

      // US002 - Lista de Marinheiros
      marinheiros: [],
      mostrarTabela: false,

      // US001 - Registo de Marinheiros
      novo: {
        id_marinheiro: '',
        nome: '',
        idade: '',
        classificacao: '',
      },

      // US003 - Filtro por Classificação
      filtroClassificacao: '',
      marinheirosFiltrados: [],
      erroFiltro: '',

      // US004 - Filtro por ID
      idPesquisa: '',
      marinheiroEncontrado: [],
      erroId: '',

      // US005 - Update de Classificacao Atraves de ID
      update: {
        id: '',
        classificacao: '',
      },
      mensagemUpdate: '',
      erroUpdate: '',

      // US006 - Eliminar Marinheiro (Só funciona se não tiver nenhuma reserva associada)
      idDelete: '',
      mensagemDelete: '',
      erroDelete: '',
    }
  },

  mounted() {
    this.atualizarLista()
    this.currentPage = 1
  },

  computed: {
    marinheirosPaginados() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.marinheiros.slice(start, start + this.itemsPerPage)
    },

    totalPages() {
      return Math.ceil(this.marinheiros.length / this.itemsPerPage)
    },
  },

  watch: {
    marinheiros() {
      this.currentPage = 1
    },
  },

  methods: {
    toggleBox(box) {
      if (this.activeBox === box) {
        this.activeBox = null
      } else {
        this.activeBox = box
        this.mostrarTabela = false
      }
    },

    // US002 - Lista de Marinheiros
    async toggle() {
      this.mostrarTabela = !this.mostrarTabela

      if (this.mostrarTabela && this.marinheiros.length === 0) {
        const res = await fetch('/api/marinheiros')
        this.marinheiros = await res.json()
      } else {
        this.marinheiros = []
      }
    },
    // US001 - Registo de Marinheiros
    async registarMarinheiro() {
      const res = await fetch('/api/marinheiros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.novo),
      })

      const texto = await res.text()
      console.log(texto)

      if (res.ok) {
        alert('Marinheiro registado!')

        this.novo = {
          id_marinheiro: '',
          nome: '',
          idade: '',
          classificacao: '',
        }
      } else {
        if (texto.includes('ORA-00001') || texto.toLowerCase().includes('unique')) {
          alert('ID já existe')
        } else {
          alert('Erro ao registar')
        }
      }
    },
    // Atualizar
    async atualizarLista() {
      const res = await fetch('/api/marinheiros')
      this.marinheiros = await res.json()
    },
    // US003 - Filtro por Classificação
    async listarPorClassificacao() {
      this.erroFiltro = ''
      this.marinheirosFiltrados = []

      const res = await fetch(
        `api/marinheiros/classificacao?classificacao=${this.filtroClassificacao}`,
      )
      // ERRO NÃO EXISTE MARINHEIRO COM ESSA CLASSIFICAÇÃO
      if (res.ok) {
        this.marinheirosFiltrados = await res.json()
      } else {
        const erro = await res.json()
        this.erroFiltro = erro.erro || 'Nenhum Marinheiro com essa Classificação'
      }
    },
    // US004 - Filtro por ID
    async procurarPorId() {
      this.erroId = ''
      this.marinheiroEncontrado = []

      const res = await fetch(`api/marinheiros/${this.idPesquisa}`)

      if (res.ok) {
        this.marinheiroEncontrado = await res.json()
      } else {
        const erro = await res.json()
        this.erroId = erro.erro || 'Marinheiro não encontrado'
      }
    },
    // US005 - Update de Classificacao Atraves de ID
    async atualizarClassificacao() {
      this.mensagemUpdate = ''
      this.erroUpdate = ''

      if (!this.update.id || !this.update.classificacao) {
        this.erroUpdate = 'Preenche todos os campos'
        return
      }

      try {
        const res = await fetch(`api/marinheiros/${this.update.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            classificacao: this.update.classificacao,
          }),
        })

        const data = await res.json()

        if (res.ok) {
          this.mensagemUpdate = data.message

          this.update = { id: '', classificacao: '' }

          this.atualizarLista()
        } else {
          this.erroUpdate = data.error || 'Erro ao atualizar.'
        }
      } catch (err) {
        this.erroUpdate = 'Erro na ligação ao servidor.'
      }
    },
    // US006 - Eliminar Marinheiro (Só funciona se não tiver nenhuma reserva associada)
    async eliminarMarinheiro() {
      this.mensagemDelete = ''
      this.erroDelete = ''

      if (!this.idDelete) {
        this.erroDelete = 'Indica um ID'
        return
      }

      try {
        const res = await fetch(`/api/marinheiros/${this.idDelete}`, {
          method: 'DELETE',
        })

        const data = await res.json()

        if (res.ok) {
          this.mensagemDelete = data.message
          this.idDelete = ''

          this.atualizarLista()
        } else {
          this.erroDelete = data.error
        }
      } catch (err) {
        this.erroDelete = 'Erro na ligação ao servidor'
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

.page {
  display: flex;
  gap: 30px;
  padding: 30px;
  align-items: center;
}

/* ESQUERDA */
.main {
  flex: 3;
}

/* HEADER */
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 20px;
}

.header-box h1 {
  font-size: 28px;
}

/* TABELA */
.table-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.refresh {
  margin-bottom: 10px;
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

/* SIDEBAR */
.sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  gap: 40px;

  height: 100%;
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
</style>
