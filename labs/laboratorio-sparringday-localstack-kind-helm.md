# Laboratório Sparring Day com LocalStack + Helm + kind

## Objetivo

Este laboratório documenta a construção da base local do projeto **Sparring Day** usando **LocalStack rodando em Kubernetes com Helm + kind**, validando fim a fim os recursos iniciais abaixo:

- **S3** para hospedar o frontend estático
- **DynamoDB** para armazenar dados iniciais
- **Lambda** para consultar o DynamoDB
- **API Gateway** para expor a Lambda
- **Portal base** hospedado no S3
- **Página de teste de API** no frontend
- **Estrutura base em Terraform** para transformar o laboratório em módulos reutilizáveis

A ideia deste documento é servir como:

1. **guia operacional prático** para validar o funcionamento básico da aplicação localmente;
2. **fonte de verdade** para a futura criação dos módulos Terraform iniciais do projeto.

---

## Referência adotada

Este laboratório foi montado com base em:

- tutorial oficial do LocalStack para **S3 static website com Terraform**;
- guia oficial de **Terraform com LocalStack**;
- guia oficial de **deploy com Helm**;
- documentação oficial de **Lambda no LocalStack**;
- troubleshooting oficial de **LocalStack em Kubernetes**.

Essas referências foram adaptadas para o seu cenário específico com **kind + Helm + NodePort + Lambda com Docker socket**.

---

## Visão da arquitetura do laboratório

```text
Navegador
   |
   v
Frontend React/Tailwind
   |
   +--> S3 website endpoint (LocalStack)
   |
   +--> Página de teste da API
             |
             v
      API Gateway (LocalStack)
             |
             v
          Lambda
             |
             v
         DynamoDB
```

### Fluxo esperado

1. O frontend é buildado localmente.
2. Os arquivos do build são enviados para um bucket S3 no LocalStack.
3. O bucket é configurado para **static website hosting**.
4. O frontend expõe uma página de teste que consome a API.
5. A API chama uma Lambda.
6. A Lambda consulta a tabela do DynamoDB.
7. A resposta retorna para o frontend.

---

## Pré-requisitos

Antes de começar, garanta:

- WSL/Linux com Docker funcionando
- `kind`
- `kubectl`
- `helm`
- `aws cli`
- `terraform`
- `python3` + `pip`
- `zip`
- Node.js e npm

Instalar `tflocal`:

```bash
pip install terraform-local
```

Validar:

```bash
tflocal --help
terraform version
kubectl version --client
helm version
aws --version
docker version
```

---

## Estrutura sugerida do laboratório

```text
sparringday-local-lab/
├── docs/
│   └── laboratorio.md
├── localstack/
│   ├── kind-config.yaml
│   └── values.yaml
├── lambda/
│   ├── lambda_function.py
│   └── function.zip
├── frontend/
│   └── sparringday-frontend/
├── terraform/
│   ├── main.tf
│   ├── provider.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars
│   ├── modules/
│   │   ├── s3_static_site/
│   │   ├── dynamodb/
│   │   ├── lambda/
│   │   └── api_gateway/
│   └── environments/
│       └── local/
└── scripts/
    ├── create-resources.sh
    ├── seed-dynamodb.sh
    └── validate-lab.sh
```

---

# Etapa 1 — Criando o cluster kind corretamente

## 1.1 Arquivo `kind-config.yaml`

> Ponto crítico: para o LocalStack conseguir executar Lambda com a implementação atual, o **Docker socket precisa existir no node do kind**.

Crie o arquivo abaixo:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: localstack-lab
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30066
        hostPort: 4566
        protocol: TCP
    extraMounts:
      - hostPath: /var/run/docker.sock
        containerPath: /var/run/docker.sock
