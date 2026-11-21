# Textura do peixe

`public/assets/pirarara.webp` (1122×620) é a ilustração do peixe vista de cima e
endireitada ao longo da espinha: cauda à esquerda, cabeça à direita, espinha no meio
da altura e margem transparente em volta (a altura extra é por causa dos bigodes).
O componente `PirararaPond` dobra essa textura enquanto o peixe nada.

Os scripts aqui endireitam uma ilustração curva com fundo branco (foi assim que a
primeira versão, o pirarucu, foi feita). Salve a imagem como
`77321fca-pirarucu-inteiro.jpg` numa pasta e rode, de dentro dela
(`pip install pillow numpy scipy scikit-image`):

```
python3 1-recortar.py     # tira o fundo branco -> fish_rgba.png
python3 2-espinha.py      # acha a espinha -> path.npy (confira spine_dbg.png)
python3 3-endireitar.py   # endireita -> fish_straight.png (confira spine_dbg2.png)
```

Ao trocar a textura, confira em `src/lib/pirarara-scene.ts`: `TEX_W`/`TEX_H` (tamanho
da imagem) e as zonas `pec` e `pel` (onde ficam as peitorais e as pélvicas, em px
da textura, e a que distância da espinha elas começam).
