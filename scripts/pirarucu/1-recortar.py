import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, disk, binary_opening
im=np.asarray(Image.open('77321fca-pirarucu-inteiro.jpg').convert('RGB')).astype(float)
mn=im.min(2); 
near=(mn>225)&(im.max(2)-mn<20)
lab,n=ndi.label(near)
border=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
bg=np.isin(lab,list(border))
fg=~bg
fg=ndi.binary_fill_holes(fg)
# keep largest component
lab2,n2=ndi.label(fg); sizes=ndi.sum(fg,lab2,range(1,n2+1)); fg=lab2==(np.argmax(sizes)+1)
# soft alpha: based on whiteness near edge
d=ndi.distance_transform_edt(fg)
white=np.clip((255-mn)/40,0,1)
alpha=np.where(d>3,1.0,np.minimum(1,white*1.2))*fg
# dilate a touch for edge pixels outside fg that are not pure white
Image.fromarray((alpha*255).astype(np.uint8)).save('alpha.png')
np.save('fg.npy',fg)
body=binary_opening(fg,disk(28))
Image.fromarray((body*255).astype(np.uint8)).save('body.png')
sk=skeletonize(body)
ys,xs=np.nonzero(sk); print(len(xs))
np.save('sk.npy',np.c_[xs,ys])
a3=alpha[...,None]
rgb=np.where(a3>0.02,(im-(1-a3)*255)/np.maximum(a3,0.02),0)
# erode color fringe: shrink alpha 1px at the edge
alpha=np.minimum(alpha,ndi.grey_erosion(alpha,size=(3,3))*0.5+alpha*0.5)
rgba=np.dstack([np.clip(rgb,0,255),alpha*255]).astype(np.uint8)
Image.fromarray(rgba).save('fish_rgba.png')