```

## 1.2 Criar o cluster

```bash
kind delete cluster --name localstack-lab
kind create cluster --config kind-config.yaml
```

## 1.3 Validar se o Docker socket entrou no node

```bash
docker exec -it localstack-lab-control-plane ls -l /var/run/docker.sock
```

Esperado:

```text
srw-rw---- ... /var/run/docker.sock
```

Se isso falhar, **não avance**, porque a Lambda não vai subir.

---

# Etapa 2 — Instalando o LocalStack com Helm

## 2.1 Adicionar repositório Helm

```bash
helm repo add localstack https://localstack.github.io/helm-charts
helm repo update
```

## 2.2 Arquivo `values.yaml`

Use um `values.yaml` compatível com o seu cenário:

```yaml
image:
  repository: localstack/localstack-pro
  tag: latest

service:
  type: NodePort
  edgeService:
    nodePort: 30066

startServices: "s3,sqs,sns,dynamodb,lambda,iam,sts,cloudwatch,logs,ec2,apigatewayv2,secretsmanager,cognito-identity,cognito-idp,events"

enableStartupScripts: false

debug: true

extraEnvVars:
  - name: LOCALSTACK_AUTH_TOKEN
    value: "SEU_TOKEN_AQUI"
  - name: DEBUG
    value: "1"
  - name: DOCKER_HOST
    value: "unix:///var/run/docker.sock"

volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
      type: Socket

volumeMounts:
  - name: docker-sock
    mountPath: /var/run/docker.sock
```

> Observação de validação: o chart oficial expõe `service.type`, `service.edgeService.nodePort`, `extraEnvVars`, `volumes` e `volumeMounts`. Nesta versão removemos `service.edgeService.type`, porque esse campo não aparece nos valores publicados do chart.

## 2.3 Instalar/atualizar o release

```bash
helm upgrade --install localstack localstack/localstack \
  -n localstack \
  --create-namespace \
  -f values.yaml
```

## 2.4 Validar o pod

```bash
kubectl get pods -n localstack
kubectl logs -n localstack deploy/localstack --tail 100
```

## 2.5 Validar o socket dentro do pod

```bash
kubectl exec -n localstack deploy/localstack -- ls -l /var/run/docker.sock
```

Esperado:

```text
srw-rw---- ... /var/run/docker.sock
```

## 2.6 Validar endpoint

```bash
aws --endpoint-url=http://localhost:4566 sts get-caller-identity
```

Saída esperada: algum JSON de conta fake do LocalStack.

---

# Etapa 3 — Configuração local do AWS CLI

Exporte variáveis fake para simplificar o laboratório:

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
```

Opcional: criar alias:

```bash
alias awslocal='aws --endpoint-url=http://localhost:4566'
```

Teste:

```bash
awslocal s3 ls
awslocal dynamodb list-tables
awslocal lambda list-functions
```

---

# Etapa 4 — Criando o bucket S3 para o frontend

## 4.1 Criar bucket

```bash
awslocal s3 mb s3://sparringday-front-local
```

## 4.2 Configurar static website hosting

```bash
awslocal s3 website s3://sparringday-front-local \
  --index-document index.html \
  --error-document index.html
```

## 4.3 Política pública do bucket

Crie `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::sparringday-front-local/*"
    }
  ]
}
```

Aplicar:

```bash
awslocal s3api put-bucket-policy \
  --bucket sparringday-front-local \
  --policy file://bucket-policy.json
```

## 4.4 Upload inicial de arquivos estáticos de teste

```bash
mkdir -p www
cat > www/index.html <<'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sparring Day</title>
  </head>
  <body>
    <h1>Sparring Day local</h1>
    <p>Bucket S3 local funcionando.</p>
  </body>
</html>
EOF
```

```bash
awslocal s3 sync www/ s3://sparringday-front-local
```

## 4.5 URL esperada do site

```text
http://sparringday-front-local.s3-website.localhost.localstack.cloud:4566
```

## 4.6 Validar

Abrir no navegador ou testar:

