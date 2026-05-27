# LocalStack + Terraform Lab

Laboratório básico para provisionamento local de recursos AWS utilizando **LocalStack** + **Terraform**.

## Objetivo

Este laboratório cria localmente:

- 1 Bucket S3
- 1 Tabela DynamoDB

Tudo executando localmente via LocalStack, sem custos na AWS.

---

# Arquitetura

```text
Terraform
   |
   v
LocalStack (Docker)
   |
   +--> S3
   |
   +--> DynamoDB
```

---

# Pré-requisitos

## Docker
## Terraform
## AWS CLI

Verifique:

```bash
docker --version
terraform version
aws --version
```


# Instalação do LocalStack

```bash
pipx install localstack
```

---

# Configuração do Token (opcional)

Se você estiver usando LocalStack Pro/Enterprise ou se o CLI solicitar, execute:

ATENÇÃO: Localize seu token ao clicar na url de acesso ao Localstack

```bash

     __                     _______ __             __
    / /   ____  _________ _/ / ___// /_____ ______/ /__
   / /   / __ \/ ___/ __ `/ /\__ \/ __/ __ `/ ___/ //_/
  / /___/ /_/ / /__/ /_/ / /___/ / /_/ /_/ / /__/ ,<
 /_____/\____/\___/\__,_/_//____/\__/\__,_/\___/_/|_|

- LocalStack CLI: 2026.3.0
- Profile: default
- App: https://app.localstack.cloud

[12:20:08] starting LocalStack in Docker mode 🐳    
```


```bash
localstack auth set-token SEU_TOKEN
```

---

# Subindo o LocalStack

```bash
localstack start -d
```

---

# Validar funcionamento

```bash
docker ps | grep localstack
```

```bash
curl http://localhost:4566/_localstack/health
```

---

# Configuração AWS CLI

```bash
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1
aws configure set output json
```

---

# Estrutura do Projeto

```text
localstack-terraform/
├── main.tf
├── outputs.tf
├── terraform.tf
├── terraform.tfvars
├── variables.tf
├── versions.tf
└── README.md
```

---

# Provider Terraform

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

---

# Recursos Criados

## S3 Bucket

```hcl
resource "aws_s3_bucket" "lab" {
  bucket = "localstack-lab-dev-bucket"
}
```

## DynamoDB

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

# Inicialização Terraform

```bash
terraform init
terraform validate
terraform fmt -recursive
terraform plan
terraform apply -auto-approve
```

---

# Testes

## Listar buckets

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

## Upload arquivo

```bash
echo "teste localstack" > teste.txt

aws --endpoint-url=http://localhost:4566 \
s3 cp teste.txt s3://localstack-lab-dev-bucket/teste.txt
```

## Listar arquivos

```bash
aws --endpoint-url=http://localhost:4566 \
s3 ls s3://localstack-lab-dev-bucket
```

## Listar tabelas DynamoDB

```bash
aws --endpoint-url=http://localhost:4566 \
dynamodb list-tables
```

## Inserir item

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

## Buscar item

```bash
aws --endpoint-url=http://localhost:4566 \
dynamodb get-item \
--table-name localstack-lab-dev-users \
--key '{"id": {"S": "1"}}'
```

---

# Destroy

```bash
terraform destroy -auto-approve
```

---

# Parar LocalStack

```bash
localstack stop
```

---

# Troubleshooting

## Credenciais AWS

```bash
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
```

## Logs

```bash
docker logs localstack-main --tail 100
```

---

# Próximos passos

- Lambda
- API Gateway
- SNS
- SQS
- EventBridge
- Step Functions
- ECS
- Athena
- Glue
- Terraform Modules
- Azure DevOps CI/CD
- Backstage + LocalStack

---

# Referências

- https://docs.localstack.cloud/
- https://developer.hashicorp.com/terraform/docs
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs
