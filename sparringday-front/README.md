# SparringDay Frontend

O **SparringDay** é um portal digital para esportes de combate, criado para centralizar informações sobre lutas, atletas, rankings, eventos, notícias e futuramente gestão administrativa.

Esta primeira versão é uma landing page moderna construída com **React + Vite + Tailwind CSS**, preparada para evoluir no mesmo modelo do projeto **Its On Fight**: frontend estático, arquitetura cloud-native, backend serverless, infraestrutura como código e CI/CD.

## Objetivo

Criar uma base de produto profissional para validar a marca SparringDay e evoluir gradualmente para uma plataforma completa de eventos de luta.

O produto deve permitir, no futuro:

- divulgação de eventos e cards de luta;
- perfil público de atletas;
- rankings por categoria, modalidade, gênero e região;
- notícias e conteúdos sobre esportes de combate;
- área administrativa para gestão de atletas, lutas e eventos;
- autenticação com perfis de acesso;
- integração com backend serverless na AWS;
- deploy automatizado por pipeline.

## Stack inicial

- React
- Vite
- Tailwind CSS
- Lucide React
- JavaScript

## Estrutura do repositório

```text
sparringday-frontend/
├── public/
├── src/
│   ├── components/
│   │   └── RankingCard.jsx
│   ├── data/
│   │   └── homeData.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   ├── API_DESIGN.md
│   ├── FRONTEND_GUIDE.md
│   └── INFRASTRUCTURE.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## Como rodar localmente

### Pré-requisitos

- Node.js LTS
- npm
- Git

### Instalar dependências

```bash
npm install
```

### Executar ambiente local

```bash
npm run dev
```

### Gerar build de produção

```bash
npm run build
```

### Visualizar build localmente

```bash
npm run preview
```

## Scripts disponíveis

```bash
npm run dev      # inicia o servidor local
npm run build    # gera build de produção
npm run preview  # executa preview do build
```

## Documentação do projeto

A documentação principal está organizada em arquivos dentro da pasta `docs/`:

- [Visão geral do projeto](docs/PROJECT_OVERVIEW.md)
- [Roadmap do produto](docs/ROADMAP.md)
- [Arquitetura sugerida](docs/ARCHITECTURE.md)
- [Design inicial da API](docs/API_DESIGN.md)
- [Guia do frontend](docs/FRONTEND_GUIDE.md)
- [Infraestrutura e deploy](docs/INFRASTRUCTURE.md)

## Fases do projeto

1. Landing page e identidade visual.
2. Páginas públicas: lutas, eventos, rankings, atletas e notícias.
3. Backend serverless com API Gateway, Lambda e DynamoDB.
4. Área administrativa com autenticação.
5. Portal do atleta.
6. Gestão de eventos e cards de luta.
7. Ranking oficial por categoria.
8. Observabilidade, segurança e operação.
9. CI/CD e infraestrutura como código.
10. Evolução para plataforma escalável.

## Estratégia de ambientes

Sugestão inicial:

```text
hml -> homologação
prd -> produção
```

Sugestão futura de domínios:

```text
hml.sparringday.com
api.hml.sparringday.com
sparringday.com
api.sparringday.com
```

## Direção técnica

A direção técnica recomendada para evolução do produto é:

- frontend hospedado em S3 + CloudFront;
- backend com API Gateway + Lambda;
- banco NoSQL com DynamoDB;
- autenticação com Amazon Cognito;
- mídia em S3 com CloudFront;
- infraestrutura com Terraform;
- pipelines no Azure DevOps;
- ambientes separados por branch e variáveis.

## Próximos passos

- Separar a home em componentes menores.
- Adicionar React Router.
- Criar páginas públicas iniciais.
- Criar dados mockados para atletas, eventos, lutas e notícias.
- Criar pipeline de build e deploy.
- Criar módulo Terraform para frontend.
- Publicar ambiente de homologação.

## Status atual

Status: **MVP frontend inicial**.

A home já existe como primeira entrega visual do produto. O próximo passo é evoluir a base para um portal navegável e preparar deploy automatizado.