```bash
curl http://sparringday-front-local.s3-website.localhost.localstack.cloud:4566
```

---

# Etapa 5 — Criando o DynamoDB

## 5.1 Criar tabela de atletas

```bash
awslocal dynamodb create-table \
  --table-name SparringDayAthletes \
  --attribute-definitions AttributeName=athleteId,AttributeType=S \
  --key-schema AttributeName=athleteId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

## 5.2 Inserir registros de teste

```bash
awslocal dynamodb put-item \
  --table-name SparringDayAthletes \
  --item '{
    "athleteId": {"S": "athlete-001"},
    "name": {"S": "Sameque Mendes"},
    "category": {"S": "75kg"},
    "city": {"S": "São Paulo"},
    "wins": {"N": "1"},
    "losses": {"N": "0"}
  }'
```

```bash
awslocal dynamodb put-item \
  --table-name SparringDayAthletes \
  --item '{
    "athleteId": {"S": "athlete-002"},
    "name": {"S": "Atleta Teste"},
    "category": {"S": "63kg"},
    "city": {"S": "Campinas"},
    "wins": {"N": "3"},
    "losses": {"N": "1"}
  }'
```

## 5.3 Validar tabela

```bash
awslocal dynamodb scan --table-name SparringDayAthletes
```

---

# Etapa 6 — Criando a Lambda

## 6.1 Código da função `lambda_function.py`

```python
import json
import os

import boto3

TABLE_NAME = os.environ.get("TABLE_NAME", "SparringDayAthletes")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

# Em LocalStack, a variável AWS_ENDPOINT_URL é disponibilizada dentro do runtime.
# Mantemos DYNAMODB_ENDPOINT apenas como fallback opcional.
endpoint_url = os.environ.get("AWS_ENDPOINT_URL") or os.environ.get("DYNAMODB_ENDPOINT")

dynamodb_kwargs = {
    "region_name": AWS_REGION,
}

if endpoint_url:
    dynamodb_kwargs["endpoint_url"] = endpoint_url

dynamodb = boto3.resource("dynamodb", **dynamodb_kwargs)
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    response = table.scan()

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS"
        },
        "body": json.dumps({
            "message": "Sparring Day API funcionando",
            "count": len(response.get("Items", [])),
            "athletes": response.get("Items", [])
        })
    }
```

## 6.2 Empacotar a função

```bash
rm -f function.zip
zip -r function.zip lambda_function.py
unzip -l function.zip
```

O arquivo deve aparecer na raiz do zip.

## 6.3 Criar role fake

```bash
awslocal iam create-role \
  --role-name lambda-sparringday-role \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
```

## 6.4 Criar a Lambda

```bash
awslocal lambda create-function \
  --function-name sparringday-get-athletes \
  --runtime python3.11 \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::000000000000:role/lambda-sparringday-role \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{TABLE_NAME=SparringDayAthletes,AWS_REGION=us-east-1}"
```

> Observação de validação: para código executando dentro de Lambda no LocalStack, a documentação recomenda usar o endpoint interno via `AWS_ENDPOINT_URL` quando necessário, em vez de assumir `localhost.localstack.cloud:4566` dentro do runtime.

## 6.5 Validar estado da Lambda

```bash
awslocal lambda get-function-configuration \
  --function-name sparringday-get-athletes \
  --query '{State:State,StateReason:StateReason,LastUpdateStatus:LastUpdateStatus}'
```

Esperado:

```json
{
  "State": "Active",
  "StateReason": null,
  "LastUpdateStatus": "Successful"
}
```

## 6.6 Invocar a Lambda diretamente

```bash
awslocal lambda invoke \
  --function-name sparringday-get-athletes \
  response.json

cat response.json
```

Resposta esperada:

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "..."
}
```

---

# Etapa 7 — Criando a API

## Observação importante

Para o laboratório inicial, você pode seguir por duas rotas:

