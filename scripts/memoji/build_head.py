"""
Rebuilds the homepage memoji head from its reference sheet.

    python3 scripts/memoji/build_head.py

Needs numpy, pillow, scipy, scikit-image, trimesh, rtree and
fast-simplification. Reads reference-views.jpg (front, left, right, back,
top and 3/4 views in a 3x2 grid) and writes public/memoji/head.bin and
public/memoji/views.jpg, which components/home/memoji/head.ts loads.

1. Cut each view out of the sheet and mask the head from the background.
2. Build the volume that fits every silhouette (a visual hull), with
   rounded cross-sections, and the ears and nose placed where the side view
   draws them.
3. Smooth and simplify it, and record which views can see each vertex.
4. Pack the views into an atlas for the shader to project onto the head.

If the bounding boxes change, update HALF_WIDTH, HALF_DEPTH and RECTS in
head.ts from the values this prints.
"""
import json, os, struct
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import measure
import trimesh
import fast_simplification

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "public", "memoji")
WORK = os.path.join(HERE, ".work")
os.makedirs(WORK, exist_ok=True)
os.chdir(WORK)

# --- 1. Views and masks -----------------------------------------------------
sheet = Image.open(os.path.join(HERE, "reference-views.jpg")).convert("RGB")
CELLS = {"front": (0, 0, 338, 392), "left": (342, 0, 682, 392), "right": (686, 0, 1024, 392),
         "back": (0, 441, 338, 836), "top": (342, 441, 682, 836)}
for k, box in CELLS.items():
    sheet.crop(box).save(f"v_{k}.png")
ks = list(CELLS)
bg = np.array([44, 44, 46.0])
for k in ks:
    c=np.asarray(Image.open(f'v_{k}.png').convert('RGB')).astype(float)
    d=np.abs(c-bg).sum(axis=2)
    rb=ndi.gaussian_filter(c[...,0]-c[...,2],2)
    m=(d>14)|(rb>1.2)
    m=ndi.binary_opening(m,iterations=2)
    lab,n=ndi.label(m); sizes=ndi.sum(m,lab,range(1,n+1))
    keep=lab==(np.argmax(sizes)+1)
    keep=ndi.binary_fill_holes(ndi.binary_closing(keep,iterations=4))
    keep=ndi.binary_opening(keep,iterations=2)
    Image.fromarray((keep*255).astype(np.uint8)).save(f'm_{k}.png')
    ys,xs=np.where(keep); print(k,xs.min(),xs.max(),ys.min(),ys.max())

# --- 2/3. Volume, smoothing, visibility -----------------------------------------
# Bounding boxes (pixels, inside each cell) from the masks.
def bbox(k):
    m=np.asarray(Image.open(f'm_{k}.png'))>127
    ys,xs=np.where(m); return m,(xs.min(),xs.max(),ys.min(),ys.max())
views={k:bbox(k) for k in ['front','back','left','right','top']}
H=2.2; Y0=1.1
fb=views['front'][1]; lb=views['left'][1]
Wx=H*(fb[1]-fb[0])/(fb[3]-fb[2])/2
D2=H*(lb[1]-lb[0])/(lb[3]-lb[2])/2
print('Wx',Wx,'D2',D2)

def sample(k,s,t):
    """s,t in [0,1] across the view's bbox -> mask value."""
    m,(x0,x1,y0,y1)=views[k]
    px=np.clip(np.round(x0+s*(x1-x0)).astype(int),0,m.shape[1]-1)
    py=np.clip(np.round(y0+t*(y1-y0)).astype(int),0,m.shape[0]-1)
    inside=(s>=0)&(s<=1)&(t>=0)&(t<=1)
    return m[py,px]&inside

N=200
mx=1.06
xs=np.linspace(-Wx*mx,Wx*mx,N); ys=np.linspace(-Y0*mx,Y0*mx,N); zs=np.linspace(-D2*mx,D2*mx,N)
X,Yg,Z=np.meshgrid(xs,ys,zs,indexing='ij')
t=(Y0-Yg)/(2*Y0)
hull=sample('front',(X+Wx)/(2*Wx),t)
hull&=sample('back',(Wx-X)/(2*Wx),t)
side=sample('left',(D2-Z)/(2*D2),t)&sample('right',(Z+D2)/(2*D2),t)
top=sample('top',(X+Wx)/(2*Wx),(Z+D2)/(2*D2))
hull&=side&top

# Per-row extents. Front: x range with the ears replaced by a straight
# interpolation (the "core" head). Side: z range.
mF,(fx0,fx1,fy0,fy1)=views['front']
EAR0,EAR1=206,300
rows=np.arange(mF.shape[0])
left=np.array([np.where(mF[y])[0].min() if mF[y].any() else np.nan for y in rows],float)
right=np.array([np.where(mF[y])[0].max() if mF[y].any() else np.nan for y in rows],float)
for arr in (left,right):
    arr[EAR0:EAR1+1]=np.linspace(arr[EAR0],arr[EAR1],EAR1-EAR0+1)
