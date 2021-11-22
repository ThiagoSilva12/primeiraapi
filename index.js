// Vamos construir o servidor usando o modo express.
//Esse modulo possui funções para executar e manipular o servidor node.
//Iniciaremos criando uma referencia do express com a importação do modulo.

const express = require("express");

//Criar uma referêrncia do servidor express para utilizá-lo.

const app = express();

// Fazer o servidor express receber e tratar dados em formato json.

app.use(express.json());

/*
Abaixo, iremos criar as 4 rotas para os verbos get,post,put e de
    - GET  -> Esse verbo é utilizado todas as vezes que o usuário requisita
    alguma informação ao servidor e, este por sua vez responde;

- POST -> É utilizado todas as vezes que o usuário quiser cadastrar um cliente
ou enviar um dado importante ao servidor;

- PUT -> É usado quando se deseja atualizar algum dados sobre um objeto;

- DELETE -> É usado para apagar um dados sobre objetos.

Ao final das rotas iremos aplicar ao servidor uma porta de comunicação. No nosso
caso será a porta 3000.
*/


app.get("/api/cliente/",(req,res)=>{
    res.send("Você está na rota do GET");
});

app.post("/api/cliente/cadastro",(req,res)=>{
res.send(`Os dados enviados foram ${req.body.nome}`);
});

app.put("/api/cliente/atualizar/:id",(req,res)=>{
res.send(`O id passado foi ${req.params.id}
e os dados para  atualizar são ${req.body}`);
});

app.delete("/api/cliente/apagar/:id",(req,res)=>{
res.send(`O id passado foi ${req.params.id}`);
});

app.listen(3000,()=>console.log("Servidor online em http://localhost:3000"));