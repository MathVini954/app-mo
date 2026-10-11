# SUA IDEIA. NOSSO CÓDIGO. — Showreel 30 s

Motion design de 30 segundos (1920×1080, 16:9) em **HTML + CSS + JavaScript + GSAP**, para divulgar
serviços de desenvolvimento web: sites, landing pages e sistemas.
Estética Swiss / editorial, cores sólidas, tipografia gigante, interfaces desenhadas em HTML/SVG
e sound design sincronizado.

```
00.0  A IDEIA ............ cursor, digitação, IDEIA. ocupa a tela, letras viram blocos
03.9  IDEIA → DIGITAL .... blocos montam o site, DESIGN. desliza e vira CÓDIGO., que vira código e volta à interface
09.2  EXPERIÊNCIA ........ câmera entra no navegador, cursor, microinterações, rolagem, desktop → tablet → smartphone, RESPONSIVO.
13.9  O QUE EU DESENVOLVO  smartphone gira e vira o fundo azul; SITES. / LANDING PAGES. / SISTEMAS. com a interface dentro das letras
20.5  SUA EMPRESA ........ composição 3D dos mockups, câmera recua, SUA EMPRESA. NO DIGITAL.
25.0  ASSINATURA ......... headline vira uma linha → marca azul → fundo branco → VAMOS CRIAR ALGO INCRÍVEL? → assinatura → preto
```

Ritmo: transições longas e suaves (`power2`/`power3`, 0,6–1,3 s), overshoots discretos,
zoom pela letra com aceleração em escala logarítmica (velocidade percebida constante).

## Rodar

```bash
npm start            # servidor local sem dependências → http://localhost:5173
```

Também funciona abrindo `index.html` direto no navegador (Chrome/Edge/Safari/Firefox recentes).
Com o servidor local a sincronia de áudio é sample-accurate; via `file://` a narração usa `<audio>`.

Tela inicial **CLIQUE PARA INICIAR** (necessária para liberar o áudio). Atalhos:
`Espaço` pausar · `R` reiniciar · `M` mudo · `F` tela cheia. No fim aparece **ASSISTIR NOVAMENTE**.
Os controles aparecem ao mover o mouse e somem sozinhos (útil para gravar a tela, se preferir).

Para inspecionar um instante: `index.html?t=16.2` congela a timeline nesse tempo.

## Personalizar

Tudo em `js/config.js`:

| Campo | Padrão | Uso |
|---|---|---|
| `brand` | `SEU NOME` | assinatura final (ajusta o tamanho sozinho) |
| `instagram` | `@seu_instagram` | rodapé da assinatura |
| `subtitle`, `ctaLabel`, `year` | — | textos da assinatura e da cena 5 |
| `audio.*` | — | narração, trilha externa, volumes (veja `assets/audio/README.md`) |
| `projects.*` | demos | screenshots reais (veja `assets/projects/README.md`) |

Atalho sem editar código: `index.html?brand=Seu%20Nome&ig=@seuperfil`.

## Exportar MP4 (Reels, portfólio, anúncios)

```bash
npm install
npx playwright install chromium    # uma vez
npm run render                     # dist/showreel-1920x1080-60fps.mp4 + capa .png
npm run render:30                  # 30 fps
npm run render:preview             # prévia 960×540
node tools/render.mjs --query "&brand=Seu%20Nome&ig=@perfil"
```

Precisa do **ffmpeg** no PATH. A exportação é quadro a quadro (não é gravação de tela):
cada frame é posicionado na timeline e capturado; o áudio é renderizado pelo mesmo motor
com `OfflineAudioContext`. Resultado: 30,000 s, 1800 frames a 60 fps, H.264 + AAC, ~10 MB,
sem frames perdidos e com a mesma sincronia da versão ao vivo. Leva ~3–4 min.

## Áudio

- **Trilha e efeitos**: sintetizados com Web Audio API (123 BPM, drop em 20,60 s).
  Introdução calma, groove contido, breakdown quando o smartphone gira, um acorde por palavra
  (SITES / LANDING / SISTEMAS caem no tempo forte do compasso), pico em 20,6 s e desaceleração final.
  Teclado mecânico, cliques de interface, whooshes, sub-bass, impactos, riser, reverb.
  Os cues de som são registrados pela própria timeline (`sfx(...)` ao lado de cada animação).
- **Narração**: não incluída e **nunca simulada**. Coloque os arquivos em `assets/audio/`
  (tabela de tempos e direção de voz em `assets/audio/README.md`). A tela inicial informa se
  a narração foi encontrada. A trilha abaixa automaticamente enquanto a voz fala.
- Mixagem atual (sem voz): ~−16,5 LUFS integrado, pico abaixo de −1 dBTP.

## Estrutura

```
index.html              palco 1920×1080, cenas, mockups (HTML/SVG), HUD, tela inicial
css/showreel.css        paleta, tipografia, componentes e mockups
js/config.js            personalização (marca, contato, áudio, projetos)
js/showreel.js          timeline GSAP única + player sincronizado ao relógio de áudio
js/audio.js             motor de áudio (síntese, mixagem, narração, render offline)
tools/render.mjs        exportação MP4 determinística (Playwright + ffmpeg)
tools/serve.mjs         servidor local
assets/fonts/           Archivo Black, Space Grotesk, Inter, JetBrains Mono (locais, OFL)
assets/vendor/          GSAP 3.13 (local, funciona offline)
assets/audio/           narração / trilha opcionais
assets/projects/        screenshots opcionais
tutorial/               tutorial vertical "Nova requisição" (index.html, css/, js/, audio/)
```

