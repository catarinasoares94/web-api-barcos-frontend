<template>
  <div class="page">
    <!-- ESQUERDA -->
    <div class="main">
      <!-- TABELA -->
      <div class="table-box" v-if="activeBox === 'listar'">
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

      <div class="forms-area" :key="activeBox">
        <!-- US001 REGISTAR MARINHEIRO -->
        <div v-if="activeBox === 'registar'" class="card">
          <h3>Registar</h3>

          <input v-model="novo.id_marinheiro" placeholder="ID" />
          <input v-model="novo.nome" placeholder="Nome" />
          <input v-model="novo.idade" placeholder="Idade" />
          <input v-model="novo.classificacao" placeholder="Classificação" />

          <button class="primary" @click="registarMarinheiro">Registar</button>
        </div>

        <!-- US003 LISTAR MARINHEIRO POR CLASSIFICAÇÃO -->
        <div v-if="activeBox === 'filtro'" class="card">
          <h3>Filtrar por Classificação</h3>

          <input v-model="filtroClassificacao" placeholder="Ex: 5" />
          <button @click="listarPorClassificacao">Filtrar</button>

          <!-- RESULTADOS -->
          <table v-if="marinheirosFiltrados.length">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Classificação</th>
                <th>Idade</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="m in marinheirosFiltrados" :key="m[0]">
                <td>{{ m[0] }}</td>
                <td>{{ m[1] }}</td>
                <td>{{ m[2] }}</td>
                <td>{{ m[3] }}</td>
              </tr>
            </tbody>
          </table>

          <p v-if="erroFiltro">{{ erroFiltro }}</p>
        </div>

        <!-- US004 LISTAR INFO DE MARINHEIRO POR ID -->
        <div v-if="activeBox === 'procurar'" class="card">
          <h3>Procurar por ID</h3>

          <input v-model="idPesquisa" placeholder="ID" />
          <button @click="procurarPorId">Procurar</button>

          <!-- RESULTADO -->
          <table v-if="marinheiroEncontrado.length">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Classificação</th>
                <th>Idade</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{{ marinheiroEncontrado[0][0] }}</td>
                <td>{{ marinheiroEncontrado[0][1] }}</td>
                <td>{{ marinheiroEncontrado[0][2] }}</td>
                <td>{{ marinheiroEncontrado[0][3] }}</td>
              </tr>
            </tbody>
          </table>

          <p v-if="erroId">{{ erroId }}</p>
        </div>

        <!-- US005 - UPDATE -->
        <div v-if="activeBox === 'update'" class="card">
          <h3>Atualizar Classificação</h3>

          <input v-model="update.id" placeholder="ID" />
          <input v-model="update.classificacao" placeholder="Nova classificação" />

          <button @click="atualizarClassificacao">Atualizar</button>

          <p v-if="mensagemUpdate">{{ mensagemUpdate }}</p>
          <p v-if="erroUpdate">{{ erroUpdate }}</p>
        </div>

        <!-- US006 - ELIMINAR -->
        <div v-if="activeBox === 'delete'" class="card danger">
          <h3>Eliminar</h3>

          <input v-model="idDelete" placeholder="ID" />
          <button @click="eliminarMarinheiro">Eliminar</button>

          <p v-if="mensagemDelete">{{ mensagemDelete }}</p>
          <p v-if="erroDelete">{{ erroDelete }}</p>
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

      // US005 - Update
      update: {
        id: '',
        classificacao: '',
      },
      mensagemUpdate: '',
      erroUpdate: '',

      // US006 - Eliminar
      idDelete: '',
      mensagemDelete: '',
      erroDelete: '',
    }
  },

  mounted() {
    console.log('MONTADO')
    this.atualizarLista()
  },

  computed: {
    marinheirosPaginados() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.marinheiros.slice(start, start + this.itemsPerPage)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.marinheiros.length / this.itemsPerPage))
    },
  },

  watch: {
    marinheiros() {
      this.currentPage = 1
    },
  },

  methods: {
    toggleBox(box) {
      this.activeBox = box
    },

    // US002 - Lista de Marinheiros
    async atualizarLista() {
      try {
        const res = await fetch('/api/marinheiros')
        this.marinheiros = await res.json()
      } catch {
        console.error('Erro ao carregar lista')
      }
    },

    // US001 - Registo de Marinheiros
    async registarMarinheiro() {
      const res = await fetch('/api/marinheiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.novo),
      })

      if (res.ok) {
        alert('Marinheiro registado!')
        this.atualizarLista()
      } else {
        alert('Erro ao registar')
      }
    },

    // US003
    async listarPorClassificacao() {
      this.erroFiltro = ''
      this.marinheirosFiltrados = []

      try {
        const res = await fetch(
          `/api/marinheiros/classificacao?classificacao=${this.filtroClassificacao}`,
        )
        if (res.ok) {
          this.marinheirosFiltrados = await res.json()
        } else {
          this.erroFiltro = 'Nenhum Marinheiro encontrado'
        }
      } catch {
        this.erroFiltro = 'Erro de ligação'
      }
    },

    // US004
    async procurarPorId() {
      this.erroId = ''
      this.marinheiroEncontrado = []

      try {
        const res = await fetch(`/api/marinheiros/${this.idPesquisa}`)
        if (res.ok) {
          this.marinheiroEncontrado = await res.json()
        } else {
          this.erroId = 'Marinheiro não encontrado'
        }
      } catch {
        this.erroId = 'Erro de ligação'
      }
    },

    // US005
    async atualizarClassificacao() {
      const res = await fetch(`/api/marinheiros/${this.update.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classificacao: this.update.classificacao,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        this.mensagemUpdate = data.message
        this.atualizarLista()
      } else {
        this.erroUpdate = data.error
      }
    },

    // US006
    async eliminarMarinheiro() {
      const res = await fetch(`/api/marinheiros/${this.idDelete}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        this.mensagemDelete = data.message
        this.atualizarLista()
      } else {
        this.erroDelete = data.error
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
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 30px;
  padding: 30px;
}

/* ESQUERDA */
.main {
  flex: 3;
  position: relative;
  z-index: 1;
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
