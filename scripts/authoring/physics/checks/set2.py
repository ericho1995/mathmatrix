"""Independent checks for Physics practice exam 2 (VCAA data values)."""
import math
g, G, e, me, h, heV, c = 9.81, 6.67e-11, 1.60e-19, 9.11e-31, 6.63e-34, 4.14e-15, 3.00e8
hc = heV*c

print('== Section A ==')
print('A1 lift up', 60*(g+1.5), 'down', 60*(g-1.5), 'mg', 60*g, 'ma', 60*1.5)
t = math.sqrt(2*1.25/g); vy = g*t; print('A2 t', t, 'vy', vy, 'v', math.hypot(3, vy), 'sum', 3+vy)
print('A3 hump', math.sqrt(g*20), 'sqrt r', math.sqrt(20), 'sqrt 2gr', math.sqrt(2*g*20), 'gr', g*20)
print('A4 recoil', 0.020*400/4.0)
print('A5 spring E', 0.5*30*0.15, 'k', 30/0.15)
print('A6 g planet', g*2/4)
print('A10 flux', 0.40*0.050*math.sin(math.radians(30)), 'cos', 0.40*0.050*math.cos(math.radians(30)))
print('A12 Ip', 2.0*12/240, 'P', 12*2)
print('A13 peak', 15*math.sqrt(2), 'pp', 2*15*math.sqrt(2), 'rms/sqrt2', 15/math.sqrt(2))
E = hc/250e-9; print('A15 E', E, 'stop V', E - 2.3)
print('A16 p', h/500e-9, 'E J', h*c/500e-9, 'hc', h*c, 'h/(lam c)', h/(500e-9*c))
gam = 1/math.sqrt(1 - 0.6**2); print('A18 L', 100/gam, '/g^2', 100/gam**2, 'x0.6', 60, 'x g', 100*gam)
P = 3.8e26; print('A19 m/s', P/c**2, 'P/c', P/c, 'Pc2', P*c**2)

print('== Section B ==')
m = 5.0; th = math.radians(20); W = m*g*math.sin(th); N = m*g*math.cos(th)
print('B1 Wpar', W, 'Fnet', 30 - W - 8, 'a', (30 - W - 8)/m, 'N', N, 'decel', (W + 8)/m)
u, th = 15.0, math.radians(40); ux, uy = u*math.cos(th), u*math.sin(th)
tt = (uy + math.sqrt(uy**2 + 2*g*20))/g
print('B2 ux uy', ux, uy, 't top', uy/g, 'hmax above ground', 20 + uy**2/(2*g), 't land', tt, 'range', ux*tt, 'vy land', uy - g*tt, 'speed', math.hypot(ux, uy - g*tt))
L, th, mb = 1.2, math.radians(30), 0.50; r = L*math.sin(th)
print('B3 r', r, 'T', mb*g/math.cos(th), 'v', math.sqrt(r*g*math.tan(th)), 'period', 2*math.pi*r/math.sqrt(r*g*math.tan(th)))
p0 = 2*4 - 3*1; v3 = (p0 + 2*1)/3; KEb = 0.5*2*16 + 0.5*3*1; KEa = 0.5*2*1 + 0.5*3*v3**2
print('B4 p', p0, 'v3', v3, 'KE before', KEb, 'after', KEa, 'impulse on 2kg', 2*(-1 - 4))
MM, RM, rP = 6.42e23, 3.39e6, 9.38e6
print('B5 g Mars', G*MM/RM**2, 'T s', 2*math.pi*math.sqrt(rP**3/(G*MM)), 'T h', 2*math.pi*math.sqrt(rP**3/(G*MM))/3600, 'v', math.sqrt(G*MM/rP))
Ef = 200/0.020; a = e*Ef/me; tp = 0.050/3.0e7
print('B6 E', Ef, 'a', a, 't', tp, 'y', 0.5*a*tp**2, 'vy', a*tp, 'mg', me*g, 'eE', e*Ef)
mp = 1.67e-27; v = e*0.25*0.40/mp
print('B7 v', v, 'T', 2*math.pi*mp/(e*0.25), 'alpha r', (4*mp*v)/(2*e*0.25), 'KE eV', 0.5*mp*v**2/e)
print('B8 t in', 0.10/0.50, 'dPhi', 0.40*0.10**2, 'emf', 20*0.40*0.01/0.20, 'I (R=2.0)', 20*0.40*0.01/0.20/2.0)
print('B9 ratio', 240/6, 'Ip', 6*1.5/240, 'Vpk', 6*math.sqrt(2), 'P', 9.0)
I = 12e3/240; print('B10 I', I, 'drop', I*0.4, 'Vhouse', 240 - I*0.4, 'loss', I**2*0.4, '%', I**2*0.4/12e3*100, 'stepped I', 12e3/2400, 'loss', (12e3/2400)**2*0.4)
E = hc/400e-9; phi = E - 0.95; print('B11 E', E, 'phi', phi, 'f0', phi/heV, 'lam0 nm', hc/phi*1e9)
lv = {1: -10.4, 2: -5.5, 3: -3.7, 4: -1.6}
gaps = sorted((abs(lv[i] - lv[j]), i, j) for i in lv for j in lv if i > j)
print('B12 gaps', gaps, 'longest lam nm', hc/gaps[0][0]*1e9, 'shortest', hc/gaps[-1][0]*1e9)
p = math.sqrt(2*me*e*5000); print('B13 p', p, 'lam', h/p, 'lam 20kV', h/math.sqrt(2*me*e*20000))
gam = 1/math.sqrt(1 - 0.99**2); E0 = me*c**2
print('B14 gamma', gam, 'E0', E0, 'Etot', gam*E0, 'Ek', (gam - 1)*E0, 'Ek MeV', (gam - 1)*E0/e/1e6, 'classical', 0.5*me*(0.99*c)**2)
# B15 whirling stopper: r = 0.50 m, hanging masses
mh = [0.050, 0.100, 0.150, 0.200, 0.250]; t20 = [20.2, 14.1, 11.6, 10.1, 8.9]
F = [x*g for x in mh]; vv = [2*math.pi*0.50*20/t for t in t20]; v2 = [x**2 for x in vv]
print('B15 F', [round(x, 3) for x in F], 'v', [round(x, 2) for x in vv], 'v2', [round(x, 1) for x in v2])
n = 5; mx = sum(v2)/n; my = sum(F)/n
sl = sum((v2[i] - mx)*(F[i] - my) for i in range(n))/sum((v2[i] - mx)**2 for i in range(n))
print('   slope F/v2', sl, 'icpt', my - sl*mx, 'mass', sl*0.50, 'origin slope', sum(F[i]*v2[i] for i in range(n))/sum(x*x for x in v2))
