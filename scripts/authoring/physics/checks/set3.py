"""Independent checks for Physics practice exam 3 (VCAA data values)."""
import math
g, G, ME, RE, kC, e, me, h, heV, c = 9.81, 6.67e-11, 5.98e24, 6.37e6, 8.99e9, 1.60e-19, 9.11e-31, 6.63e-34, 4.14e-15, 3.00e8
hc = heV*c

print('== Section A ==')
print('A1 resist', 4500 - 1500*2.0)
print('A3 power', 70*g*12/20, 'energy', 70*g*12)
print('A4 impulse', 0.5*400*0.050, 'v', 0.5*400*0.050/0.20, 'rect v', 400*0.050/0.20)
print('A5 friction', 1200*15**2/50, 'mv/r', 1200*15/50, 'a', 15**2/50, 'mg', 1200*g)
print('A7 alpha energy J', 2*e*1000)
print('A8 F', 0.25*3.0*0.40, 'cm slip', 25*3.0*0.40)
print('A10 emf', 50*0.020/0.010, 'one turn', 0.020/0.010)
print('A12 Ns', 200*6000/240, 'inverted', 200*240/6000)
print('A16 lam0 nm (4.5 eV)', hc/4.5*1e9)
gam = 1/math.sqrt(1 - 0.8**2); print('A18 gamma', gam, 't', gam, 'g^2', gam**2, '1/g', 1/gam)

print('== Section B ==')
a = (3200 - 300 - 100)/1600; print('B1 a', a, 'T', 400*a + 100)
u, th = 7.2, math.radians(52); ux, uy = u*math.cos(th), u*math.sin(th); tt = 4.20/ux
y = 2.10 + uy*tt - 0.5*g*tt**2; vy = uy - g*tt
print('B2 ux uy', ux, uy, 't', tt, 'y at hoop', y, 'vy', vy, 'speed', math.hypot(ux, vy), 'angle below horiz', math.degrees(math.atan2(-vy, ux)), 'hmax', 2.10 + uy**2/(2*g))
v1 = math.sqrt(2*g*0.050); vb = (2.010*v1)/0.010
print('B3 v block', v1, 'bullet', vb, 'KE bullet', 0.5*0.010*vb**2, 'KE after', 0.5*2.010*v1**2, '% lost', (1 - 2.010*v1**2/(0.010*vb**2))*100)
Es = 0.5*800*0.20**2; print('B4 Es', Es, 'v launch', math.sqrt(2*Es/2.0), 'v top', math.sqrt(2*(Es - 2.0*g*0.60)/2.0), 'hmax', Es/(2.0*g))
GM = G*ME; print('B5 g(2RE)', GM/(2*RE)**2, 'g surface', GM/RE**2, 'E per kg', GM*(1/RE - 1/(2*RE)), 'for 500 kg', 500*GM*(1/RE - 1/(2*RE)), 'mgh naive', 500*9.81*RE, 'v orbit', math.sqrt(GM/(2*RE)))
# grid estimate: trapezoid with 1e6 m steps for the chart
rs = [RE + i*(RE/20) for i in range(21)]; tr = sum((GM/rs[i]**2 + GM/rs[i+1]**2)/2*(rs[i+1] - rs[i]) for i in range(20)); print('   trapz', tr)
F = kC*4e-6*2e-6/0.30**2; E1 = kC*4e-6/0.15**2; E2 = kC*2e-6/0.15**2
print('B6 F', F, 'E1', E1, 'E2', E2, 'Etot', E1 + E2, 'force on e', e*(E1 + E2))
print('B7 v', 2.0e4/0.050, 'r', me*(2.0e4/0.050)/(e*0.050))
print('B8 emf1', 200*0.004/0.020, 'emf3', 200*0.004/0.010)
Vr = 325/math.sqrt(2); I = Vr/100; print('B9 Vrms', Vr, 'I', I, 'P', Vr*I, 'peak P', 325**2/100, 'half freq peak', 325/2)
I = 60e6/330e3; Vend = 330e3 - I*12; print('B10 I', I, 'loss', I**2*12, '%', I**2*12/60e6*100, 'ratio', 330/22, 'Vend', Vend, 'Vtown', Vend/15)
phiB = heV*6.0e14; print('B11 phi A', heV*4.4e14, 'phi B', phiB, 'V0 B at 8e14', heV*8e14 - phiB, 'V0 A at 8e14', heV*8e14 - heV*4.4e14)
print('B12 lambda', 900e-9/1.5)
mD, mT, mHe, mn = 3.3436e-27, 5.0074e-27, 6.6447e-27, 1.6749e-27
dm = mD + mT - mHe - mn; E = dm*c**2; print('B13 dm', dm, 'E J', E, 'MeV', E/e/1e6, 'per s for 1 GW', 1e9/E)
p = h/0.15e-9; mN = 1.675e-27; print('B14 p', p, 'Ek e J', p**2/(2*me), 'eV', p**2/(2*me)/e, 'Ek n J', p**2/(2*mN), 'eV', p**2/(2*mN)/e)
hh = [0.10, 0.20, 0.30, 0.40, 0.50]; vv = [1.31, 1.89, 2.31, 2.66, 2.98]; v2 = [x**2 for x in vv]
print('B15 v2', [round(x, 2) for x in v2])
n = 5; mx = sum(hh)/n; my = sum(v2)/n
sl = sum((hh[i] - mx)*(v2[i] - my) for i in range(n))/sum((hh[i] - mx)**2 for i in range(n))
print('   slope', sl, 'icpt', my - sl*mx, 'g est', sl/2)