def px_to_x(px): return (px-fx0)/(fx1-fx0)*2*Wx-Wx
py=np.clip(np.round(fy0+t*(fy1-fy0)).astype(int),0,len(rows)-1)
xl=px_to_x(left[py]); xr=px_to_x(right[py])
core=(X>=xl)&(X<=xr)
# side z-range per row from the side occupancy itself
zmax=np.where(side,Z,-9).max(axis=2,keepdims=True)
# The face profile without the nose: interpolate the side view's front edge
# across the nose rows so the nose doesn't widen the whole face.
mL,(lx0,lx1,ly0,ly1)=views['left']
NOSE0,NOSE1=244,296
lrows=np.arange(mL.shape[0])
lfront=np.array([np.where(mL[y])[0].min() if mL[y].any() else np.nan for y in lrows],float)
lfront[NOSE0:NOSE1+1]=np.linspace(lfront[NOSE0],lfront[NOSE1],NOSE1-NOSE0+1)
lpy=np.clip(np.round(ly0+t*(ly1-ly0)).astype(int),0,len(lrows)-1)
zfront=D2-(lfront[lpy]-lx0)/(lx1-lx0)*2*D2
zmax=np.minimum(zmax,np.nanmax(zfront,axis=2,keepdims=True))
zmin=np.where(side,Z,9).min(axis=2,keepdims=True)
xc=(xl+xr)/2; hx=(xr-xl)/2+1e-6
zc=(zmax+zmin)/2; hz=(zmax-zmin)/2+1e-6
u=np.abs((X-xc)/hx); v=(Z-zc)/hz
n=np.where(v>0,2.1,2.4)
ell=(u**n+np.abs(v)**n)<=1
body=core&side&top&ell&np.isfinite(xl)
earrows=(py>=EAR0-4)&(py<=EAR1+4)
# Ears sit where the side view draws them (the top view places them a
# little further forward; the side view is the one people see).
earz=((Z+0.39)/0.22)**2+((Yg+0.27)/0.34)**2<=1
ears=sample('front',(X+Wx)/(2*Wx),t)&~core&earz
noserows=(lpy>=NOSE0-2)&(lpy<=NOSE1+2)
nose=hull&noserows&(np.abs(X)<0.24)&(Z>0)
occ=body|ears|nose
print('occupied',occ.mean())
f=ndi.gaussian_filter(occ.astype(np.float32),1.4)
verts,faces,_,_=measure.marching_cubes(f,0.5,spacing=(xs[1]-xs[0],ys[1]-ys[0],zs[1]-zs[0]))
verts+=np.array([xs[0],ys[0],zs[0]])
mesh=trimesh.Trimesh(verts,faces[:,::-1],process=True)
if mesh.volume<0: mesh.invert()
trimesh.smoothing.filter_taubin(mesh,iterations=10)
print('raw',len(mesh.vertices),len(mesh.faces))
v2,f2=fast_simplification.simplify(mesh.vertices.astype(np.float32),mesh.faces.astype(np.int32),target_count=30000)
mesh=trimesh.Trimesh(v2,f2,process=True)
print('dec',len(mesh.vertices),len(mesh.faces), 'watertight',mesh.is_watertight)

v=mesh.vertices; n=mesh.vertex_normals
dirs=np.array([[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,1,0]],float)  # front, back, left(+x), right(-x), top
ray=trimesh.ray.ray_triangle.RayMeshIntersector(mesh)
vis=np.zeros((len(v),5),np.uint8)
for i,d in enumerate(dirs):
    facing=(n@d)>-0.05
    idx=np.where(facing)[0]
    origins=v[idx]+d*2e-3+n[idx]*1e-3
    hit=ray.intersects_any(origins,np.repeat(d[None],len(idx),0))
    vis[idx[~hit],i]=255
    print(i,(~hit).sum(),'/',len(idx))
nv=len(v); faces=mesh.faces.astype(np.uint16 if nv<65536 else np.uint32)
with open(os.path.join(OUT,'head.bin'),'wb') as f:
    f.write(struct.pack('<II',nv,faces.size))
    f.write(v.astype('<f4').tobytes())
    f.write(vis.tobytes())
    pad=(-(5*nv))%4; f.write(b'\0'*pad)
    f.write(faces.astype('<u2').tobytes())

# --- 4. Atlas ------------------------------------------------------------------
order = ["front", "back", "left", "right", "top"]
pad = 3
crops = {}
for k in order:
    x0, x1, y0, y1 = views[k][1]
    crops[k] = Image.open(f"v_{k}.png").convert("RGB").crop((x0 - pad, y0 - pad, x1 + 1 + pad, y1 + 1 + pad))
cw = max(c.size[0] for c in crops.values()); ch = max(c.size[1] for c in crops.values())
W, H2 = cw * 3, ch * 2
atlas = Image.new("RGB", (W, H2), (44, 44, 46))
rects = {}
for i, k in enumerate(order):
    c = crops[k]; ox = (i % 3) * cw; oy = (i // 3) * ch
    atlas.paste(c, (ox, oy))
    px0 = ox + pad; px1 = ox + c.size[0] - pad - 1; py0 = oy + pad; py1 = oy + c.size[1] - pad - 1
    rects[k] = [round((px0 + 0.5) / W, 5), round(1 - (py0 + 0.5) / H2, 5),
                round((px1 + 0.5) / W, 5), round(1 - (py1 + 0.5) / H2, 5)]
atlas.save(os.path.join(OUT, "views.jpg"), quality=88)
print("HALF_WIDTH", round(Wx, 5), "HALF_DEPTH", round(D2, 5))
print("RECTS", json.dumps(rects))
