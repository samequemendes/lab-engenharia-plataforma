# SparringDay — Roadmap do Produto

## Fase 1 — Landing page e identidade visual

Status sugerido: **iniciado**

Objetivo: validar a marca e criar a primeira presença digital do produto.

Entregas:

- página inicial responsiva;
- identidade visual inicial;
- estrutura React + Vite + Tailwind;
- repositório frontend;
- README inicial;
- documentação do produto;
- dados mockados iniciais.

Melhorias:

- menu mobile funcional;
- separação da home em componentes;
- SEO básico;
- metatags sociais;
- favicon e assets próprios;
- deploy em homologação.

## Fase 2 — Portal público navegável

Objetivo: transformar a landing page em um portal real.

Páginas sugeridas:

```text
/                  -> Home
/lutas             -> Lista de lutas
/eventos           -> Lista de eventos
/eventos/:slug     -> Detalhe do evento
/rankings          -> Rankings
/atletas           -> Lista de atletas
/atletas/:slug     -> Perfil do atleta
/noticias          -> Notícias
/noticias/:slug    -> Detalhe da notícia
/sobre             -> Sobre o projeto
/contato           -> Contato
```

Entregas:

- React Router;
- páginas públicas;
- componentes reutilizáveis;
- dados mockados em arquivos separados;
- filtros básicos por modalidade, categoria e status;
- layout responsivo em todas as páginas.

## Fase 3 — Backend inicial

Objetivo: criar uma API para alimentar o portal.

Stack sugerida:

- API Gateway HTTP;
- AWS Lambda;
- DynamoDB;
- S3 para mídia;
- CloudFront;
- Terraform.

Funcionalidades:

- CRUD de atletas;
- CRUD de eventos;
- CRUD de lutas;
- CRUD de rankings;
- CRUD de notícias;
- endpoint de URL pré-assinada para upload.

## Fase 4 — Área administrativa

Objetivo: permitir gestão de conteúdo.

Funcionalidades:

- login administrativo;
- cadastro de atletas;
- cadastro de eventos;
- cadastro de lutas;
- atualização de resultados;
- gestão de rankings;
- publicação de notícias;
- upload de imagens.

Perfis sugeridos:

- admin geral;
- organizador de evento;
- academia;
- atleta.

## Fase 5 — Portal do atleta

Objetivo: dar identidade pública para cada atleta.

Funcionalidades:

- perfil público;
- foto;
- cartel;
- modalidade;
- categoria de peso;
- academia;
- cidade/estado;
- histórico de lutas;
- vídeos;
- redes sociais;
- status competitivo.

## Fase 6 — Eventos e cards de luta

Objetivo: profissionalizar a apresentação e gestão dos eventos.

Funcionalidades:

- página individual de evento;
- card principal;
- card preliminar;
- dados de pesagem;
- resultados;
- status da luta;
- local e data;
- mídia do evento;
- divulgação pública.

## Fase 7 — Ranking oficial

Objetivo: criar rankings úteis e confiáveis.

Critérios possíveis:

- vitórias;
- derrotas;
- empates;
- nocautes/finalizações;
- atividade recente;
- qualidade dos adversários;
- títulos;
- curadoria manual.

Dimensões:

- modalidade;
- gênero;
- peso;
- região;
- academia;
- idade/categoria.

## Fase 8 — Observabilidade e operação

Objetivo: preparar o produto para produção.

Itens:

- CloudWatch Logs;
- métricas de Lambda;
- métricas de API Gateway;
- alarmes de erro 4xx/5xx;
- alarmes de latência;
- monitoramento frontend;
- auditoria administrativa;
- backups e exportações.

## Fase 9 — CI/CD e IaC

Objetivo: automatizar o ciclo de entrega.

Pipelines:

- frontend;
- backend;
- infraestrutura;
- orquestradora.

Etapas frontend:

```text
install -> lint -> build -> deploy-s3 -> invalidate-cloudfront
```

Etapas infraestrutura:

```text
fmt -> init -> validate -> plan -> apply
```

## Fase 10 — Plataforma escalável

Objetivo: transformar o SparringDay em negócio/plataforma.

Possibilidades:

- venda de ingressos;
- inscrições de atletas;
- pagamentos;
- patrocinadores;
- marketplace;
- transmissão ao vivo;
- app mobile;
- ranking de academias;
- área premium para atletas;
- integração com YouTube e redes sociais.

## Backlog inicial

### Alta prioridade

- separar home em componentes;
- adicionar React Router;
- criar páginas públicas;
- criar dados mockados;
- configurar deploy estático;
- criar módulo Terraform de frontend.

### Média prioridade

- criar backend;
- criar DynamoDB;
- criar autenticação com Cognito;
- criar área administrativa;
- implementar upload de imagens.

### Baixa prioridade

- pagamentos;
- app mobile;
- marketplace;
- streaming;
- automações avançadas.
