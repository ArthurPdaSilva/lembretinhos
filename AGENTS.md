# Lembretinhos — Contexto do Projeto

## Visão Geral

App React Native (Expo) muito simples para criar lembretes a partir de um dia específico. A partir do dia escolhido, o app envia uma notificação local **de hora em hora, das 08:00 às 22:00**, todos os dias, até o usuário marcar o lembrete como concluído. Funciona 100% offline, com dados locais em SQLite. UI em português brasileiro. **Somente Android** nesta etapa; iOS não é suportado.

## Funcionalidades

- **Lista de lembretinhos**: separa pendentes e concluídos, mostra o texto e a data e indica **"Atrasado"** quando o dia já passou e o lembrete segue pendente. Tem um checkbox para concluir e um botão "+" para criar
- **Criar lembretinho**: texto ("o que lembrar") e data. **Não existe edição**: para corrigir, o usuário exclui e cria de novo
- **Excluir lembretinho**: com diálogo de confirmação, cancelando as notificações pendentes dele
- **Concluir**: pela lista ou pelo botão "Concluído" da própria notificação. Cancela todas as notificações restantes do lembrete
- **Reabrir**: desmarcar o checkbox de um concluído volta a agendar as notificações

## Estrutura

```
src/
  components/    # Componentes compartilhados de UI
  database/      # SQLite, migrations e repositories (lembretinhos.db)
  features/
    reminders/   # Telas, store, schemas e serviço de notificações
  routes/        # Navegação
  styles/        # Design tokens
  utils/         # Utilitários globais (datas, formatação)
  types.ts       # Tipos e constantes de negócio
  __tests__/     # Testes espelhando a source
App.tsx          # Raiz do app
assets/          # Ícones, adaptive icon, splash e ícone de notificação
```

## Convenções de Código

- **Named exports exclusivamente** — sem `export default` (exceto onde o Expo exigir)
- **PascalCase**: componentes, screens, stores, arquivos de rota
- **camelCase**: utilitários, schemas, variáveis, funções
- **SCREAMING_SNAKE_CASE**: constantes imutáveis compartilhadas e chaves de configuração
- **Alias `@/`** mapeando `src/` (`import { X } from "@/components/X"`)
- **Indentação**: tab · **Aspas**: duplas (Biome)
- **Idioma**: português brasileiro em toda UI, mensagens de validação e placeholders
- **Nomes de variáveis, funções e parâmetros em inglês** — português apenas em strings de UI
- **Props interface**: `ComponentNameProps`

## Padrões Específicos

### Estado (Zustand)
- `useReminderStore` em memória, hidratado e sincronizado pelo repository do SQLite
- Reset em testes: `useReminderStore.setState({ ... })` no `beforeEach`

### Banco Local (SQLite)
- `SQLiteProvider` na raiz, banco `lembretinhos.db`
- Migrations versionadas por `PRAGMA user_version` em `src/database/migrations/`
- Telas e stores não executam SQL diretamente; repositories ficam em `src/database/repositories/`
- Alterações de schema só por migrations testadas, sem apagar dados existentes

Schema inicial (migration 001):

```sql
CREATE TABLE reminders (
  id            TEXT PRIMARY KEY,         -- UUID
  title         TEXT NOT NULL,
  date          TEXT NOT NULL,            -- AAAA-MM-DD (primeiro dia de aviso)
  completed     INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  completed_at  TEXT,
  created_at    TEXT NOT NULL
);

CREATE TABLE reminder_notifications (
  reminder_id      TEXT NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  notification_id  TEXT NOT NULL,         -- id retornado pelo expo-notifications
  fire_at          TEXT NOT NULL,
  PRIMARY KEY (reminder_id, notification_id)
);
```

### Notificações (`features/reminders/services/notifications.ts`)
- Notificações **locais** com `expo-notifications`; nada de push ou servidor
- Horários: de hora em hora entre **08:00 e 22:00** (`NOTIFICATION_START_HOUR = 8`, `NOTIFICATION_END_HOUR = 22`), ou seja, 15 avisos por dia
- Os avisos começam na data do lembrete e **continuam nos dias seguintes** até ele ser concluído ou excluído
- Se o lembrete for criado para hoje, a primeira notificação sai na próxima hora cheia dentro da janela
- **Limite de agendamentos**: o Android limita a quantidade de alarmes por app (cerca de 500, e alguns fabricantes limitam menos). Por isso não se agenda "para sempre":
  - Existe um orçamento global `MAX_SCHEDULED_NOTIFICATIONS = 200` (cerca de 13 dias para um lembrete sozinho)
  - Um **agendador em janela deslizante** preenche o orçamento com os próximos horários de todos os lembretes pendentes, do mais cedo para o mais tarde, de forma intercalada entre os lembretes
  - O agendador roda ao abrir o app, ao voltar para o primeiro plano, ao criar, concluir, reabrir ou excluir, ao receber ou tocar numa notificação e numa tarefa periódica com `expo-background-task` (melhor esforço; o sistema decide quando roda)
  - Se o usuário passar muitos dias sem abrir o app, os avisos podem acabar até a próxima abertura. Isso é uma limitação conhecida e documentada no README
