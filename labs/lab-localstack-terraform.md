# Laboratório LocalStack + Terraform

> Construindo uma mini AWS local para estudos de Platform Engineering.

Este documento explica o laboratório de ponta a ponta: o motivo, a arquitetura, o fluxo de execução e o que você aprende ao final.

Para executar os comandos do projeto, consulte também o guia operacional:  
👉 [README do Terraform LocalStack](../localstack-terraform/README_validado.md)

---

## 1. Visão geral

Imagine que a AWS seja uma cidade cheia de serviços.

Nessa cidade:

- O **S3** é como um grande galpão onde guardamos arquivos.
- O **DynamoDB** é como um armário inteligente, rápido e organizado para guardar dados.
- O **Terraform** é o engenheiro que desenha e constrói tudo a partir de código.
- O **LocalStack** é uma maquete funcional dessa cidade rodando dentro da sua máquina.

A ideia deste laboratório é criar uma pequena estrutura AWS local, sem custo e sem risco de afetar uma conta real.

---

## 2. Objetivo do laboratório

Ao final deste lab, você terá provisionado localmente:

- Um bucket S3.
- Uma tabela DynamoDB.
- Um ambiente LocalStack rodando via Docker.
- Um fluxo básico de testes usando AWS CLI.
- Uma base simples para evoluir estudos de Platform Engineering.

Este laboratório é ideal para praticar **infraestrutura como código** antes de levar o mesmo raciocínio para ambientes reais na AWS.

---

## 3. Arquitetura

```text
                +----------------------+
                |      Terraform       |
                |  Infraestrutura IaC  |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |      LocalStack      |
                |   AWS local no Docker|
                +-----+-----------+----+
                      |           |
                      v           v
                  S3 Bucket    DynamoDB
```

O Terraform envia chamadas para o endpoint local do LocalStack:

```text
http://localhost:4566
```

Esse endpoint funciona como a porta de entrada para os serviços AWS simulados.

---

## 4. Por que usar LocalStack?

Aprender cloud diretamente na AWS real pode ser poderoso, mas também pode trazer alguns riscos:

- Criar custos sem perceber.
- Testar em ambientes compartilhados.
- Depender de internet e permissões reais.
- Errar em recursos que não deveriam ser alterados.

O LocalStack resolve isso criando um ambiente seguro de treino.

É como fazer sparring técnico antes de entrar em uma luta oficial: você simula a pressão, testa os movimentos e aprende com os erros, mas em um ambiente controlado. 🥊

---

## 5. Estrutura do laboratório

A estrutura validada do projeto é:

```text
.
├── labs
│   └── lab-localstack-terraform_validado.md
└── localstack-terraform
    ├── README_validado.md
    ├── main.tf
    ├── outputs.tf
    ├── terraform.tf
    ├── terraform.tfvars
    ├── variables.tf
    └── versions.tf
```

### Papel de cada área

| Caminho | Responsabilidade |
|---|---|
| `labs/` | Documentação conceitual e explicativa do laboratório |
| `localstack-terraform/` | Código Terraform e guia operacional |
| `main.tf` | Recursos principais, como S3 e DynamoDB |
| `terraform.tf` | Configuração do provider AWS apontando para o LocalStack |
| `variables.tf` | Declaração das variáveis |
| `terraform.tfvars` | Valores usados no laboratório |
| `outputs.tf` | Saídas úteis após o provisionamento |
| `versions.tf` | Versões mínimas do Terraform e providers |

---

## 6. Início: preparando o terreno

Antes de provisionar qualquer recurso, precisamos preparar a base.

Os pré-requisitos são:

- Docker instalado.
- Terraform instalado.
- AWS CLI instalada.
- LocalStack CLI instalada.
- Token do LocalStack configurado, quando solicitado.

O Docker executa o LocalStack, o Terraform cria os recursos e a AWS CLI permite validar se tudo realmente foi criado.

---

## 7. Meio: provisionando a infraestrutura

Com o LocalStack rodando, o Terraform entra em cena.

O provider AWS é configurado para não chamar a AWS real. Em vez disso, ele aponta para:

```hcl
endpoints {
  s3       = "http://localhost:4566"
  dynamodb = "http://localhost:4566"
}
```

Isso muda completamente o destino das chamadas.

Na prática:

- O Terraform acha que está falando com a AWS.
- O LocalStack recebe as chamadas localmente.
- Os recursos são criados dentro do container.
- Você consegue testar tudo sem sair da sua máquina.

---

## 8. Recursos criados

### S3

O bucket S3 serve para testes de armazenamento de arquivos.

Exemplo de uso:

- Upload de arquivos.
- Listagem de objetos.
- Testes futuros com eventos, Lambda ou pipelines.

### DynamoDB

A tabela DynamoDB serve para testes de banco NoSQL.

Exemplo de uso:

- Inserção de item.
- Consulta por chave.
- Testes futuros com aplicações serverless.

---

## 9. Fim: validando e limpando

Depois do `terraform apply`, a validação acontece com AWS CLI:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
aws --endpoint-url=http://localhost:4566 dynamodb list-tables
```

Esses comandos confirmam se os recursos existem dentro do LocalStack.

Ao final, você pode destruir os recursos:

```bash
terraform destroy -auto-approve
```

E parar o LocalStack:

```bash
localstack stop
```

Esse fechamento é importante para manter o ambiente limpo e evitar confusão em próximos testes.

---

## 10. Boas práticas aplicadas

Este laboratório segue boas práticas simples, mas importantes:

- Separação entre documentação conceitual e guia operacional.
- Uso de Terraform para provisionamento declarativo.
- Uso de endpoint local para evitar chamadas na AWS real.
- Credenciais fake para testes locais.
- Comandos reproduzíveis.
- Estrutura clara de diretórios.
- Possibilidade de evolução para novos serviços.

---

## 11. Troubleshooting comum

### Erro de credenciais

Se aparecer:

```text
Unable to locate credentials
```

Configure credenciais fake:

```bash
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1
aws configure set output json
```

### LocalStack não responde

Verifique se o container está rodando:

```bash
docker ps | grep localstack
```

Veja os logs:

```bash
docker logs localstack-main --tail 100
```

### Porta 4566 com problema

A porta `4566` é a principal porta do LocalStack.

Verifique se há conflito:

```bash
sudo lsof -i :4566
```

---

## 12. Próximos passos

Depois deste lab, você pode evoluir para:

- Lambda.
- API Gateway.
- SQS.
- SNS.
- EventBridge.
- Step Functions.
- Testes automatizados.
- Módulos Terraform.
- Pipeline no Azure DevOps.
- Backstage criando serviços com templates.
- Simulação de workloads serverless locais.

---

## 13. Conclusão

Você criou uma mini AWS local.

Mais importante do que subir um bucket ou uma tabela foi entender o fluxo:

```text
Código Terraform -> Provider AWS local -> LocalStack -> Serviços simulados
```

Esse tipo de laboratório é uma base excelente para Platform Engineering, porque permite testar padrões, módulos e automações antes de aplicar em ambientes reais.

É o seu ringue de treino para cloud: controlado, barato e perfeito para evoluir técnica antes da produção. 🚀