1. **API Gateway REST (`apigateway`)**: mais próximo do padrão clássico AWS.
2. **API Gateway v2 (`apigatewayv2`)**: mais simples para laboratório HTTP.

Como o seu `startServices` já inclui `apigatewayv2`, vamos usar **HTTP API** para reduzir complexidade.

## 7.1 Criar API HTTP

```bash
API_ID=$(awslocal apigatewayv2 create-api \
  --name sparringday-http-api \
  --protocol-type HTTP \
  --query 'ApiId' \
  --output text)

echo $API_ID
```

## 7.2 Criar integração com a Lambda

```bash
INTEGRATION_ID=$(awslocal apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:000000000000:function:sparringday-get-athletes \
  --payload-format-version 2.0 \
  --query 'IntegrationId' \
  --output text)

echo $INTEGRATION_ID
```

## 7.3 Criar rota GET `/athletes`

```bash
awslocal apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key 'GET /athletes' \
  --target integrations/$INTEGRATION_ID
```

## 7.4 Criar stage

```bash
awslocal apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name local \
  --auto-deploy
```

## 7.5 Permissão para API invocar a Lambda

```bash
awslocal lambda add-permission \
  --function-name sparringday-get-athletes \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:000000000000:${API_ID}/*/*/athletes"
```

## 7.6 URL esperada

```text
http://<API_ID>.execute-api.localhost.localstack.cloud:4566/local/athletes
```

## 7.7 Testar

```bash
curl http://$API_ID.execute-api.localhost.localstack.cloud:4566/local/athletes
```

Se houver problema de DNS local, use o formato alternativo suportado pelo LocalStack:

```bash
curl http://localhost:4566/_aws/execute-api/$API_ID/local/athletes
```

Se a resposta falhar, consulte:

```bash
kubectl logs -n localstack deploy/localstack --tail 200
awslocal logs describe-log-groups
```

---

# Etapa 8 — Subindo o frontend real do Sparring Day

## 8.1 Rodar o frontend

Considerando a base React + Tailwind já criada no projeto:

```bash
cd frontend/sparringday-frontend
npm install
npm run dev
```

## 8.2 Criar uma página de teste da API

Exemplo de componente:

```jsx
import { useEffect, useState } from "react";

export default function ApiTestPage() {
  const [athletes, setAthletes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://SEU_API_ID.execute-api.localhost.localstack.cloud:4566/local/athletes")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao consultar API");
        return res.json();
      })
      .then((data) => {
        const parsed = data.athletes ? data : JSON.parse(data.body || "{}");
        setAthletes(parsed.athletes || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Teste da API - Sparring Day</h1>

      {error && (
        <div className="mb-4 rounded border border-red-500 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {athletes.map((athlete) => (
          <div key={athlete.athleteId} className="rounded-xl border border-zinc-700 p-4">
            <h2 className="text-xl font-semibold">{athlete.name}</h2>
            <p>Categoria: {athlete.category}</p>
            <p>Cidade: {athlete.city}</p>
            <p>Vitórias: {athlete.wins}</p>
            <p>Derrotas: {athlete.losses}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
```

## 8.3 Gerar build

```bash
npm run build
```

## 8.4 Fazer upload para o bucket

```bash
awslocal s3 sync dist/ s3://sparringday-front-local --delete
```

## 8.5 Validar no navegador

```text
http://sparringday-front-local.s3-website.localhost.localstack.cloud:4566
```

---

# Etapa 9 — Script de criação rápida dos recursos

## 9.1 `scripts/create-resources.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

awslocal() {
  aws --endpoint-url=http://localhost:4566 "$@"
}

awslocal sts get-caller-identity >/dev/null

echo "[1/8] Criando role da lambda"
awslocal iam create-role \
  --role-name lambda-sparringday-role \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null 2>&1 || true

