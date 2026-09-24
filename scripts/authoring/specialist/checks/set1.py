"""Independent checks for Specialist practice set 1. Run with a Python that has
sympy and scipy:  python scripts/authoring/specialist/checks/set1.py
Every printed value is compared by eye against set-1.mjs; asserts guard the
exact answers."""
from sympy import *
from scipy import stats
from scipy import integrate as si
import math

x, y, t, z, n, k, u, v, s = symbols('x y t z n k u v s')
N = stats.norm

print('== Exam 1 ==')
# Q1 induction 25^n - 1 divisible by 24
assert all((25**m - 1) % 24 == 0 for m in range(1, 30))
# Q2 z = -1 + sqrt3 i
zz = -1 + sqrt(3)*I
print('Q2 |z|, arg', abs(zz), arg(zz))
assert simplify(zz**3 - 8) == 0 or expand(zz**3) == 8
print('Q2 roots of z^3=8', solve(z**3 - 8, z))
# Q3 f = (x^2+3)/(x-1)
f = (x**2 + 3)/(x - 1)
assert simplify(f - (x + 1 + 4/(x - 1))) == 0
sp = solve(diff(f, x), x); print('Q3 stationary', [(p, f.subs(x, p)) for p in sp], 'y-int', f.subs(x, 0))
# Q4 implicit atan(y) + x y^2 = pi/4 at (0,1)
Y = Function('Y')(x)
expr = atan(Y) + x*Y**2 - pi/4
d = solve(diff(expr, x), diff(Y, x))[0]
print('Q4 dy/dx', d.subs({Y: 1}).subs(x, 0))
# Q5 int_0^{pi/4} x sec^2 x
print('Q5', simplify(integrate(x*sec(x)**2, (x, 0, pi/4))))
print('   numeric', float(integrate(x*sec(x)**2, (x, 0, pi/4))), float(pi/4 - log(2)/2))
# Q6 dy/dx = y(2-y), y(0)=1
Yf = Function('y')
sol = dsolve(Eq(Yf(x).diff(x), Yf(x)*(2 - Yf(x))), Yf(x), ics={Yf(0): 1})
print('Q6', simplify(sol.rhs), ' check vs 2/(1+e^-2x):', simplify(sol.rhs - 2/(1 + exp(-2*x))))
print('   partial fractions', apart(1/(y*(2 - y)), y))
# Q7 stats
print('Q7 E', 4*150 + 40, 'sd', sqrt(4*36 + 25), 'a', (666 - 640)/13, 'CI', 147.5 - 1.96*6/4, 147.5 + 1.96*6/4)
# Q8 plane
A, B, C = Matrix([2, -1, 1]), Matrix([3, 1, 0]), Matrix([1, 0, 3])
nrm = (B - A).cross(C - A); print('Q8 n', nrm.T, 'd', nrm.dot(A), nrm.dot(B), nrm.dot(C), 'area', sqrt(nrm.dot(nrm))/2)
lam = Rational(nrm.dot(A), nrm.dot(nrm)); print('   foot', (lam*nrm).T, 'dist', abs(nrm.dot(A))/sqrt(nrm.dot(nrm)))
# Q9 r = e^t cos t i + e^t sin t j
r = Matrix([exp(t)*cos(t), exp(t)*sin(t)])
vv = r.diff(t); print('Q9 v', simplify(vv.T), 'speed', simplify(sqrt(vv.dot(vv))))
print('   arc 0..ln3', simplify(integrate(sqrt(2)*exp(t), (t, 0, log(3)))), 'cos angle', simplify(r.dot(vv)/(sqrt(r.dot(r))*sqrt(vv.dot(vv)))))
# Q10 log2 3 irrational: 2^p = 3^q has no positive integer solutions (parity) - reasoning only

