# Áudio do tutorial

O tutorial **funciona sem nenhum arquivo nesta pasta**: trilha calma e efeitos (toques, cliques,
confirmações) são sintetizados em tempo real e sincronizados com cada animação. As legendas grandes
no topo carregam todo o conteúdo, então o vídeo também funciona no mudo (como costuma ser visto no WhatsApp).

A narração **não é simulada**. Sem arquivo, o vídeo roda sem voz e a tela inicial avisa:
"NARRAÇÃO — nenhum arquivo encontrado".

## Narração — um arquivo por frase (recomendado)

Salve cada frase com o nome abaixo, sem silêncio no começo do arquivo. Cada uma toca no instante
indicado e a trilha abaixa sozinha enquanto a voz fala (−7 dB, `duckMusicDb` em `js/config.js`).

| Arquivo           | Frase                                                                                   | Entra em | Termina até | Na tela |
|-------------------|-----------------------------------------------------------------------------------------|---------:|------------:|---------|
| `narracao-01.mp3` | Primeiro, confira quem vai retirar o material.                                          |   3,9 s  |    ~8,1 s   | Passo 1 · Quem retira |
| `narracao-02.mp3` | Depois, escolha os insumos.                                                             |   8,3 s  |   ~10,4 s   | Passo 2 · Escolher insumos |
| `narracao-03.mp3` | Novidade: filtre pelo tipo de serviço. Em Hidráulica, só aparece material de hidráulica. |  10,6 s  |   ~17,4 s   | chips Hidráulica → Elétrica → Alvenaria |
| `narracao-04.mp3` | Marque o que vai usar e ajuste a quantidade.                                            |  17,6 s  |   ~26,1 s   | 3 itens marcados, quantidade |
| `narracao-05.mp3` | E o serviço? Não é mais obrigatório.                                                    |  26,3 s  |   ~30,6 s   | Passo 3 · "Opcional" |
| `narracao-06.mp3` | Seu líder pode apropriar por você — a requisição vai do mesmo jeito.                    |  30,8 s  |   ~35,6 s   | cartão Antes/Agora · Você envia → Seu líder apropria |
| `narracao-07.mp3` | Se souber o serviço, é só escolher na árvore da EAP.                                    |  35,8 s  |   ~42,2 s   | árvore da EAP → VEDAÇÕES |
| `narracao-08.mp3` | Por fim, envie agora ou junte no lote.                                                  |  42,4 s  |   ~49,0 s   | Ao lote / Enviar → "Requisição enviada" |
| `narracao-09.mp3` | Pronto. Requisição feita em menos de um minuto.                                         |  49,2 s  |   ~54,5 s   | resumo dos 4 passos |

Os tempos e textos ficam no array `NARR` de `tutorial/js/tutorial.js` (a coluna "Entra em" é o `cue`).
Se alterar o roteiro visual, ajuste os `cue` junto.

## Alternativa: arquivo único

Salve como `narracao.mp3` (55 s, alinhado ao t = 0, frases nos tempos da tabela). Se existir,
ele tem prioridade sobre os arquivos por frase.

## Direção de voz

Voz brasileira, calma e próxima — colega explicando, não locutor de anúncio. Ritmo de ~2,5 palavras
por segundo, pausas curtas entre as frases. Ênfase em "**não é mais obrigatório**" e "**seu líder
pode apropriar por você**". mp3/wav, 44,1 ou 48 kHz, voz limpa (sem música), pico abaixo de −1 dBFS.

## Trilha externa (opcional)

Se existir `trilha.mp3` nesta pasta, ela substitui a trilha sintetizada (os efeitos continuam).
Algo calmo, ~96 BPM, com espaço para a voz; a trilha sintetizada recua entre 26 e 35 s para
destacar a mensagem do passo 3.
