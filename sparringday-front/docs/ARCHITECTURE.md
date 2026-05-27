# SparringDay — Arquitetura

## 1. Objetivo da arquitetura

A arquitetura do SparringDay deve permitir começar simples, com frontend estático, e evoluir para uma plataforma serverless com backend, autenticação, banco de dados, mídia e automação de deploy.

A estratégia recomendada é manter baixo custo inicial, fácil manutenção e boa escalabilidade.

## 2. Arquitetura inicial

Na primeira fase, o projeto é apenas frontend estático.

```text
Usuário
  ↓
Frontend React local ou hospedado
  ↓
Dados mockados no projeto
```

## 3. Arquitetura frontend em produção

Sugestão para hospedagem estática na AWS:

```text
Usuário
  ↓
Route 53
  ↓
CloudFront
  ↓
S3 Static Hosting
  ↓
React SPA
```

Componentes:

- Route 53 para DNS;
- ACM para certificado TLS;
- CloudFront como CDN;
- S3 para arquivos estáticos;
- React SPA como aplicação pública.

## 4. Arquitetura backend sugerida

```text
React Frontend
  ↓
API Gateway HTTP
  ↓
AWS Lambda
  ↓
DynamoDB
```

Componentes:

- API Gateway HTTP para exposição dos endpoints;
- Lambda para regras de negócio;
- DynamoDB para persistência NoSQL;
- IAM para permissões mínimas;
- CloudWatch para logs e métricas.

## 5. Arquitetura de autenticação

```text
Usuário/Admin
  ↓
React Frontend
  ↓
Amazon Cognito
  ↓
JWT Token
  ↓
API Gateway Authorizer
  ↓
Lambda protegida
```

Perfis sugeridos:

- admin;
- organizador;
- academia;
- atleta;
- usuário público.

## 6. Arquitetura de mídia

```text
Admin ou atleta
  ↓
Frontend solicita URL pré-assinada
  ↓
API Gateway + Lambda
  ↓
S3 Presigned URL
  ↓
Upload direto para S3
  ↓
CloudFront entrega a mídia
```

Tipos de mídia:

- fotos de atletas;
- pôsteres de eventos;
- imagens de notícias;
- thumbnails de vídeos;
- documentos ou releases no futuro.

## 7. Modelo de ambientes

```text
hml -> homologação
prd -> produção
```

Sugestão de domínios:

```text
hml.sparringday.com
api.hml.sparringday.com
sparringday.com
api.sparringday.com
```

## 8. Separação de responsabilidades

### Frontend

- renderização da UI;
- navegação pública;
- consumo da API;
- autenticação via Cognito;
- upload via URL pré-assinada;
- experiência do usuário.

### Backend

- regras de negócio;
- validação de dados;
- autorização;
- persistência;
- geração de URLs pré-assinadas;
- integração com serviços AWS.

### Infraestrutura

- provisionamento de recursos;
- DNS;
- certificados;
- buckets;
- CDN;
- API Gateway;
- Lambdas;
- tabelas DynamoDB;
- roles IAM;
- pipelines.

## 9. Serviços AWS sugeridos

- S3
- CloudFront
- Route 53
- ACM
- API Gateway
- Lambda
- DynamoDB
- Cognito
- IAM
- CloudWatch
- WAF, em fase mais avançada

## 10. Segurança arquitetural

Recomendações:

- HTTPS obrigatório;
- menor privilégio em IAM;
- CORS restrito;
- endpoints administrativos protegidos;
- Cognito para autenticação;
- headers de segurança no CloudFront;
- logs e auditoria;
- variáveis sensíveis fora do frontend.

## 11. Evolução futura

Possíveis evoluções:

- Backstage para scaffolding de novos serviços;
- pipeline orquestradora;
- GitOps;
- múltiplas contas AWS;
- WAF;
- logs do CloudFront consultados com Athena;
- dashboard de operação;
- integração com pagamentos;
- app mobile consumindo a mesma API.
