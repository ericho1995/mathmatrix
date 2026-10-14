"""Independent checks for Physics practice exam 8 (VCAA data values)."""
import math
import numpy as np
g, G, ME, RE, kC, e, me, h, heV, c = 9.81, 6.67e-11, 5.97e24, 6.37e6, 8.99e9, 1.60e-19, 9.11e-31, 6.63e-34, 4.14e-15, 3.00e8
hc = heV*c; mp = 1.67e-27
rad = math.radians

print('== Section A ==')
m, th = 5.0, rad(30)
print('A1 friction mg sin', m*g*math.sin(th), 'mg cos', m*g*math.cos(th), 'mg', m*g)
print('A2 (conceptual) horizontal launch vs drop: same time, thrown lands faster')
m, v, t = 1500, 18.0, 9.0
KE = 0.5*m*v**2; print('A3 KE', KE, 'P', KE/t, 'no half', m*v**2/t, 'F=mv/t', m*v/t, 'KE kJ', KE/1e3)
print('A4 (conceptual) equal masses elastic: first stops, second moves off at u')
m, r, f = 0.30, 0.60, 1.5
v = 2*math.pi*r*f; print('A5 v', v, 'T', m*v**2/r, 'v=rf', m*(r*f)**2/r, 'v=2pi r/f', m*(2*math.pi*r/f)**2/r, 'mg', m*g)
print('A6 (conceptual) weightlessness = free fall')
print('A7 E = V/d, d doubled -> E and F halved')
# A8: same velocity, perpendicular to B. |F| = qvB same; r = mv/(qB) larger for proton.
print('A8 r ratio p/e', mp/me)
# A9: x east, y north, z up. Electron moving down, B north.
vv = np.array([0, 0, -1.0]); B = np.array([0, 1.0, 0]); F = -1*np.cross(vv, B)
print('A9 force on electron (x east, y north, z up)', F, '-> west' if F[0] < 0 else '-> east')
Vp, Vs, P = 240, 12, 36
Is = P/Vs; Ip = P/Vp; print('A10 Is', Is, 'Ip', Ip, 'Ip peak', Ip*math.sqrt(2), 'inverted', Is*Vp/Vs)
N, A, B, ang, dt = 50, 20e-4, 0.40, rad(30), 0.10
print('A11 emf sin', N*B*A*math.sin(ang)/dt, 'cos', N*B*A*math.cos(ang)/dt, 'no angle', N*B*A/dt, 'no N', B*A*math.sin(ang)/dt)
print('A13 speed halved: peak EMF halves, period doubles')
f0, f = 5.5e14, 8.0e14
print('A14 V0', heV*(f - f0), 'hf', heV*f, 'phi', heV*f0, 'hf+phi', heV*(f + f0))
print('A15 constant intensity, higher f: Ek max up, photons/s = P/(hf) down')
lev = {1: -13.6, 2: -3.40, 3: -1.51, 4: -0.85}
Ein = 12.5
reach = [n for n in lev if n > 1 and lev[n] - lev[1] <= Ein]
print('A16 levels reachable with 12.5 eV:', reach, 'excitation energies', [round(lev[n] - lev[1], 2) for n in lev])
emit = sorted({round(lev[a] - lev[b], 2) for a in reach + [1] for b in reach + [1] if a > b})
print('    photons possible', emit, ' 4->3 =', round(lev[4] - lev[3], 2), ' 4->1 =', round(lev[4] - lev[1], 2))
print('A17 single photons build interference pattern')
print('A18 proper time: astronaut (present at both events); proper length: Earth observer (Earth-station at rest)')
gam = 1 + 1.50/0.511; print('A19 gamma', gam, 'gamma-1', gam - 1, 'inverse', 0.511/1.50)

print('== Section B ==')
# B1 astronaut and tool bag / gas thruster
M, mb, vb = 120.0, 3.0, 2.0
vr = mb*vb/(M - mb); print('B1 recoil', vr, 'using 120 kg', mb*vb/M, 'time 15 m', 15/vr, 'thrust', 0.025*40, 'a', 0.025*40/117)
# B2 banked aircraft
m, v, th = 1200, 60.0, rad(25)
L = m*g/math.cos(th); r = v**2/(g*math.tan(th))
print('B2 lift', L, 'r', r, 'T', 2*math.pi*r/v, 'pilot seat force', 70*g/math.cos(th), 'pilot mg', 70*g, 'ratio', 1/math.cos(th))
# B3 bungee
m, L0, k = 60.0, 15.0, 120.0
vt = math.sqrt(2*g*L0); W = m*g
x = (W + math.sqrt(W**2 + 4*(k/2)*W*L0))/(2*(k/2))
print('B3 v taut', vt, 'x max', x, 'check', W*(L0 + x), 0.5*k*x**2, 'x at vmax', W/k, 'net F bottom', k*x - W, 'a bottom', (k*x - W)/m)
xe = W/k; vmax = math.sqrt(2*(W*(L0 + xe) - 0.5*k*xe**2)/m); print('   vmax', vmax)
# B4 bow: F = 900x - 600x^2 on 0..0.50 m
Fb = lambda x: 900*x - 600*x**2
area = 450*0.5**2 - 200*0.5**3
xs = np.linspace(0, 0.5, 11); print('B4 F samples', [round(Fb(xx), 1) for xx in xs], 'area', area, 'triangle', 0.5*0.5*Fb(0.5), 'trap 0.05', np.trapezoid([Fb(xx) for xx in xs], xs))
Ek = 0.8*area; ma = 0.028; va = math.sqrt(2*Ek/ma); print('   Ek arrow', Ek, 'v', va)
t = 30/70; print('   t', t, 'drop', 0.5*g*t**2, 'with exact v', 0.5*g*(30/va)**2, 'squares (2.5 J each)', area/2.5)
for est in (84, 92):
    print('   v from estimate', est, math.sqrt(2*0.8*est/ma))