echo "[2/8] Criando tabela DynamoDB"
awslocal dynamodb create-table \
  --table-name SparringDayAthletes \
  --attribute-definitions AttributeName=athleteId,AttributeType=S \
  --key-schema AttributeName=athleteId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST >/dev/null 2>&1 || true

echo "[3/8] Inserindo seed de atletas"
awslocal dynamodb put-item \
  --table-name SparringDayAthletes \
  --item '{"athleteId":{"S":"athlete-001"},"name":{"S":"Sameque Mendes"},"category":{"S":"75kg"},"city":{"S":"São Paulo"},"wins":{"N":"1"},"losses":{"N":"0"}}' >/dev/null

echo "[4/8] Criando bucket S3"
awslocal s3 mb s3://sparringday-front-local >/dev/null 2>&1 || true
awslocal s3 website s3://sparringday-front-local \
  --index-document index.html \
  --error-document index.html >/dev/null

echo "[5/8] Criando Lambda"
awslocal lambda create-function \
  --function-name sparringday-get-athletes \
  --runtime python3.11 \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::000000000000:role/lambda-sparringday-role \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables="{TABLE_NAME=SparringDayAthletes,AWS_REGION=us-east-1}" >/dev/null 2>&1 || true

echo "[6/8] Criando HTTP API"
API_ID=$(awslocal apigatewayv2 create-api \
  --name sparringday-http-api \
  --protocol-type HTTP \
  --query 'ApiId' \
  --output text)

INTEGRATION_ID=$(awslocal apigatewayv2 create-integration \
  --api-id "$API_ID" \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:000000000000:function:sparringday-get-athletes \
  --payload-format-version 2.0 \
  --query 'IntegrationId' \
  --output text)

echo "[7/8] Criando rota e stage"
awslocal apigatewayv2 create-route \
  --api-id "$API_ID" \
  --route-key 'GET /athletes' \
  --target integrations/"$INTEGRATION_ID" >/dev/null

awslocal apigatewayv2 create-stage \
  --api-id "$API_ID" \
  --stage-name local \
  --auto-deploy >/dev/null 2>&1 || true

echo "[8/8] Aplicando permissão da Lambda"
awslocal lambda add-permission \
  --function-name sparringday-get-athletes \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:000000000000:${API_ID}/*/*/athletes" >/dev/null 2>&1 || true

echo "Lab criado."
echo "API URL: http://${API_ID}.execute-api.localhost.localstack.cloud:4566/local/athletes"
```

---

# Etapa 10 — Terraform base do laboratório

## Objetivo

Transformar o laboratório manual em uma base Terraform modular, reutilizável e alinhada com o projeto.

A recomendação oficial do LocalStack é usar `tflocal`, que cria um override temporário para apontar os endpoints do provider AWS para `http://localhost:4566`.

## 10.1 Estrutura Terraform sugerida

```text
terraform/
├── provider.tf
├── variables.tf
├── outputs.tf
├── main.tf
├── terraform.tfvars
├── environments/
│   └── local/
│       └── terraform.tfvars
└── modules/
    ├── s3_static_site/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── dynamodb/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── lambda/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── api_gateway/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## 10.2 `provider.tf`

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = var.region
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3           = "http://s3.localhost.localstack.cloud:4566"
    s3control    = "http://localhost.localstack.cloud:4566"
    dynamodb     = "http://localhost:4566"
    lambda       = "http://localhost:4566"
    iam          = "http://localhost:4566"
    sts          = "http://localhost:4566"
    logs         = "http://localhost:4566"
    apigatewayv2 = "http://localhost:4566"
  }
}
```

> Observação de validação: o tutorial oficial de S3 com Terraform usa `s3.localhost.localstack.cloud:4566` para S3 e `localhost.localstack.cloud:4566` para `s3control`. Como este laboratório também pretende provisionar HTTP API com Terraform, incluímos `apigatewayv2` explicitamente no provider manual.

