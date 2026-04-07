<template>
  <h2>Marinheiros</h2>

  <button @click="carregar">Listar Marinheiros</button>

  <table v-if="marinheiros.length > 0" border="1">
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
</template>

<script>
export default {
  data() {
    return {
      marinheiros: []
    }
  },

  methods: {
    async carregar() {
      const res = await fetch("http://localhost:8080/api/marinheiros")
      this.marinheiros = await res.json()
    }
  }
}
</script>