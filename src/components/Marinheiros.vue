<template>
  <div class="container">

    <!-- US02 - LISTAR TODOS OS MARINHEIROS -->

    <div class="box">
      <h2>Ver Dados Pessoais dos Marinheiros</h2>

      <button @click="toggle">
        {{ mostrarTabela ? 'Esconder Marinheiros' : 'Listar Marinheiros' }}
      </button>

      <button @click="atualizarLista" v-if="mostrarTabela"> Atualizar Lista </button>

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

    <!-- US01 REGISTAR MARINHEIRO -->
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

  </div>
</template>

<script>
export default {
  data() {
    return {
      marinheiros: [],
      mostrarTabela: false,
      novo: {
        id_marinheiro: "",
        nome: "",
        idade: "",
        classificacao: ""
      }
    }
  },

  methods: {
    async toggle() {
      this.mostrarTabela = !this.mostrarTabela

      if (this.mostrarTabela && this.marinheiros.length === 0) {
        const res = await fetch("http://localhost:8080/api/marinheiros")
        this.marinheiros = await res.json()
      }
    },

    async registarMarinheiro() {
      const res = await fetch("http://localhost:8080/api/marinheiros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.novo)
      })

      const texto = await res.text()
      console.log(texto)

      if (res.ok) {
        alert("Marinheiro registado!")

        this.novo = {
          id_marinheiro: "",
          nome: "",
          idade: "",
          classificacao: ""
        }

      
      } else {
        if (texto.includes("ORA-00001") || texto.toLowerCase().includes("unique")) {
          alert("ID já existe")
        } else {
          alert("Erro ao registar")
        }
      }
    },

    async atualizarLista() {
      const res = await fetch("http://localhost:8080/api/marinheiros")
      this.marinheiros = await res.json()
    }
  }
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