## Notas técnicas

- **Uma única `gsap.timeline()`** de 30 s. Nada anima fora dela (nem o cursor piscando),
  por isso qualquer instante pode ser renderizado de forma idêntica.
- **Relógio mestre = AudioContext**: a cada frame a timeline é posicionada no tempo do som
  (descontando a latência de saída). Pausar suspende o áudio e a imagem junto, sem deriva.
- **Sem cortes secos**: cada cena nasce da anterior (letras → blocos → interface → smartphone →
  fundo azul → letras-janela → mockups 3D → headline → linha → marca → assinatura).
- **Máscaras tipográficas** com `clipPath` SVG aplicado ao HTML dos mockups (zoom através da letra "I").
- Animações em `transform`, `opacity` e `clip-path`; a compressão desktop → mobile anima a geometria
  real dos componentes (o texto reflui de verdade). Medido ~60 fps em headless.
- Tipografia gigante re-rasterizada a cada frame (`force3D: false`) para não borrar em escala.
- Mockups são fictícios e sinalizados (DEMO, "dados de exemplo"). Sem clientes, depoimentos
  ou números de resultado inventados.
- "Neue Montreal" é comercial e não foi incluída; o par Archivo Black + Space Grotesk cobre o papel.

## Tutorial — Nova requisição (Rio Ave)

Vídeo vertical de **58,6 s (1080×1920, 9:16)**, pensado para WhatsApp/celular, que ensina a fazer uma
requisição de material no app Rio Ave. Fica em `tutorial/` e reaproveita o motor de áudio e a exportação.
O roteiro está na grade da trilha (108 BPM): toques, legendas e viradas de capítulo caem na batida.

```
00.0  ABERTURA ........... "Como fazer uma requisição" + "4 passos — e o serviço agora é opcional" (capa do WhatsApp)
03.3  PASSO 1 ............ Quem retira (já vem preenchido)
07.2  PASSO 2 ............ Insumos · NOVO filtro por tipo de serviço: Hidráulica → só hidráulica (etiqueta em
                           cada item, lista rola até tubos e registros) → Elétrica → Alvenaria
17.8                       Toque no insumo → tela de quantidade no mesmo modal (teclado, Adicionar) → volta
                           marcado com a quantidade; repete para os outros → Concluir → itens no carrinho
30.6  PASSO 3 ............ "Não é mais obrigatório" (~4,4 s) → "Seu líder pode apropriar por você" (cartão
                           Serviço: Obrigatório → Opcional · Você envia → Seu líder pode apropriar depois) → EAP opcional
46.1  PASSO 4 ............ Enviar agora ou juntar no lote → toque em Enviar → "Requisição enviada"
52.8  RESUMO ............. os 4 passos + "Dúvidas? Fale com o seu líder." (termina no resumo, sem tela preta)
```

```bash
npm start                          # → http://localhost:5173/tutorial/
npm run render:tutorial            # dist/tutorial-requisicao-1080x1920-60fps.mp4 + capa .png
npm run render:tutorial:whatsapp   # 30 fps, bitrate limitado — arquivo leve para WhatsApp
npm run render:tutorial:preview    # prévia 540×960 a 30 fps
```

- Legendas grandes no topo: o vídeo funciona **no mudo**. A narração é opcional e nunca simulada
  (veja `tutorial/audio/README.md` com as frases e os tempos).
- Trilha sintetizada "viva" (108 BPM, seções com drops e uma parada no passo 3), mixada para alto-falante
  de celular (sem sub-grave) e perto de −16 LUFS (`inputGainDb` em `tutorial/js/config.js`).
- A logo Rio Ave do cabeçalho foi redesenhada em vetor a partir do print do app (arco + letreiro).
- `tutorial/index.html?t=31.5` congela num instante (Espaço continua dali, sem som); `tutorial/js/tutorial.js`
  concentra roteiro, dados fictícios dos insumos/EAP e a timeline.
- O app é redesenhado em HTML/CSS a partir dos prints (não são imagens). **Os chips de filtro por
  tipo de serviço, as etiquetas nos itens e o contador "12 de 129 · Hidráulica" são uma proposta de
  funcionalidade** — no app atual eles não existem (o cabeçalho real mostra "129 no estoque").
  **Só distribua o vídeo para as equipes depois que o filtro estiver no app**: quem seguir o tutorial
  em campo vai procurar os chips.
- **A tela de quantidade foi desenhada a partir da descrição do fluxo, sem print**: um insumo por vez,
  no mesmo modal (campo com unidade, "Em estoque", teclado numérico, botão "Adicionar" → "✓ Adicionado",
  volta automática à lista com a quantidade). Também são suposições os botões −/+ nos itens do formulário
  e o nível intermediário da EAP. Confira nome do botão e layout no app antes de distribuir.

## Licenças de terceiros

- GSAP 3.13 — GreenSock Standard License (uso gratuito, inclusive comercial).
- Archivo Black, Space Grotesk, Inter, JetBrains Mono — SIL Open Font License 1.1 (via @fontsource).
