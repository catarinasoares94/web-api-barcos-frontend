<template>
  <div class="container">
    <!-- US008 - LISTAR TODOS OS BARCOS REGISTADOS NO SISTEMA -->
    <div class="box">
      <h2>Ver Todos os Barcos Registados no Sistema</h2>

      <button @click="toggle">
        {{ mostrarTabela ? 'Esconder Barcos' : 'Listar Barcos' }}
      </button>

      <button @click="atualizarLista" v-if="mostrarTabela">Atualizar Lista</button>

      <p></p>

      <table v-if="mostrarTabela && barcos.length > 0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cor</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="m in barcos" :key="m[0]">
            <td>{{ m[0] }}</td>
            <td>{{ m[1] }}</td>
            <td>{{ m[2] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- US007 - REGISTAR UM BARCO ( ID, NOME E COR ) -->

    <div class="box">
      <h2>Registar Barco</h2>

      <form @submit.prevent="registarBarco" class="form">
        <label>ID</label>
        <input type="number" v-model="novo.id_barco" placeholder="ID" required />

        <label>Nome</label>
        <input type="text" v-model="novo.nome" placeholder="Nome" required />

        <label>Cor</label>
        <input type="text" v-model="novo.cor" placeholder="Cor" required />

        <button type="submit">Registar</button>
      </form>
    </div>
  </div>
  <!-- DIV DO CONTAINER -->
</template>

<script>
export default {
  data() {
    return {
      // US008 - Lista de barcos
      barcos: [],
      mostrarTabela: false,

      // US007 - Registo de Barco
      novo: {
        id_barco: '',
        nome: '',
        cor: '',
      },
    }
  },

  methods: {
    // US008 - Lista de barcos
    async toggle() {
      this.mostrarTabela = !this.mostrarTabela

      if (this.mostrarTabela && this.barcos.length === 0) {
        const res = await fetch('http://localhost:8080/api/barcos')
        this.barcos = await res.json()
      } else {
        this.barcos = []
      }
    },

    // US007 - Registo de Barco
    async registarBarco() {
      const res = await fetch('http://localhost:8080/api/barcos', {
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
      const res = await fetch('http://localhost:8080/api/barcos')
      this.barcos = await res.json()
    },
  },
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 600px;
  margin: 20px 0 20px 40px;
}

.box {
  background: #ffffff;
  border-radius: 14px;
  padding: 25px;
  box-shadow: 0 8px 20px rgba(192, 26, 26, 0.08);
  border: 1px solid #ddd;

  display: flex;
  flex-direction: column;
  gap: 12px;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  max-width: 350px;
  width: 100%;
  margin-bottom: 5px;
}

.box:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.box h2 {
  font-size: 18px;
  margin-bottom: 10px;
  border-bottom: 2px solid #f1f1f1;
  padding-bottom: 5px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  width: 100%;
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
}

input:focus {
  border-color: #007bff;
  padding: 6px;
  border: 1px solid #999;
}

label {
  margin-top: 10px;
  display: block;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #0056b3;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th {
  background: #f5f5f5;
}

th,
td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: center;
}

.sucesso {
  color: #2e7d32;
  font-weight: 500;
}

.erro {
  color: #c62828;
  font-weight: 500;
}

body {
  background: #f4f6f9;
}
</style>
