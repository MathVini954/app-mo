# Screenshots de projetos reais

Sem screenshots, o showreel usa mockups demonstrativos claramente fictícios
(marcados como **DEMO**, com "dados de exemplo" no painel).

Para usar seus projetos:

1. Exporte capturas **1600 × 900 px ou maiores, proporção 16:9**, só a área da página
   (sem barra do navegador — ela já é desenhada pelo vídeo). PNG ou JPG de boa qualidade.
2. Salve aqui, por exemplo `assets/projects/site-cliente.png`.
3. Em `js/config.js`, preencha:

```js
projects: {
  browser: { screenshot: "assets/projects/site-cliente.png", url: "cliente.com.br" },
  sites:   { screenshot: "assets/projects/institucional.png", url: "empresa.com.br" },
  landing: { screenshot: "assets/projects/landing.png",       url: "oferta.empresa.com.br" },
  systems: { screenshot: "assets/projects/painel.png",        url: "app.empresa.com.br" }
}
```

- `sites`, `landing` e `systems` aparecem dentro das letras de SITES / LANDING PAGES / SISTEMAS
  e depois na composição 3D. O topo da imagem é o que aparece primeiro.
- `browser` substitui a página da cena "experiência digital". A coreografia de blocos e o
  modo smartphone foram desenhados sobre o layout demonstrativo; com screenshot, a imagem
  aparece no desktop e some suavemente durante a compressão para mobile.
- Use apenas projetos que você tem autorização para divulgar.