print('== Section A ==')
# A3 (x^2-4)/(x^2-x-2)
print('A3', factor(x**2 - 4), factor(x**2 - x - 2), limit((x**2-4)/(x**2-x-2), x, oo))
# A4 domain/range f = 2 asin(1-3x) + pi/2
print('A4 domain', solve([1 - 3*x <= 1, 1 - 3*x >= -1], x), 'range', [2*(-pi/2) + pi/2, 2*(pi/2) + pi/2])
# A5 Arg(z^5/w^2)
w5 = (1 - I)**5/(sqrt(3) + I)**2
print('A5', arg(simplify(w5)), simplify(arg(w5)/pi))
# A7 roots 2+i, 2-i, r with product 10
p = expand((z - (2 + I))*(z - (2 - I))*(z - 2)); print('A7', p)
# A8 Euler pseudocode dy/dx = x + y, y(0)=1, h=0.1, 3 steps
xx, yy = 0.0, 1.0
for i in range(3):
    yy = yy + 0.1*(xx + yy); xx += 0.1
print('A8 euler', yy, 'exact', 2*math.exp(0.3) - 0.3 - 1)
xx, yy = 0.0, 1.0
for i in range(3):
    xx += 0.1; yy = yy + 0.1*(xx + yy)
print('   x-first', yy)
xx, yy = 0.0, 1.0
for i in range(2):
    yy = yy + 0.1*(xx + yy); xx += 0.1
print('   two steps', yy)
# A10 a = 2 - v, v(0)=0: distance first 2 s
vt = 2*(1 - exp(-t)); print('A10 distance', float(integrate(vt, (t, 0, 2))), 'v(2)', float(vt.subs(t, 2)))
# A11 volume region y=x^2, y=4 about y-axis
print('A11', integrate(pi*y, (y, 0, 4)), 'x-axis version', integrate(pi*(16 - x**4), (x, 0, 2)))
# A12 arc length y = ln cos x, 0..pi/3
L = integrate(sqrt(1 + diff(log(cos(x)), x)**2).simplify(), (x, 0, pi/3)); print('A12', L, float(L), float(log(2 + sqrt(3))))
# A13 substitution
print('A13', integrate(x*sqrt(1 - x), (x, 0, 1)), integrate(sqrt(u) - u**Rational(3, 2), (u, 0, 1)))
# A15 m with (a-b).b = 0
m = symbols('m'); a_ = Matrix([2, -1, m]); b_ = Matrix([1, 3, 2]); print('A15', solve((a_ - b_).dot(b_), m))
# A16 perpendicular component
a_ = Matrix([3, -1, 2]); b_ = Matrix([1, 1, 1]); par = a_.dot(b_)/b_.dot(b_)*b_; print('A16 perp', (a_ - par).T, 'par', par.T)
# A17 distance point to line
P = Matrix([1, 2, 3]); A0 = Matrix([1, 0, -1]); dvec = Matrix([1, 2, 2]); cr = (P - A0).cross(dvec); print('A17', sqrt(cr.dot(cr))/sqrt(dvec.dot(dvec)))
# A18 min speed r = (t^2-4t, 3t)
sp2 = (2*t - 4)**2 + 9; print('A18 min speed', sqrt(sp2.subs(t, 2)))
# A19 Pr(X > Y)
print('A19', 1 - N.cdf(0, loc=2, scale=5), 'sd7 version', 1 - N.cdf(0, loc=2, scale=7), 'sd sqrt7', 1 - N.cdf(0, loc=2, scale=math.sqrt(7)), 'Y>X', N.cdf(0, loc=2, scale=5))
# A20 p-value
zval = (101.2 - 100)/(5/5); print('A20 z', zval, 'p', 1 - N.cdf(zval), 'two-sided', 2*(1 - N.cdf(zval)))
# A14 mixing tank: Q' = 0.2*3 - 2Q/(100+t)

