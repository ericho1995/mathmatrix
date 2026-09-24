"""Independent checks for Physics practice exam 1. Values use the VCAA data:
g = 9.81, G = 6.67e-11, ME = 5.98e24, RE = 6.37e6, k = 8.99e9, e = 1.60e-19,
me = 9.11e-31, h = 6.63e-34 J s = 4.14e-15 eV s, c = 3.00e8."""
import math
g, G, ME, RE, kC, e, me, h, heV, c = 9.81, 6.67e-11, 5.98e24, 6.37e6, 8.99e9, 1.60e-19, 9.11e-31, 6.63e-34, 4.14e-15, 3.00e8
f = lambda v, n=4: float(f'{v:.{n}g}')

print('== Section A ==')
T = 2*20*math.sin(math.radians(30))/g; print('A2 flight time', T, 'half', T/2, 'using cos', 2*20*math.cos(math.radians(30))/g)
v = math.sqrt(g*80*math.tan(math.radians(12))); print('A3 banked', v, 'sin', math.sqrt(g*80*math.sin(math.radians(12))), 'no tan', math.sqrt(g*80))
vf = 2*3/3; print('A4 v', vf, 'KE lost', 0.5*2*9 - 0.5*3*vf**2)
print('A5 spring v', math.sqrt(200*0.1**2/0.05), 'kx/m wrong', 200*0.1/0.05)
gs = G*ME/RE**2; print('A6 g surface', gs, 'at 2RE', G*ME/(2*RE)**2, 'half', gs/2)
print('A7 null point x', 3/3)   # (3-x)=2x
print('A10 Vs rms', 240*60/1200, 'peak', 240*60/1200*math.sqrt(2), 'rms/sqrt2', 12/math.sqrt(2))
I = 50e3/5000; print('A12 loss', I**2*4, 'wrong V^2/R', 5000**2/4)
print('A14 spacing mm', 600e-9*2.0/0.40e-3*1e3)
print('A16 lambda', h/math.sqrt(2*me*e*150), 'using V not eV', h/math.sqrt(2*me*150))
E = 13.6*(1 - 1/9); print('A17 E', E, 'lambda nm', heV*c/E*1e9)
gam = 1/math.sqrt(1 - 0.98**2); print('A18 gamma', gam, 'dilated us', 2.2*gam, 'contracted', 2.2/gam)

print('== Section B ==')
a = 1.0*g/4.0; print('B1 a', a, 'T', 3.0*a, 'weight hanging', 1.0*g)
ux, uy = 18*math.cos(math.radians(35)), 18*math.sin(math.radians(35)); t = 25/ux
y = uy*t - 0.5*g*t**2; print('B2 ux uy', ux, uy, 't', t, 'height at wall', y, 'clearance', y - 2.4, 'hmax', uy**2/(2*g), 'time hmax', uy/g)
Fnet = 400*12**2/8.0; print('B3 Fnet', Fnet, 'N', Fnet - 400*g, 'vmin', math.sqrt(g*8.0))
print('B4 impulse', 1200*15, 'F', 1200*15/0.080, 'rebound impulse', 1200*17)
Tp = 12*3600; r = (G*ME*Tp**2/(4*math.pi**2))**(1/3); print('B6 r', r, 'alt', r - RE, 'v', 2*math.pi*r/Tp, 'check sqrt(GM/r)', math.sqrt(G*ME/r))
print('B7 E', 500/0.020, 'F', e*500/0.020, 'v', math.sqrt(2*e*500/me))
m = e*0.50*0.083/2.0e5; print('B8 m', m, 'in u', m/1.66e-27)
print('B10 F', 50*1.5*0.040*0.20)
Phi = 0.30*0.010; print('B11 flux', Phi, 'avg emf quarter', 100*Phi/(0.25/50), 'period', 1/50)
Il = 400e3/13800; print('B12 I', Il, 'loss', Il**2*5, 'drop', Il*5, 'Vp ratio', 13800/690, 'direct I', 400e3/690, 'direct loss', (400e3/690)**2*5)
print('B13 dx mm', 532e-9*2.0/0.25e-3*1e3, 'path diff 3rd dark', 2.5*532e-9)
# B14 photoelectric: threshold 5.5e14, h (eV) from gradient; plotted line Ek = heV f - phi
phi = heV*5.5e14; print('B14 phi eV', phi, 'Ek at 7.5e14', heV*7.5e14 - phi, 'v', math.sqrt(2*(heV*7.5e14 - phi)*e/me))
lam = h/math.sqrt(2*me*e*54); print('B15 lambda', lam, 'Xray E keV', heV*c/lam/1e3)
gam = 1/math.sqrt(1 - 0.9**2); print('B16 gamma', gam, 'earth time', 12/0.9, 'crew time', 12/0.9/gam, 'crew distance', 12/gam)
# B18 current balance: I, dm (g)
I = [0.50, 1.00, 1.50, 2.00, 2.50]; dm = [0.62, 1.20, 1.85, 2.43, 3.05]
F = [x*1e-3*g for x in dm]; print('B18 F (mN)', [round(x*1e3, 2) for x in F])
n = len(I); mx = sum(I)/n; my = sum(F)/n
slope = sum((I[i]-mx)*(F[i]-my) for i in range(n))/sum((I[i]-mx)**2 for i in range(n)); icpt = my - slope*mx
print('   slope N/A', slope, 'intercept', icpt, 'B (l=0.050 m, n=1)', slope/0.050)
