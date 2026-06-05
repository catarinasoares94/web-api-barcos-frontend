# Web API - Gestão de Barcos - FRONTEND

## Descrição
Este projeto consiste no desenvolvimento do Frontend em Vue.js para a aplicação de gestão de reservas de barcos.

A aplicação permite a interação com a Web API em Node.js, possibilitando:

* Gestão de marinheiros
* Gestão de barcos
* Criação e gestão de reservas
_________________________________________________________________________________________

## Tecnologias utilizadas

* Vue.js
* JavaScript
* HTML5
* CSS3
_________________________________________________________________________________________________________________________

## Estrutura do projeto

web-api-barcos-frontend/
│
├── public/
│   ├── images/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── Barcos.vue
│   │   ├── Home.vue
│   │   ├── Marinheiros.vue
│   │   └── Reservas.vue
│   │
│   ├── router/
│   │   └── index.js
│   │
│   ├── views/
│   ├── App.vue
│   └── main.js
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
_________________________________________________________________________________________________________________________

## Como executar o projeto

1. Instalar dependências:

```
npm install
```

2. Executar o servidor:

```
npm run dev
```

3. A API ficará disponível em:

```
http://localhost:5173
```
_________________________________________________________________________________________________________________________

## Principais Funcionalidades

### Marinheiros

* Criar marinheiro
* Listar todos os marinheiros
* Filtrar por classificação
* Obter marinheiro por ID
* Atualizar classificação
* Eliminar marinheiro

---

### Barcos

* Criar barco
* Listar barcos
* Listar barcos disponíveis

---

### Reservas

* Criar reserva
* Listar reservas de um marinheiro
* Cancelar reserva futura
_________________________________________________________________________________________________________________________

## Regras implementadas

* Validação de campos obrigatórios antes de envio para a API;
* Validação de formatos (ex: datas);
* Apresentação de mensagens de erro e sucesso;
* Tratamento de respostas da API;
* Interface consistente com as regras de negócio definidas no backend.
_________________________________________________________________________________________________________________________

## Testes

Os testes foram realizados através da interface da aplicação, garantindo:

* Validação de inputs
* Comunicação correta com a API
* Tratamento de erros
_________________________________________________________________________________________________________________________

## Notas
* O frontend não implementa autenticação nem autorização;
* Assume-se a existência de diferentes tipos de utilizadores:
    * Gestor: gere marinheiros e barcos;
    * Marinheiro: consulta barcos e gere reservas;
_________________________________________________________________________________________________________________________

## Autor

Catarina Soares | UP25T08 – Desenvolvimento Web – PL/SQL