print('== Section B ==')
# B1 f = 4x/(x^2-1)
f = 4*x/(x**2 - 1)
print('B1 apart', apart(f, x), ' f\'', factor(diff(f, x)))
print('   area 2..4', simplify(integrate(f, (x, 2, 4))), float(integrate(f, (x, 2, 4))))
V = pi*integrate(f**2, (x, 2, 4)); print('   volume', simplify(V), float(V))
g = f + k*x
print('   k for stationary at 2', solve(diff(g, x).subs(x, 2), k))
g2 = g.subs(k, Rational(20, 9)); print('   stationary pts of g', [(p, g2.subs(x, p)) for p in solve(diff(g2, x), x) if p.is_real])
# B2 P(z)
P_ = z**4 - 2*z**3 + 3*z**2 - 2*z + 2
print('B2', expand(P_.subs(z, 1 + I)), factor(P_, extension=I), solve(P_, z))
print('   circle centre 1/2 radius', sqrt(Rational(1, 4) + 1), 'area half disc', pi*Rational(5, 4)/2, 'max |z|', Rational(1, 2) + sqrt(5)/2)
# B3 parachute
vT = math.sqrt(490); print('B3 terminal', vT)
tt = si.quad(lambda w: 1/(9.8 - 0.02*w*w), 0, 20)[0]; print('   time to 20', tt, 'formula', (50/(2*math.sqrt(490)))*math.log((math.sqrt(490)+20)/(math.sqrt(490)-20)))
xdist = si.quad(lambda w: w/(9.8 - 0.02*w*w), 0, 20)[0]; print('   distance to 20', xdist, 25*math.log(490/90))
v1 = 0 + 0.5*9.8; v2 = v1 + 0.5*(9.8 - 0.02*v1**2); print('   euler v(1)', v2)
tt2 = quad = si.quad(lambda w: 1/(9.8 - 0.2*w*w), 20, 7.5)[0]; print('   time 20 -> 7.5 after opening', tt2, ' formula', (5/14)*math.log(29*13/27))
# B4 skew lines
P1, d1 = Matrix([1, 2, 0]), Matrix([1, -1, 2]); P2, d2 = Matrix([0, 1, 3]), Matrix([2, 1, -1])
nn = d1.cross(d2); print('B4 n', nn.T, 'dist', abs((P2 - P1).dot(nn))/sqrt(nn.dot(nn)), 'plane d', nn.dot(P1))
print('   intersect?', solve(list(P1 + s*d1 - P2 - t*d2), [s, t]))
lam = symbols('lam'); foot = P2 + lam*nn; lv = solve(nn.dot(foot) - nn.dot(P1), lam)[0]; print('   foot', (P2 + lv*nn).T, 'lam', lv)
# B5 ball and drone
rb = Matrix([10*t, 2 + 12*t - Rational(49, 10)*t**2]); rd = Matrix([30 - 5*t, Rational(74, 10) - Rational(1, 2)*t])
tmax = 12/9.8; print('B5 tmax', tmax, 'hmax', 2 + 12*tmax - 4.9*tmax**2, 'speed t=1', math.hypot(10, 12 - 9.8))
print('   collide t', solve(rb - rd, t), rb.subs(t, 2).T)
vb, vd = rb.diff(t).subs(t, 2), rd.diff(t)
ang = acos(vb.dot(vd)/(sqrt(vb.dot(vb))*sqrt(vd.dot(vd)))); print('   angle deg', float(ang*180/pi))
arc = si.quad(lambda s_: math.sqrt(100 + (12 - 9.8*s_)**2), 0, 2)[0]; print('   arc 0..2', arc)
print('   cartesian', expand(rb[1].subs(t, x/10)))
# B6 stats
se = 4/5; print('B6 CI', 248.3 - N.ppf(0.975)*se, 248.3 + N.ppf(0.975)*se)
zz = (248.3 - 250)/se; print('   z', zz, 'p', N.cdf(zz))
crit = 250 - N.ppf(0.95)*se; print('   crit', crit, 'type II', 1 - N.cdf(crit, loc=248, scale=se), 'using 248.684', 1 - N.cdf(248.684, loc=248, scale=se))
print('   n for width<=2', (2*N.ppf(0.975)*4/2)**2)
