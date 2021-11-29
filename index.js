// Vamos construir o servidor usando o modo express.
//Esse modulo possui funções para executar e manipular o servidor node.
//Iniciaremos criando uma referencia do express com a importação do modulo.

const express = require("express");

const cors = require('cors');


// Vamos importar o modulo mongoose que fará a interface entre o 
//nodejs e o banco de dados mongodb
const mongoose = require("mongoose");

//Importação do modo bcrypt para criptografia de senhas
const bcrypt = require("bcrypt");

//JSONWebToken é um hash que garante a senção segura em uma página ou grupos de páginas
//permitindo ou não o acesso aos conteúdo destas páginas.Ele é gerado a partir de algum
//elementos,tais como:dados que importam ao token(payload),chave secreta,tempo de
//explicação e método de criptografia.
const jtw  = require("jsonwebtoken");

const cfn = require("./config");
const { jwt_expires } = require("./config");

const url= "mongodb+srv://thiagoscmongodb:tsc0612@clustercliente.taitl.mongodb.net/primeiraapi?retryWrites=true&w=majority";

mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true});

// Vamos criar a estrutura da tabela cliente com o comando de Schema
const tabela = mongoose.Schema({
    nome:{type:String, required:true},
    email:{type:String,required:true,unique:false},
    cpf:{type:String, required:true,unique:false},
    usuario:{type:String, required:true, unique:false},
    senha:{type:String, required:true,}
});

//Aplicação da criptografia do bcrypt a tabela de cadastro
// de clientes será feita um passo antes do salvamento
//dos dados clientes,
//vamos usar o comando pre
tabela.pre("save",function(next){
    let cliente = this;
    if(!cliente.isModified('senha')) return next()
bcrypt.hash(cliente.senha,10,(erro,rs)=>{
if(erro) return console.log(`erro ao gerar senha -> ${erro}`);
    cliente.senha= rs
    return next();
    })

});

//execução da tabela
const Cliente = mongoose.model("tbcliente",tabela);

//Criar uma referêrncia do servidor express para utilizá-lo.

const app = express();

// Fazer o servidor express receber e tratar dados em formato json.

app.use(express.json());
app.use(cors());
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











app.get("/api/cliente/", verifica,(req,res)=>{
    Cliente.find((erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar ler os clientes -> ${erro}`});
        }
        res.status(200).send({output:dados});
    }

    );
});

app.get("/api/cliente/:id",(req,res)=>{
    Cliente.findById(req.params.id,(erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar ler os clientes -> ${erro}`});
        }
        res.status(200).send({output:dados});
    }

    );
});








app.post("/api/cliente/cadastro",(req,res)=>{

    const cliente = new Cliente(req.body);
    cliente.save().then(()=>{
        const gerado = criaToken(req.body.usuario,req.body.nome);
        res.status(201).send({output:`Cliente cadastrado` ,token:gerado});
    })
    .catch((erro)=>res.status(400).send({output:`Erro ao tentar cadastrar o cliente`,message:erro}))

});


app.post("/api/cliente/login",(req,res)=>{
    const us = req.body.usuario;
    const sh = req.body.senha;
    Cliente.findOne({usuario:us},(erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Usuário não localizado -> ${erro}`});
        }
      bcrypt.compare(sh,dados.senha,(erro,igual)=>{
        if(erro) return res.status(400).senha({output:`Erro ao tentar logar-> ${erro}`});
        if(!igual) return res.status(400).send({output:`A senha não é valida-> ${erro}`});
        const gerado = criaToken(dados.usuario,dados.nome);
        res.status(200).send({output:`Logado`,payload:dados,token:gerado});
      });

    
    });
});




app.put("/api/cliente/atualizar/:id", verifica,(req,res)=>{
    Cliente.findByIdAndUpdate(req.params.id,req.body,(erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar atualizar -> ${erro}`});
        }
        res.status(200).send({output:`Dados atualizados`});
    })
});

app.delete("/api/cliente/apagar/:id", verifica,(req,res)=>{
Cliente.findByIdAndDelete(req.params.id,(erro,dados)=>{
    if(erro){
        return res.status(400).send({output:`Erro ao tentar apagar o cliente ->${erro}`})
    }
    res.status(204).send({});
    });
});


//Gerar token
const criaToken=(usuario, nome)=>{
   return jtw.sign({usuario:usuario,nome:nome},cfn.jwt_key,{expiresIn:cfn.jwt_expires});
};


//validação do token
function verifica(req,res,next){
    const token_gerado = req.headers.token;
    if(!token_gerado){
        return res.status(401).send({output:"Não há token"});
    }
    jtw.verify(token_gerado,cfn.jwt_key,(erro,dados)=>{
        if(erro){
            return res.status(401).send({output:"Token inválido"});
        }
        next();
    });
};

app.listen(3000,()=>console.log("Servidor online em http://localhost:3000"));