# Lembretinhos

App simples para Android, feito com React Native (Expo), para você não esquecer das coisas. Você escreve o que quer lembrar e escolhe o dia. A partir desse dia, o app te avisa **de hora em hora** até você marcar como concluído.

Funciona 100% offline: sem conta, sem servidor, com tudo salvo no aparelho.

## Como funciona

1. Toque em **+**, escreva o lembretinho e escolha o dia.
2. A partir do dia escolhido, você recebe uma notificação a cada hora, das **08:00 às 22:00**.
   - Se criar o lembrete para hoje, a primeira notificação chega na próxima hora cheia.
   - Se o dia acabar sem você concluir, os avisos **continuam no dia seguinte**, e no outro, até você concluir. Na lista, ele aparece como **Atrasado**.
3. Toque em **Concluído**, na lista ou direto na notificação, e os avisos param.

Na lista você também pode:

- **Excluir** um lembretinho, com confirmação. As notificações dele são canceladas.
- **Reabrir** um concluído, desmarcando o checkbox. Os avisos voltam.

Não dá para editar um lembretinho: para corrigir, exclua e crie de novo.

> As notificações são locais e chegam mesmo com o app fechado. Se você negar a permissão de notificações, os lembretes continuam salvos, mas sem avisos. Dá para liberar depois nos ajustes do celular.

### Limites do Android

- **Fila de avisos:** o Android limita quantos alarmes um app pode ter agendados. Por isso, o app agenda até **200 avisos à frente** (uns 13 dias para um lembrete sozinho, menos se houver vários pendentes) e completa a fila sempre que você abre o app, cria, conclui ou exclui algo, ou toca numa notificação. Em segundo plano, o sistema também deixa o app renovar a fila de vez em quando. Se você passar muito tempo sem abrir o app, com vários lembretes atrasados, os avisos podem parar até a próxima abertura.
- **Pontualidade:** em economia de bateria, o Android pode atrasar um aviso alguns minutos.
- **Economia de bateria agressiva:** alguns celulares (Xiaomi, Samsung, Motorola etc.) podem segurar ou cortar notificações de apps "otimizados". Se os avisos não chegarem, tire o Lembretinhos da otimização de bateria nos ajustes do celular.
- **Reinicialização:** os avisos agendados continuam depois de reiniciar o celular.

## Status

Primeira versão implementada, falta testar num aparelho Android real. Etapas:

- [x] Documentação inicial (AGENTS.md e README)
- [x] Paleta de cores (Post-it)
- [x] Ícones do app (post-it com sino)
- [x] Setup: Expo SDK 58 (React Native 0.88), TypeScript, Biome, Jest e estrutura `src/`
- [x] Tema Post-it claro e escuro (segue o sistema) e componentes base: botão, campo de texto, diálogo de confirmação e toasts
- [x] Banco `lembretinhos.db` com migration inicial e repository
- [x] Store Zustand e tela de lista (pendentes, atrasados e concluídos), com concluir e reabrir pelo checkbox
- [x] Formulário de criação com validação (texto até 200 caracteres, data de hoje em diante, atalhos Hoje/Amanhã e calendário nativo)
- [x] Exclusão com confirmação (ícone de lixeira em cada lembretinho)
- [x] Agendador de notificações: permissão, de hora em hora, dias seguintes e limite de agendamentos (cria, conclui, reabre e exclui já ajustam a fila; avisos já exibidos somem da barra ao concluir)
- [x] Ação "Concluído" direto na notificação, com o app aberto, em segundo plano ou fechado
- [x] Renovação da fila ao abrir o app, ao voltar para ele e em segundo plano (a cada 12h no mínimo, quando o Android permitir)
- [x] Toasts em todas as ações
- [ ] Teste em aparelho Android real (app fechado, reinicialização, economia de bateria)

## Stack

- Expo + TypeScript (somente Android)
- `expo-notifications`: notificações locais agendadas
- `expo-background-task`: renovação periódica da fila de avisos
- `expo-sqlite` + Zustand: dados locais
- React Hook Form + Zod: formulário
- React Navigation (native stack)
- Jest + React Native Testing Library, Biome

## Visual

- **Paleta Post-it:** amarelo quente (`#F2A900`) com grafite (`#2A2110`) sobre fundo cor de papel (`#FFFBF0`), e um coral discreto (`#FF6F59`) como acento. Sem gradientes.
- **Tema claro e escuro** automáticos, seguindo a configuração do celular.
- **Ícone:** um post-it amarelo com o canto dobrado e um sino no centro. Em `assets/` estão o ícone do app, o adaptive icon, o ícone temático do Android 13+, o splash e o ícone da barra de notificação; os desenhos originais (SVG) ficam em `assets/source/`.
- A paleta completa (tokens) está no [AGENTS.md](AGENTS.md#identidade-visual).

## Dados

Tudo fica no SQLite (`lembretinhos.db`), no armazenamento privado do app:

- `reminders`: texto, dia, se foi concluído e datas de criação e conclusão
- `reminder_notifications`: IDs das notificações agendadas de cada lembrete, usados para cancelar e renovar os avisos

Desinstalar o app apaga os dados.

## Estrutura

```text
App.tsx
assets/            ícones e splash (SVGs originais em assets/source/)
src/
  components/      componentes compartilhados
  database/        migrations e repositories
  features/
    reminders/     telas, store, schema e serviço de notificações
  routes/          navegação
  styles/          design tokens
  utils/           utilitários
  __tests__/       testes espelhando a source
```

## Requisitos

- Node.js 22.13+ (linha 22), 24.3+ ou 26+, exigência do Expo SDK 58
- npm
- Expo/EAS CLI
- Android Studio (emulador) ou um aparelho Android

> As notificações agendadas e o botão "Concluído" na notificação não funcionam de forma confiável no **Expo Go**. Use um *development build*.

## Instalação

```bash
npm install
```

Android local:

```bash
npx expo run:android
```

Ou gere o APK pelo EAS, na nuvem, sem precisar do Android SDK local (`eas.json`):

```bash
eas build --profile development --platform android
```

```bash
eas build --profile preview --platform android
```

- `development`: o app com o `expo-dev-client`, para usar com `npx expo start` e recarregar ao editar o código.
- `preview`: o app completo e independente, para usar no dia a dia ou mandar para alguém testar.

### Ver erros no celular

Com o celular ligado no USB (depuração USB ativada) e o `adb` instalado (`sudo dnf install android-tools`), dá para ler o log quando o app fecha sozinho:

```bash
adb logcat -v brief | grep -E "AndroidRuntime|ReactNativeJS"
```

### Otimização do APK (R8)

O APK de release passa pelo R8, que remove código que parece não ser usado. O WorkManager (usado pelo `expo-background-task` para renovar os avisos em segundo plano) cria o banco interno dele por reflexão, e o R8 removia esse construtor: o app fechava ao abrir (`NoSuchMethodException: androidx.work.impl.WorkDatabase_Impl.<init>`). As regras que mantêm essas classes ficam no plugin `expo-build-properties` do `app.json` (`extraProguardRules`).

O pacote Android é `com.arthurpsilva.lembretinhos`.

Comandos:

```bash
npm start
npm run android
npm test
npm run typecheck
npm run lint
```

## Qualidade

Antes de cada commit:

```bash
npx biome check --write .
npx tsc --noEmit
npm test -- --runInBand
```
