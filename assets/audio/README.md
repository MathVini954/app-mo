# Áudio

O showreel **funciona sem nenhum arquivo nesta pasta**: trilha eletrônica e efeitos sonoros são
sintetizados em tempo real (Web Audio API) e já estão sincronizados com cada animação.

A narração **não é simulada**. Se não houver arquivo, o vídeo roda sem voz e a tela inicial avisa isso.

## Narração — duas opções

### Opção A (recomendada): um arquivo por frase

Grave/gere cada frase separadamente e salve com estes nomes. Cada arquivo é tocado
automaticamente no instante indicado (o início do arquivo = início da fala, sem silêncio antes).

| Arquivo             | Texto                          | Entra em | Janela disponível | O que está na tela |
|---------------------|--------------------------------|---------:|------------------:|--------------------|
| `narracao-01.mp3`   | Tudo começa com uma ideia.     |  0,35 s  | até ~1,9 s        | digitação da frase |
| `narracao-02.mp3`   | Transformada em experiência.   |  2,30 s  | até ~4,0 s        | blocos → site, DESIGN → CÓDIGO |
| `narracao-03.mp3`   | Feita para cada tela.          |  4,45 s  | até ~5,8 s        | interação → smartphone |
| `narracao-04.mp3`   | Sites, páginas e sistemas.     |  6,20 s  | até ~8,7 s        | SITES 6,24 · LANDING 7,20 · SISTEMAS 8,15 |
| `narracao-05.mp3`   | Sua empresa merece presença.   |  9,65 s  | até ~11,7 s       | SUA EMPRESA. NO DIGITAL. |
| `narracao-06.mp3`   | Vamos criar algo incrível?     | 12,75 s  | até ~14,4 s       | pergunta → assinatura |

Na frase 4, fale com pausas: "Sites… páginas… e sistemas." — cada palavra cai na batida em que ela aparece.

Os tempos ficam em `js/config.js` (`audio.narration.lines[].cue`) e podem ser ajustados em décimos de segundo.

### Opção B: um arquivo único

Salve como `narracao.mp3` (15 s, alinhado ao t = 0, com as frases nos tempos da tabela acima).
Se esse arquivo existir, ele tem prioridade sobre os arquivos por frase.

### Direção de voz

Masculina, brasileira, grave, calma, natural — campanha de marca premium, não varejo.
Entregue em mp3/wav, 44,1 ou 48 kHz, voz limpa (sem música), pico abaixo de −1 dBFS.
Enquanto a voz fala a trilha é abaixada automaticamente (−5 dB, ajustável em `duckMusicDb`)
e a última frase recebe um reverb curto.

## Trilha externa (opcional)

Se existir `trilha.mp3`, ela substitui a trilha sintetizada (os efeitos sonoros continuam).
Para manter a sincronia com os impactos, use 126 BPM com o "drop" em 9,10 s.

## Observação sobre `file://`

Abrindo o `index.html` direto do disco, o navegador não permite decodificar o áudio com precisão,
então a narração toca por `<audio>` (sincronia boa, sem o reverb/ducking fino).
Com `npm start` (servidor local) ou na exportação MP4, tudo fica sample-accurate.