- O agendamento é **idempotente**: ele compara o que deveria estar agendado com o que está em `reminder_notifications` e só cancela o que sobra e agenda o que falta
- Concluir ou excluir cancela os agendamentos do lembrete antes de qualquer outra coisa
- Categoria de notificação com a ação **"Concluído"**, que marca o lembrete sem abrir o app
- A permissão de notificação (`POST_NOTIFICATIONS`, Android 13+) é pedida na primeira criação de lembrete; se for negada, mostrar um toast `info` explicando
- Canal próprio (`reminders`) com importância alta
- Sem permissão de alarme exato, o Android pode atrasar os avisos alguns minutos (modo Doze). Isso é aceitável: não pedir `SCHEDULE_EXACT_ALARM` nem `USE_EXACT_ALARM` nesta etapa
- Os agendamentos precisam sobreviver à reinicialização do aparelho (`RECEIVE_BOOT_COMPLETED`, tratado pelo `expo-notifications`); o agendador também roda na abertura do app como garantia
- Notificações agendadas e ações exigem *development build*; não confiar no Expo Go
- A lógica de "quais horários agendar" é uma função pura (`agora`, lembretes pendentes e orçamento entram; a lista de horários sai), separada das chamadas ao `expo-notifications`

### Formulários
- React Hook Form + Zod + `@hookform/resolvers`
- Schema em `features/reminders/schemas/reminderSchema.ts`
- Texto obrigatório (1–200 caracteres); a data não pode ser anterior a hoje
- Controller + FormInput para integração

### Identidade Visual

Paleta **Post-it**: amarelo quente com grafite, lembrando um bilhete colado na geladeira. Visual chapado (sem gradientes), com o amarelo como cor da marca e um coral discreto como acento.

**Tema**: claro e escuro seguem o sistema (`useColorScheme`), sem tela de configuração. `lightColors` ficam em `@/styles/tokens` e `darkColors` em `@/styles/theme`, ambos com as mesmas chaves (`ThemeColors`). Componentes leem as cores por `useThemeColors()`, nunca por hex fixo.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `primary` | `#F2A900` | `#FFC53D` | Botões, FAB "+", checkbox marcado |
| `primaryPressed` | `#D99700` | `#FFD978` | Estado pressionado dos botões |
| `primaryText` | `#8A5A00` | `#FFD166` | Texto e ícones em amarelo sobre fundo claro/escuro (links, data de hoje) |
| `primarySoft` | `#FFF3CC` | `#3A2F12` | Fundos de chip, item selecionado |
| `onPrimary` | `#2A2110` | `#2A2110` | Texto e ícones sobre `primary` (sempre escuro: branco no amarelo não é legível) |
| `accent` | `#FF6F59` | `#FF8A75` | Coral decorativo (ilustrações, detalhes); nunca para estados |
| `accentSoft` | `#FFE9E4` | `#3D2018` | Fundo de detalhes em coral |
| `background` | `#FFFBF0` | `#17140E` | Fundo das telas (papel) |
| `surface` | `#FFFFFF` | `#221E16` | Cards dos lembretinhos, modais |
| `surfaceMuted` | `#FFF6DE` | `#2B261C` | Cards concluídos, campos de formulário |
| `border` | `#F1E6C8` | `#3A3324` | Bordas e divisores |
| `textPrimary` | `#2A2110` | `#FBF6EA` | Texto principal (grafite) |
| `textSecondary` | `#6B5D42` | `#BDB29A` | Datas, legendas |
| `textMuted` | `#A3957A` | `#85795F` | Placeholder, texto de concluído riscado |
| `success` / `successSoft` | `#2F7D4F` / `#E5F4EA` | `#5BD38A` / `#12301F` | Toast de sucesso |
| `warning` / `warningSoft` | `#B4440F` / `#FDE8DF` | `#FF9A6B` / `#3D2216` | Selo "Atrasado", toast `info` |
| `danger` / `dangerSoft` | `#C0262D` / `#FDECEC` | `#F87171` / `#3B1418` | Excluir, erros, toast de erro |
| `shadow` | `#5C4300` | `#000000` | Sombras |

- O texto sobre `primary` é sempre `onPrimary` (grafite, contraste ≈ 8:1). Nunca usar branco sobre o amarelo
- Amarelo como texto sobre fundo claro usa `primaryText`, não `primary` (o amarelo puro não tem contraste para leitura)
- `textMuted` serve só para placeholders e itens concluídos, nunca para texto que precisa ser lido com atenção
- Sem gradientes: superfícies chapadas, cantos arredondados e sombra leve, como papel
- `spacing`, `borderRadius`, `fontSize` e `fontWeight` seguem a mesma escala do VCampos

