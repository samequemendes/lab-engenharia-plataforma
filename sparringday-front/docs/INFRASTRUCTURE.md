# SparringDay — Infraestrutura e Deploy

## 1. Objetivo

Este documento define a direção inicial para infraestrutura do SparringDay, considerando evolução parecida com o projeto Its On Fight: frontend estático, backend serverless, Terraform, ambientes separados e CI/CD.

## 2. Estratégia geral

A infraestrutura deve começar simples e barata, mas preparada para crescer.

Direção recomendada:

- frontend em S3 + CloudFront;
- DNS no Route 53;
- certificado TLS no ACM;
- backend com API Gateway + Lambda;
- banco com DynamoDB;
- autenticação com Cognito;
- mídia em S3;
- Terraform para IaC;
- Azure DevOps para CI/CD.

## 3. Ambientes

Ambientes sugeridos:

```text
hml -> homologação
prd -> produção
```

Domínios sugeridos:

```text
hml.sparringday.com
api.hml.sparringday.com
sparringday.com
api.sparringday.com
```

## 4. Arquitetura frontend

```text
Usuário
  ↓
Route 53
  ↓
CloudFront
  ↓
S3 Bucket
  ↓
React Build
```

Recursos:

- bucket S3 privado;
- CloudFront com Origin Access Control;
- certificado ACM em `us-east-1`;
- registro DNS no Route 53;
- invalidation após deploy.

## 5. Arquitetura backend

```text
Frontend
  ↓
API Gateway HTTP
  ↓
Lambda
  ↓
DynamoDB
```

Recursos:

- API Gateway HTTP;
- Lambda por domínio ou função;
- DynamoDB por entidade;
- IAM roles com menor privilégio;
- CloudWatch Logs.

## 6. Módulos Terraform sugeridos

```text
modules/
├── frontend
├── api-gateway
├── lambda
├── dynamodb
├── cognito
├── s3-media
├── cloudfront
├── route53
├── acm
└── iam
```

## 7. Estrutura de infraestrutura sugerida

```text
infra-sparringday/
├── backend.tf
├── provider.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── locals.tf
├── environments/
│   ├── hml.tfvars
│   └── prd.tfvars
└── modules/
    ├── frontend/
    ├── api-gateway/
    ├── lambda/
    ├── dynamodb/
    ├── cognito/
    └── s3-media/
```

## 8. Backend remoto Terraform

Sugestão:

```text
S3 bucket para tfstate
DynamoDB para lock
```

Exemplo conceitual:

```hcl
terraform {
  backend "s3" {
    bucket         = "sparringday-terraform-states"
    key            = "hml/frontend/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "sparringday-terraform-locks"
    encrypt        = true
  }
}
```

## 9. Pipeline frontend

Responsável por build e deploy da aplicação React.

Etapas:

```text
install -> lint -> build -> sync-s3 -> invalidate-cloudfront
```

Variáveis necessárias:

```text
AWS_REGION
S3_BUCKET_NAME
CLOUDFRONT_DISTRIBUTION_ID
VITE_API_BASE_URL
VITE_APP_ENV
```

## 10. Pipeline infraestrutura

Responsável por provisionar recursos AWS.

Etapas:

```text
terraform fmt
terraform init
terraform validate
terraform plan
terraform apply
```

Boas práticas:

- `apply` manual em produção;
- plano salvo como artefato;
- variáveis por ambiente;
- nenhuma credencial hardcoded;
- uso de service connection ou role federada.

## 11. Pipeline backend

Responsável por empacotar e publicar Lambdas.

Etapas sugeridas:

```text
install -> test -> package -> publish-artifact -> deploy
```

## 12. Pipeline orquestradora

No futuro, uma pipeline orquestradora pode coordenar:

- infraestrutura;
- frontend;
- backend;
- invalidação de cache;
- promoção entre ambientes.

Fluxo sugerido:

```text
branch staging -> deploy hml
branch main    -> deploy prd
```

## 13. Segurança

Recomendações:

- bucket S3 privado;
- CloudFront com OAC;
- HTTPS obrigatório;
- headers de segurança;
- CORS restrito;
- IAM com menor privilégio;
- endpoints administrativos protegidos por Cognito;
- logs habilitados;
- secrets fora do repositório.

Headers recomendados:

```text
Strict-Transport-Security
Content-Security-Policy
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
```

## 14. Observabilidade

Frontend:

- monitoramento de erros JavaScript;
- métricas de performance;
- logs de deploy;
- integração futura com Sentry ou CloudWatch RUM.

Backend:

- CloudWatch Logs;
- métricas Lambda;
- métricas API Gateway;
- alarmes de erro;
- alarmes de latência;
- auditoria administrativa.

## 15. Tags recomendadas

```text
Project     = SparringDay
Environment = hml/prd
Owner       = sameque
ManagedBy   = terraform
CostCenter  = personal/project
Application = sparringday
```

## 16. Próximos passos de infraestrutura

1. Criar repositório `infra-sparringday`.
2. Criar backend remoto Terraform.
3. Criar módulo de frontend.
4. Provisionar S3 + CloudFront + Route 53.
5. Criar pipeline frontend.
6. Publicar HML.
7. Depois criar API Gateway + Lambda + DynamoDB.
