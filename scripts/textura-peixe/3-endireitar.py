import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from scipy.interpolate import splprep, splev
path=np.load('path.npy')
# smooth
sm=np.c_[ndi.gaussian_filter1d(path[:,0],25,mode='nearest'),ndi.gaussian_filter1d(path[:,1],25,mode='nearest')]
sm=sm[::8]
# extend ends
def ext(a,b,L): d=(a-b)/np.linalg.norm(a-b); return a+d*L
head=ext(sm[0],sm[3],70); tail=ext(sm[-1],sm[-4],55)
ctrl=np.vstack([head,sm,tail])
tck,u=splprep(ctrl.T,s=len(ctrl)*6)
uu=np.linspace(0,1,4000); xy=np.array(splev(uu,tck)).T
seg=np.linalg.norm(np.diff(xy,axis=0),axis=1); arc=np.r_[0,np.cumsum(seg)]; L=arc[-1]; print('length',L)
N=int(round(L)); s=np.linspace(0,L,N)
X=np.interp(s,arc,xy[:,0]);Y=np.interp(s,arc,xy[:,1])
dx=np.gradient(X);dy=np.gradient(Y);n=np.hypot(dx,dy);tx,ty=dx/n,dy/n
nx,ny=-ty,tx   # normal
H=440; t=np.arange(H)-H/2
im=np.asarray(Image.open('fish_rgba.png')).astype(float)
pm=im.copy(); pm[...,:3]*=pm[...,3:4]/255
# coordinates: output (row=t, col=s)
Xs=X[None,:]+t[:,None]*nx[None,:]; Ys=Y[None,:]+t[:,None]*ny[None,:]
out=np.stack([ndi.map_coordinates(pm[...,c],[Ys,Xs],order=1,cval=0) for c in range(4)],-1)
# head-on-right: column index s=0 is head -> flip
out=out[:,::-1]
a=out[...,3:4]; rgb=np.where(a>0,out[...,:3]*255/np.maximum(a,1e-3),0)
res=np.dstack([np.clip(rgb,0,255),a]).astype(np.uint8)
# crop to alpha bbox
ys,xs=np.nonzero(res[...,3]>8); y0=max(0,ys.min()-2);x0=max(0,xs.min()-2);res=res[y0:ys.max()+3, x0:xs.max()+3]
print('crop',res.shape, 'spine row in crop', H/2-y0, x0)
Image.fromarray(res).save('fish_straight.png')
dbg=Image.open('fish_rgba.png').convert('RGB');d=ImageDraw.Draw(dbg)
d.line(list(zip(X,Y)),fill=(255,0,0),width=3)
for i in range(0,N,60): d.line([(X[i]-nx[i]*150,Y[i]-ny[i]*150),(X[i]+nx[i]*150,Y[i]+ny[i]*150)],fill=(0,120,255),width=1)
dbg.save('spine_dbg2.png')
