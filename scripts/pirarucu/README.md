# Textura do pirarucu

`public/assets/pirarucu.webp` é a ilustração do peixe inteiro (curvo, fundo branco)
endireitada ao longo da espinha, com a cabeça para a direita e 30 px de margem
transparente. O componente `PirarucuPond` dobra essa textura de novo enquanto ele nada.

Para trocar a ilustração, salve a nova como `77321fca-pirarucu-inteiro.jpg` numa pasta
e rode, de dentro dela (precisa de `pip install pillow numpy scipy scikit-image`):

```
python3 1-recortar.py     # tira o fundo branco -> fish_rgba.png
python3 2-espinha.py      # acha a espinha -> path.npy (confira spine_dbg.png)
python3 3-endireitar.py   # endireita -> fish_straight.png (confira spine_dbg2.png)
```

Depois adicione a margem de 30 px (e 8 px extras no topo, para centralizar a espinha)
e exporte em WebP. Se as peitorais mudarem de lugar, ajuste a zona `pec` em
`src/lib/pirarucu-scene.ts`.
