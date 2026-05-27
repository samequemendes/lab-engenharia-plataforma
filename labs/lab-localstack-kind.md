# Lab: LocalStack com Helm + Kind

Este laboratório sobe um ambiente AWS local usando **LocalStack dentro de um cluster Kubernetes local com Kind**, instalado via **Helm Chart**. A ideia é simular serviços AWS sem consumir recursos reais da AWS e usar o ambiente como base para labs com Terraform, AWS CLI, Lambda, S3, SQS, DynamoDB, EC2 fake e outros serviços suportados pelo LocalStack.

> Este lab também resolve o problema clássico do Terraform tentando acessar `http://localhost:4566/` sem o LocalStack estar exposto corretamente, gerando erro de `connection refused`.

---

## Objetivo

Ao final deste lab, você terá:

- Um cluster Kubernetes local criado com Kind.
- O LocalStack instalado no cluster via Helm.
- A porta `4566` exposta localmente via `kubectl port-forward`.
- O AWS CLI apontando para o LocalStack.
- Um teste funcional criando e listando recursos fake da AWS.
- Uma base pronta para rodar Terraform contra o endpoint local.

---

## Arquitetura do lab

```text
Máquina local
├── Docker
│   └── Kind cluster
│       └── Kubernetes
│           └── Namespace: localstack
│               └── LocalStack instalado via Helm
│                   └── Service localstack:4566
│
├── kubectl port-forward
│   └── localhost:4566 -> service/localstack:4566
│
├── AWS CLI
│   └── --endpoint-url=http://localhost:4566
│
└── Terraform
    └── provider AWS apontando para LocalStack
```

---

## Pré-requisitos

Instale as ferramentas abaixo antes de iniciar:

- Docker
- Kind
- kubectl
- Helm
- AWS CLI
- Terraform, caso vá usar o lab com IaC

Valide as instalações:

```bash
docker --version
kind --version
kubectl version --client
helm version
aws --version
terraform version
```

---

## 1. Criar o cluster Kind

Crie um arquivo chamado `kind-config.yaml`:

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
```

Crie o cluster:

```bash
kind create cluster --config kind-config.yaml
```

Valide:

```bash
kubectl cluster-info --context kind-localstack-lab
kubectl get nodes
```

---

## 2. Criar o namespace

```bash
kubectl create namespace localstack
```

Valide:

```bash
kubectl get ns
```

---

## 3. Adicionar o repositório Helm do LocalStack

```bash
helm repo add localstack https://localstack.github.io/helm-charts
helm repo update
```

Valide se o chart aparece:

```bash
helm search repo localstack
```

---

## 4. Criar o arquivo de valores do Helm

Crie um arquivo chamado `values-localstack.yaml`:

```yaml
image:
  tag: latest

service:
  type: NodePort
  edgeService:
    name: edge
    targetPort: 4566
    nodePort: 30066

startServices: "s3,sqs,dynamodb,lambda,iam,sts,cloudwatch,logs,ec2"

enableStartupScripts: false

extraEnvVars:
  - name: DEBUG
    value: "1"
  - name: AWS_DEFAULT_REGION
    value: "us-east-1"
```

> Observação: este lab usa `NodePort` para permitir acesso via `localhost:4566` através do mapeamento criado no Kind. Alternativamente, você pode usar `ClusterIP` e acessar com `kubectl port-forward`.

---

## 5. Instalar o LocalStack com Helm

```bash
helm upgrade --install localstack localstack/localstack \
  --namespace localstack \
  --values values-localstack.yaml
```

Acompanhe os pods:

```bash
kubectl get pods -n localstack -w
```

Valide os recursos criados:

```bash
kubectl get all -n localstack
helm list -n localstack
```

---

## 6. Validar acesso ao LocalStack

Teste o endpoint principal:

```bash
curl http://localhost:4566/_localstack/health
```

Saída esperada: um JSON com o status dos serviços do LocalStack.

Caso o acesso via NodePort não funcione, use port-forward:

```bash
kubectl port-forward -n localstack service/localstack 4566:4566
```

Em outro terminal:

```bash
curl http://localhost:4566/_localstack/health
```

---

## 7. Configurar credenciais fake da AWS

O LocalStack não precisa de credenciais reais da AWS, mas o AWS CLI e o Terraform esperam valores configurados.

```bash
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
```

Também é possível criar um profile específico:

```bash
aws configure --profile localstack
```

Use os valores:

```text
AWS Access Key ID: test
AWS Secret Access Key: test
Default region name: us-east-1
Default output format: json
```

---

## 8. Testar com AWS CLI

Criar um bucket S3 fake:

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://meu-bucket-local
```