> Observação: quando usar `tflocal`, parte desse override pode ser gerado automaticamente.

## 10.3 `variables.tf`

```hcl
variable "region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "sparringday"
}

variable "frontend_bucket_name" {
  type    = string
  default = "sparringday-front-local"
}

variable "athletes_table_name" {
  type    = string
  default = "SparringDayAthletes"
}

variable "lambda_function_name" {
  type    = string
  default = "sparringday-get-athletes"
}
```

## 10.4 `main.tf`

```hcl
module "s3_static_site" {
  source      = "./modules/s3_static_site"
  bucket_name = var.frontend_bucket_name
}

module "dynamodb" {
  source     = "./modules/dynamodb"
  table_name = var.athletes_table_name
}

module "lambda" {
  source              = "./modules/lambda"
  function_name       = var.lambda_function_name
  dynamodb_table_name = module.dynamodb.table_name
}

module "api_gateway" {
  source               = "./modules/api_gateway"
  api_name             = "sparringday-http-api"
  lambda_function_name = module.lambda.function_name
  lambda_function_arn  = module.lambda.function_arn
}
```

## 10.5 `outputs.tf`

```hcl
output "frontend_bucket_name" {
  value = module.s3_static_site.bucket_name
}

output "frontend_website_url" {
  value = module.s3_static_site.website_url
}

output "athletes_table_name" {
  value = module.dynamodb.table_name
}

output "lambda_function_name" {
  value = module.lambda.function_name
}

output "api_endpoint" {
  value = module.api_gateway.api_endpoint
}
```

---

# Etapa 11 — Módulos iniciais recomendados

## 11.1 Módulo `s3_static_site`

Responsabilidades:

- criar bucket
- configurar website hosting
- aplicar política pública de leitura
- expor URL do site

## 11.2 Módulo `dynamodb`

Responsabilidades:

- criar tabela base de atletas
- definir chave primária
- expor nome da tabela

## 11.3 Módulo `lambda`

Responsabilidades:

- criar role fake/local
- empacotar ou referenciar zip
- definir variáveis de ambiente
- expor nome e ARN da função

## 11.4 Módulo `api_gateway`

Responsabilidades:

- criar HTTP API
- criar integração AWS_PROXY
- criar rota GET `/athletes`
- criar stage `local`
- expor endpoint final

---

# Etapa 12 — Sequência recomendada para geração dos módulos Terraform

## Fase A — Recurso isolado

Criar e validar separadamente:

1. bucket S3
2. tabela DynamoDB
3. Lambda
4. API Gateway

## Fase B — Consolidar em módulos

Transformar cada recurso em um módulo dedicado.

## Fase C — Composição local

Criar `main.tf` raiz chamando os módulos e validando com:

```bash
tflocal init
tflocal plan
tflocal apply
```

## Fase D — Seed e deploy do frontend

Após `apply`:

1. fazer upload do frontend via CLI ou script;
2. testar a página de API;
3. validar retorno da Lambda.

---

# Etapa 13 — Checklist de validação do laboratório

## Infra e LocalStack

- [ ] kind criado com `extraMounts` para `/var/run/docker.sock`
- [ ] LocalStack instalado via Helm
- [ ] NodePort `30066` acessível pela porta local `4566`
- [ ] `/var/run/docker.sock` visível no pod do LocalStack
- [ ] `awslocal sts get-caller-identity` funcionando

## S3

- [ ] bucket criado
- [ ] website hosting configurado
- [ ] política pública aplicada
- [ ] `index.html` acessível

## DynamoDB

- [ ] tabela criada
- [ ] itens de teste inseridos
- [ ] `scan` funcionando

## Lambda

- [ ] zip criado corretamente
- [ ] role fake criada
- [ ] Lambda em estado `Active`
- [ ] invocação direta funcionando

## API

- [ ] API criada
- [ ] integração criada
- [ ] rota `/athletes` criada
- [ ] endpoint respondendo via `curl`

