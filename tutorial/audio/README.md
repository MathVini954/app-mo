# Áudio do tutorial

O tutorial **funciona sem nenhum arquivo nesta pasta**: trilha pop leve (108 BPM) e efeitos (toques, cliques,
confirmações) são sintetizados em tempo real e sincronizados com cada animação. As legendas grandes
no topo carregam todo o conteúdo, então o vídeo também funciona no mudo (como costuma ser visto no WhatsApp).

A narração **não é simulada**. Sem arquivo, o vídeo roda sem voz e a tela inicial avisa:
"NARRAÇÃO — nenhum arquivo encontrado".

## Narração — um arquivo por frase (recomendado)

Salve cada frase com o nome abaixo, sem silêncio no começo do arquivo. Cada uma toca no instante
indicado e a trilha abaixa sozinha enquanto a voz fala (−7 dB, `duckMusicDb` em `tutorial/js/config.js`).

| Arquivo | Frase | Entra em | Termina até | Na tela |
|---------|-------|---------:|------------:|---------|
| `narracao-01.mp3` | Primeiro, confira quem vai retirar o material. | 3,5 s | ~7,5 s | Passo 1 · Quem retira |
| `narracao-02.mp3` | Depois, escolha os insumos. | 7,6 s | ~9,8 s | Passo 2 · Escolher insumos |
| `narracao-03.mp3` | Novidade: filtro por tipo de serviço. | 9,9 s | ~12,6 s | chips em foco |
| `narracao-04.mp3` | Hidráulica? Só aparece hidráulica. | 12,7 s | ~14,9 s | lista filtrada com etiqueta Hidráulica |
| `narracao-05.mp3` | E assim por diante. | 15,0 s | ~18,2 s | Elétrica → Alvenaria |
| `narracao-06.mp3` | Toque no insumo, digite a quantidade e toque em Adicionar. | 18,3 s | ~22,4 s | tela de quantidade · teclado · Adicionar |
| `narracao-07.mp3` | Repita para os outros e toque em Concluir. | 22,5 s | ~27,6 s | 2º e 3º itens · Concluir |
| `narracao-08.mp3` | Pronto: insumos no carrinho. | 27,7 s | ~31,0 s | itens no formulário · “Já dá para enviar” |
| `narracao-09.mp3` | E o serviço? Não é mais obrigatório. | 31,1 s | ~35,1 s | Passo 3 · “Não é mais obrigatório” |
| `narracao-10.mp3` | Seu líder pode apropriar por você. Ele pode indicar o serviço depois. | 35,2 s | ~40,9 s | cartão Serviço: Obrigatório → Opcional · Você envia → Seu líder pode apropriar depois |
| `narracao-11.mp3` | Se souber o serviço, é só escolher na árvore da EAP. | 41,0 s | ~46,3 s | árvore da EAP → VEDAÇÕES |
| `narracao-12.mp3` | Por fim, envie agora ou junte no lote. | 46,4 s | ~50,9 s | Ao lote / Enviar |
| `narracao-13.mp3` | Pronto, requisição enviada. | 51,0 s | ~54,6 s | “Requisição enviada” |
| `narracao-14.mp3` | Dúvidas? Fale com o seu líder. | 54,7 s | ~58,3 s | resumo dos 4 passos |

> As frases 03–05 apresentam o **filtro por tipo de serviço, que é uma proposta** (ainda não existe no
> app). Grave e distribua essa versão só depois que o filtro estiver publicado.
> A frase 06 cita o botão **Adicionar** da tela de quantidade, que foi desenhada a partir da descrição
> do fluxo (sem print): confirme o nome do botão no app antes de gravar.

Os tempos e textos ficam no array `NARR` de `tutorial/js/tutorial.js` e são calculados a partir do
roteiro `T` (em batidas da trilha), então acompanham sozinhos qualquer ajuste de ritmo.

## Alternativa: arquivo único

Salve como `narracao.mp3` (58,6 s, alinhado ao t = 0, frases nos tempos da tabela). Se existir,
ele tem prioridade sobre os arquivos por frase.

## Direção de voz

Voz brasileira, calma e próxima — colega explicando, não locutor de anúncio. Ritmo de ~2,5 palavras
por segundo, pausas curtas entre as frases. Ênfase em "**não é mais obrigatório**" e "**seu líder
pode apropriar por você**". mp3/wav, 44,1 ou 48 kHz, voz limpa (sem música), pico abaixo de −1 dBFS.

## Trilha externa (opcional)

Se existir `trilha.mp3` nesta pasta, ela substitui a trilha sintetizada (os efeitos continuam).
A trilha sintetizada é pop leve a **108 BPM** e todo o vídeo está na grade dela: o celular pousa no
1º "drop" (3,3 s), o toque em Hidráulica cai no 2º (11,7 s), "Não é mais obrigatório" entra numa
parada (30,6 s), "Seu líder pode apropriar" no 3º drop (35,0 s) e o Enviar no 4º (50,6 s).
Uma trilha externa deve ter 108 BPM com o tempo 1 em 0 s para manter essa sincronia.
