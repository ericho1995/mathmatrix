"""Independent checks for Physics practice exam 5 (VCAA data values)."""
import math
g, G, ME, RE, kC, e, me, h, heV, c = 9.81, 6.67e-11, 5.97e24, 6.37e6, 8.99e9, 1.60e-19, 9.11e-31, 6.63e-34, 4.14e-15, 3.00e8
hc = heV*c; mp = 1.67e-27

print('== Section A ==')
a = 20/5; print('A1 a', a, 'contact', 3*a, '2kg net', 2*a)
print('A2 v', math.sqrt(25 + 2*10*3/2), 'ignore u', math.sqrt(2*30/2), 'no 2', math.sqrt(25 + 15))
print('A3 T', 2*math.pi*12/6)
print('A4 k', 0.20*g/0.05, 'mgx', 0.20*g*0.05, 'mm', 0.20*g/0.005)
print('A12 I', 2000/240, 'loss', (2000/240)**2*0.5, 'drop', 2000/240*0.5, 'V2/R', 240**2/0.5)
print('A14 photons/s', 5e-3*650e-9/(h*c))
print('A15 lam0 nm', hc/2.3*1e9)
gam = 1/math.sqrt(1 - 0.8**2); E0 = mp*c**2
print('A17 Ek', (gam - 1)*E0, 'rest', E0, 'total', gam*E0, 'classical', 0.5*mp*(0.8*c)**2)
print('A19 ratio', mp/me, 'sqrt', math.sqrt(mp/me))

print('== Section B ==')
F = 60*g*math.sin(math.radians(25)) - 120; a = F/60; print('B1 Fpar', 60*g*math.sin(math.radians(25)), 'Fnet', F, 'a', a, 'v', math.sqrt(2*a*50), 'heat', 120*50)
u, th = 25, math.radians(20); ux, uy = u*math.cos(th), u*math.sin(th); T = 2*uy/g
print('B2 ux uy', ux, uy, 'T', T, 'R', ux*T, 'hmax', uy**2/(2*g), 'vmin for 30 m', math.sqrt(30*g/math.sin(2*th)))
m, r = 0.20, 0.80; vt = 4.0; Tt = m*vt**2/r - m*g; vb2 = vt**2 + 2*g*2*r
print('B3 T top', Tt, 'v bottom', math.sqrt(vb2), 'T bottom', m*vb2/r + m*g, 'vmin top', math.sqrt(g*r))
print('B4 x', 2.0*math.sqrt(0.5/200), 'Fmax', 200*2.0*math.sqrt(0.5/200), 'impulse', 0.5*4.0)
rI = RE + 420e3; v = math.sqrt(G*ME/rI)
print('B5 r', rI, 'v', v, 'T s', 2*math.pi*rI/v, 'T min', 2*math.pi*rI/v/60, 'g', G*ME/rI**2, 'ratio', G*ME/rI**2/9.81)
m, d = 3.2e-15, 0.012; V = m*g*d/(3*e); print('B6 V for 3e', V)
V = 785; E = V/d; q = m*g/E; print('   E', E, 'weight', m*g, 'q', q, 'n', q/e, 'q+e net F', (q + e)*E - m*g, 'a', ((q + e)*E - m*g)/m)
Fe = kC*e**2; Fg = G*mp**2; print('B7 ratio', Fe/Fg)
print('B8 f', 1/0.025, 'Vrms', 36/math.sqrt(2), 'P', (36/math.sqrt(2))**2/12)
I = 20e6/220e3; print('B10 I', I, 'loss', I**2*25, 'drop', I*25, 'Vin', 220e3 - I*25, 'eff', (20e6 - I**2*25)/20e6, 'half R loss', I**2*12.5, 'double V loss', (I/2)**2*25)
n = 1000*550e-9/(h*c); p = h/550e-9; print('B11 n', n, 'p', p, 'F', n*p, 'P/c', 1000/c)
for E in (4.67, 4.89, 5.46, 6.70, 5.46 - 4.89, 6.70 - 4.89, 6.70 - 5.46):
    print('B12 E', round(E, 2), 'nm', hc/E*1e9)
gam = 6.5e12/938e6; beta = math.sqrt(1 - 1/gam**2)
print('B13 gamma', gam, '1-beta', 1 - beta, 'L', 27e3/gam, 't lab', 27e3/c, 't proper', 27e3/c/gam)
lam = h/math.sqrt(2*me*e*150); print('B14 lam', lam, 'dx', lam*1.0/1.0e-7, 'lam 600 V', h/math.sqrt(2*me*e*600))
lams = [940, 660, 590, 525, 470]; Vt = [1.29, 1.85, 2.08, 2.33, 2.61]
x = [1/(l*1e-9)/1e6 for l in lams]; print('B15 1/lam (e6)', [round(v, 3) for v in x], 'ideal V', [round(1240/l, 2) for l in lams])
n = 5; mx = sum(x)/n; my = sum(Vt)/n
sl = sum((x[i] - mx)*(Vt[i] - my) for i in range(n))/sum((x[i] - mx)**2 for i in range(n))
print('   slope V per 1e6 m^-1', sl, 'icpt', my - sl*mx, 'slope V m', sl*1e-6, 'h', sl*1e-6*e/c, '% diff', (sl*1e-6*e/c - 6.63e-34)/6.63e-34*100)