## Frontend

- [ ] página local de teste criada
- [ ] build do frontend gerado
- [ ] build enviado ao bucket
- [ ] site acessível no endpoint S3
- [ ] página consome a API corretamente

## Terraform

- [ ] `tflocal init` funcionando
- [ ] `tflocal plan` funcionando
- [ ] `tflocal apply` funcionando
- [ ] outputs coerentes

---

# Etapa 14 — Troubleshooting

## Erro: `Docker not available`

Causa provável:

- o socket Docker não está montado no pod do LocalStack.

Validar:

```bash
docker exec -it localstack-lab-control-plane ls -l /var/run/docker.sock
kubectl exec -n localstack deploy/localstack -- ls -l /var/run/docker.sock
```

## Erro: Lambda em `State: Failed`

Validar:

```bash
awslocal lambda get-function-configuration --function-name sparringday-get-athletes
kubectl logs -n localstack deploy/localstack --tail 200
```

## Erro: ZIP inválido

Validar:

```bash
unzip -l function.zip
```

O arquivo `lambda_function.py` deve estar na raiz do zip.

## Erro: API não responde

Validar:

- se a Lambda responde direto;
- se a rota foi criada no API Gateway;
- se a permissão `lambda add-permission` foi aplicada;
- se o endpoint gerado usa `execute-api.localhost.localstack.cloud:4566`.

## Erro: frontend não carrega no S3 website

Validar:

- se o bucket possui `index.html`;
- se o bucket policy permite leitura pública;
- se a URL usada é a de website endpoint.

---

# Etapa 15 — Próximo passo recomendado

Depois deste laboratório validado, o próximo passo ideal é:

1. criar o **módulo Terraform `s3_static_site`**;
2. criar o **módulo `dynamodb`**;
3. criar o **módulo `lambda`**;
4. criar o **módulo `api_gateway`**;
5. criar um `main.tf` agregador para ambiente `local`;
6. adicionar scripts de seed e upload do frontend;
7. preparar a mesma lógica para depois evoluir para AWS real.

---

# Notas de validação aplicadas nesta versão

Os principais ajustes desta revisão foram:

1. **Helm chart mais fiel ao chart oficial**  
   O `values.yaml` foi ajustado para usar explicitamente `image.repository: localstack/localstack-pro` e para manter apenas campos publicados no chart para serviço, `extraEnvVars`, `volumes` e `volumeMounts`.

2. **Lambda preparada para runtime interno do LocalStack**  
   A função deixou de assumir `localhost.localstack.cloud:4566` dentro do runtime e passou a priorizar `AWS_ENDPOINT_URL`, que é o padrão mais seguro para execução interna.

3. **Provider Terraform mais completo para esse laboratório**  
   O bloco manual agora inclui `s3`, `s3control` e `apigatewayv2`, evitando lacunas quando o objetivo for evoluir o laboratório para módulos Terraform.

4. **Script de bootstrap realmente fim a fim**  
   O script rápido agora cria não só bucket, tabela e Lambda, mas também integração, rota, stage e permissão da HTTP API.

---

# Conclusão

Este laboratório estabelece a primeira base funcional do Sparring Day em ambiente local com LocalStack sobre Kubernetes:

- frontend estático servido no S3 local;
- dados em DynamoDB;
- consulta por Lambda;
- exposição via API Gateway;
- estrutura pronta para modularização via Terraform.

Com isso, você passa a ter uma trilha clara:

**validar manualmente -> modularizar em Terraform -> evoluir o projeto com segurança**.

---

# Fontes usadas na construção deste laboratório

- LocalStack Docs — Host a static website locally using S3 and Terraform
- LocalStack Docs — Terraform integration (`tflocal`)
- LocalStack Docs — Lambda service
- LocalStack Docs — Deploy with Helm
- LocalStack Docs — Kubernetes FAQ / troubleshooting