**Ícone do app**: um post-it amarelo (`#FFC53D`) levemente inclinado, com o canto dobrado (`#D99700`), um sino grafite (`#2A2110`) no centro e o badalo em coral (`#FF6F59`), sobre fundo papel (`#FFFBF0`). Identidade própria do Lembretinhos; não reutilizar a marca do VCampos.

As fontes vetoriais ficam em `assets/source/` e os PNGs são gerados a partir delas. Para mudar o ícone, edite o SVG e gere os PNGs de novo (ImageMagick com librsvg: `magick -background none assets/source/X.svg -resize 1024x1024 assets/X.png`).

| Arquivo | Fonte | Uso |
|---|---|---|
| `icon.png` | `source/icon.svg` | Ícone principal 1024×1024, fundo papel opaco (Play Store) |
| `adaptive-icon.png` | `source/icon-foreground.svg` | Frente do adaptive icon, transparente, com o desenho a 75% para caber na zona segura; `backgroundColor: "#FFFBF0"` no `app.json` |
| `monochrome-icon.png` | `source/icon-monochrome.svg` | Ícone temático do Android 13+: silhueta branca do post-it com o sino vazado |
| `splash-icon.png` | `source/icon-foreground.svg` | Splash (`expo-splash-screen`), fundo `#FFFBF0` no claro e `#17140E` no escuro |
| `notification-icon.png` | `source/notification-icon.svg` | Barra de notificação: silhueta branca em fundo transparente, 96×96; `color: "#F2A900"` no plugin `expo-notifications` |

**Ícones da interface** (`MaterialCommunityIcons`):

| Ação/estado | Ícone |
|---|---|
| Novo lembretinho (FAB) | `plus` |
| Pendente / concluído | `checkbox-blank-circle-outline` / `check-circle` |
| Excluir | `trash-can-outline` |
| Data | `calendar-blank-outline` |
| Atrasado | `alert-circle-outline` |
| Lista vazia | `bell-check-outline` |
| Notificações desativadas | `bell-off-outline` |

### UI
- Design tokens de `@/styles/tokens` e `@/styles/theme` (colors, spacing, borderRadius, fontSize, fontWeight)
- Componentes compartilhados em `@/components/` (CustomButton, FormInput, ConfirmModal, …)
- Ícones: `@expo/vector-icons` (MaterialCommunityIcons)
- Visual limpo e amigável, adequado a telas pequenas, respeitando a barra de status e a barra de navegação/gestos do Android (`react-native-safe-area-context`)
- A exclusão sempre passa pelo `ConfirmModal`

### Navegação
- `@react-navigation/native-stack`
- Param list tipada: `export type RootStackParamList = { ReminderList: undefined; ReminderForm: undefined }`
- Tocar na notificação abre a lista

### Plataforma
- Somente Android nesta etapa; não adicionar código, configuração ou dependências específicas de iOS
- Suporte a iOS, se vier, será planejado numa etapa própria (o iOS limita a 64 notificações agendadas por app, o que muda o orçamento do agendador)
- Builds pelo EAS ou locais com `npx expo run:android`

## Testes (Jest + React Native Testing Library)

- `jest-expo` preset
- `render`, `fireEvent`, `waitFor` de `@testing-library/react-native`
- Rodar com `npm test -- --runInBand`
- `expo-notifications`, `expo-background-task` e `expo-sqlite` sempre mockados
- Stores resetadas com `useXStore.setState()` no `beforeEach`
- Imports **relativos** nos testes (não usar `@/`)
- Arquivo: `{SourceName}.test.ts(x)` em `src/__tests__/`, espelhando a source (`src/features/reminders/services/notifications.ts` → `src/__tests__/features/reminders/services/notifications.test.ts`)
- O agendador é testado com relógio fixo, cobrindo: criação para hoje no meio da janela, depois das 22h, dias seguintes, vários lembretes dividindo o orçamento, conclusão e exclusão

## Regras de Workflow

Estas regras são obrigatórias em toda interação:

1. **Testes obrigatórios** — toda implementação deve incluir testes para a nova funcionalidade
2. **Suite de testes** — após qualquer alteração, rodar `npm test -- --runInBand` e corrigir falhas
3. **Typecheck + Biome** — após qualquer alteração, rodar `npx tsc --noEmit` e `npx biome check --write` e corrigir todos os erros
4. **README** — toda nova feature, modificação ou correção deve atualizar o `README.md` refletindo o que mudou
5. **Toast de confirmação** — toda ação do usuário que muda dados (criar, concluir, reabrir, excluir) deve mostrar um toast ao terminar, usando `notification` de `@/components/notifications`: `success` quando concluir, `error` com mensagem amigável em português quando falhar e `info` para avisos (ex.: permissão de notificação negada). Nenhuma ação deve terminar em silêncio. O teste da funcionalidade deve verificar o toast
