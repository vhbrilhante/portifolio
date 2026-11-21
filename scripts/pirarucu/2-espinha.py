import numpy as np, collections
from PIL import Image, ImageDraw
pts=np.load('sk.npy'); S=set(map(tuple,pts))
nb=lambda p:[(p[0]+dx,p[1]+dy) for dx in(-1,0,1) for dy in(-1,0,1) if (dx or dy) and (p[0]+dx,p[1]+dy) in S]
def bfs(s):
    prev={s:None};q=collections.deque([s]);last=s
    while q:
        p=q.popleft();last=p
        for n in nb(p):
            if n not in prev: prev[n]=p;q.append(n)
    return last,prev
a,_=bfs(tuple(pts[0])); b,prev=bfs(a)
path=[];p=b
while p: path.append(p);p=prev[p]
path=np.array(path,float)
if path[0,1]>path[-1,1]: path=path[::-1]  # start at head (top)
print(len(path),path[0],path[-1])
np.save('path.npy',path)
img=Image.open('fish_rgba.png').convert('RGB');d=ImageDraw.Draw(img)
d.line([tuple(p) for p in path],fill=(255,0,0),width=3)
img.save('spine_dbg.png')
