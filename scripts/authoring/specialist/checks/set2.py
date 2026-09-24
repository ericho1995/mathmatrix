"""Independent checks for Specialist practice set 2 (sympy + scipy)."""
from sympy import *
from scipy import stats
from scipy import integrate as si
from scipy.optimize import brentq
import math

x, y, t, z, k, s, h, r = symbols('x y t z k s h r')
N = stats.norm

print('== Exam 1 ==')
# Q1 sum r 2^r = (n-1)2^(n+1) + 2
for n_ in range(1, 12):
    assert sum(q*2**q for q in range(1, n_ + 1)) == (n_ - 1)*2**(n_ + 1) + 2
# Q2 P = z^3 + z - 10
P = z**3 + z - 10; print('Q2', P.subs(z, 2), solve(P, z))
# area triangle (2,0),(-1,2),(-1,-2)
print('   area', Rational(1, 2)*4*3)
# Q3 cosec(2x)+1 on (0,pi)
f = 1/sin(2*x) + 1
print('Q3 turning', [(p, f.subs(x, p)) for p in solve(diff(f, x), x) if 0 < p < pi], 'solve =3', solve(Eq(sin(2*x), Rational(1, 2)), x))
# Q4 volume region between y=x^2 and y=2x about y-axis
print('Q4 intersections', solve([y - x**2, y - 2*x], [x, y]), 'V', integrate(pi*(y - y**2/4), (y, 0, 4)))
# Q5 a = 2x+3, v=2 at x=0
vsq = 2*integrate(2*x + 3, (x, 0, x)) + 4; print('Q5 v^2', factor(vsq), 'v(1)', sqrt(vsq.subs(x, 1)))
# Q6 arc length y = 2/3 x^(3/2), 0..3
L = integrate(sqrt(1 + diff(Rational(2, 3)*x**Rational(3, 2), x)**2), (x, 0, 3)); print('Q6', simplify(L))
# Q7 partial fractions
print('Q7', apart((5*x + 1)/((x - 1)*(x + 2)), x), simplify(integrate((5*x + 1)/((x - 1)*(x + 2)), (x, 2, 3))), float(log(Rational(125, 16))), float(integrate((5*x + 1)/((x - 1)*(x + 2)), (x, 2, 3))))
# Q8 hypothesis tech-free
print('Q8 z', (5.1 - 5)/(0.2/4), 'p', 2*(1 - N.cdf(2)))
# Q9 line/plane
d = Matrix([2, -1, 2]); n = Matrix([1, 2, -2]); A = Matrix([1, 0, 2])
tt = solve(n.dot(A + t*d) - 5, t)[0]; print('Q9 t', tt, 'point', (A + tt*d).T, 'sin', abs(d.dot(n))/(sqrt(d.dot(d))*sqrt(n.dot(n))), 'dist A', abs(n.dot(A) - 5)/3)
# Q10 ellipse
rr = Matrix([3*cos(t), 2*sin(t)]); vv = rr.diff(t)
print('Q10 a', simplify(vv.diff(t) + rr).T, 'r.v', simplify(rr.dot(vv)), 'speed^2', simplify(vv.dot(vv)))

print('== Section A ==')
print('A3 disc', solve(k**2 - 16, k))
print('A4', solve(Eq(cos(x - pi/4), 0), x))
w = -8 + 8*sqrt(3)*I; print('A5', abs(w), arg(w), [simplify(2*exp(I*(pi/6 + q*pi/2))) for q in range(4)])
X, Y = symbols('X Y', real=True); print('A6', expand((X - 3)**2 + Y**2 - 4*(X**2 + Y**2)))
# A8 Euler dy/dx = sqrt(x+y), y(1)=3, h=0.5 to x=2
y1 = 3 + 0.5*math.sqrt(4); y2 = y1 + 0.5*math.sqrt(1.5 + y1); print('A8', y1, y2, 'wrong x', y1 + 0.5*math.sqrt(1 + y1), 'const slope', 3 + 1*2)
# A9 logistic
print('A9 t', math.log(7)/0.3, math.log(7)/0.6)
# A10 cone
print('A10', 0.5/(pi/4), float(0.5/(pi/4)))
print('A11', integrate(x**2*exp(x), (x, 0, 1)))
print('A12 SA', float(integrate(pi*sqrt(4*x + 1), (x, 0, 4))), float(integrate(2*pi*sqrt(x)*sqrt(1 + 1/(4*x)), (x, 0, 4))))
print('A13 t', 25/6.25)
print('A15', math.degrees(math.acos(4/9)))
print('A17', Matrix([1, 1, 0]).cross(Matrix([0, 1, 1])).T, Matrix([1, -1, 1]).dot(Matrix([1, 0, 1])))
print('A19', 9*4 + 4*9)

