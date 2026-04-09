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
    }
  },

  methods: {
    // US002 - Lista de Marinheiros
    async toggle() {
      this.mostrarTabela = !this.mostrarTabela

      if (this.mostrarTabela && this.marinheiros.length === 0) {
        const res = await fetch('http://localhost:8080/api/marinheiros')
        this.marinheiros = await res.json()
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
  },
}
</script>

<style>
.container {
  display: flex !important;
  flex-direction: row;
  align-items: flex-start;
  gap: 40px;
}

.box {
  border: 1px dashed black;
  padding: 20px;
  width: 350px;
}

.container > .box {
  flex: 0 0 auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 6px;
  border: 1px solid #999;
}

button {
  margin-top: 10px;
  margin-right: 10px;
  padding: 8px;
  cursor: pointer;
}
</style>
