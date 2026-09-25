"""Independent checks for Physics practice exam 4 (VCAA data values)."""
import math
g, G, ME, RE, kC, e, me, h, heV, c = 9.81, 6.67e-11, 5.97e24, 6.37e6, 8.99e9, 1.60e-19, 9.11e-31, 6.63e-34, 4.14e-15, 3.00e8
hc = heV*c

print('== Section A ==')
print('A2 dp', 0.15*35, 'sub', 0.15*5)
print('A3 T bottom', 30*g + 30*16/2.5, 'mg', 30*g, 'mg-mv2/r', 30*g - 30*16/2.5, 'r halved', 30*g + 30*16/1.25)
print('A6 g at 3R', G*ME/(3*RE)**2, 'at 2R', G*ME/(2*RE)**2, 'div3', G*ME/RE**2/3)
print('A7 T ratio', 4**1.5)
I = 1000/240; print('A11 Irms', I, 'peak', I*math.sqrt(2), 'rms/sqrt2', I/math.sqrt(2))
print('A13 eff', 12*9.0/(240*0.50))
print('A14 E eV', hc/600e-9, 'J', h*c/600e-9)
print('A16 lam', h/(0.145*40), 'h/m', h/0.145, 'h/(m v^2)', h/(0.145*1600), 'h v/m', h*40/0.145)
for (a, b) in [(4, 2), (5, 2), (3, 2), (2, 1), (99999, 2)]:
    E = 13.6*(1/b**2 - 1/a**2); print('A18', a, '->', b, E, 'nm', hc/E*1e9)

print('== Section B ==')
m = 800; print('B1 T up', m*(g + 1.2), 'v', 1.2*2.0, 't dec', 2.4/1.5, 'T dec', m*(g - 1.5), 'app wt 60kg', 60*(g - 1.5))
t = math.sqrt(2*180/g); vy = g*t; print('B2 t', t, 'x', 60*t, 'vy', vy, 'v', math.hypot(60, vy), 'angle', math.degrees(math.atan2(vy, 60)))
print('B3 v design', math.sqrt(120*g*math.tan(math.radians(18))))
print('B4 v2', 1.0*12/2.0, 'KE', 0.5*1*144 + 0.5*2*36, 'F avg', 1.0*12/0.020)
MM, d = 7.35e22, 3.84e8
gE = G*ME/d**2; print('B5 gE at moon', gE, 'v moon', math.sqrt(gE*d), 'T days', 2*math.pi*d/math.sqrt(gE*d)/86400)
x = d*math.sqrt(ME)/(math.sqrt(ME) + math.sqrt(MM)); print('   null x', x, 'from moon', d - x, 'check', G*ME/x**2, G*MM/(d - x)**2)
E = 2500/0.015; print('B6 E', E, 'F', e*E, 'v', math.sqrt(2*e*2500/me), 'proton v', math.sqrt(2*e*2500/1.67e-27))
print('B7 F', 5.0*0.20*0.50, 'a', 5.0*0.20*0.50/0.10)
print('B8 f', 1/0.040, 'avg emf quarter', 150*5e-3/0.010, 'peak (NBAw)', 150*5e-3*2*math.pi*25)
print('B9 ratio', 11000/240, 'Is', 50*2400/240, 'Ip', 50*2400/11000)
for V in (22e3, 66e3):
    I = 5e6/V; print('B10 V', V, 'I', I, 'loss', I**2*8.0, '%', I**2*8.0/5e6*100, 'drop', I*8.0)
Ek = 1.2*e; E = 1.2 + 2.1; print('B11 Ek J', Ek, 'photon eV', E, 'lam nm', hc/E*1e9, 'electrons/s', 4.0e-6/e)
print('B12 d mm', 650e-9*1.5/2.6e-3*1e3)
gam = 1/math.sqrt(1 - 0.995**2); tE = 15000/(0.995*c); t0 = tE/gam
print('B13 gamma', gam, 'tE us', tE*1e6, 'L muon km', 15/gam, 't0 us', t0*1e6, 'half-lives', t0/1.56e-6, 'fraction', 0.5**(t0/1.56e-6), 'no-relativity half-lives', tE/1.56e-6, 'frac', 0.5**(tE/1.56e-6))
E = me*c**2; print('B14 E J', E, 'MeV', E/e/1e6, 'lam', h*c/E, 'p', E/c)
hh = [0.05, 0.10, 0.20, 0.30, 0.40]; vv = [math.sqrt(2*g*x) for x in hh]; emf = [35, 48, 71, 84, 99]
print('B15 v', [round(x, 2) for x in vv])
n = 5; mx = sum(vv)/n; my = sum(emf)/n
sl = sum((vv[i] - mx)*(emf[i] - my) for i in range(n))/sum((vv[i] - mx)**2 for i in range(n)); ic = my - sl*mx
v6 = math.sqrt(2*g*0.60); print('   slope', sl, 'icpt', ic, 'v(0.60)', v6, 'pred', sl*v6 + ic, 'origin pred', v6*sum(emf[i]*vv[i] for i in range(n))/sum(x*x for x in vv))