# B5 exoplanet
MX, RX = 4.0*ME, 1.5*RE
gX = G*MX/RX**2; print('B5 g', gX, 'ratio', 4/2.25, '9.81*ratio', 9.81*4/2.25, 'thrust 250 kg', 250*gX, 'with 17', 250*17)
r = 2*RX; T = 2*math.pi*math.sqrt(r**3/(G*MX)); Tw = 2*math.pi*math.sqrt(RX**3/(G*MX))
print('   r', r, 'T s', T, 'h', T/3600, 'wrong r=RX', Tw, Tw/3600, 'v', math.sqrt(G*MX/r))
# B6 charged spheres
m, th, d = 2.0e-3, rad(12), 0.060
Fe = m*g*math.tan(th); q = d*math.sqrt(Fe/kC); E = kC*q/d**2
print('B6 Fe', Fe, 'q', q, 'E', E, 'E=F/q', Fe/q, 'tension', m*g/math.cos(th))
# B7 cyclotron, protons; x right, y up the page, z out of the page
B, R = 1.2, 0.40
# clockwise viewed from above: at the top of the circle the proton moves +x and the centre is -y
vv = np.array([1.0, 0, 0])
for Bz in (1.0, -1.0):
    F = np.cross(vv, np.array([0, 0, Bz])); print('B7 Bz', Bz, 'force', F)
thalf = math.pi*mp/(e*B); fosc = e*B/(2*math.pi*mp); vmax = e*B*R/mp; KE = 0.5*mp*vmax**2
print('   t half', thalf, 'f', fosc, 'vmax', vmax, 'v/c', vmax/c, 'KE J', KE, 'MeV', KE/e/1e6, 'gamma', 1/math.sqrt(1 - (vmax/c)**2))
# B8 regenerative braking
n, I, l, B = 40, 6.0, 0.050, 0.80
print('B8 F side', n*I*l*B)
m, v1, v2 = 95.0, 8.0, 3.0
dKE = 0.5*m*(v1**2 - v2**2); print('   dKE', dKE, 'stored 60%', 0.6*dKE)
# B9 induction cooktop: B triangle -4 mT -> +4 mT in 20 us, back in 20 us
A, B0, tr = 0.020, 4.0e-3, 20e-6
print('B9 f', 1/(2*tr), 'Phi max', B0*A, 'dPhi', 2*B0*A, 'emf', 2*B0*A/tr, 'f doubled emf', 2*B0*A/(tr/2))
# B10 distribution
P1, V1, R1, Vh, Vl, R2 = 110e3, 11e3, 6.0, 11e3, 240, 0.040
I1 = P1/V1; Vin = V1 - I1*R1; ratio = Vh/Vl; Vout = Vin/ratio; I2 = I1*ratio
print('B10 ratio', ratio, 'I1', I1, 'drop', I1*R1, 'Vin T2', Vin, 'Vout T2', Vout, 'I2', I2, 'P2/Vout', (P1 - I1**2*R1)/Vout)
print('    drop LV', I2*R2, 'V houses', Vout - I2*R2, 'loss HV', I1**2*R1, 'loss LV', I2**2*R2, 'R ratio', R1/R2, 'I ratio^2', ratio**2)
print('    delivered to houses', P1 - I1**2*R1 - I2**2*R2, 'fraction', (P1 - I1**2*R1 - I2**2*R2)/P1)
# B11 microwaves
lam, d, L = 0.028, 0.15, 1.50
print('B11 path diff 2nd min', 1.5*lam, 'dx', lam*L/d, 'theta deg', math.degrees(math.asin(lam/d)), 'exact y1', L*math.tan(math.asin(lam/d)), 'E eV', hc/lam, 'E J', h*c/lam)
# B12 light sail
P, lam = 50e3, 1064e-9
p = h/lam; Eph = h*c/lam; n = P/Eph
print('B12 p', p, 'E', Eph, 'n', n, 'F reflect', 2*n*p, '2P/c', 2*P/c, 'absorb', P/c, 'a 2.0 kg', 2*P/c/2.0)
# B13 Michelson-Morley spacecraft
gam = 1/math.sqrt(1 - 0.6**2); print('B13 gamma', gam, 'L', 1.20/gam, 'round trip ship', 2*1.20/c)
# B14 electron diffraction r = 50/sqrt(V kV) mm
lam4 = h/math.sqrt(2*me*e*4000); print('B14 lam 4 kV', lam4, 'p', math.sqrt(2*me*e*4000))
for V in (2, 3, 4, 5, 6, 8, 10, 16):
    print('    V', V, 'r', 50/math.sqrt(V))
print('    proton lam at 4 kV', h/math.sqrt(2*mp*e*4000), 'ratio', math.sqrt(mp/me))
# B15 spring investigation
mass = np.array([100, 200, 300, 400, 500])*1e-3
F = mass*g; x = np.array([2.5, 4.8, 7.4, 9.9, 12.2])
print('B15 F', F)
sl, ic = np.polyfit(x, F, 1); print('    fit F = sl*x(cm) + ic', sl, ic, 'k N/m', sl*100)
sl0 = (x @ F)/(x @ x); print('    through origin k N/m', sl0*100)
print('    energy at 10.0 cm (k=40)', 0.5*40*0.100**2, 'from fit line F', sl*10 + ic, 'area', 0.5*0.100*(sl*10 + ic))
print('    offset 0.5 cm: slope same, intercept', ic - sl*0.5)
