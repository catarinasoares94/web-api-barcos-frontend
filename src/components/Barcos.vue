<template>
  <div class="page">
    <!-- ESQUERDA -->
    <div class="main">
      <!-- US008 - LISTAR TODOS OS BARCOS REGISTADOS NO SISTEMA -->
      <div class="table-box" v-if="activeBox === 'listar'">
        <table v-if="barcos.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Cor</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="b in barcos" :key="b[0]">
              <td>{{ b[0] }}</td>
              <td>{{ b[1] }}</td>
              <td>{{ b[2] }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FORMS -->
      <div class="forms-area">
        <!-- US007 - REGISTAR UM BARCO ( ID, NOME E COR ) -->
        <div v-if="activeBox === 'registar'" class="card">
          <h3>Registar Barco</h3>

          <input v-model="novo.id_barco" placeholder="ID" />
          <input v-model="novo.nome" placeholder="Nome" />
          <input v-model="novo.cor" placeholder="Cor" />

          <button class="primary" @click="registarBarco">Registar</button>
        </div>

        <!-- US009 - LISTAR TODOS OS BARCOS DISPONIVEIS PARA RESERVA -->
        <div v-if="activeBox === 'disponiveis'" class="card">
          <h3>Barcos Disponíveis</h3>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Cor</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="b in barcosDisponiveis" :key="b[0]">
                <td>{{ b[0] }}</td>
                <td>{{ b[1] }}</td>
                <td>{{ b[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DELETE BARCO -->
      <div v-if="activeBox === 'delete'" class="card danger">
        <h3>Eliminar Barco</h3>

        <input v-model="idDelete" placeholder="ID do barco" />

        <button class="danger" @click="eliminarBarco">Eliminar</button>

        <p v-if="mensagemDelete">{{ mensagemDelete }}</p>
        <p v-if="erroDelete">{{ erroDelete }}</p>
      </div>
    </div>

    <!-- DIREITA -->
    <div class="sidebar">
      <button @click="toggleBox('listar')">Listar Barcos</button>

      <button @click="toggleBox('registar')">Registar Barco</button>

      <button @click="toggleBox('disponiveis')">Barcos Disponíveis</button>

      <button class="danger" @click="toggleBox('delete')">Eliminar Barco</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // CONTROLO UI
      activeBox: 'listar',

      // US008 - Lista de barcos disponiveis no sistema
      barcos: [],

      // US007 - Registo de barco (id, nome e cor)
      novo: {
        id_barco: '',
        nome: '',
        cor: '',
      },

      // US009 - Listar Barcos Disponiveis para Reserva
      barcosDisponiveis: [],

      //Eliminar barco
      idDelete: '',
      mensagemDelete: '',
      erroDelete: '',
    }
  },

  async mounted() {
    await this.atualizarLista()
  },

  methods: {
    // TROCAR BOX
    async toggleBox(box) {
      this.activeBox = box

      // carregar dados automaticamente ao entrar

      if (box === 'listar') {
        await this.atualizarLista()
      }

      if (box === 'disponiveis') {
        await this.listarDisponiveis()
      }
    },

    // US008 - Lista de barcos disponiveis no sistema
    async atualizarLista() {
      const res = await fetch('/api/barcos')
      this.barcos = await res.json()
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

        // atualizar lista automaticamente
        await this.atualizarLista()

        // opcional: voltar à lista
        this.activeBox = 'listar'
      } else {
        if (texto.includes('ORA-00001') || texto.toLowerCase().includes('unique')) {
          alert('ID já existe')
        } else {
          alert('Erro ao registar')
        }
      }
    },

    // US009 - Listar Barcos Disponiveis para Reserva
    async listarDisponiveis() {
      const res = await fetch('/api/barcos/disponiveis')
      const dados = await res.json()

      if (res.ok) {
        this.barcosDisponiveis = dados
      } else {
        this.barcosDisponiveis = []
        alert(dados.error || 'Nenhum barco disponível')
      }
    },

    //Eliminar barco
    async eliminarBarco() {
      this.mensagemDelete = ''
      this.erroDelete = ''

      const idNum = Number(this.idDelete)

      if (!Number.isInteger(idNum)) {
        this.erroDelete = 'ID inválido. Inserir apenas números inteiros.'
        return
      }

      try {
        const res = await fetch(`/api/barcos/${idNum}`, {
          method: 'DELETE',
        })

        const dados = await res.json()

        if (res.ok) {
          this.mensagemDelete = 'Barco eliminado com sucesso.'
          this.idDelete = ''
          await this.atualizarLista()
          return
        }

        // TRATAR ERROS ESPECÍFICOS
        if (res.status === 404) {
          this.erroDelete = 'Barco não existe.'
        } else if (res.status === 400) {
          this.erroDelete = 'Barco tem reservas associadas.'
        } else {
          this.erroDelete = dados.error || 'Erro ao eliminar.'
        }
      } catch (err) {
        console.error(err)
        this.erroDelete = 'Erro de ligação ao servidor.'
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
