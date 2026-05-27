# SparringDay — Guia do Frontend

## 1. Stack

O frontend do SparringDay utiliza:

- React;
- Vite;
- Tailwind CSS;
- Lucide React;
- JavaScript.

A stack foi escolhida por ser leve, rápida e adequada para deploy estático em S3 + CloudFront ou outras plataformas.

## 2. Princípios de interface

- mobile-first;
- componentes reutilizáveis;
- acessibilidade desde o início;
- layout limpo e responsivo;
- visual dark com destaque vermelho;
- separação entre dados, componentes e páginas;
- evitar lógica pesada dentro de componentes visuais.

## 3. Estrutura atual

```text
src/
├── components/
│   └── RankingCard.jsx
├── data/
│   └── homeData.js
├── App.jsx
├── index.css
└── main.jsx
```

## 4. Estrutura recomendada para evolução

```text
src/
├── assets/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── PageContainer.jsx
│   ├── home/
│   │   ├── HeroSection.jsx
│   │   ├── NextFightCard.jsx
│   │   ├── RankingPreview.jsx
│   │   ├── HighlightsSection.jsx
│   │   └── NewsPreview.jsx
│   ├── athletes/
│   │   ├── AthleteCard.jsx
│   │   └── AthleteProfile.jsx
│   ├── events/
│   │   ├── EventCard.jsx
│   │   └── FightCard.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Badge.jsx
│       └── SectionTitle.jsx
├── data/
├── pages/
├── routes/
├── services/
├── hooks/
├── utils/
├── App.jsx
├── index.css
└── main.jsx
```

## 5. Páginas sugeridas

```text
pages/
├── Home.jsx
├── Fights.jsx
├── Events.jsx
├── EventDetails.jsx
├── Rankings.jsx
├── Athletes.jsx
├── AthleteDetails.jsx
├── News.jsx
├── NewsDetails.jsx
├── About.jsx
├── Contact.jsx
└── AdminDashboard.jsx
```

## 6. Rotas sugeridas

```text
/                  -> Home
/lutas             -> Lutas
/eventos           -> Eventos
/eventos/:slug     -> Detalhe do evento
/rankings          -> Rankings
/atletas           -> Atletas
/atletas/:slug     -> Detalhe do atleta
/noticias          -> Notícias
/noticias/:slug    -> Detalhe da notícia
/sobre             -> Sobre
/contato           -> Contato
/admin             -> Área administrativa
```

## 7. Serviços de API

Quando o backend existir, criar uma camada de serviços:

```text
services/
├── apiClient.js
├── athletesService.js
├── eventsService.js
├── fightsService.js
├── rankingsService.js
└── newsService.js
```

Exemplo de `apiClient.js`:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error("Erro ao consultar API");
  }

  return response.json();
}
```

## 8. Variáveis de ambiente

Criar arquivos conforme ambiente:

```text
.env.local
.env.hml
.env.prd
```

Variáveis sugeridas:

```env
VITE_APP_NAME=SparringDay
VITE_APP_ENV=hml
VITE_API_BASE_URL=https://api.hml.sparringday.com
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_DOMAIN=
```

## 9. Padrão de componentes

Cada componente deve:

- ter nome claro;
- receber dados por props;
- evitar dependência direta de dados mockados;
- manter responsabilidade única;
- usar HTML semântico;
- ter foco visível em elementos interativos.

Exemplo:

```jsx
export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-3 text-zinc-400">{description}</p>}
    </div>
  );
}
```

## 10. Tailwind CSS

Diretrizes:

- usar classes utilitárias diretamente para componentes simples;
- extrair componentes quando houver repetição;
- evitar valores arbitrários sem necessidade;
- manter padrão de espaçamento;
- usar `max-w-7xl`, `mx-auto`, `px-5` e `lg:px-8` para containers;
- manter contraste adequado;
- seguir mobile-first.

## 11. Acessibilidade

Boas práticas:

- usar `header`, `main`, `section`, `article`, `footer`;
- manter ordem correta de headings;
- botões com `aria-label` quando necessário;
- links e botões com `focus-visible`;
- contraste suficiente;
- não depender apenas de cor para transmitir informação.

## 12. Próximas tarefas técnicas

1. Separar `App.jsx` em componentes da home.
2. Adicionar React Router.
3. Criar páginas públicas.
4. Criar dados mockados por domínio.
5. Criar camada de serviços.
6. Configurar ESLint/Prettier.
7. Adicionar testes básicos futuramente.
8. Preparar build para deploy estático.
