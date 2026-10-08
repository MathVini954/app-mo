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
| `narracao-01.mp3`   | Tudo começa com uma ideia.     |  0,70 s  | até ~3,5 s        | digitação da frase |
| `narracao-02.mp3`   | Transformada em experiência.   |  5,60 s  | até ~8,5 s        | blocos → site, DESIGN → CÓDIGO |
| `narracao-03.mp3`   | Feita para cada tela.          | 12,15 s  | até ~13,9 s       | desktop → smartphone |
| `narracao-04.mp3`   | Sites, páginas e sistemas.     | 14,80 s  | até ~20,4 s       | SITES 14,75 · LANDING 16,70 · SISTEMAS 18,65 |
| `narracao-05.mp3`   | Sua empresa merece presença.   | 22,05 s  | até ~24,9 s       | SUA EMPRESA. NO DIGITAL. |
| `narracao-06.mp3`   | Vamos criar algo incrível?     | 25,95 s  | até ~27,8 s       | pergunta → assinatura (27,9 s) |

Na frase 4 há tempo de sobra: fale com calma, "Sites, páginas… e sistemas.", ou divida em três
arquivos e acrescente as entradas em `js/config.js` (por exemplo 14,80 · 16,72 · 18,67 s).

Os tempos ficam em `js/config.js` (`audio.narration.lines[].cue`) e podem ser ajustados em décimos de segundo.

### Opção B: um arquivo único

Salve como `narracao.mp3` (30 s, alinhado ao t = 0, com as frases nos tempos da tabela acima).
Se esse arquivo existir, ele tem prioridade sobre os arquivos por frase.

### Direção de voz

Masculina, brasileira, grave, calma, natural — campanha de marca premium, não varejo.
Entregue em mp3/wav, 44,1 ou 48 kHz, voz limpa (sem música), pico abaixo de −1 dBFS.
Enquanto a voz fala a trilha é abaixada automaticamente (−5 dB, ajustável em `duckMusicDb`)
e a última frase recebe um reverb curto.

## Trilha externa (opcional)

Se existir `trilha.mp3`, ela substitui a trilha sintetizada (os efeitos sonoros continuam).
Para manter a sincronia com os impactos, use 123 BPM com o "drop" em 20,60 s.

## Observação sobre `file://`

Abrindo o `index.html` direto do disco, o navegador não permite decodificar o áudio com precisão,
então a narração toca por `<audio>` (sincronia boa, sem o reverb/ducking fino).
Com `npm start` (servidor local) ou na exportação MP4, tudo fica sample-accurate.
