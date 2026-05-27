# SparringDay — API Design

## 1. Objetivo

Este documento descreve o desenho inicial da API do SparringDay. A API deverá alimentar o portal público, a área administrativa e futuras integrações com aplicativos ou serviços externos.

A primeira versão pode ser implementada com **API Gateway HTTP + AWS Lambda + DynamoDB**.

## 2. Convenções

### Base URL sugerida

```text
https://api.hml.sparringday.com
https://api.sparringday.com
```

### Formato de resposta

```json
{
  "data": {},
  "message": "Operação realizada com sucesso",
  "requestId": "uuid"
}
```

### Formato de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo obrigatório não informado",
    "details": []
  },
  "requestId": "uuid"
}
```

## 3. Entidades principais

## 3.1 Atleta

```json
{
  "id": "uuid",
  "name": "Marcos Silva",
  "slug": "marcos-silva",
  "nickname": "Punho de Aço",
  "gender": "masculino",
  "birthDate": "1995-04-10",
  "modality": "Boxe",
  "weightCategory": "Peso Médio",
  "team": "Academia Exemplo",
  "city": "São Paulo",
  "state": "SP",
  "wins": 12,
  "losses": 1,
  "draws": 0,
  "knockouts": 7,
  "profileImageUrl": "https://...",
  "instagram": "@atleta",
  "status": "active",
  "createdAt": "2026-05-24T10:00:00Z",
  "updatedAt": "2026-05-24T10:00:00Z"
}
```

## 3.2 Evento

```json
{
  "id": "uuid",
  "name": "SparringDay Fight Night 01",
  "slug": "sparringday-fight-night-01",
  "date": "2026-06-20",
  "time": "20:00",
  "venue": "Arena SparringDay",
  "city": "São Paulo",
  "state": "SP",
  "status": "scheduled",
  "posterUrl": "https://...",
  "createdAt": "2026-05-24T10:00:00Z",
  "updatedAt": "2026-05-24T10:00:00Z"
}
```

## 3.3 Luta

```json
{
  "id": "uuid",
  "eventId": "uuid",
  "fighterAId": "uuid",
  "fighterBId": "uuid",
  "modality": "Boxe",
  "weightCategory": "Peso Médio",
  "rounds": 3,
  "status": "scheduled",
  "result": {
    "winnerId": null,
    "method": null,
    "round": null,
    "time": null
  },
  "createdAt": "2026-05-24T10:00:00Z",
  "updatedAt": "2026-05-24T10:00:00Z"
}
```

## 3.4 Ranking

```json
{
  "id": "uuid",
  "modality": "Boxe",
  "gender": "masculino",
  "weightCategory": "Peso Médio",
  "positions": [
    {
      "position": 1,
      "fighterId": "uuid",
      "points": 120
    }
  ],
  "updatedAt": "2026-05-24T10:00:00Z"
}
```

## 3.5 Notícia

```json
{
  "id": "uuid",
  "title": "SparringDay anuncia novo evento",
  "slug": "sparringday-anuncia-novo-evento",
  "summary": "Resumo da notícia",
  "content": "Conteúdo completo",
  "coverImageUrl": "https://...",
  "author": "Equipe SparringDay",
  "publishedAt": "2026-05-24T10:00:00Z",
  "status": "published"
}
```

## 4. Endpoints públicos

### Atletas

```text
GET /athletes
GET /athletes/{id}
GET /athletes/slug/{slug}
```

### Eventos

```text
GET /events
GET /events/{id}
GET /events/slug/{slug}
```

### Lutas

```text
GET /fights
GET /fights/{id}
```

### Rankings

```text
GET /rankings
GET /rankings/{id}
```

### Notícias

```text
GET /news
GET /news/{slug}
```

## 5. Endpoints administrativos

Devem ser protegidos por autenticação.

### Atletas

```text
POST   /athletes
PUT    /athletes/{id}
DELETE /athletes/{id}
```

### Eventos

```text
POST   /events
PUT    /events/{id}
DELETE /events/{id}
```

### Lutas

```text
POST   /fights
PUT    /fights/{id}
DELETE /fights/{id}
```

### Rankings

```text
POST /rankings
PUT  /rankings/{id}
```

### Notícias

```text
POST   /news
PUT    /news/{id}
DELETE /news/{id}
```

### Uploads

```text
POST /uploads/presigned-url
```

## 6. Filtros sugeridos

### Atletas

```text
GET /athletes?modality=Boxe&gender=masculino&weightCategory=Peso Médio&state=SP
```

### Eventos

```text
GET /events?status=scheduled&state=SP
```

### Lutas

```text
GET /fights?eventId=uuid&status=scheduled&modality=Boxe
```

### Rankings

```text
GET /rankings?modality=Boxe&gender=masculino&weightCategory=Peso Médio
```

## 7. Autenticação e autorização

Endpoints públicos não precisam de autenticação.

Endpoints administrativos devem exigir JWT emitido pelo Amazon Cognito.

Papéis sugeridos:

```text
admin
organizer
academy
athlete
```

## 8. Estratégia DynamoDB inicial

Opção simples para MVP:

- `sparringday-athletes-hml`
- `sparringday-events-hml`
- `sparringday-fights-hml`
- `sparringday-rankings-hml`
- `sparringday-news-hml`

Para produção, trocar sufixo `hml` por `prd`.

## 9. Próximos passos da API

1. Definir se será um Lambda por domínio ou um Lambda por endpoint.
2. Criar schema de validação dos payloads.
3. Criar contrato de erros.
4. Criar tabelas DynamoDB.
5. Criar endpoints públicos primeiro.
6. Depois proteger endpoints administrativos com Cognito.
