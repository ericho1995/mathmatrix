"""Independent checks for Specialist practice set 5 (sympy + scipy)."""
from sympy import *
from scipy import stats
from scipy import integrate as si
from scipy.optimize import brentq
import math

x, y, t, z, k, s, h = symbols('x y t z k s h')
N = stats.norm

print('== Exam 1 ==')
print('Q1', [(m, n) for m in range(1, 60) for n in range(1, 60) if m*m - n*n == 10])
q = z**2 - (3 + I)*z + 4 + 3*I; print('Q2', expand(q.subs(z, 1 + 2*I)), solve(q, z), 'dot', 1*2 + 2*(-1), 'area', Rational(1, 2)*sqrt(5)*sqrt(5))
print('Q3', simplify(sec(t)**2 - tan(t)**2), simplify(diff(tan(t), t)/diff(sec(t), t)), simplify((diff(tan(t), t)/diff(sec(t), t)).subs(t, pi/4)))
Y = Function('Y')(x); d1 = solve(diff(x**3 + Y**3 - 9, x), diff(Y, x))[0]; d2 = diff(d1, x).subs(diff(Y, x), d1)
print('Q4', d1.subs(Y, 2).subs(x, 1), simplify(d2.subs(Y, 2).subs(x, 1)))
print('Q5', integrate(x/sqrt(x + 1), (x, 0, 3)))
xt = integrate(3*t**2 - 12*t + 9, (t, 0, t)); print('Q6 rest', solve(3*t**2 - 12*t + 9, t), [xt.subs(t, v) for v in (0, 1, 3, 4)], 'a(4)', 6*4 - 12)
ysol = log(exp(x) + 1); print('Q7 residual', simplify(diff(ysol, x) - exp(x - ysol)), 'y(0)', ysol.subs(x, 0))
print('Q8', 20 - 16, sqrt(9 + 16), 'k', 4 + 0.8*5)
P = Matrix([3, 1, 4]); n = Matrix([2, -1, 2]); val = n.dot(P) - 4
print('Q9 dist', abs(val)/3, 'foot', (P - val/9*n).T, 'reflect', (P - 2*val/9*n).T, 'parallel plane d', n.dot(P))
vv = Matrix([2 - 2*t, 3*t**2 - 3]); rr = Matrix([1, 0]) + vv.integrate((t, 0, t)); print('Q10 r', rr.T, 'y=0', solve(rr[1], t), 'x at sqrt3', simplify(rr[0].subs(t, sqrt(3))), 'rest', solve(list(vv), t), rr.subs(t, 1).T, 'a(1)', vv.diff(t).subs(t, 1).T, 'speed t=2', sqrt(vv.subs(t, 2).dot(vv.subs(t, 2))))

print('== Section A ==')
print('A2', [(nn, nn*nn + nn + 41, isprime(nn*nn + nn + 41)) for nn in (1, 10, 39, 40)])
print('A4 roots of sec x = x on [0,2pi]:', [r for r in [brentq(lambda u: 1/math.cos(u) - u, a, b) for (a, b) in [(4.8, 6.28)]]], 'sign check', [(u, 1/math.cos(u) - u) for u in (4.72, 5.5, 6.28)])
print('A5', expand((2*exp(-2*I*pi/3))**3))
w = (1 + I)/(1 - I); print('A6', simplify(w), 2025 % 4)
print('A7', solve(z**4 + 4, z))
xx, yy = 0.0, 1.0
while yy <= 3:
    yy = yy + 0.25*2*yy; xx += 0.25
