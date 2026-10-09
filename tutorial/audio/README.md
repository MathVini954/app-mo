# Áudio do tutorial

O tutorial **funciona sem nenhum arquivo nesta pasta**: trilha calma e efeitos (toques, cliques,
confirmações) são sintetizados em tempo real e sincronizados com cada animação. As legendas grandes
no topo carregam todo o conteúdo, então o vídeo também funciona no mudo (como costuma ser visto no WhatsApp).

A narração **não é simulada**. Sem arquivo, o vídeo roda sem voz e a tela inicial avisa:
"NARRAÇÃO — nenhum arquivo encontrado".

## Narração — um arquivo por frase (recomendado)

Salve cada frase com o nome abaixo, sem silêncio no começo do arquivo. Cada uma toca no instante
indicado e a trilha abaixa sozinha enquanto a voz fala (−7 dB, `duckMusicDb` em `tutorial/js/config.js`).

| Arquivo | Frase | Entra em | Termina até | Na tela |
|---------|-------|---------:|------------:|---------|
| `narracao-01.mp3` | Primeiro, confira quem vai retirar o material. | 3,9 s | ~8,2 s | Passo 1 · Quem retira |
| `narracao-02.mp3` | Depois, escolha os insumos. | 8,2 s | ~10,0 s | Passo 2 · Escolher insumos |
| `narracao-03.mp3` | Novidade: filtro por tipo de serviço. | 10,2 s | ~12,8 s | chips em foco |
| `narracao-04.mp3` | Hidráulica? Só aparece hidráulica. | 13,0 s | ~15,0 s | lista filtrada com etiqueta Hidráulica |
| `narracao-05.mp3` | E assim por diante. | 15,1 s | ~18,2 s | Elétrica → Alvenaria (“e assim por diante”) |
| `narracao-06.mp3` | Marque o que vai usar e toque em Concluir. | 18,3 s | ~22,9 s | 3 itens marcados → Concluir |
| `narracao-07.mp3` | Ajuste a quantidade, se precisar. | 23,0 s | ~26,9 s | + na quantidade · “Já dá para enviar” |
| `narracao-08.mp3` | E o serviço? Não é mais obrigatório. | 27,0 s | ~31,4 s | Passo 3 · “Não é mais obrigatório” |
| `narracao-09.mp3` | Seu líder pode apropriar por você. Ele pode indicar o serviço depois. | 31,5 s | ~37,3 s | cartão Serviço: Obrigatório → Opcional · Você envia → Seu líder pode apropriar depois |
| `narracao-10.mp3` | Se souber o serviço, é só escolher na árvore da EAP. | 37,4 s | ~43,8 s | árvore da EAP → VEDAÇÕES |
| `narracao-11.mp3` | Por fim, envie agora ou junte no lote. | 43,9 s | ~48,2 s | Ao lote / Enviar |
| `narracao-12.mp3` | Pronto, requisição enviada. | 48,3 s | ~52,8 s | “Requisição enviada” |
| `narracao-13.mp3` | Dúvidas? Fale com o seu líder. | 52,9 s | ~56,5 s | resumo dos 4 passos |

> As frases 03–05 apresentam o **filtro por tipo de serviço, que é uma proposta** (ainda não existe no
> app). Grave e distribua essa versão só depois que o filtro estiver publicado.

Os tempos e textos ficam no array `NARR` de `tutorial/js/tutorial.js` (a coluna "Entra em" é o `cue`).
Se alterar o roteiro visual, ajuste os `cue` junto.

## Alternativa: arquivo único

Salve como `narracao.mp3` (57 s, alinhado ao t = 0, frases nos tempos da tabela). Se existir,
ele tem prioridade sobre os arquivos por frase.

## Direção de voz

Voz brasileira, calma e próxima — colega explicando, não locutor de anúncio. Ritmo de ~2,5 palavras
por segundo, pausas curtas entre as frases. Ênfase em "**não é mais obrigatório**" e "**seu líder
pode apropriar por você**". mp3/wav, 44,1 ou 48 kHz, voz limpa (sem música), pico abaixo de −1 dBFS.

## Trilha externa (opcional)

Se existir `trilha.mp3` nesta pasta, ela substitui a trilha sintetizada (os efeitos continuam).
Algo calmo, ~96 BPM, com espaço para a voz; a trilha sintetizada fica mais leve (sem bumbo e baixo)
entre 26,7 e 36,9 s para destacar a mensagem do passo 3.
