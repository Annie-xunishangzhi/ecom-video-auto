import sys,numpy as np
from PIL import Image
from scipy import ndimage
def key(src,dst):
    a=np.array(Image.open(src).convert('RGB')).astype(float);R,G,B=a[...,0],a[...,1],a[...,2]
    m=np.minimum(R,B)-G
    alpha=1-np.clip((m-70)/(170-70),0,1)
    # keep largest component + anything attached
    solid=alpha>0.5;lab,n=ndimage.label(solid);sz=ndimage.sum(solid,lab,range(1,n+1))
    keep=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>0.02*sz.max()])
    near=ndimage.binary_dilation(keep,iterations=3)
    alpha=np.where(near,alpha,0);alpha=np.where(keep&(alpha>0.5),np.maximum(alpha,0),alpha)
    # fill holes inside figure that look magenta? (none expected) ; despill near edges
    edge=ndimage.binary_dilation(alpha<0.99,iterations=4)
    k=np.clip(m,0,None)*np.where(edge,1.0,0.0)
    a[...,0]-=k;a[...,2]-=k
    out=np.dstack([np.clip(a,0,255),alpha*255]).astype(np.uint8)
    im=Image.fromarray(out,'RGBA');bb=im.getbbox();im=im.crop(bb);im.save(dst);return im.size
if __name__=='__main__':
    for s in sys.argv[1:]: print(s,key(s,s.replace('v2_','cut_')))
