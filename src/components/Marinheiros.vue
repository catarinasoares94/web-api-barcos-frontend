<template>
  <h2>Marinheiros</h2>

  <!-- ERRO -->
  <p v-if="erro" style="color: red">{{ erro }}</p>

  <!-- Criar -->
  <h3>Criar Marinheiro</h3>
  <input v-model="nome" placeholder="Nome" />
  <input v-model="idade" placeholder="Idade" />
  <input v-model="classificacao" placeholder="Classificação" />
  <button @click="criar">Criar</button>

  <hr />

  <!-- Filtro -->
  <h3>Filtrar por Classificação</h3>
  <input v-model="classificacaoFiltro" placeholder="Classificação" />
  <button @click="filtrar">Filtrar</button>
  <button @click="carregar">Reset</button>

  <hr />

  <!-- Lista -->
  <h3>Lista de Marinheiros</h3>

  <p v-if="marinheiros.length === 0">Sem dados...</p>

  <ul>
    <li v-for="m in marinheiros" :key="m.ID_MARINHEIRO">
      {{ m.NOME }} - {{ m.CLASSIFICACAO }}
      <button @click="apagar(m.ID_MARINHEIRO)">X</button>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      marinheiros: [],
      nome: '',
      idade: '',
      classificacao: '',
      classificacaoFiltro: '',
      erro: '',
    }
  },

  methods: {
    async carregar() {
      try {
        const res = await fetch('http://localhost:8080/api/marinheiros')

        if (!res.ok) throw new Error('Erro ao carregar marinheiros')

        this.marinheiros = await res.json()
        this.erro = ''
      } catch (e) {
        console.error(e)
        this.erro = 'Backend não está ligado'
        this.marinheiros = []
      }
    },

    async criar() {
      try {
        await fetch('http://localhost:8080/api/marinheiros', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_marinheiro: Date.now(),
            nome: this.nome,
            idade: this.idade,
            classificacao: this.classificacao,
          }),
        })

        this.carregar()
      } catch {
        this.erro = 'Erro ao criar marinheiro'
      }
    },

    async filtrar() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/marinheiros/classificacao?classificacao=${this.classificacaoFiltro}`,
        )

        this.marinheiros = await res.json()
      } catch {
        this.erro = 'Erro no filtro'
      }
    },

    async apagar(id) {
      try {
        await fetch(`http://localhost:8080/api/marinheiros/${id}`, {
          method: 'DELETE',
        })

        this.carregar()
      } catch {
        this.erro = 'Erro ao apagar'
      }
    },
  },

  mounted() {
    this.carregar()
  },
}
</script>
