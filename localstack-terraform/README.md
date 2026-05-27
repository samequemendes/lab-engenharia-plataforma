# LocalStack + Terraform Lab

Guia operacional para provisionar recursos AWS locais usando **LocalStack** e **Terraform**.

Este README é o passo a passo prático do laboratório. Para entender o conceito completo, a arquitetura e o raciocínio por trás do lab, leia:  
👉 [Explicação completa do laboratório](../labs/lab-localstack-terraform_validado.md)

---

## 1. Objetivo

Provisionar localmente:

- Um bucket S3.
- Uma tabela DynamoDB.

Tudo será criado dentro do LocalStack, sem custo na AWS real.

---

## 2. Arquitetura resumida

```text
Terraform
   |
   v
LocalStack na porta 4566
   |
   +--> S3
   |
   +--> DynamoDB
```

---

## 3. Pré-requisitos

Valide as ferramentas:

```bash
docker --version
terraform version
aws --version
```

Instale o LocalStack CLI, caso ainda não tenha:

```bash
pipx install localstack
```

---

## 4. Configurar autenticação do LocalStack

Se o LocalStack solicitar autenticação, configure seu token:

```bash
localstack auth set-token SEU_TOKEN
```

Você pode obter o token no painel do LocalStack:

```text
https://app.localstack.cloud
```

> Não versione tokens, credenciais reais ou qualquer segredo no Git.

---

## 5. Subir o LocalStack

Inicie o LocalStack em background:

```bash
localstack start -d
```

Valide se o container está rodando:

```bash
docker ps | grep localstack
```

Valide o health check:

```bash
curl http://localhost:4566/_localstack/health
```

Se retornar um JSON, o ambiente está pronto.

---

## 6. Configurar AWS CLI

Mesmo usando ambiente local, a AWS CLI precisa de credenciais.

Use credenciais fake:

```bash
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1
aws configure set output json
```

Teste a conexão:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

---

## 7. Estrutura do projeto

```text
localstack-terraform/
├── README_validado.md
├── main.tf
├── outputs.tf
├── terraform.tf
├── terraform.tfvars
├── variables.tf
└── versions.tf
```

---

## 8. Provider Terraform

O arquivo `terraform.tf` deve configurar o provider AWS apontando para o LocalStack.

```hcl
provider "aws" {
  region     = "us-east-1"
  access_key = "test"
  secret_key = "test"

  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3       = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
  }
}
```

### Por que isso é importante?

Sem essa configuração, o Terraform tentaria falar com a AWS real.

Com essa configuração, ele envia as chamadas para o LocalStack.

---

## 9. Recursos provisionados

### S3 Bucket

```hcl
resource "aws_s3_bucket" "lab" {
  bucket = "localstack-lab-dev-bucket"
}
```

### DynamoDB

```hcl
resource "aws_dynamodb_table" "lab_users" {
  name         = "localstack-lab-dev-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
```

---

## 10. Executar Terraform

Inicialize:

```bash
terraform init
```

Formate:

```bash
terraform fmt -recursive
```

Valide:

```bash
terraform validate
```

Planeje:

```bash
terraform plan
```

Aplique:

```bash
terraform apply -auto-approve
```

---

## 11. Testar S3

Listar buckets:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

Criar arquivo de teste:

```bash
echo "teste localstack" > teste.txt
```

Fazer upload:

```bash
aws --endpoint-url=http://localhost:4566 \
  s3 cp teste.txt s3://localstack-lab-dev-bucket/teste.txt
```

Listar arquivos no bucket:

```bash
aws --endpoint-url=http://localhost:4566 \
  s3 ls s3://localstack-lab-dev-bucket
```

---

## 12. Testar DynamoDB

Listar tabelas:

```bash
aws --endpoint-url=http://localhost:4566 \
  dynamodb list-tables
```

Inserir item:

```bash
aws --endpoint-url=http://localhost:4566 \
  dynamodb put-item \
  --table-name localstack-lab-dev-users \
  --item '{
    "id": {"S": "1"},
    "name": {"S": "Sameque"},
    "role": {"S": "Platform Engineer"}
  }'
```

Buscar item:

```bash
aws --endpoint-url=http://localhost:4566 \
  dynamodb get-item \
  --table-name localstack-lab-dev-users \
  --key '{"id": {"S": "1"}}'
```

---

## 13. Outputs do Terraform

Depois do apply, consulte as saídas:

```bash
terraform output
```

Se os outputs estiverem configurados, você pode recuperar nomes de recursos assim:

```bash
terraform output -raw s3_bucket_name
terraform output -raw dynamodb_table_name
```

---

## 14. Destroy

Remova os recursos criados pelo Terraform:

```bash
terraform destroy -auto-approve
```

Pare o LocalStack:

```bash
localstack stop
```

---

## 15. Troubleshooting

### AWS CLI sem credenciais

Erro comum:

```text
Unable to locate credentials
```

Solução:

```bash
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1
```

### LocalStack não responde

Verifique o container:

```bash
docker ps | grep localstack
```

Verifique logs:

```bash
docker logs localstack-main --tail 100
```

### Health check falhou

Teste novamente:

```bash
curl http://localhost:4566/_localstack/health
```

Se continuar falhando, reinicie:

```bash
localstack stop
localstack start -d
```

---

## 16. Boas práticas

- Nunca use credenciais reais em labs locais.
- Sempre use `--endpoint-url=http://localhost:4566` ao testar via AWS CLI.
- Rode `terraform fmt -recursive` antes de versionar.
- Rode `terraform validate` antes de aplicar.
- Separe documentação conceitual de documentação operacional.
- Use nomes previsíveis para facilitar troubleshooting.
- Destrua recursos quando terminar o teste.

---

## 17. Próximas evoluções

Este lab pode virar base para:

- Lambda + API Gateway.
- S3 event notifications.
- DynamoDB Streams.
- SQS e SNS.
- EventBridge.
- Testes automatizados.
- Módulos Terraform reutilizáveis.
- Pipeline CI/CD no Azure DevOps.
- Templates Backstage para criação de serviços.

---

## 18. Referências

- [Documentação LocalStack](https://docs.localstack.cloud/)
- [Documentação Terraform](https://developer.hashicorp.com/terraform/docs)
- [AWS Provider Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)