Listar buckets:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

Criar uma fila SQS fake:

```bash
aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name minha-fila-local
```

Listar filas:

```bash
aws --endpoint-url=http://localhost:4566 sqs list-queues
```

Testar STS:

```bash
aws --endpoint-url=http://localhost:4566 sts get-caller-identity
```

---

## 9. Exemplo de provider Terraform para LocalStack

Crie um arquivo `provider.tf`:

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3         = "http://localhost:4566"
    sqs        = "http://localhost:4566"
    dynamodb   = "http://localhost:4566"
    lambda     = "http://localhost:4566"
    iam        = "http://localhost:4566"
    sts        = "http://localhost:4566"
    cloudwatch = "http://localhost:4566"
    logs       = "http://localhost:4566"
    ec2        = "http://localhost:4566"
  }
}
```

Exemplo simples de recurso S3 em `main.tf`:

```hcl
resource "aws_s3_bucket" "lab" {
  bucket = "bucket-localstack-kind-lab"
}
```

Execute:

```bash
terraform init
terraform plan
terraform apply -auto-approve
```

Valide:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

---

## 10. Troubleshooting

### Erro: `dial tcp 127.0.0.1:4566: connect: connection refused`

Esse erro significa que o Terraform ou AWS CLI tentou acessar `localhost:4566`, mas o LocalStack não estava acessível nessa porta.

Verifique:

```bash
kubectl get pods -n localstack
kubectl get svc -n localstack
curl http://localhost:4566/_localstack/health
```

Se necessário, rode:

```bash
kubectl port-forward -n localstack service/localstack 4566:4566
```

Depois rode novamente:

```bash
terraform plan
```

---

### Erro: pod do LocalStack não sobe

Verifique os eventos e logs:

```bash
kubectl describe pod -n localstack -l app.kubernetes.io/name=localstack
kubectl logs -n localstack -l app.kubernetes.io/name=localstack
```

---

### Erro: AWS CLI tenta acessar AWS real

Garanta que você está usando `--endpoint-url`:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

Ou revise o provider Terraform para confirmar que os endpoints estão apontando para o LocalStack.

---

### Erro com EC2 AMI no Terraform

Em LocalStack, algumas buscas de AMI podem não se comportar como na AWS real. Se o lab anterior usava:

```hcl
data "aws_ami" "linux" {
  most_recent = true
  owners      = ["amazon"]
}
```

E falhou durante o `DescribeImages`, primeiro confirme que o LocalStack está acessível. Depois, para labs locais, prefira simplificar o exemplo e evitar dependência de AMI real, ou cadastre/mocke os dados necessários para o teste.

---

## 11. Comandos úteis

Listar pods:

```bash
kubectl get pods -n localstack
```

Listar services:

```bash
kubectl get svc -n localstack
```

Ver logs:

```bash
kubectl logs -n localstack -l app.kubernetes.io/name=localstack -f
```

Atualizar release Helm:

```bash
helm upgrade localstack localstack/localstack \
  --namespace localstack \
  --values values-localstack.yaml
```

Remover LocalStack:

```bash
helm uninstall localstack -n localstack
kubectl delete namespace localstack
```

Remover cluster Kind:

```bash
kind delete cluster --name localstack-lab
```

---

## 12. Estrutura sugerida do repositório

```text
localstack-kind-helm-lab/
├── README.md
├── kind-config.yaml
├── values-localstack.yaml
└── terraform/
    ├── provider.tf
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

---

## 13. Fluxo resumido

```bash
kind create cluster --config kind-config.yaml
kubectl create namespace localstack
helm repo add localstack https://localstack.github.io/helm-charts
helm repo update
helm upgrade --install localstack localstack/localstack \
  --namespace localstack \
  --values values-localstack.yaml
curl http://localhost:4566/_localstack/health
aws --endpoint-url=http://localhost:4566 s3 mb s3://meu-bucket-local
terraform init
terraform apply -auto-approve
```

---

## Conclusão

Este lab entrega uma base local para testar recursos AWS usando LocalStack dentro de Kubernetes. O uso de Kind aproxima o ambiente de um cenário real de cluster, enquanto o Helm permite instalar, versionar e atualizar o LocalStack de forma mais padronizada.

Esse modelo é uma boa base para evoluir para:

- labs com Terraform;
- pipelines CI/CD;
- Backstage scaffolding;
- testes automatizados de infraestrutura;
- simulação de serviços AWS em ambiente local;
- padronização de ambientes de desenvolvimento para times de plataforma.

## Criação do cluster Kind

```bash
kind create cluster --name kind-2 --image kindest/node:v1.34.0 --wait 5m
```