print('A8', xx, yy, 'exact', math.log(3)/2)
print('A9', solve(0.5*k*(1 - k/1000) - 60, k))
print('A10', 4*math.exp(-math.log(2)))
print('A11', integrate(pi*(x - x**4), (x, 0, 1)), 'wrong', integrate(pi*(sqrt(x) - x**2)**2, (x, 0, 1)), 'area', integrate(sqrt(x) - x**2, (x, 0, 1)))
print('A12', float(integrate(2*pi*x*sqrt(1 + 4*x**2), (x, 0, 1))), 'about x', si.quad(lambda u: 2*math.pi*u*u*math.sqrt(1 + 4*u*u), 0, 1)[0], 'no sqrt', float(integrate(2*pi*x, (x, 0, 1))), 'forgot 2pi', float(integrate(x*sqrt(1 + 4*x**2), (x, 0, 1))))
print('A13', integrate(x*cos(2*x), x))
A_, B_ = symbols('A B'); yy_ = A_*exp(2*x) + B_*exp(-x); print('A14', simplify(diff(yy_, x, 2) - diff(yy_, x) - 2*yy_))
print('A16', abs(3 - (-6))/3)
print('A17', math.degrees(math.asin(5/(3*math.sqrt(3)))), math.degrees(math.acos(5/(3*math.sqrt(3)))))
print('A18', si.quad(lambda u: math.sqrt(math.exp(2*u) + 4), 0, 1)[0], 'displacement', math.hypot(math.e - 1, 2))
print('A19', N.cdf(48, 50, 2), N.cdf(48, 50, 8))

print('== Section B ==')
f = atan(x) + atan(1/x); print('B1', simplify(diff(f, x)), f.subs(x, 1), f.subs(x, -1))
print('   int atan', integrate(atan(x), (x, 0, 1)), 'V', integrate(pi*tan(y)**2, (y, 0, pi/4)), float(pi*(1 - pi/4)))
print('   arc', si.quad(lambda u: math.sqrt(1 + 1/(1 + u*u)**2), 0, 1)[0])
z1 = 3 + I; zs = [expand(z1*I**q) for q in range(4)]; print('B2 vertices', zs, 'z1^4', expand(z1**4), [expand(zz**4) for zz in zs])
print('   side', abs(zs[1] - zs[0]), 'area', abs(zs[1] - zs[0])**2, 'mid', (zs[0] + zs[1])/2, abs((zs[0] + zs[1])/2), 'ann', 20 - 5*pi)
X, Y = symbols('X Y', real=True); print('   perp bisector check', expand((X**2 + Y**2) - ((X - 2)**2 + (Y - 4)**2)), 'at z1', (3**2 + 1) - ((3 - 2)**2 + (1 - 4)**2))
Nf = lambda tt: 40/(1 + 19*math.exp(-0.8*tt)); print('B3 t30', math.log(57)/0.8, Nf(math.log(57)/0.8), 't20', math.log(19)/0.8, 'max rate', 0.8*20*0.5)
print('   eq h=6', solve(0.8*k*(1 - k/40) - 6, k))
n1 = 20 + 1*(0.8*20*(1 - 20/40) - 6); n2 = n1 + 1*(0.8*n1*(1 - n1/40) - 6); print('   euler', n1, n2)
xs = 3*sin(2*t); print('B4 check', simplify(diff(xs, t, 2) + 4*xs), xs.subs(t, 0), diff(xs, t).subs(t, 0))
dist = si.quad(lambda u: abs(6*math.cos(2*u)), 0, 2)[0]; print('   dist 0..2', dist, 'avg speed', dist/2, 'x(2)', 3*math.sin(4))
print('   first x=1.5', math.pi/12)
n1v, n2v = Matrix([1, 1, -1]), Matrix([2, -1, 1]); print('B5', n1v.cross(n2v).T, n1v.dot(n2v))
A0 = Matrix([1, 1, 0]); dd = Matrix([0, 1, 1]); PP = Matrix([3, 2, 5]); AP = PP - A0
proj = AP.dot(dd)/dd.dot(dd); print('   closest', (A0 + proj*dd).T, 'dist', sqrt((AP - proj*dd).dot(AP - proj*dd)))
n3 = AP.cross(dd); print('   n3', n3.T, 'plane', Matrix([2, 1, -1]).dot(A0), Matrix([2, 1, -1]).dot(PP), 'angle', math.degrees(math.acos(4/math.sqrt(18))))
print('B6 a', N.cdf(500, 508, 6), 'b', 500 + N.ppf(0.99)*6, 'c', 1 - N.cdf(6400, 12*508 + 250, math.sqrt(12*36 + 400)))
se = 6/math.sqrt(30); print('   p', N.cdf((505.4 - 508)/se), 'CI', 505.4 - N.ppf(0.975)*se, 505.4 + N.ppf(0.975)*se, 'n', (N.ppf(0.975)*6)**2)
