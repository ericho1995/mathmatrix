"""Independent checks for Specialist practice set 4 (sympy + scipy)."""
from sympy import *
from scipy import stats
from scipy import integrate as si
from scipy.optimize import brentq
import math

x, y, t, z, k, s, h, th = symbols('x y t z k s h theta')
N = stats.norm

print('== Exam 1 ==')
f = x*exp(-x)
for n in range(1, 8):
    assert simplify(diff(f, x, n) - (-1)**n*(x - n)*exp(-x)) == 0
print('Q1 ok')
zz = cos(th) + I*sin(th); print('Q2', simplify(expand((zz + 1/zz)**3).rewrite(cos)), simplify(8*cos(th)**3 - 2*cos(3*th) - 6*cos(th)))
f3 = x**2/(x - 1)**2; print('Q3', factor(diff(f3, x)), factor(diff(f3, x, 2)), f3.subs(x, -Rational(1, 2)))
L = integrate(sqrt((2*t)**2 + (2*t**2)**2), (t, 0, 2*sqrt(2))); print('Q4', simplify(L))
v = 1/(x + 1); print('Q5 a', simplify(v*diff(v, x)), 'a(1)', simplify(v*diff(v, x)).subs(x, 1), 't(3)', integrate(1/v, (x, 0, 3)))
Yf = Function('y'); sol = dsolve(Eq(Yf(x).diff(x), x*(1 + Yf(x)**2)), Yf(x), ics={Yf(0): 1}); print('Q6', sol, 'domain |x| <', sqrt(pi/2))
print('Q7', integrate(pi*sin(2*x)**2, (x, 0, pi/2)))
print('Q8 se', 12/6, 'crit', 80 + 1.645*2)
A = Matrix([1, 1, 0]); B = Matrix([3, 2, 2]); C = Matrix([2, -1, 0])
AB, AC = B - A, C - A; nn = AB.cross(AC); print('Q9 dot', AB.dot(AC), 'area', Rational(1, 2)*sqrt(AB.dot(AB))*sqrt(AC.dot(AC)), 'D', (B + AC).T, 'n', nn.T, 'd', nn.dot(A), nn.dot(B), nn.dot(C))
r = Matrix([cos(2*t), sin(2*t), t]); vv = r.diff(t); aa = vv.diff(t); print('Q10 speed', simplify(sqrt(vv.dot(vv))), 'a.v', simplify(aa.dot(vv)), 'length 0..pi', simplify(integrate(sqrt(5), (t, 0, pi))), 'r(pi)', r.subs(t, pi).T)

print('== Section A ==')
print('A3 range sec>=1 on (-pi/2,pi/2): y<=1')
g = (x**2 - 1)/(x**2 + 1); print('A4', g.subs(x, 0), limit(g, x, oo))
print('A5', expand((sqrt(3) + I)**6))
print('A6', expand((z - (2 - 3*I))*(z - (2 + 3*I))))
T0 = lambda tt: 20 + 60*math.exp(-math.log(2)/10*tt); print('A9', 10*math.log(6)/math.log(2), T0(10*math.log(6)/math.log(2)))
print('A10', integrate(integrate(6*t - 4, (t, 0, t)) + 3, (t, 0, 2)))
print('A11', diff(x**Rational(3, 2), x, 2).subs(x, 1))
print('A12', float(integrate(x*exp(-x), (x, 0, 3))), 'alt', float(integrate(x*exp(-x), (x, 0, oo))))
V13 = pi*integrate(exp(2) - exp(2*y), (y, 0, 1)); print('A13', simplify(V13), float(V13), 'about x', float(pi*integrate(log(x)**2, (x, 1, E))), 'no cyl', float(pi*(exp(2) - 1)/2), 'cyl', float(pi*exp(2)))
L14 = si.quad(lambda u: math.sqrt(1 + 9*u/4), 0, 4)[0]; print('A14', L14, 'chord', math.sqrt(80), 'unsquared', si.quad(lambda u: math.sqrt(1 + 1.5*math.sqrt(u)), 0, 4)[0], 'x+y', 4 + 8)
print('A15', math.degrees(math.acos(1/math.sqrt(3))), math.degrees(math.asin(1/math.sqrt(3))))
print('A16', Matrix([1, 1, 0]).cross(Matrix([0, 1, 1])).T)
print('A17', Matrix([2, -1, 3]).dot(Matrix([1, -1, 2])))
print('A18 max speed', 8)
print('A19', 1 - N.cdf(85, 80, 6), 'sd12', 1 - N.cdf(85, 80, 12), 'sd3', 1 - N.cdf(85, 80, 3), 'sd 1.5', 1 - N.cdf(85, 80, 1.5))
print('A20 sigma', 1.96*5/1.96)

