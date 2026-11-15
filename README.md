# Portfólio — Victor Hugo Brilhante (protótipo)

React + TypeScript + Tailwind CSS v4 + Vite, com a estrutura do shadcn/ui.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Preview online (GitHub Pages)

Todo push na `main` publica o site em https://vhbrilhante.github.io/portifolio/
pelo workflow `.github/workflows/deploy-pages.yml`. Uma vez só: em
**Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.

## Estrutura

```
components.json                 # config do shadcn (aliases @/components, @/components/ui, @/lib/utils)
src/lib/utils.ts                # cn() = clsx + tailwind-merge (padrão shadcn)
src/components/ui/
  inline-mark.tsx               # palavra + logo / foto na mesma linha (regra da altura da fonte)
  interactive-folder-gallery.tsx# pasta de projetos em glassmorphism (framer-motion)
src/App.tsx                     # página (layout do Figma) + rota #/resume
src/content.tsx                 # TEXTOS, LINKS, PROJETOS E CARREIRA: edite aqui
src/pages/Resume.tsx            # aba de currículo (Print / PDF pelo navegador)
src/components/ui/career-timeline.tsx  # linha do tempo 2025 → 2028 (gurbinder.dev)
src/components/ui/toolbar.tsx   # copiar link, som, tema, relógio local (ch.sh)
src/components/ui/text-fx.tsx   # marca-texto, pílula, letra à mão, forte/fraco (antwi.dev)
src/lib/sfx.ts                  # efeitos sonoros sintetizados (Web Audio)
public/assets/                  # logos e fotos exportados do Figma
```

### Por que `src/components/ui`
É o caminho padrão do shadcn. Quando você roda `npx shadcn@latest add <componente>`
(ou cola um componente do 21st.dev), ele espera os componentes em `@/components/ui`
e o helper `cn` em `@/lib/utils`. Mantendo essa pasta, todo componente novo entra
sem precisar ajustar import.

### Se fosse começar do zero
```bash
npm create vite@latest portfolio -- --template react-ts
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init        # cria components.json, lib/utils e o alias @
npm install framer-motion @phosphor-icons/react
```

## Ícones
Phosphor Icons (`@phosphor-icons/react`), lista em https://phosphoricons.com

## Regra das marcas inline
Logo ou foto à direita da palavra tem a altura da fonte (`1em`) e fica centralizada
nas letras da linha (`vertical-align: -0.15em`). Assim nunca passa da altura do texto
e acompanha qualquer mudança de fonte ou tamanho.