print('== Section B ==')
# B1 slide
f1 = 4 - 2*atan(x); a_, kk = Rational(1, 4), 3 - pi/2
q = a_*(x - 3)**2 + kk
print('B1 f1(1)', f1.subs(x, 1), 'f1\'(1)', diff(f1, x).subs(x, 1), 'q(1)', simplify(q.subs(x, 1)), 'q\'(1)', diff(q, x).subs(x, 1), "f1''(1)", diff(f1, x, 2).subs(x, 1), "q''", diff(q, x, 2), 'k', float(kk))
L1 = si.quad(lambda u: math.sqrt(1 + (2/(1 + u*u))**2), 0, 1)[0]; L2 = si.quad(lambda u: math.sqrt(1 + ((u - 3)/2)**2), 1, 3)[0]
print('   length', L1 + L2, 'angle top', math.degrees(math.atan(2)))
area = si.quad(lambda u: 4 - 2*math.atan(u), 0, 1)[0] + si.quad(lambda u: 0.25*(u - 3)**2 + 3 - math.pi/2, 1, 3)[0]; print('   area', area)
# B2
wv = exp(I*pi/3); print('B2', simplify(wv**6), 'hex area', 6*sqrt(3)/4, 'roots -64', [nsimplify(simplify(2*exp(I*(pi/6 + q*pi/3)))) for q in range(6)])
print('   rotate', simplify(exp(I*pi/3)*(sqrt(3) + I)), 'sector area', Rational(1, 2)*4*(pi/2 - pi/6))
zz = symbols('zz'); print('   conj = z^5 count: z=0 plus 6 roots of unity')
# B3 vase
V = lambda hh: math.pi*(hh + hh**3/24 + hh**5/1280)
print('B3 V(8)', V(8), 'dh/dt at 4', 5/(math.pi*(1 + 16/16)**2), 'half depth', brentq(lambda hh: V(hh) - V(8)/2, 0, 8), 'fill time', V(8)/5)
SA = si.quad(lambda u: 2*math.pi*(1 + u*u/16)*math.sqrt(1 + (u/8)**2), 0, 8)[0]; print('   SA', SA, 'depth r=3', math.sqrt(32))
# B4 rumour
kval = math.log(59/5)/2400; print('B4 k', kval, 't fastest', math.log(59)/(1200*kval))
Nf = lambda tt: 1200/(1 + 59*math.exp(-1200*kval*tt)); print('   N(2)', Nf(2), 't90', math.log(59*1200/120 - 59*0 ) if False else math.log(59/(1/0.9 - 1))/(1200*kval))
Ne = 20
for _ in range(2):
    Ne = Ne + 0.5*kval*Ne*(1200 - Ne)
print('   euler N(1)', Ne, 'exact N(1)', Nf(1))
# B5 drones
tA = Matrix([2*t, 3*t, 10 + t]); tB = Matrix([20 - t, 2*t + 5, 20 - t]); dd = tB - tA
d2 = expand(dd.dot(dd)); tm = solve(diff(d2, t), t)[0]; print('B5 d2', d2, 'tmin', tm, float(tm), 'dmin', float(sqrt(d2.subs(t, tm))))
print('   speed A', sqrt(14), float(sqrt(14)), 'angle', math.degrees(math.acos(3/math.sqrt(84))))
print('   cross plane t', solve(2*t + 3*t + 10 + t - 30, t), tA.subs(t, Rational(10, 3)).T)
print('   intersect?', solve([2*s - (20 - t), 3*s - (2*t + 5), 10 + s - (20 - t)], [s, t]))
# B6
print('B6 a', N.cdf(1000, 1010, 8), 'b', 1 - N.cdf(5070, 5050, math.sqrt(320)), 'c', 1 - N.cdf(0, 5, 10))
print('   d z', (1002.8 - 1005)/1, 'p', N.cdf(-2.2), 'crit', 1005 - N.ppf(0.99)*1, 'CI', 1002.8 - N.ppf(0.995), 1002.8 + N.ppf(0.995))