print('== Section B ==')
f5 = 1/(x**2 - 2*x + 5); print('B1 max', f5.subs(x, 1), 'infl', [ (p, f5.subs(x, p)) for p in solve(diff(f5, x, 2), x)])
print('   pf a=-3', apart(1/(x**2 - 2*x - 3), x), 'area', simplify(integrate(1/(x**2 - 2*x - 3), (x, 4, 6))), float(integrate(1/(x**2 - 2*x - 3), (x, 4, 6))), float(log(Rational(15, 7))/4))
print('   volume', si.quad(lambda u: math.pi/((u - 1)**2 + 4)**2, 0, 2)[0])
c = symbols('c'); print('B2 triple', expand(expand((cos(th) + I*sin(th))**3)).as_real_imag()[0])
print('   roots', [float(cos(q*pi/9)) for q in (1, 5, 7)], 'check', [8*math.cos(q*math.pi/9)**3 - 6*math.cos(q*math.pi/9) - 1 for q in (1, 5, 7)], 'product', math.cos(math.pi/9)*math.cos(5*math.pi/9)*math.cos(7*math.pi/9))
print('   z^6 - z^3 + 1', [complex(rt) for rt in Poly(z**6 - z**3 + 1).nroots()], 'arg', math.pi/9)
xs = 20*(1 - math.exp(-2)); print('B3 x(8)', xs, 't below 5', 8 + 4*math.log(xs/5), '90% time', 4*math.log(10))
x1 = 0 + 1*5; x2 = x1 + 1*(5 - 0.25*x1); print('   euler x(2)', x2, 'exact', 20*(1 - math.exp(-0.5)))
S_ = lambda hh: 8*math.pi/3*((hh + 1)**1.5 - 1); V_ = lambda hh: 2*math.pi*hh**2
print('B4 V(4)', V_(4), 32*math.pi, 'S(4)', S_(4), 'dh/dt', 2/(8*math.pi), 'S=V at', brentq(lambda hh: S_(hh) - V_(hh), 0.5, 10), 'fill', V_(4)/2)
SA_check = si.quad(lambda yy: 2*math.pi*2*math.sqrt(yy)*math.sqrt(1 + 1/yy), 0, 4)[0]; print('   SA check', SA_check)
tl = 12/4.9; print('B5 tmax', 12/9.8, 'hmax', 12**2/19.6, 'land t', tl, 'pos', 15*tl, 2*tl, 'speed', math.sqrt(225 + 4 + 144), 'angle', math.degrees(math.atan(12/math.sqrt(229))))
print('   at x=30: t=2, y', 4, 'z', 24 - 4.9*4)
arc = si.quad(lambda s_: math.sqrt(225 + 4 + (12 - 9.8*s_)**2), 0, tl)[0]; print('   arc', arc)
print('B6 a', 1 - N.cdf(1000, 936, math.sqrt(1728)), 'b', 1 - N.cdf(1000, 980, math.sqrt(1760)), 'c', 1 - N.cdf(0, -2, 20))
se = 12/math.sqrt(50); print('   se', se, 'z', (81.2 - 78)/se, 'p', 1 - N.cdf((81.2 - 78)/se), 'CI', 81.2 - N.ppf(0.95)*se, 81.2 + N.ppf(0.95)*se)
