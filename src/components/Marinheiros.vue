<template>
  <div class="container">
    <!-- US002 - LISTAR TODOS OS MARINHEIROS -->

    <div class="box">
      <h2>Ver Dados Pessoais dos Marinheiros</h2>

      <button @click="toggle">
        {{ mostrarTabela ? 'Esconder Marinheiros' : 'Listar Marinheiros' }}
      </button>

      <button @click="atualizarLista" v-if="mostrarTabela">Atualizar Lista</button>

      <p></p>

      <table v-if="mostrarTabela && marinheiros.length > 0" border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Classificação</th>
            <th>Idade</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="m in marinheiros" :key="m[0]">
            <td>{{ m[0] }}</td>
            <td>{{ m[1] }}</td>
            <td>{{ m[2] }}</td>
            <td>{{ m[3] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- US001 REGISTAR MARINHEIRO -->
    <div class="box">
      <h2>Registar Utilizador como Marinheiro</h2>

      <form @submit.prevent="registarMarinheiro" class="form">
        <label>ID</label>
        <input type="number" v-model="novo.id_marinheiro" placeholder="ID" required />

        <label>Nome</label>
        <input type="text" v-model="novo.nome" placeholder="Nome" required />

        <label>Idade</label>
        <input type="number" v-model="novo.idade" placeholder="Idade" required />

        <label>Classificação</label>
        <input type="number" v-model="novo.classificacao" placeholder="Classificação" required />

        <button type="submit">Registar</button>
      </form>
    </div>

    <!-- US003 LISTAR MARINHEIRO POR CLASSIFICAÇÃO -->
    <div class="box">
      <h2>Listar por Classificação</h2>

      <label>Classificação</label>
      <input type="number" v-model="filtroClassificacao" placeholder="Ex: 10" />

      <button @click="listarPorClassificacao">Filtrar</button>

      <p></p>

      <table v-if="marinheirosFiltrados.length > 0" border="1">
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

      <p v-if="erroFiltro" style="color: red">
        {{ erroFiltro }}
      </p>
    </div>

    <!-- US004 LISTAR INFO DE MARINHEIRO POR ID -->
    <div class="box">
      <h2>Mostrar Informação Detalhada sobre Marinheiro através do seu ID</h2>
      <label>ID</label>
      <input type="number" v-model="idPesquisa" placeholder="Ex: 30" />

      <button @click="procurarPorId">Procurar</button>

      <p></p>

      <table v-if="marinheiroEncontrado.length > 0" border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Classificação</th>
            <th>Idade</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="m in marinheiroEncontrado" :key="m[0]">
            <td>{{ m[0] }}</td>
            <td>{{ m[1] }}</td>
            <td>{{ m[2] }}</td>
            <td>{{ m[3] }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="erroId" style="color: red">
        {{ erroId }}
      </p>
    </div>
  </div>

  <!-- US005 - UPDATE DE CLASSIFICAÇAO ATRAVES DE ID -->
  <div class="box">
    <h2>Atualizar Classificação do Marinheiro</h2>

    <label>ID</label>
    <input type="number" v-model="update.id" placeholder="Ex: 100" />

    <label>Nova Classificação</label>
    <input type="number" v-model="update.classificacao" placeholder="Ex: 8" />

    <button @click="atualizarClassificacao">Atualizar</button>

    <p v-if="mensagemUpdate" style="color: green">
      {{ mensagemUpdate }}
    </p>

    <p v-if="erroUpdate" style="color: red">
      {{ erroUpdate }}
    </p>
  </div>

  <!-- US006 - ELIMINAR MARINHEIRO (SEM RESERVA ASSOCIADA OBRIGATORIO) -->
  <div class="box">
    <h2>Eliminar Marinheiro</h2>

    <label>ID</label>
    <input type="number" v-model="idDelete" placeholder="Ex: 100" />

    <button @click="eliminarMarinheiro">Eliminar</button>

    <p v-if="mensagemDelete" style="color: green">
      {{ mensagemDelete }}
    </p>

    <p v-if="erroDelete" style="color: red">
      {{ erroDelete }}
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
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

  methods: {
    // US002 - Lista de Marinheiros
    async toggle() {
      this.mostrarTabela = !this.mostrarTabela

      if (this.mostrarTabela && this.marinheiros.length === 0) {
        const res = await fetch('http://localhost:8080/api/marinheiros')
        this.marinheiros = await res.json()
      } else {
        this.marinheiros = []
      }
    },
    // US001 - Registo de Marinheiros
    async registarMarinheiro() {
      const res = await fetch('http://localhost:8080/api/marinheiros', {
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
      const res = await fetch('http://localhost:8080/api/marinheiros')
      this.marinheiros = await res.json()
    },
    // US003 - Filtro por Classificação
    async listarPorClassificacao() {
      this.erroFiltro = ''
      this.marinheirosFiltrados = []

      const res = await fetch(
        `http://localhost:8080/api/marinheiros/classificacao?classificacao=${this.filtroClassificacao}`,
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

      const res = await fetch(`http://localhost:8080/api/marinheiros/${this.idPesquisa}`)

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
        const res = await fetch(`http://localhost:8080/api/marinheiros/${this.update.id}`, {
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
        const res = await fetch(`http://localhost:8080/api/marinheiros/${this.idDelete}`, {
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
.container {
  display: flex !important;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 20px;
}

.box {
  border: 1px dashed black;
  padding: 20px;

  flex: 1 1 220px;
  max-width: 500px;
}

.box:last-child {
  margin-left: auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 6px;
  border: 1px solid #999;
}

label {
  margin-top: 10px;
  display: block;
}

button {
  margin-top: 10px;
  margin-right: 10px;
  padding: 6px;
  cursor: pointer;
}

table {
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  text-align: center;
}
</style>
